import { redirect } from 'next/navigation'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import { AccountSettings } from '@/components/account-settings'

const prisma = new PrismaClient()

export default async function SettingsPage() {
  const user = await stackServerApp.getUser()
  
  if (!user) {
    redirect('/handler/sign-in')
  }

  // Get user data from database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      businesses: {
        select: { id: true, name: true }
      },
      creditTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      subscriptionHistory: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  if (!dbUser) {
    // Create user if doesn't exist
    const newUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.primaryEmail!,
        name: user.displayName,
        plan: 'FREE_TRIAL',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      include: {
        businesses: true,
        creditTransactions: true,
        subscriptionHistory: true
      }
    })
    
    return <AccountSettings user={newUser} />
  }

  return <AccountSettings user={dbUser} />
}

