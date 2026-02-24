import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink, Home, BookOpen, Users, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sitemap - Juicy Links',
  description: 'Complete sitemap of all pages and features available on Juicy Links AI SEO platform.',
  robots: {
    index: true,
    follow: true,
  },
}

const sitePages = [
  {
    category: 'Main Pages',
    icon: Home,
    pages: [
      { name: 'Homepage', url: '/', description: 'AI SEO platform for getting recommended by AI models' },
      { name: 'How It Works', url: '/how-it-works', description: 'Learn how our AI model integration process works' },
      { name: 'Pricing', url: '/pricing', description: 'View our subscription plans and credit packages' },
      { name: 'Contact', url: '/contact', description: 'Get in touch with our support team' },
    ]
  },
  {
    category: 'Dashboard',
    icon: BarChart3,
    pages: [
      { name: 'Dashboard Home', url: '/dashboard', description: 'Main dashboard with analytics and queue status' },
      { name: 'Business Management', url: '/dashboard/businesses/add', description: 'Add and manage your businesses' },
      { name: 'Prompt Logs', url: '/dashboard/logs', description: 'View detailed logs of all AI submissions' },
      { name: 'Onboarding', url: '/dashboard/onboarding', description: 'Get started with your first business setup' },
    ]
  },
  {
    category: 'Account',
    icon: Users,
    pages: [
      { name: 'Sign In', url: '/handler/sign-in', description: 'Sign in to your account' },
      { name: 'Sign Up', url: '/handler/sign-up', description: 'Create a new account' },
    ]
  }
]

const externalLinks = [
  { name: 'XML Sitemap', url: '/sitemap.xml', description: 'Machine-readable sitemap for search engines' },
  { name: 'Robots.txt', url: '/robots.txt', description: 'Search engine crawling instructions' },
]

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Site Map
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Navigate through all pages and features of the Juicy Links AI SEO platform. 
            Find everything you need to get your business recommended by AI models.
          </p>
        </div>

        {/* Main Site Pages */}
        <div className="space-y-8">
          {sitePages.map((section) => {
            const IconComponent = section.icon
            return (
              <div key={section.category} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <IconComponent className="h-6 w-6 text-blue-600 mr-3" />
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {section.category}
                    </h2>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {section.pages.map((page) => (
                      <Link
                        key={page.url}
                        href={page.url}
                        className="block p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
                              {page.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {page.description}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-mono">
                              {page.url}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 ml-2 flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Technical Pages */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <BookOpen className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Technical Pages
              </h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {externalLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 mb-1">
                        {link.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {link.description}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-mono">
                        {link.url}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-green-500 ml-2 flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Platform Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {sitePages.reduce((acc, section) => acc + section.pages.length, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Pages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">22</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">AI Models</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">5</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">LLM Providers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Processing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Need help navigating? <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
