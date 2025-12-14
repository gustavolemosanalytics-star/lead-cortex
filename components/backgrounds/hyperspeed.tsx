'use client'

import { useEffect, useRef } from 'react'

interface HyperspeedProps {
  className?: string
  starCount?: number
  speed?: number
  color?: string
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

    class Star {
      x: number
      y: number
      z: number
      pz: number

      constructor() {
        this.x = Math.random() * canvas.width - canvas.width / 2
        this.y = Math.random() * canvas.height - canvas.height / 2
        this.z = Math.random() * canvas.width
        this.pz = this.z
      }

      update() {
        this.z -= speed * 2
        if (this.z < 1) {
          this.z = canvas.width
          this.x = Math.random() * canvas.width - canvas.width / 2
          this.y = Math.random() * canvas.height - canvas.height / 2
          this.pz = this.z
        }
      }

      draw() {
        const sx = (this.x / this.z) * (canvas.width / 2) + canvas.width / 2
        const sy = (this.y / this.z) * (canvas.height / 2) + canvas.height / 2
        const px = (this.x / this.pz) * (canvas.width / 2) + canvas.width / 2
        const py = (this.y / this.pz) * (canvas.height / 2) + canvas.height / 2

        this.pz = this.z

        const opacity = 1 - this.z / canvas.width
        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)

        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(sx, sy)
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
        ctx.lineWidth = 1.5 * (1 - this.z / canvas.width) + 0.5
        ctx.stroke()

        // Draw glowing head
        ctx.beginPath()
        ctx.arc(sx, sy, 1.5 * (1 - this.z / canvas.width), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
        ctx.fill()
      }
    }

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      stars = []
      for (let i = 0; i < starCount; i++) {
        stars.push(new Star())
      }
    }

    function animate() {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        star.update()
        star.draw()
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
