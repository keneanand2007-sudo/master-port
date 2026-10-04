import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { setLenis } from '../../lib/lenis'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

// Lenis -> gsap.ticker -> ScrollTrigger (one clock, no extra rAF loop)
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    setLenis(lenis)

    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      setLenis(null)
      lenis.destroy()
    }
  }, [])

  return null
}
