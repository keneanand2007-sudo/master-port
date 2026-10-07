import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

type Fly = { x: number; y: number; r: number; vy: number; ph: number; sp: number }

// Warm drifting lights. One canvas, one pre-drawn glow sprite, paused when off screen.
export default function Fireflies({
  intensityRef,
  count = 40,
}: {
  intensityRef: { current: number }
  count?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const glow = document.createElement('canvas')
    glow.width = 64
    glow.height = 64
    const g = glow.getContext('2d')
    if (!ctx || !g) return

    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,214,150,1)')
    grad.addColorStop(0.25, 'rgba(255,170,90,0.55)')
    grad.addColorStop(1, 'rgba(255,140,60,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 64)

    const reduced = prefersReducedMotion()
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let w = 0
    let h = 0
    const flies: Fly[] = []

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    for (let i = 0; i < count; i++) {
      flies.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 6 + Math.random() * 10,
        vy: 6 + Math.random() * 14,
        ph: Math.random() * Math.PI * 2,
        sp: 0.5 + Math.random(),
      })
    }

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      const k = intensityRef.current
      for (const f of flies) {
        f.y -= f.vy * dt
        if (f.y < -20) {
          f.y = h + 20
          f.x = Math.random() * w
        }
        const x = f.x + Math.sin(t * f.sp + f.ph) * 18
        ctx.globalAlpha = (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * f.sp * 1.7 + f.ph))) * k
        const s = f.r * 2
        ctx.drawImage(glow, x - s / 2, f.y - s / 2, s, s)
      }
      ctx.globalAlpha = 1
    }

    let visible = true
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    io.observe(canvas)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    if (reduced) {
      draw(0, 0)
    }
    const tick = (time: number, deltaMs: number) => {
      if (visible) draw(time, Math.min(deltaMs, 50) / 1000)
    }
    if (!reduced) gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      io.disconnect()
      ro.disconnect()
    }
  }, [intensityRef, count])

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
}
