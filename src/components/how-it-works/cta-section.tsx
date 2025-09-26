"use client"

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

const features = [
  "14-day free trial",
  "No setup fees", 
  "Cancel anytime",
  "24/7 support"
]

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Ready to Transform Your Business?
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Training AI Models
            <span className="block">About Your Business Today</span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-4 max-w-2xl mx-auto">
            The sooner you start, the more training data you create. 
            <strong>Growth plan recommended for maximum impact.</strong>
          </p>
          
          <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
            Run for 6+ months to maximize your chances of being included in the next generation of AI models.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center text-white">
                <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Link
            href="/handler/sign-up"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            Start Free Trial
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
          
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-bold text-lg"
          >
            View Pricing
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-blue-100 text-sm"
        >
          <p>
            No credit card required • Set up in under 5 minutes • 
            <span className="font-semibold"> 30-day money-back guarantee</span>
          </p>
        </motion.div>
      </div>

      {/* Success Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        viewport={{ once: true }}
        className="relative mt-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Join the AI Revolution
            </h3>
            <p className="text-blue-100">
              Businesses using Juicy Links are already seeing incredible results
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">2,500+</div>
              <div className="text-blue-200 text-sm">Businesses Trained</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">450%</div>
              <div className="text-blue-200 text-sm">Avg. Growth Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">166M+</div>
              <div className="text-blue-200 text-sm">Users Reached</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">98.7%</div>
              <div className="text-blue-200 text-sm">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
