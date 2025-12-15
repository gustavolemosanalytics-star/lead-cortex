'use client'

import { useEffect, useRef } from 'react'

interface ParticlesProps {
  className?: string
  particleCount?: number
  colors?: string[]
}

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  opacity: number
}

function createParticle(width: number, height: number, colors: string[]): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 3 + 1,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: (Math.random() - 0.5) * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: Math.random() * 0.5 + 0.2,
  }
}

function updateParticle(
  particle: Particle,
  width: number,
  height: number,
  mouseX: number | null,
  mouseY: number | null
): void {
  particle.x += particle.speedX
  particle.y += particle.speedY

  if (mouseX !== null && mouseY !== null) {
    const dx = mouseX - particle.x
    const dy = mouseY - particle.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < 100) {
      const force = (100 - distance) / 100
      particle.x -= dx * force * 0.02
      particle.y -= dy * force * 0.02
    }
  }

  if (particle.x < 0 || particle.x > width) particle.speedX *= -1
  if (particle.y < 0 || particle.y > height) particle.speedY *= -1
}

function drawParticle(particle: Particle, ctx: CanvasRenderingContext2D): void {
  ctx.beginPath()
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
  ctx.fillStyle = particle.color
  ctx.globalAlpha = particle.opacity
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.beginPath()
  ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
  const gradient = ctx.createRadialGradient(
    particle.x,
    particle.y,
    0,
    particle.x,
    particle.y,
    particle.size * 2
  )
  gradient.addColorStop(0, particle.color + '40')
  gradient.addColorStop(1, 'transparent')
  ctx.fillStyle = gradient
  ctx.fill()
}

function drawConnections(particles: Particle[], ctx: CanvasRenderingContext2D): void {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 150) {
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = `rgba(124, 58, 237, ${0.1 * (1 - distance / 150)})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }
  }
}

export function Particles({
  className = '',
  particleCount = 50,
  colors = ['#7c3aed', '#22d3ee', '#ec4899', '#3b82f6'],
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let particles: Particle[] = []
    let mouse = { x: null as number | null, y: null as number | null }

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle(canvas.width, canvas.height, colors))
      }
    }

    function handleMouseMove(e: MouseEvent) {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    function handleMouseLeave() {
      mouse.x = null
      mouse.y = null
    }

    function animate() {
      if (!canvas || !ctx) return
      ctx.fillStyle = 'rgba(15, 23, 42, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        updateParticle(particle, canvas.width, canvas.height, mouse.x, mouse.y)
        drawParticle(particle, ctx)
      })

      drawConnections(particles, ctx)

      animationId = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [particleCount, colors])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ background: 'var(--background)' }}
    />
  )
}
