'use client'

import { useEffect, useRef } from 'react'

interface HyperspeedProps {
  className?: string
  starCount?: number
  speed?: number
  color?: string
}

interface Star {
  x: number
  y: number
  z: number
  pz: number
}

function createStar(width: number, height: number): Star {
  return {
    x: Math.random() * width - width / 2,
    y: Math.random() * height - height / 2,
    z: Math.random() * width,
    pz: Math.random() * width,
  }
}

function updateStar(star: Star, width: number, height: number, speed: number): void {
  star.z -= speed * 2
  if (star.z < 1) {
    star.z = width
    star.x = Math.random() * width - width / 2
    star.y = Math.random() * height - height / 2
    star.pz = star.z
  }
}

function drawStar(
  star: Star,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string
): void {
  const sx = (star.x / star.z) * (width / 2) + width / 2
  const sy = (star.y / star.z) * (height / 2) + height / 2
  const px = (star.x / star.pz) * (width / 2) + width / 2
  const py = (star.y / star.pz) * (height / 2) + height / 2

  star.pz = star.z

  const opacity = 1 - star.z / width
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  ctx.beginPath()
  ctx.moveTo(px, py)
  ctx.lineTo(sx, sy)
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
  ctx.lineWidth = 1.5 * (1 - star.z / width) + 0.5
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(sx, sy, 1.5 * (1 - star.z / width), 0, Math.PI * 2)
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
  ctx.fill()
}

export function Hyperspeed({
  className = '',
  starCount = 150,
  speed = 3,
  color = '#7c3aed',
}: HyperspeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let stars: Star[] = []

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      stars = []
      for (let i = 0; i < starCount; i++) {
        stars.push(createStar(canvas.width, canvas.height))
      }
    }

    function animate() {
      if (!canvas || !ctx) return
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        updateStar(star, canvas.width, canvas.height, speed)
        drawStar(star, ctx, canvas.width, canvas.height, color)
      })

      animationId = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener('resize', resize)
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [starCount, speed, color])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ background: 'var(--background)' }}
    />
  )
}
