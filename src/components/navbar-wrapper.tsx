"use client"

import { Suspense } from "react"
import { Navbar } from "./navbar"

function NavbarSkeleton() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 animate-pulse rounded" />
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-16 bg-gray-300 dark:bg-gray-700 animate-pulse rounded" />
            ))}
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 animate-pulse rounded" />
            <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 animate-pulse rounded" />
            <div className="h-9 w-24 bg-gray-300 dark:bg-gray-700 animate-pulse rounded" />
          </div>
        </div>
      </div>
    </nav>
  )
}

export function NavbarWrapper() {
  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <Navbar />
    </Suspense>
  )
}
