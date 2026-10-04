import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

type Mode = 'dot' | 'link' | 'label'

// data-cursor="open" on any element shows its label inside the cursor
const LABELS: Record<string, string> = {
  view: 'VIEW',
  open: 'OPEN',
  explore: 'EXPLORE',
  drag: 'DRAG',
}

export default function CustomCursor() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const body = bodyRef.current
    const label = labelRef.current
    if (!wrap || !body || !label) return
    // Mouse-like pointers only. Touch devices keep their normal behaviour.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const html = document.documentElement
    html.classList.add('has-custom-cursor')

    const reduced = prefersReducedMotion()
    const d = reduced ? 0 : 0.35

    gsap.set(wrap, { autoAlpha: 0 })
    gsap.set(body, {
      xPercent: -50,
      yPercent: -50,
      width: 8,
      height: 8,
      backgroundColor: 'rgba(255,255,255,1)',
      borderColor: 'rgba(255,255,255,0)',
    })

    const moveX = gsap.quickTo(wrap, 'x', { duration: reduced ? 0 : 0.25, ease: 'power3.out' })
    const moveY = gsap.quickTo(wrap, 'y', { duration: reduced ? 0 : 0.25, ease: 'power3.out' })

    let shown = false
    let current = 'dot'

    const apply = (mode: Mode, text = '') => {
      const key = mode + text
      if (key === current) return
      current = key
      label.textContent = text
      const size = mode === 'dot' ? 8 : mode === 'link' ? 44 : 92
      gsap.to(body, {
        width: size,
        height: size,
        backgroundColor:
          mode === 'label' ? 'rgba(255,59,48,0.92)' : mode === 'link' ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,1)',
        borderColor: mode === 'link' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0)',
        duration: d,
        ease: 'power3.out',
      })
      gsap.to(label, { opacity: mode === 'label' ? 1 : 0, duration: d })
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      if (!shown) {
        shown = true
        gsap.set(wrap, { x: e.clientX, y: e.clientY })
        gsap.to(wrap, { autoAlpha: 1, duration: 0.3 })
      }
      moveX(e.clientX)
      moveY(e.clientY)
    }

    const onOver = (e: PointerEvent) => {
      const t = e.target
      if (!(t instanceof Element)) return
      const tagged = t.closest<HTMLElement>('[data-cursor]')
      const text = tagged ? LABELS[tagged.dataset.cursor ?? ''] : undefined
      if (text) return apply('label', text)
      if (t.closest('a, button, [role="button"]')) return apply('link')
      apply('dot')
    }

    const onLeave = () => {
      shown = false
      gsap.to(wrap, { autoAlpha: 0, duration: 0.2 })
    }
    const onDown = () => gsap.to(body, { scale: 0.8, duration: 0.15 })
    const onUp = () => gsap.to(body, { scale: 1, duration: 0.2 })

    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerover', onOver)
    html.addEventListener('mouseleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      html.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      gsap.killTweensOf([wrap, body, label])
      html.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <div ref={wrapRef} aria-hidden="true" className="pointer-events-none invisible fixed top-0 left-0 z-[95]">
      <div ref={bodyRef} className="absolute top-0 left-0 rounded-full border border-solid">
        <span
          ref={labelRef}
          className="label absolute inset-0 grid place-items-center text-text opacity-0 whitespace-nowrap"
        />
      </div>
    </div>
  )
}
