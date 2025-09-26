"use client"

interface SpokaneRooterLogoProps {
  size?: number
  className?: string
}

export function SpokaneRooterLogo({ size = 48, className = "" }: SpokaneRooterLogoProps) {
  return (
    <div 
      className={`inline-flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="text-xs font-bold leading-none">SR</div>
      </div>
    </div>
  )
}
