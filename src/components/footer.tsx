"use client"

import Link from "next/link"
import { Zap, Twitter, Linkedin, Github, Mail } from "lucide-react"

const footerNavigation = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "API Documentation", href: "/docs" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Press Kit", href: "/press" },
    { name: "Contact", href: "/contact" },
  ],
  resources: [
    { name: "Help Center", href: "/help" },
    { name: "Community", href: "/community" },
    { name: "Guides", href: "/guides" },
    { name: "Webinars", href: "/webinars" },
    { name: "Status", href: "/status" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
    { name: "Security", href: "/security" },
    { name: "Sitemap", href: "/sitemap-page" },
  ],
}

const socialLinks = [
  {
    name: "Twitter",
    href: "https://twitter.com/juicylinks",
    icon: Twitter,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/juicylinks",
    icon: Linkedin,
  },
  {
    name: "GitHub",
    href: "https://github.com/juicylinks",
    icon: Github,
  },
  {
    name: "Email",
    href: "mailto:support@juicylinks.ai",
    icon: Mail,
  },
]

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand section */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-green-600">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Juicy Links</span>
              </Link>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 max-w-md">
                The next generation of SEO. Get your business included in AI model training data 
                so you get recommended when users ask for suggestions. Get ahead of the AI revolution.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Product */}
            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-3">
                {footerNavigation.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-3">
                {footerNavigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Resources</h3>
              <ul className="space-y-3">
                {footerNavigation.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerNavigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Stay updated with AI SEO trends
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get the latest insights on AI-powered marketing and SEO strategies.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 min-w-0 md:min-w-80">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-600 dark:text-gray-300">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2025 Juicy Links. All rights reserved.</p>
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Made by{' '}
                <a 
                  href="https://www.taylorkalin.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline"
                >
                  Taylor Kalin
                </a>
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <span>Made with ❤️ for the AI generation</span>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}