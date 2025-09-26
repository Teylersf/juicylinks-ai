import { redirect } from 'next/navigation'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import { DashboardContent } from '@/components/dashboard-content'

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const user = await stackServerApp.getUser()
  
  if (!user) {
    redirect('/handler/sign-in')
  }
  
  // Get user data from database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      businesses: true,
      promptLogs: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          business: true,
        },
      },
      subscriptionHistory: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })
  
  // Create user in database if doesn't exist
  if (!dbUser) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.primaryEmail!,
        name: user.displayName,
        plan: 'FREE_TRIAL',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
      include: {
        businesses: true,
        promptLogs: true,
        subscriptionHistory: true,
      },
    })
    
    // Redirect new users to onboarding
    redirect('/dashboard/onboarding')
  }
  
  // If user has no businesses, redirect to onboarding
  if (dbUser.businesses.length === 0) {
    redirect('/dashboard/onboarding')
  }
  
  return <DashboardContent user={dbUser} />
}
