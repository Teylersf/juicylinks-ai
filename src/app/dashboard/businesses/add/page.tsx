import { redirect } from 'next/navigation'
import { stackServerApp } from '@/stack'
import { AddBusinessForm } from '@/components/add-business-form'

export default async function AddBusinessPage() {
  const user = await stackServerApp.getUser()
  
  if (!user) {
    redirect('/handler/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Add New Business
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Set up your business for AI SEO optimization across all major LLM platforms
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <AddBusinessForm />
          </div>
        </div>
      </div>
    </div>
  )
}
