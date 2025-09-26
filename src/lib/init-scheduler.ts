// Note: Scheduler initialization is now handled by Vercel cron jobs
// See vercel.json for cron configuration and /api/cron/* routes

console.log('Juicy Links: Using Vercel cron jobs for prompt scheduling')

// Export empty function for backward compatibility
export function initializeScheduler() {
  console.log('Scheduler initialization skipped - using Vercel cron jobs')
}
