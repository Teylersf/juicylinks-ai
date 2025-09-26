"use client"

import { motion } from 'framer-motion'
import { Code, Database, Shield, Cpu, Network, Gauge } from 'lucide-react'

const technicalFeatures = [
  {
    icon: Code,
    title: "Advanced Prompt Engineering",
    description: "Sophisticated algorithms craft context-aware prompts that naturally integrate your business into AI conversations",
    details: [
      "Advanced prompt optimization",
      "Context-aware generation", 
      "Performance testing",
      "Dynamic adaptation"
    ]
  },
  {
    icon: Database,
    title: "Intelligent Data Management",
    description: "Secure, scalable infrastructure handles millions of AI interactions while protecting your business data",
    details: [
      "Enterprise-grade encryption",
      "Real-time synchronization",
      "Automated backups",
      "Privacy compliant"
    ]
  },
  {
    icon: Network,
    title: "Multi-Platform Integration",
    description: "Seamless integration with all major AI platforms through robust APIs and intelligent rate limiting",
    details: [
      "Robust API integration",
      "Smart rate management",
      "Automatic error handling", 
      "Real-time monitoring"
    ]
  },
  {
    icon: Cpu,
    title: "Machine Learning Optimization",
    description: "Continuous learning algorithms improve your business recommendations based on performance data",
    details: [
      "Performance optimization",
      "Advanced analytics",
      "Automated testing",
      "Pattern recognition"
    ]
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security ensures your business data and AI interactions are completely protected",
    details: [
      "Advanced encryption",
      "Multi-factor authentication",
      "Regular security audits",
      "Industry compliance"
    ]
  },
  {
    icon: Gauge,
    title: "Performance Monitoring",
    description: "Real-time analytics and monitoring ensure optimal performance across all AI platforms",
    details: [
      "Performance metrics",
      "Automated alerts",
      "Analytics dashboard",
      "Custom reporting"
    ]
  }
]

const architectureStats = [
  {
    label: "AI Models",
    value: "22+",
    description: "Integrated platforms"
  },
  {
    label: "Performance",
    value: "Fast",
    description: "Optimized processing"
  },
  {
    label: "Reliability",
    value: "99.9%+",
    description: "Service availability"
  },
  {
    label: "Global",
    value: "24/7",
    description: "Worldwide coverage"
  }
]

export function TechnicalDetails() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Built for Enterprise Performance
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our platform delivers reliable, scalable, and secure AI integration services 
            with enterprise-grade performance and security
          </p>
        </div>

        {/* Technical Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {technicalFeatures.map((feature, index) => {
            const Icon = feature.icon
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                  {feature.description}
                </p>

                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mr-3 flex-shrink-0"></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>

        {/* Architecture Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">
              Platform Capabilities
            </h3>
            <p className="text-blue-100">
              Built to handle enterprise-scale AI integration workloads
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {architectureStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-blue-200">
                  {stat.description}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
