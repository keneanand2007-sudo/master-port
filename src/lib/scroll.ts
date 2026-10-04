import { getLenis } from './lenis'
import { prefersReducedMotion } from '../hooks/useReducedMotion'

// Smooth scroll to a section by id. Uses Lenis when it is running.
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.6, easing: (t: number) => 1 - Math.pow(1 - t, 4) })
  } else {
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }
}
