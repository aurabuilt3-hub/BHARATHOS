'use client'

import React from 'react'
import { AIAshokaChakraLogo } from './BrandLogo'

interface AshokaEmblemProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AshokaEmblem({ className = '', size = 'md' }: AshokaEmblemProps) {
  const sizeMap = {
    sm: 36,
    md: 62,
    lg: 96
  }

  return (
    <AIAshokaChakraLogo 
      size={sizeMap[size]} 
      className={className} 
    />
  )
}
