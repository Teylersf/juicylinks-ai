import * as cron from 'node-cron'
import { PromptQueueManager } from '../queue/prompt-queue'

export class PromptScheduler {
  private static instance: PromptScheduler
  private queueManager: PromptQueueManager
  private isScheduled = false

  private constructor() {
    this.queueManager = PromptQueueManager.getInstance()
  }

  static getInstance(): PromptScheduler {
    if (!PromptScheduler.instance) {
      PromptScheduler.instance = new PromptScheduler()
    }
    return PromptScheduler.instance
  }

  /**
   * Start the cron job scheduler
   */
  start(): void {
    if (this.isScheduled) {
      console.log('Prompt scheduler is already running')
      return
    }

    // Schedule to run every day at 9 AM UTC
    cron.schedule('0 9 * * *', async () => {
      console.log('Starting daily prompt queue processing...')
      try {
        await this.queueManager.addPromptsToQueue('automatic')
        await this.queueManager.processQueue('automatic')
        console.log('Daily prompt queue processing completed')
      } catch (error) {
        console.error('Error in daily prompt processing:', error)
      }
    }, {
      timezone: "UTC"
    })

    // Also schedule a smaller batch every 4 hours for more frequent processing
    cron.schedule('0 */4 * * *', async () => {
      console.log('Starting 4-hour prompt queue check...')
      try {
        // Only process if queue is not already running
        if (!this.queueManager.isCurrentlyProcessing()) {
          await this.queueManager.addPromptsToQueue('automatic')
          await this.queueManager.processQueue('automatic')
        }
      } catch (error) {
        console.error('Error in 4-hour prompt processing:', error)
      }
    }, {
      timezone: "UTC"
    })

    this.isScheduled = true
    console.log('Prompt scheduler started - Daily at 9 AM UTC and every 4 hours')
  }

  /**
   * Stop the cron job scheduler
   */
  stop(): void {
    cron.getTasks().forEach(task => {
      task.stop()
    })
    this.isScheduled = false
    console.log('Prompt scheduler stopped')
  }

  /**
   * Manually trigger prompt processing (for testing or admin use)
   */
  async triggerManualProcessing(): Promise<void> {
    console.log('Manually triggering prompt queue processing...')
    try {
      await this.queueManager.addPromptsToQueue('manual')
      await this.queueManager.processQueue('manual')
      console.log('Manual prompt queue processing completed')
    } catch (error) {
      console.error('Error in manual prompt processing:', error)
      throw error
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isScheduled: boolean; isProcessing: boolean; queueLength: number } {
    return {
      isScheduled: this.isScheduled,
      isProcessing: this.queueManager.isCurrentlyProcessing(),
      queueLength: this.queueManager.getCurrentQueue().length
    }
  }
}
