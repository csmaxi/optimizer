"use client"

import React from 'react'
import Image from 'next/image'

interface WatermarkProps {
  opacity?: number
  size?: 'small' | 'medium' | 'large'
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  className?: string
  animated?: boolean
}

export const Watermark: React.FC<WatermarkProps> = ({
  opacity = 0.1,
  size = 'medium',
  position = 'bottom-right',
  className = '',
  animated = true
}) => {
  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  }

  return (
    <div
      className={`
        fixed 
        ${positionClasses[position]} 
        z-50 
        pointer-events-none 
        select-none 
        watermark
        ${animated ? 'watermark-animated' : ''}
        ${className}
      `}
      style={{ 
        opacity,
        '--watermark-opacity': opacity
      } as React.CSSProperties & { '--watermark-opacity': number }}
    >
      <div className={`${sizeClasses[size]} relative`}>
        <Image
          src="/Glacial.png"
          alt="Watermark"
          fill
          className="object-contain drop-shadow-sm"
          priority={false}
          unoptimized
        />
      </div>
    </div>
  )
}

export default Watermark
