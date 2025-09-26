import { Metadata } from 'next'
import { ContactForm } from '@/components/contact-form'
import { Mail, MessageSquare, Clock, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us - Juicy Links',
  description: 'Get in touch with our team. We&apos;re here to help you succeed with AI SEO and get your business recommended by AI platforms.',
  keywords: 'contact, support, AI SEO help, customer service, Juicy Links',
}

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Send us a message and we\'ll respond within 24 hours',
    details: 'support@juicylinks.ai',
    color: 'blue'
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our team during business hours',
    details: 'Available 9 AM - 6 PM PST',
    color: 'green'
  },
  {
    icon: Clock,
    title: 'Response Time',
    description: 'We typically respond within',
    details: '2-4 hours during business days',
    color: 'purple'
  },
  {
    icon: MapPin,
    title: 'Location',
    description: 'Based in the United States',
    details: 'Serving customers worldwide',
    color: 'orange'
  }
]

const colorClasses = {
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-600 transform rotate-12 scale-150"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Mail className="h-4 w-4 mr-2" />
              We&apos;re Here to Help
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Get in Touch
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                with Our Team
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Have questions about AI SEO? Need help getting started? Want to discuss enterprise solutions? 
              We&apos;re here to help you succeed with AI recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Grid */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              const colorClass = colorClasses[info.color as keyof typeof colorClasses]
              
              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {info.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {info.description}
                  </p>
                  
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {info.details}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Send Us a Message
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Fill out the form below and we&apos;ll get back to you as soon as possible
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How quickly will I see results?",
                answer: "Most businesses start seeing AI recommendations within 2-4 weeks of consistent submissions. The more data we submit, the faster you'll appear in AI responses."
              },
              {
                question: "Which AI platforms do you integrate with?",
                answer: "We integrate with all major AI platforms: OpenAI (GPT-5), Anthropic (Claude 4), Google (Gemini 2.5), Grok (X.AI), and Perplexity. That's 22 different AI models total."
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period."
              },
              {
                question: "Do you offer enterprise solutions?",
                answer: "Yes, we offer custom enterprise solutions with dedicated account management, custom integrations, and volume pricing. Contact us to discuss your needs."
              },
              {
                question: "Is my business data secure?",
                answer: "Absolutely. We use enterprise-grade encryption and security measures to protect your business information. Your data is never shared with competitors."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
