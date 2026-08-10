'use client'

import React from 'react'

export function AIAshokaChakraLogo({ size = 48, className = '' }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ minWidth: size, minHeight: size }}
    >
      <defs>
        <filter id="chakraGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E90FF" />
          <stop offset="100%" stopColor="#00f2ff" />
        </linearGradient>
      </defs>

      {/* Top Arc (Saffron/Orange) */}
      <path 
        d="M 18,36 A 34,34 0 0,1 82,36" 
        stroke="#FF9933" 
        strokeWidth="4" 
        strokeLinecap="round" 
        className="drop-shadow-[0_0_4px_rgba(255,153,51,0.5)]"
      />

      {/* Bottom Arc (Green) */}
      <path 
        d="M 82,64 A 34,34 0 0,1 18,64" 
        stroke="#128807" 
        strokeWidth="4" 
        strokeLinecap="round" 
        className="drop-shadow-[0_0_4px_rgba(18,136,7,0.5)]"
      />

      {/* Center Circle & Chakra (Neon Blue) */}
      <circle 
        cx="50" 
        cy="50" 
        r="18" 
        stroke="#1E90FF" 
        strokeWidth="2.5" 
        filter="url(#chakraGlow)"
        className="drop-shadow-[0_0_6px_rgba(30,144,255,0.6)]"
      />

      {/* 24 Spokes of the Ashoka Chakra */}
      <g filter="url(#chakraGlow)">
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180
          const x2 = 50 + 17 * Math.cos(angle)
          const y2 = 50 + 17 * Math.sin(angle)
          return (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={x2}
              y2={y2}
              stroke="#1E90FF"
              strokeWidth="1.2"
            />
          )
        })}
      </g>
      
      {/* Inner hub */}
      <circle cx="50" cy="50" r="3.5" fill="#1E90FF" />
      <circle cx="50" cy="50" r="1.5" fill="#040815" />

      {/* Left side Blue Circuit Lines */}
      <g stroke="url(#circuitGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.85">
        <path d="M 18,50 L 5,50" />
        <path d="M 23,38 L 12,38 L 6,32" />
        <path d="M 23,62 L 12,62 L 6,68" />
        <circle cx="5" cy="50" r="1.2" fill="#00f2ff" />
        <circle cx="6" cy="32" r="1.2" fill="#00f2ff" />
        <circle cx="6" cy="68" r="1.2" fill="#00f2ff" />
      </g>

      {/* Right side Blue Circuit Lines */}
      <g stroke="url(#circuitGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.85">
        <path d="M 82,50 L 95,50" />
        <path d="M 77,38 L 88,38 L 94,32" />
        <path d="M 77,62 L 88,62 L 94,68" />
        <circle cx="95" cy="50" r="1.2" fill="#00f2ff" />
        <circle cx="94" cy="32" r="1.2" fill="#00f2ff" />
        <circle cx="94" cy="68" r="1.2" fill="#00f2ff" />
      </g>
    </svg>
  )
}

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  hideText?: boolean
  className?: string
}

export default function BrandLogo({ size = 'md', hideText = false, className = '' }: BrandLogoProps) {
  // Logo sizes: sm (~38px), md (~74px), lg (~111px) (increased by ~6%)
  const logoSizes = {
    sm: 38,
    md: 74,
    lg: 111
  }

  // Branding sizes mapping (increased slightly)
  const titleSizes = {
    sm: 'text-base md:text-lg',
    md: 'text-xl md:text-2xl',
    lg: 'text-3xl md:text-4xl'
  }

  const subtitleSizes = {
    sm: 'text-[8.5px] md:text-[9px]',
    md: 'text-[12px] md:text-[13px]',
    lg: 'text-[15px] md:text-[16px]'
  }

  const taglineSizes = {
    sm: 'text-[7px] md:text-[7.5px]',
    md: 'text-[9.5px] md:text-[10px]',
    lg: 'text-[12.5px] md:text-[13.5px]'
  }

  const spacingClasses = {
    sm: 'space-y-0.5',
    md: 'space-y-1',
    lg: 'space-y-1.5'
  }

  return (
    <div className={`flex items-center space-x-4 select-none ${className}`}> {/* Spacing increased by 4px to space-x-4 */}
      <div className="shrink-0 flex items-center justify-center">
        <AIAshokaChakraLogo size={logoSizes[size]} className="drop-shadow-[0_0_6px_rgba(6,182,212,0.25)]" />
      </div>
      
      {!hideText && (
        <div className={`flex flex-col min-w-0 justify-center text-left ${spacingClasses[size]}`}>
          {/* Main Title: BHARAT OS */}
          <div className="flex items-baseline leading-none">
            <span className={`${titleSizes[size]} font-extrabold tracking-wider text-white antialiased`}>
              BHARAT
            </span>
            <span className={`${titleSizes[size]} text-[#1E90FF] font-black tracking-wider ml-1.5 antialiased`}>
              OS
            </span>
          </div>

          {/* Subtitle: AI-Powered Smart Governance */}
          <span className={`${subtitleSizes[size]} text-[#D0D6E2] font-medium tracking-wide leading-none antialiased`}>
            AI-Powered Smart Governance
          </span>

          {/* Hindi Tagline: सशक्त भारत, सुरक्षित भारत */}
          <span className={`${taglineSizes[size]} text-[#FF9933] font-semibold tracking-[0.08em] leading-none font-mono antialiased`}>
            सशक्त भारत, सुरक्षित भारत
          </span>
        </div>
      )}
    </div>
  )
}
