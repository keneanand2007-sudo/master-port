import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const bar = barRef.current
    const label = labelRef.current
    if (!bar || !label) return

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        gsap.set(bar, { scaleX: self.progress })
        label.textContent = `${String(Math.round(self.progress * 100)).padStart(3, '0')} / 100`
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <>
      <div className="pointer-events-none fixed top-0 left-0 z-50 h-px w-full" aria-hidden="true">
        <div ref={barRef} className="h-full origin-left bg-red" style={{ transform: 'scaleX(0)' }} />
      </div>
      <span
        ref={labelRef}
        className="label vertical pointer-events-none fixed top-1/2 left-3 z-50 hidden -translate-y-1/2 rotate-180 mix-blend-difference md:left-5 md:block"
        aria-hidden="true"
      >
        000 / 100
      </span>
    </>
  )
}
