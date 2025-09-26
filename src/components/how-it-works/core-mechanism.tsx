"use client"

import { motion } from 'framer-motion'
import { Database, Repeat, TrendingUp, Clock, Target, Zap } from 'lucide-react'

export function CoreMechanism() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How Getting Into AI Models Really Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            The secret behind getting your business recommended by AI: consistent data submission 
            that gets included in the next generation of AI models
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Database className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Daily Prompt Submissions
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We submit carefully crafted prompts about your business to all major AI platforms 
                <strong> with data sharing enabled</strong>. This means your business information 
                becomes part of their training data.
              </p>
            </motion.div>

            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Repeat className="h-8 w-8 text-blue-500 dark:text-blue-400" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Next Model Release
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                When AI companies release new models, they train on data from previous interactions. 
                <strong> Your business data gets included</strong>, making you more likely to be 
                recommended in the new model.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-4">
                <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Volume = Probability
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              The more prompts we submit about your business, the higher the probability 
              you&apos;ll be recommended when users ask AI for suggestions. This is why our 
              <strong> Growth plan submits more prompts daily</strong> - increasing your 
              chances of being included in future model training data.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Long-term Strategy
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              <strong>You need to keep submissions running for multiple months</strong> to 
              get maximum benefit. The longer you run, the more data points you create, 
              and the higher your likelihood of being included when companies train their next models.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold mb-4">
            New Model Integration Guarantee
          </h3>
          
          <p className="text-lg text-indigo-100 mb-6 max-w-3xl mx-auto">
            We monitor AI company releases and <strong>add new models to our system within 1 week</strong> 
            of their launch. This means you start submitting to new models immediately, 
            giving you a head start on the next training cycle.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">1 Week</div>
              <div className="text-indigo-200 text-sm">New Model Integration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">6+ Months</div>
              <div className="text-indigo-200 text-sm">Recommended Runtime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">5x Higher</div>
              <div className="text-indigo-200 text-sm">Growth Plan Submission Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
