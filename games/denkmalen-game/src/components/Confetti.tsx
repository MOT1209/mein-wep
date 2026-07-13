'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ConfettiProps {
  count?: number
  colors?: string[]
  duration?: number
  spread?: number
  gravity?: number
  onComplete?: () => void
}

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', 
  '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA',
]

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
  velocityX: number
  velocityY: number
  shape: 'circle' | 'square' | 'triangle'
}

export function Confetti({
  count = 50,
  colors = DEFAULT_COLORS,
  duration = 3000,
  spread = 70,
  gravity = 1,
  onComplete,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Generate particles
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * spread,
      velocityY: Math.random() * 50 + 20,
      shape: (['circle', 'square', 'triangle'] as const)[Math.floor(Math.random() * 3)],
    }))

    setParticles(newParticles)

    // Clean up after duration
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [count, colors, duration, spread, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: '-10vh',
            rotate: 0,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: `${particle.x + particle.velocityX}vw`,
            y: '110vh',
            rotate: particle.rotation + 720,
            scale: [1, 1.2, 0.8],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: duration / 1000,
            ease: 'easeOut',
            delay: Math.random() * 0.5,
          }}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: particle.shape === 'circle' ? '50%' : 
                         particle.shape === 'triangle' ? '0' : '2px',
            clipPath: particle.shape === 'triangle' 
              ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
              : undefined,
          }}
        />
      ))}
    </div>
  )
}

// Preset confetti configurations
export const confettiPresets = {
  celebration: {
    count: 100,
    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3'],
    duration: 4000,
    spread: 90,
  },
  subtle: {
    count: 30,
    colors: ['#0ea5e9', '#d946ef', '#f97316'],
    duration: 2000,
    spread: 50,
  },
  winner: {
    count: 150,
    colors: ['#FFD700', '#FFA500', '#FF6347', '#32CD32'],
    duration: 5000,
    spread: 100,
  },
}
