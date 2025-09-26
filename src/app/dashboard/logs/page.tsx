import { redirect } from 'next/navigation'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import { PromptLogsView } from '@/components/prompt-logs-view'

const prisma = new PrismaClient()

export default async function PromptLogsPage() {
  const user = await stackServerApp.getUser()
  
  if (!user) {
    redirect('/handler/sign-in')
  }

  // Get user's businesses for filtering
  const businesses = await prisma.business.findMany({
    where: { userId: user.id },
    select: { id: true, name: true }
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Prompt Logs
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            View and analyze all your AI prompt submissions and responses
          </p>
        </div>

        <PromptLogsView businesses={businesses} />
      </div>
    </div>
  )
}
