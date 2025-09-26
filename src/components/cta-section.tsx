"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react"

export function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-br from-primary to-brand-600 text-primary-foreground relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 opacity-20">
        <Sparkles className="h-8 w-8 animate-bounce-gentle" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-20">
        <TrendingUp className="h-10 w-10 animate-bounce-gentle" style={{ animationDelay: "1s" }} />
      </div>
      <div className="absolute top-1/2 left-20 opacity-15">
        <div className="h-4 w-4 rounded-full bg-current animate-pulse" />
      </div>
      <div className="absolute top-1/3 right-1/4 opacity-15">
        <div className="h-6 w-6 rounded-full bg-current animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="mr-2 h-4 w-4" />
            Join the AI Revolution
          </div>

          {/* Main heading */}
          <h2 className="text-responsive-2xl font-bold mb-6">
            Ready to dominate AI search with 22 models?
          </h2>

          {/* Description */}
          <p className="text-responsive-base text-primary-foreground/80 mb-8 max-w-3xl mx-auto">
            Join the AI SEO revolution! Our enterprise-grade platform trains 22 AI models across 
            5 major platforms daily, ensuring your business gets recommended when customers ask for solutions.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1">22</div>
              <div className="text-sm text-primary-foreground/70">AI Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1">5</div>
              <div className="text-sm text-primary-foreground/70">AI Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1">24/7</div>
              <div className="text-sm text-primary-foreground/70">Automation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1">2 min</div>
              <div className="text-sm text-primary-foreground/70">Setup time</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/handler/sign-up"
              className="inline-flex items-center justify-center rounded-lg bg-white text-primary px-8 py-3 text-base font-medium shadow-lg transition-all hover:bg-white/90 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Start 14-Day Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-8 py-3 text-base font-medium text-white transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Talk to Sales
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 pt-8 border-t border-white/20">
            <p className="text-sm text-primary-foreground/60 mb-4">
              Enterprise-grade platform trusted by innovative businesses
            </p>
            <div className="flex items-center justify-center space-x-6 text-primary-foreground/40 text-xs">
              <div>🚀 Production Ready</div>
              <div>🔒 Enterprise Security</div>
              <div>⚡ Real-time Analytics</div>
              <div>🤖 22 AI Models</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
