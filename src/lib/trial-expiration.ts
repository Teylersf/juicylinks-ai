import { PrismaClient } from '@prisma/client'
import { sendTrialExpiring3Days, sendTrialExpiring1Day, sendTrialExpired } from '@/lib/email'

const prisma = new PrismaClient()

export class TrialExpirationService {
  /**
   * Check for trials expiring soon and send warning emails
   */
  static async checkAndSendExpirationWarnings(): Promise<void> {
    try {
      console.log('Checking for trial expirations...')
      
      // Get current date and calculate warning dates
      const now = new Date()
      const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000))
      const oneDayFromNow = new Date(now.getTime() + (1 * 24 * 60 * 60 * 1000))
      
      // Find users whose trials are expiring in 3 days (first warning)
      const usersExpiring3Days = await prisma.user.findMany({
        where: {
          isTrialActive: true,
          plan: 'FREE_TRIAL',
          trialEndsAt: {
            not: null,
            gte: now,
            lte: threeDaysFromNow
          },
          // Only send if we haven't sent a 3-day warning yet
          notifications: {
            none: {
              type: 'WARNING',
              title: 'Trial expiring in 3 days',
              createdAt: {
                gte: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)) // Within last 7 days
              }
            }
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
          trialEndsAt: true,
          createdAt: true
        }
      })

      // Find users whose trials are expiring in 1 day (final warning)
      const usersExpiring1Day = await prisma.user.findMany({
        where: {
          isTrialActive: true,
          plan: 'FREE_TRIAL',
          trialEndsAt: {
            not: null,
            gte: now,
            lte: oneDayFromNow
          },
          // Only send if we haven't sent a 1-day warning yet
          notifications: {
            none: {
              type: 'WARNING',
              title: 'Trial expires tomorrow',
              createdAt: {
                gte: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)) // Within last 2 days
              }
            }
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
          trialEndsAt: true,
          createdAt: true
        }
      })

      // Find users whose trials have expired (deactivation)
      const expiredUsers = await prisma.user.findMany({
        where: {
          isTrialActive: true,
          plan: 'FREE_TRIAL',
          trialEndsAt: {
            not: null,
            lt: now
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
          trialEndsAt: true
        }
      })

      // Send 3-day warning emails
      for (const user of usersExpiring3Days) {
        await this.send3DayWarning(user)
      }

      // Send 1-day warning emails
      for (const user of usersExpiring1Day) {
        await this.send1DayWarning(user)
      }

      // Deactivate expired trials
      for (const user of expiredUsers) {
        await this.deactivateExpiredTrial(user)
      }

      console.log(`Trial expiration check complete:`)
      console.log(`- 3-day warnings sent: ${usersExpiring3Days.length}`)
      console.log(`- 1-day warnings sent: ${usersExpiring1Day.length}`)
      console.log(`- Trials deactivated: ${expiredUsers.length}`)

    } catch (error) {
      console.error('Error checking trial expirations:', error)
      throw error
    }
  }

  /**
   * Send 3-day expiration warning
   */
  private static async send3DayWarning(user: {
    id: string
    email: string
    name: string | null
    trialEndsAt: Date | null
    createdAt: Date
  }): Promise<void> {
    try {
      if (!user.trialEndsAt) return
      
      const expirationDate = new Date(user.trialEndsAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      await sendTrialExpiring3Days(
        user.email,
        user.name || undefined,
        expirationDate
      )

      // Log the notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'WARNING',
          title: 'Trial expiring in 3 days',
          message: `Your free trial expires on ${expirationDate}`,
          isRead: false
        }
      })

      console.log(`Sent 3-day trial warning to ${user.email}`)
    } catch (error) {
      console.error(`Failed to send 3-day warning to ${user.email}:`, error)
    }
  }

  /**
   * Send 1-day expiration warning
   */
  private static async send1DayWarning(user: {
    id: string
    email: string
    name: string | null
    trialEndsAt: Date | null
    createdAt: Date
  }): Promise<void> {
    try {
      if (!user.trialEndsAt) return
      
      const expirationDate = new Date(user.trialEndsAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      await sendTrialExpiring1Day(
        user.email,
        user.name || undefined,
        expirationDate
      )

      // Log the notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'WARNING',
          title: 'Trial expires tomorrow',
          message: `Your free trial expires tomorrow (${expirationDate})`,
          isRead: false
        }
      })

      console.log(`Sent 1-day trial warning to ${user.email}`)
    } catch (error) {
      console.error(`Failed to send 1-day warning to ${user.email}:`, error)
    }
  }

  /**
   * Deactivate expired trial and send notification
   */
  private static async deactivateExpiredTrial(user: {
    id: string
    email: string
    name: string | null
    trialEndsAt: Date | null
  }): Promise<void> {
    try {
      // Deactivate the trial
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isTrialActive: false,
          plan: 'FREE_TRIAL' // Keep as FREE_TRIAL but inactive
        }
      })

      await sendTrialExpired(
        user.email,
        user.name || undefined
      )

      // Log the notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'INFO',
          title: 'Trial expired',
          message: 'Your free trial has expired. Upgrade to continue using Juicy Links.',
          isRead: false
        }
      })

      console.log(`Deactivated expired trial for ${user.email}`)
    } catch (error) {
      console.error(`Failed to deactivate trial for ${user.email}:`, error)
    }
  }

  /**
   * Set trial expiration date for new users (7 days from signup)
   */
  static async setTrialExpiration(userId: string): Promise<void> {
    try {
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 7) // 7-day trial

      await prisma.user.update({
        where: { id: userId },
        data: {
          trialEndsAt,
          isTrialActive: true,
          plan: 'FREE_TRIAL'
        }
      })

      console.log(`Set trial expiration for user ${userId}: ${trialEndsAt}`)
    } catch (error) {
      console.error(`Failed to set trial expiration for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Get trial status for a user
   */
  static async getTrialStatus(userId: string): Promise<{
    isTrialActive: boolean
    trialEndsAt: Date | null
    daysRemaining: number | null
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          isTrialActive: true,
          trialEndsAt: true,
          plan: true
        }
      })

      if (!user || !user.trialEndsAt) {
        return {
          isTrialActive: false,
          trialEndsAt: null,
          daysRemaining: null
        }
      }

      const now = new Date()
      const daysRemaining = Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      return {
        isTrialActive: user.isTrialActive && daysRemaining > 0,
        trialEndsAt: user.trialEndsAt,
        daysRemaining: Math.max(0, daysRemaining)
      }
    } catch (error) {
      console.error(`Failed to get trial status for user ${userId}:`, error)
      throw error
    }
  }
}
