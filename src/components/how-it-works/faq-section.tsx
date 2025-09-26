"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    question: "How does the AI training actually work?",
    answer: "We submit prompts about your business to AI platforms with data sharing enabled. When AI companies train their next models, your business data is included in that training, making you more likely to be recommended. The more submissions over time, the higher your probability of inclusion."
  },
  {
    question: "How long does it take to see results?",
    answer: "You may see some immediate recommendations, but the real power comes from long-term training. We recommend running for 6+ months to maximize your chances of being included in the next generation of AI models. The longer you run, the more training data you create."
  },
  {
    question: "Which AI platforms do you train?",
    answer: "We train your business across all major AI platforms including OpenAI (ChatGPT), Anthropic Claude, Google Gemini, Perplexity AI, and Grok (X.AI). This covers over 166 million users worldwide."
  },
  {
    question: "How do you ensure my business is represented accurately?",
    answer: "Our advanced prompt engineering ensures your business is presented authentically. We use your provided business information, values, and unique selling points to create contextually appropriate recommendations that maintain your brand integrity."
  },
  {
    question: "Is my business data secure?",
    answer: "Absolutely. We use enterprise-grade security including end-to-end encryption, SOC 2 Type II compliance, and bank-level security measures. Your data is never shared with competitors or third parties."
  },
  {
    question: "Can I customize what information is shared about my business?",
    answer: "Yes, you have complete control over your business profile. You can specify services, target audience, unique selling points, and even custom messaging that you want AI models to learn and share."
  },
  {
    question: "Why should I choose the Growth plan over Starter?",
    answer: "The Growth plan submits significantly more prompts daily, increasing your probability of being included in AI model training. More submissions = higher likelihood of recommendations. For maximum effectiveness, we strongly recommend the Growth plan for 6+ months."
  },
  {
    question: "How often are the AI models retrained?",
    answer: "We submit prompts daily to current models. When AI companies release new models (every few months), they train on data from previous interactions. We add new models to our system within 1 week of their launch, so you start benefiting immediately."
  },
  {
    question: "What if I'm not satisfied with the results?",
    answer: "We offer a 30-day money-back guarantee. If you're not seeing increased AI recommendations within 30 days, we'll refund your subscription completely. We're confident in our technology and results."
  },
  {
    question: "Do you work with businesses in all industries?",
    answer: "Yes, our platform works across all industries - from local service businesses to e-commerce, SaaS companies, restaurants, healthcare, legal services, and more. Our AI adapts to any business type."
  },
  {
    question: "How is this different from traditional SEO?",
    answer: "Traditional SEO optimizes for search engines like Google. We optimize for AI recommendation engines like ChatGPT, Claude, and Gemini. As more people ask AI for business recommendations, this becomes increasingly valuable."
  },
  {
    question: "Can I track the performance and ROI?",
    answer: "Yes, our dashboard provides detailed analytics including recommendation frequency, success rates across different AI platforms, and performance trends. You can see exactly how your investment is performing."
  },
  {
    question: "What happens if I cancel my subscription?",
    answer: "You can cancel anytime. Your business will continue to benefit from previous AI training, but new training sessions will stop. We recommend maintaining your subscription for continued optimization and competitive advantage."
  },
  {
    question: "Do you offer enterprise or agency plans?",
    answer: "Yes, we offer custom enterprise solutions for large businesses and white-label agency plans for marketing agencies. Contact our sales team to discuss volume pricing and custom features."
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <HelpCircle className="h-4 w-4 mr-2" />
            Frequently Asked Questions
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get answers to the most common questions about AI-powered business recommendations
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Still Have Questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our team of AI experts is here to help you understand how Juicy Links 
              can transform your business growth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Contact Support
              </button>
              <button className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
