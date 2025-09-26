import { redirect, notFound } from 'next/navigation'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import { PromptConfiguration } from '@/components/prompt-configuration'

const prisma = new PrismaClient()

interface PromptConfigPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PromptConfigPage({ params }: PromptConfigPageProps) {
  const resolvedParams = await params
  const user = await stackServerApp.getUser()
  
  if (!user) {
    redirect('/handler/sign-in')
  }

  // Get the business
  const business = await prisma.business.findFirst({
    where: {
      id: resolvedParams.id,
      userId: user.id, // Ensure user owns this business
    },
    include: {
      promptLogs: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!business) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Prompt Configuration
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 break-words">
              Configure AI prompts and LLM targeting for <strong>{business.name}</strong>
            </p>
          </div>

          <PromptConfiguration business={business} />
        </div>
      </div>
    </div>
  )
}
