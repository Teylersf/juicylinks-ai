"use client"

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Clock, 
  Shield, 
  Target, 
  BarChart3, 
  Zap,
  Users,
  Globe,
  CheckCircle
} from 'lucide-react'

const benefits = [
  {
    icon: TrendingUp,
    title: "Exponential Growth",
    description: "Businesses see 300-500% increase in AI-driven recommendations within 30 days",
    metric: "300-500%",
    metricLabel: "Growth Rate",
    color: "green"
  },
  {
    icon: Clock,
    title: "24/7 Automation",
    description: "Your business works around the clock, getting recommended even while you sleep",
    metric: "24/7",
    metricLabel: "Active Hours",
    color: "blue"
  },
  {
    icon: Target,
    title: "Precision Targeting",
    description: "AI learns your ideal customer profile and targets recommendations accordingly",
    metric: "95%",
    metricLabel: "Accuracy Rate",
    color: "purple"
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Reach customers worldwide across multiple languages and cultural contexts",
    metric: "50+",
    metricLabel: "Languages",
    color: "indigo"
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track performance across all AI platforms with detailed insights and metrics",
    metric: "100%",
    metricLabel: "Transparency",
    color: "orange"
  },
  {
    icon: Shield,
    title: "Brand Protection",
    description: "Ensure your business is represented accurately and professionally across all AIs",
    metric: "99.9%",
    metricLabel: "Uptime",
    color: "red"
  },
  {
    icon: Users,
    title: "Customer Insights",
    description: "Understand what customers are asking for and how they discover businesses",
    metric: "Deep",
    metricLabel: "Insights",
    color: "teal"
  },
  {
    icon: Zap,
    title: "Competitive Edge",
    description: "Stay ahead of competitors who haven't optimized for AI recommendation engines",
    metric: "First",
    metricLabel: "Mover Advantage",
    color: "yellow"
  }
]

const colorClasses = {
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    icon: "text-green-600 dark:text-green-400",
    metric: "text-green-600 dark:text-green-400",
    gradient: "from-green-500 to-green-600"
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20", 
    icon: "text-blue-600 dark:text-blue-400",
    metric: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500 to-blue-600"
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    icon: "text-purple-600 dark:text-purple-400", 
    metric: "text-purple-600 dark:text-purple-400",
    gradient: "from-purple-500 to-purple-600"
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    icon: "text-indigo-600 dark:text-indigo-400",
    metric: "text-indigo-600 dark:text-indigo-400", 
    gradient: "from-indigo-500 to-indigo-600"
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    icon: "text-orange-600 dark:text-orange-400",
    metric: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-500 to-orange-600"
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    icon: "text-red-600 dark:text-red-400",
    metric: "text-red-600 dark:text-red-400",
    gradient: "from-red-500 to-red-600"
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-900/20",
    icon: "text-teal-600 dark:text-teal-400",
    metric: "text-teal-600 dark:text-teal-400",
    gradient: "from-teal-500 to-teal-600"
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    icon: "text-yellow-600 dark:text-yellow-400",
    metric: "text-yellow-600 dark:text-yellow-400", 
    gradient: "from-yellow-500 to-yellow-600"
  }
}

export function BenefitsGrid() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Businesses Choose Juicy Links
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of forward-thinking businesses already leveraging AI for growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            const colors = colorClasses[benefit.color as keyof typeof colorClasses]
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>

                {/* Metric */}
                <div className="mb-4">
                  <div className={`text-2xl font-bold ${colors.metric} mb-1`}>
                    {benefit.metric}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {benefit.metricLabel}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Success Stories Preview */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Real Results from Real Businesses
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              See how businesses like yours are succeeding with AI-powered recommendations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                2,500+
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                Businesses Successfully Trained
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                450%
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                Average Increase in AI Mentions
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                98.7%
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                Customer Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
