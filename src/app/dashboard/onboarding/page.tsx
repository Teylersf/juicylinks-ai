import { redirect } from 'next/navigation'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import { OnboardingWizard } from '@/components/onboarding-wizard'

const prisma = new PrismaClient()

export default async function OnboardingPage() {
  const user = await stackServerApp.getUser()
  
  if (!user) {
    redirect('/handler/sign-in')
  }

  // Check if user already has businesses
  const businessCount = await prisma.business.count({
    where: { userId: user.id }
  })

  // If user already has businesses, redirect to dashboard
  if (businessCount > 0) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to Juicy Links! 🎉
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
              Let&apos;s get your first business set up for AI SEO optimization
            </p>
          </div>

          <OnboardingWizard />
        </div>
      </div>
    </div>
  )
}
