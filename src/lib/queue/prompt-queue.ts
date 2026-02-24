import { PrismaClient, LLMProvider, Business, User } from '@prisma/client'
import { GrokService } from '../llm-services/grok'
import { OpenAIService } from '../llm-services/openai'
import { PerplexityService } from '../llm-services/perplexity'
import { GeminiService } from '../llm-services/gemini'
import { ClaudeService } from '../llm-services/claude'
import { sendQueueProcessingNotification } from '../email'
import { LLM_MODELS } from '../constants/llm-models'
import { CreditManager } from '../credits/credit-manager'
import { getModelCreditCost } from '../constants/credit-system'

export interface QueueItem {
  id: string
  userId: string
  businessId: string
  business: Business
  user: User
  llmProvider: LLMProvider
  model: string // Specific model name (e.g., 'gpt-5', 'claude-4.1-opus')
  customPrompt?: string
  priority: number
  createdAt: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  position?: number
  totalInQueue?: number
}

export interface QueueStatus {
  totalItems: number
  processingItem?: QueueItem
}

export interface DetailedProgress {
  isProcessing: boolean
  currentBusiness?: string
  currentProvider?: LLMProvider
  currentModel?: string
  completedProviders: LLMProvider[]
  totalProviders: number
  progress: number // 0-100
  status: 'idle' | 'processing' | 'completed' | 'error'
  message: string
}

export class PromptQueueManager {
  private static instance: PromptQueueManager
  private prisma: PrismaClient
  private grokService: GrokService
  private openaiService: OpenAIService
  private perplexityService: PerplexityService
  private geminiService: GeminiService
  private claudeService: ClaudeService
  private isProcessing = false
  private currentQueue: QueueItem[] = []
  private statusCallbacks: Map<string, (status: QueueStatus) => void> = new Map()
  private detailedProgress: DetailedProgress = {
    isProcessing: false,
    completedProviders: [],
    totalProviders: 0,
    progress: 0,
    status: 'idle',
    message: 'Queue is idle'
  }

  private constructor() {
    this.prisma = new PrismaClient()
    this.grokService = new GrokService()
    this.openaiService = new OpenAIService()
    this.perplexityService = new PerplexityService()
    this.geminiService = new GeminiService()
    this.claudeService = new ClaudeService()
  }

  static getInstance(): PromptQueueManager {
    if (!PromptQueueManager.instance) {
      PromptQueueManager.instance = new PromptQueueManager()
    }
    return PromptQueueManager.instance
  }

  /**
   * Add prompts to queue for all active businesses
   */
  async addPromptsToQueue(triggerType: 'manual' | 'automatic' | 'credit' = 'automatic'): Promise<void> {
    try {
      // Get all active users with active businesses
      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            { isActive: true }, // Paid users
            { 
              AND: [
                { isTrialActive: true },
                { trialEndsAt: { gt: new Date() } }
              ]
            }
          ]
        },
        include: {
          businesses: {
            where: { isActive: true }
          }
        }
      })

      const queueItems: Omit<QueueItem, 'position' | 'totalInQueue'>[] = []
      const processedUsers = new Set<string>() // Track users we've already processed

      for (const user of users) {
        // Check if user should get prompts today based on their plan (check once per user)
        const userShouldGetPrompts = await this.shouldSendPromptsForUser(user)
        
        if (userShouldGetPrompts && !processedUsers.has(user.id)) {
          // Update user's tracking based on trigger type - once per user
          await this.updateUserQueueTracking(user, triggerType)
          processedUsers.add(user.id)
        }

        for (const business of user.businesses) {
          if (userShouldGetPrompts) {
            // Create queue items for each individual model in each selected provider
            for (const providerName of business.targetLLMs) {
              const provider = providerName as keyof typeof LLM_MODELS
              const models = LLM_MODELS[provider]
              
              if (models) {
                for (const model of models) {
                  queueItems.push({
                    id: `${business.id}-${provider.toLowerCase()}-${model.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    userId: user.id,
                    businessId: business.id,
                    business,
                    user,
                    llmProvider: provider,
                    model: model.name,
                    customPrompt: business.customPrompts[0] || undefined,
                    priority: this.calculatePriority(user.plan),
                    createdAt: new Date(),
                    status: 'pending'
                  })
                }
              }
            }
          }
        }
      }

      // Sort by priority (higher priority first)
      queueItems.sort((a, b) => b.priority - a.priority)
      
      // Add position information
      this.currentQueue = queueItems.map((item, index) => ({
        ...item,
        position: index + 1,
        totalInQueue: queueItems.length
      }))

      console.log(`Added ${queueItems.length} items to prompt queue`)
    } catch (error) {
      console.error('Error adding prompts to queue:', error)
    }
  }

  /**
   * Process the queue with rate limiting
   */
  async processQueue(triggerType: 'manual' | 'automatic' | 'credit' = 'automatic'): Promise<void> {
    if (this.isProcessing) {
      console.log('Queue is already being processed')
      return
    }

    this.isProcessing = true
    console.log(`Starting to process queue with ${this.currentQueue.length} items`)

    // Initialize progress tracking
    const totalItems = this.currentQueue.length
    const uniqueProviders = [...new Set(this.currentQueue.map(item => item.llmProvider))]
    
    this.updateProgress({
      isProcessing: true,
      completedProviders: [],
      totalProviders: uniqueProviders.length,
      progress: 0,
      status: 'processing',
      message: 'Starting queue processing...'
    })

    try {
      let processedCount = 0
      const processedItems: QueueItem[] = []
      
      while (this.currentQueue.length > 0) {
        const item = this.currentQueue.shift()!
        
        // Update item status to processing
        item.status = 'processing'
        this.notifyStatusUpdate()

        // Update detailed progress
        this.updateProgress({
          currentBusiness: item.business.name,
          currentProvider: item.llmProvider,
          message: `Processing ${item.llmProvider} (${item.model}) for ${item.business.name}...`,
          progress: Math.round((processedCount / totalItems) * 100)
        })

        console.log(`Processing prompt for business: ${item.business.name} (${item.llmProvider} - ${item.model})`)

        try {
          // Process the prompt based on LLM provider
          let result
          switch (item.llmProvider) {
            case 'GROK':
              result = await this.grokService.sendPrompt(
                item.business,
                item.customPrompt,
                item.model
              )
              break
            case 'OPENAI':
              result = await this.openaiService.sendPrompt(
                item.business,
                item.customPrompt,
                item.model
              )
              break
            case 'PERPLEXITY':
              result = await this.perplexityService.sendPrompt(
                item.business,
                item.customPrompt,
                item.model
              )
              break
            case 'GEMINI':
              result = await this.geminiService.sendPrompt(
                item.business,
                item.customPrompt,
                item.model
              )
              break
            case 'CLAUDE':
              result = await this.claudeService.sendPrompt(
                item.business,
                item.customPrompt,
                item.model
              )
              break
            default:
              throw new Error(`Unsupported LLM provider: ${item.llmProvider}`)
          }

          // Log the result to database
          await this.logPromptResult(item, result, triggerType)

          item.status = result.success ? 'completed' : 'failed'
          console.log(`Completed prompt for ${item.business.name}: ${result.success ? 'Success' : 'Failed'}`)

          // Add to processed items
          processedItems.push(item)

          // Update progress with success
          processedCount++
          
          // Add to completed providers if not already there
          const completedProviders = [...this.detailedProgress.completedProviders]
          if (!completedProviders.includes(item.llmProvider)) {
            completedProviders.push(item.llmProvider)
          }
          
          this.updateProgress({
            message: `✅ ${item.llmProvider} completed for ${item.business.name}`,
            progress: Math.round((processedCount / totalItems) * 100),
            completedProviders
          })

        } catch (error) {
          console.error(`Error processing prompt for ${item.business.name}:`, error)
          item.status = 'failed'
          
          // Log the error
          await this.logPromptResult(item, {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime: 0
          }, triggerType)

          // Add to processed items
          processedItems.push(item)

          // Update progress with error
          processedCount++
          
          // Add to completed providers even if failed (so UI shows it's done)
          const completedProviders = [...this.detailedProgress.completedProviders]
          if (!completedProviders.includes(item.llmProvider)) {
            completedProviders.push(item.llmProvider)
          }
          
          this.updateProgress({
            message: `❌ ${item.llmProvider} failed for ${item.business.name}`,
            progress: Math.round((processedCount / totalItems) * 100),
            completedProviders
          })
        }

        // Update queue positions
        this.updateQueuePositions()
        this.notifyStatusUpdate()

        // Rate limiting: 1 second delay between requests
        await this.delay(1000)
      }

      // Mark as completed
      this.updateProgress({
        isProcessing: false,
        currentBusiness: undefined,
        currentProvider: undefined,
        progress: 100,
        status: 'completed',
        message: `✅ All prompts processed successfully! (${processedCount}/${totalItems})`
      })

      // Send email notifications to users about their queue processing results
      await this.sendQueueNotificationEmails(processedItems, triggerType)

    } finally {
      this.isProcessing = false
      console.log('Queue processing completed')
    }
  }

  /**
   * Log prompt result to database and handle credit deduction
   */
  private async logPromptResult(item: QueueItem, result: { success: boolean; response?: string; error?: string; cost?: number; prompt?: string; responseTime?: number; tokenCount?: number }, triggerType: 'manual' | 'automatic' | 'credit' = 'automatic'): Promise<void> {
    try {
      // Create prompt log entry
      const promptLog = await this.prisma.promptLog.create({
        data: {
          userId: item.userId,
          businessId: item.businessId,
          promptText: result.prompt || 'Generated prompt',
          llmProvider: item.llmProvider,
          model: item.model,
          wasSuccessful: result.success,
          responseText: result.response,
          errorMessage: result.error,
          responseTime: result.responseTime,
          tokenCount: result.tokenCount,
          cost: result.cost,
          triggerType: triggerType
        }
      })

      // Deduct credits ONLY for credit-based triggers, not automatic cron jobs or regular manual triggers
      // Automatic daily/weekly submissions and regular manual triggers are included in the subscription plan
      if (triggerType === 'credit') {
        try {
          const creditCost = getModelCreditCost(item.model)
          await CreditManager.deductCredits(
            item.userId,
            creditCost,
            `Manual prompt submission to ${item.model}`,
            promptLog.id,
            item.model
          )
          console.log(`Deducted ${creditCost} credits for credit-based ${item.model} usage`)
        } catch (creditError) {
          console.error(`Failed to deduct credits for ${item.model}:`, creditError)
          // Don't fail the entire operation if credit deduction fails
          // This could happen if user runs out of credits mid-processing
        }
      } else {
        console.log(`No credits deducted for ${triggerType} ${item.model} submission (included in plan)`)
      }

      // Update business stats
      await this.prisma.business.update({
        where: { id: item.businessId },
        data: {
          totalPromptsSent: { increment: 1 },
          lastPromptSentAt: new Date()
        }
      })

      // Update user stats
      await this.prisma.user.update({
        where: { id: item.userId },
        data: {
          totalPromptsAllTime: { increment: 1 },
          totalPromptsThisMonth: { increment: 1 },
          lastPromptSentAt: new Date()
        }
      })

    } catch (error) {
      console.error('Error logging prompt result:', error)
    }
  }

  /**
   * Check if user should receive prompts based on their plan and frequency
   * Uses subscription-specific tracking to avoid interference with credit runs
   */
  private async shouldSendPromptsForUser(user: User): Promise<boolean> {
    const now = new Date()
    const isTrialActive = user.isTrialActive && user.trialEndsAt && now < user.trialEndsAt
    const isSubscriptionActive = user.isActive && user.stripeSubscriptionId

    // User must have access (trial or subscription)
    if (!isTrialActive && !isSubscriptionActive) {
      return false
    }

    // For trial users, check weekly restrictions using subscription tracking
    if (isTrialActive && !isSubscriptionActive) {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const hasRunThisWeek = user.lastSubscriptionRunAt && user.lastSubscriptionRunAt > oneWeekAgo
      
      if (hasRunThisWeek) {
        console.log(`Trial user ${user.id} has already had subscription run this week, skipping`)
        return false
      }
      return true
    }

    // For paid users, check daily restrictions using subscription tracking
    if (isSubscriptionActive) {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const hasRunToday = user.lastSubscriptionRunAt && user.lastSubscriptionRunAt > todayStart
      
      if (hasRunToday) {
        console.log(`Paid user ${user.id} has already had subscription run today, skipping`)
        return false
      }
      return true
    }

    return false
  }

  /**
   * Update user's queue tracking based on trigger type
   */
  private async updateUserQueueTracking(user: User, triggerType: 'manual' | 'automatic' | 'credit' = 'automatic'): Promise<void> {
    const isTrialActive = user.isTrialActive && user.trialEndsAt && new Date() < user.trialEndsAt
    const isSubscriptionActive = user.isActive && user.stripeSubscriptionId
    const now = new Date()

    try {
      if (isTrialActive && !isSubscriptionActive) {
        // Trial users: update tracking based on trigger type
        const updateData: {
          lastQueueRunAt: Date
          weeklyQueueRunsUsed: { increment: number }
          lastSubscriptionRunAt?: Date
          lastCreditRunAt?: Date
        } = {
          lastQueueRunAt: now,
          weeklyQueueRunsUsed: { increment: 1 }
        }
        
        if (triggerType === 'automatic') {
          updateData.lastSubscriptionRunAt = now
        } else if (triggerType === 'credit') {
          updateData.lastCreditRunAt = now
        }
        // For 'manual' trigger type, only update lastQueueRunAt (already in updateData)

        await this.prisma.user.update({
          where: { id: user.id },
          data: updateData
        })
        console.log(`Updated trial user ${user.id} queue tracking (${triggerType})`)
      } else if (isSubscriptionActive) {
        // Paid users: update tracking based on trigger type
        const updateData: {
          lastQueueRunAt: Date
          lastSubscriptionRunAt?: Date
          lastCreditRunAt?: Date
        } = {
          lastQueueRunAt: now
        }
        
        if (triggerType === 'automatic') {
          updateData.lastSubscriptionRunAt = now
        } else if (triggerType === 'credit') {
          updateData.lastCreditRunAt = now
        }
        // For 'manual' trigger type, only update lastQueueRunAt (already in updateData)

        await this.prisma.user.update({
          where: { id: user.id },
          data: updateData
        })
        console.log(`Updated paid user ${user.id} queue tracking (${triggerType})`)
      }
    } catch (error) {
      console.error(`Error updating user ${user.id} queue tracking:`, error)
    }
  }

  /**
   * Send email notifications to users about queue processing results
   */
  private async sendQueueNotificationEmails(processedItems: QueueItem[], triggerType: 'manual' | 'automatic' | 'credit'): Promise<void> {
    try {
      // Group items by user and business
      const userBusinessResults = new Map<string, {
        user: User
        businessResults: Map<string, {
          business: Business
          totalPrompts: number
          successfulPrompts: number
          failedPrompts: number
        }>
      }>()

      // Process all items and group by user/business
      for (const item of processedItems) {
        const userId = item.userId
        const businessId = item.businessId

        if (!userBusinessResults.has(userId)) {
          userBusinessResults.set(userId, {
            user: item.user,
            businessResults: new Map()
          })
        }

        const userResults = userBusinessResults.get(userId)!
        if (!userResults.businessResults.has(businessId)) {
          userResults.businessResults.set(businessId, {
            business: item.business,
            totalPrompts: 0,
            successfulPrompts: 0,
            failedPrompts: 0
          })
        }

        const businessResults = userResults.businessResults.get(businessId)!
        businessResults.totalPrompts++
        if (item.status === 'completed') {
          businessResults.successfulPrompts++
        } else {
          businessResults.failedPrompts++
        }
      }

      // Send email to each user for each business
      for (const [, userResults] of userBusinessResults) {
        const user = userResults.user
        const isTrialUser = !!(user.isTrialActive && user.trialEndsAt && new Date() < user.trialEndsAt)

        for (const [, businessResults] of userResults.businessResults) {
          try {
            await sendQueueProcessingNotification(
              user.email,
              user.name || undefined,
              {
                totalPrompts: businessResults.totalPrompts,
                successfulPrompts: businessResults.successfulPrompts,
                failedPrompts: businessResults.failedPrompts,
                businessName: businessResults.business.name,
                isTrialUser: isTrialUser,
                userPlan: user.plan,
                triggerType: triggerType
              }
            )
            console.log(`Queue notification email sent to ${user.email} for business ${businessResults.business.name}`)
          } catch (emailError) {
            console.error(`Failed to send queue notification email to ${user.email}:`, emailError)
            // Don't throw - continue with other emails
          }
        }
      }
    } catch (error) {
      console.error('Error sending queue notification emails:', error)
      // Don't throw - email failures shouldn't break queue processing
    }
  }

  /**
   * Calculate priority based on user plan
   */
  private calculatePriority(plan: string): number {
    switch (plan) {
      case 'ENTERPRISE': return 100
      case 'GROWTH': return 80
      case 'STARTER': return 60
      case 'FREE_TRIAL': return 40
      default: return 20
    }
  }

  /**
   * Update queue positions after processing an item
   */
  private updateQueuePositions(): void {
    this.currentQueue.forEach((item, index) => {
      item.position = index + 1
      item.totalInQueue = this.currentQueue.length
    })
  }

  /**
   * Add selective prompts to queue for specific models
   */
  async addSelectivePromptsToQueue(
    userId: string, 
    businessId: string, 
    selectedModels: { provider: string; models: string[] }[]
  ): Promise<void> {
    try {
      // Get user and business data
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          businesses: {
            where: { id: businessId, isActive: true }
          }
        }
      })

      if (!user || user.businesses.length === 0) {
        throw new Error('User or business not found')
      }

      const business = user.businesses[0]
      const queueItems: Omit<QueueItem, 'position' | 'totalInQueue'>[] = []

      // Create queue items for selected models only
      for (const selection of selectedModels) {
        const provider = selection.provider as keyof typeof LLM_MODELS
        const models = LLM_MODELS[provider]
        
        if (models) {
          for (const modelName of selection.models) {
            const model = models.find(m => m.name === modelName)
            if (model) {
              queueItems.push({
                id: `${businessId}-${provider.toLowerCase()}-${modelName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId,
                businessId,
                business,
                user,
                llmProvider: provider,
                model: modelName,
                customPrompt: business.customPrompts[0] || undefined,
                priority: this.calculatePriority(user.plan),
                createdAt: new Date(),
                status: 'pending'
              })
            }
          }
        }
      }

      // Sort by priority (higher priority first)
      queueItems.sort((a, b) => b.priority - a.priority)

      // Add positions
      const queueItemsWithPositions = queueItems.map((item, index) => ({
        ...item,
        position: index + 1,
        totalInQueue: queueItems.length
      }))

      // Add to current queue
      this.currentQueue.push(...queueItemsWithPositions)

      // Update positions for all items
      this.updateQueuePositions()

      console.log(`Added ${queueItems.length} selective prompts to queue for user ${userId}`)
    } catch (error) {
      console.error('Error adding selective prompts to queue:', error)
      throw error
    }
  }

  /**
   * Get queue status for a specific user
   * Note: userId parameter is kept for API consistency but currently not used
   * as the queue manager handles all users globally
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getQueueStatusForUser(userId: string): QueueStatus {
    const processingItem = this.currentQueue.find(item => item.status === 'processing')
    
    return {
      totalItems: this.currentQueue.length,
      processingItem
    }
  }

  /**
   * Get detailed progress information
   */
  getDetailedProgress(): DetailedProgress {
    return { ...this.detailedProgress }
  }

  /**
   * Update detailed progress
   */
  private updateProgress(updates: Partial<DetailedProgress>) {
    this.detailedProgress = { ...this.detailedProgress, ...updates }
  }

  /**
   * Subscribe to queue status updates
   */
  subscribeToUpdates(userId: string, callback: (status: QueueStatus) => void): void {
    this.statusCallbacks.set(userId, callback)
  }

  /**
   * Unsubscribe from queue status updates
   */
  unsubscribeFromUpdates(userId: string): void {
    this.statusCallbacks.delete(userId)
  }

  /**
   * Notify all subscribers of status updates
   */
  private notifyStatusUpdate(): void {
    this.statusCallbacks.forEach((callback, userId) => {
      const status = this.getQueueStatusForUser(userId)
      callback(status)
    })
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get current queue status
   */
  getCurrentQueue(): QueueItem[] {
    return [...this.currentQueue]
  }

  /**
   * Check if queue is currently processing
   */
  isCurrentlyProcessing(): boolean {
    return this.isProcessing
  }
}
