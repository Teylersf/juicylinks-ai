import { redirect, notFound } from 'next/navigation'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import { EditBusinessForm } from '@/components/edit-business-form'

const prisma = new PrismaClient()

interface EditBusinessPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditBusinessPage({ params }: EditBusinessPageProps) {
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
    }
  })

  if (!business) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Business
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Update your business information and AI SEO settings
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <EditBusinessForm business={business} />
          </div>
        </div>
      </div>
    </div>
  )
}
