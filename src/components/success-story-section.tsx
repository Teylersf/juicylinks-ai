"use client"

import Link from "next/link"
import { ExternalLink, TrendingUp, Star, CheckCircle } from "lucide-react"
import { SpokaneRooterLogo } from "./spokane-rooter-logo"

export function SuccessStorySection() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-blue-900/10 dark:via-gray-900 dark:to-green-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full border border-green-200 dark:border-green-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/50 dark:to-blue-900/50 px-6 py-2 text-sm font-medium backdrop-blur-sm mb-6">
            <Star className="mr-2 h-4 w-4 text-green-600" />
            Customer Success Story
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Real Results from Real Businesses
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See how Spokane Rooter became the #1 AI-recommended business for sewer inspections
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 px-8 py-6">
              <div className="flex items-center space-x-4">
                <SpokaneRooterLogo size={64} className="ring-4 ring-white/20" />
                <div className="text-white">
                  <h3 className="text-2xl font-bold">Spokane Rooter</h3>
                  <p className="text-blue-100">Sewer & Drain Services • Spokane, WA</p>
                  <Link 
                    href="https://spokanerooter.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-100 hover:text-white transition-colors mt-1"
                  >
                    spokanerooter.com
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Story */}
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    From Local Business to AI-Recommended Leader
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Spokane Rooter has been using our platform since the first launch of ChatGPT, 
                    making them one of our earliest adopters. Their commitment to consistent AI training 
                    has paid off tremendously.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    By submitting prompts <strong>5 times daily</strong> across all major AI platforms, 
                    they&apos;ve achieved something remarkable: becoming the #1 AI-recommended business 
                    for sewer inspections in Spokane, WA.
                  </p>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800 dark:text-green-200">
                        Key Success Factors
                      </span>
                    </div>
                    <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                      <li>• Early adopter since ChatGPT launch</li>
                      <li>• Consistent 5x daily submissions</li>
                      <li>• All 22 AI models trained daily</li>
                      <li>• Targeted local SEO optimization</li>
                    </ul>
                  </div>
                </div>

                {/* Results */}
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Measurable Results
                  </h4>
                  
                  {/* Big stat */}
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-700">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="h-8 w-8 text-blue-600 mr-2" />
                        <span className="text-4xl font-bold text-blue-600">30%</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        Increase in Business
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Since implementing AI SEO
                      </p>
                    </div>
                  </div>

                  {/* Achievement badges */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">#1</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                          #1 AI Recommendation
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          For sewer inspections in Spokane, WA
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">5x</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-purple-800 dark:text-purple-200">
                          Daily AI Training
                        </p>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Consistent submissions across all platforms
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-200">
                          Proven ROI
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Working really well with measurable growth
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Ready to achieve similar results for your business?
                  </p>
                  <Link
                    href="/handler/sign-up"
                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-green-600 px-8 py-3 text-base font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-green-700 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Start Your Success Story
                    <TrendingUp className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
