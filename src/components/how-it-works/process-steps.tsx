"use client"

import { motion } from 'framer-motion'
import { Building2, Edit3, Cpu, Rocket, BarChart3, RefreshCw } from 'lucide-react'

const steps = [
  {
    icon: Building2,
    title: "Business Profile Creation",
    description: "Add your business details, services, and unique value propositions to create a comprehensive profile.",
    details: [
      "Business name and description",
      "Services and specializations", 
      "Target audience definition",
      "Unique selling points"
    ],
    color: "blue"
  },
  {
    icon: Edit3,
    title: "Custom Prompt Engineering",
    description: "Our AI crafts personalized prompts that highlight your business in relevant conversation contexts.",
    details: [
      "Context-aware prompt generation",
      "Industry-specific optimization",
      "Competitor differentiation",
      "Natural conversation integration"
    ],
    color: "purple"
  },
  {
    icon: Cpu,
    title: "Strategic Prompt Submission",
    description: "We continuously submit prompts about your business to all major AI platforms with data sharing enabled.",
    details: [
      "Daily prompt submissions to all LLMs",
      "Data sharing enabled for future model training",
      "Multiple conversation contexts",
      "Consistent business representation",
      "Volume-based inclusion approach"
    ],
    color: "green"
  },
  {
    icon: Rocket,
    title: "Automated Deployment",
    description: "Your optimized prompts are deployed across all AI platforms with intelligent scheduling.",
    details: [
      "Daily automated submissions",
      "Rate-limited processing",
      "Error handling & retries",
      "Success tracking"
    ],
    color: "orange"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Comprehensive tracking shows how your business performs across different AI platforms.",
    details: [
      "Success/failure rates",
      "Response quality metrics",
      "Platform-specific insights",
      "ROI measurement"
    ],
    color: "pink"
  },
  {
    icon: RefreshCw,
    title: "Next Model Integration",
    description: "When new AI models launch, your business data is already included from months of submissions.",
    details: [
      "Automatic inclusion in new model training data",
      "Higher recommendation probability",
      "New model integration within 1 week",
      "Cumulative data inclusion benefits",
      "Long-term competitive advantage"
    ],
    color: "indigo"
  }
]

const colorClasses = {
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    icon: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    gradient: "from-blue-500 to-blue-600"
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30", 
    icon: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
    gradient: "from-purple-500 to-purple-600"
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    icon: "text-green-600 dark:text-green-400", 
    border: "border-green-200 dark:border-green-800",
    gradient: "from-green-500 to-green-600"
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    icon: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800", 
    gradient: "from-orange-500 to-orange-600"
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    icon: "text-pink-600 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-800",
    gradient: "from-pink-500 to-pink-600"
  },
  indigo: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    icon: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800",
    gradient: "from-indigo-500 to-indigo-600"
  }
}

export function ProcessSteps() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            The Complete Process
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            From business profile to AI recommendation engine - here&apos;s how we transform 
            your business into an AI-discoverable powerhouse
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const colors = colorClasses[step.color as keyof typeof colorClasses]
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  {/* Step Number */}
                  <div className={`absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r ${colors.gradient} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 ${colors.bg} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className={`h-8 w-8 ${colors.icon}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Details */}
                  <div className={`border-l-4 ${colors.border} pl-4`}>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-gray-600 dark:text-gray-300">
                          <div className={`w-2 h-2 bg-gradient-to-r ${colors.gradient} rounded-full mr-3 flex-shrink-0`}></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Process Flow Visualization */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-4 bg-white dark:bg-gray-900 rounded-full px-8 py-4 shadow-lg">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Complete cycle time:
            </div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              24-48 hours
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              from setup to first AI recommendations
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
