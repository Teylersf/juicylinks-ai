import { PrismaClient, CreditTransactionType, Prisma } from '@prisma/client'
import { getModelCreditCost } from '../constants/credit-system'

const prisma = new PrismaClient()

export interface CreditTransaction {
  id: string
  type: CreditTransactionType
  amount: number
  balance: number
  description: string
  createdAt: Date
  metadata?: Prisma.JsonValue
}

export class CreditManager {
  /**
   * Get user's current credit balance
   */
  static async getUserCredits(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    })
    return user?.credits || 0
  }

  /**
   * Add credits to user's account (purchase, bonus, etc.)
   */
  static async addCredits(
    userId: string,
    amount: number,
    type: CreditTransactionType,
    description: string,
    metadata?: Prisma.JsonValue | null
  ): Promise<CreditTransaction> {
    return await prisma.$transaction(async (tx) => {
      // Get current balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true, totalCreditsEarned: true }
      })

      if (!user) {
        throw new Error('User not found')
      }

      const newBalance = user.credits + amount
      const newTotalEarned = user.totalCreditsEarned + amount

      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: newBalance,
          totalCreditsEarned: newTotalEarned
        }
      })

      // Create transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          type,
          amount,
          balance: newBalance,
          description,
          metadata: metadata as Prisma.InputJsonValue
        }
      })

      return transaction
    })
  }

  /**
   * Deduct credits from user's account (for prompt usage)
   */
  static async deductCredits(
    userId: string,
    amount: number,
    description: string,
    promptLogId?: string,
    modelName?: string
  ): Promise<CreditTransaction> {
    return await prisma.$transaction(async (tx) => {
      // Get current balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true, totalCreditsSpent: true }
      })

      if (!user) {
        throw new Error('User not found')
      }

      if (user.credits < amount) {
        throw new Error('Insufficient credits')
      }

      const newBalance = user.credits - amount
      const newTotalSpent = user.totalCreditsSpent + amount

      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: newBalance,
          totalCreditsSpent: newTotalSpent
        }
      })

      // Create transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.USAGE,
          amount: -amount, // Negative for deduction
          balance: newBalance,
          description,
          promptLogId,
          modelName,
          creditCost: amount
        }
      })

      // Check if user is now low on credits and send warning if needed
      this.checkAndSendLowCreditWarning(userId, newBalance).catch(error => {
        console.error('Error checking/sending low credit warning:', error)
      })

      return transaction
    })
  }

  /**
   * Check if user has low credits and send warning email
   */
  private static async checkAndSendLowCreditWarning(userId: string, currentBalance: number) {
    const LOW_CREDIT_THRESHOLD = 10
    
    if (currentBalance <= LOW_CREDIT_THRESHOLD && currentBalance > 0) {
      try {
        // Get user info for email
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true }
        })

        if (user?.email) {
          // Send low credit warning email
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'low-credits',
              userEmail: user.email,
              userName: user.name,
              currentCredits: currentBalance,
              threshold: LOW_CREDIT_THRESHOLD
            })
          })
          
          if (!response.ok) {
            console.error('Failed to send low credit warning email')
          } else {
            console.log(`Sent low credit warning to ${user.email} (${currentBalance} credits remaining)`)
          }
        }
      } catch (error) {
        console.error('Error sending low credit warning:', error)
      }
    }
  }

  /**
   * Check if user has enough credits for a set of models
   */
  static async canAffordModels(
    userId: string,
    modelNames: string[]
  ): Promise<{ canAfford: boolean; required: number; available: number }> {
    const required = modelNames.reduce((total, modelName) => {
      return total + getModelCreditCost(modelName)
    }, 0)

    const available = await this.getUserCredits(userId)

    return {
      canAfford: available >= required,
      required,
      available
    }
  }

  /**
   * Process credit usage for multiple models
   */
  static async processModelUsage(
    userId: string,
    businessId: string,
    modelUsage: Array<{ modelName: string; promptLogId: string }>
  ): Promise<CreditTransaction[]> {
    const transactions: CreditTransaction[] = []

    for (const usage of modelUsage) {
      const creditCost = getModelCreditCost(usage.modelName)
      const transaction = await this.deductCredits(
        userId,
        creditCost,
        `Prompt submission to ${usage.modelName}`,
        usage.promptLogId,
        usage.modelName
      )
      transactions.push(transaction)
    }

    return transactions
  }

  /**
   * Get user's credit transaction history
   */
  static async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<CreditTransaction[]> {
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    return transactions
  }

  /**
   * Get credit usage statistics
   */
  static async getCreditStats(userId: string): Promise<{
    currentBalance: number
    totalSpent: number
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        totalCreditsSpent: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return {
      currentBalance: user.credits,
      totalSpent: user.totalCreditsSpent
    }
  }


}
