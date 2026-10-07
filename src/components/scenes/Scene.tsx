import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '../../lib/gsap'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

interface SceneProps {
  id: string
  image: string
  num: string
  title: string
  jp?: string
  dim?: number
  tone?: 'dark' | 'paper'
  grade?: 'sunset' | 'night' | 'dawn'
  pinContent?: boolean
  children: ReactNode
}

const VIGNETTE = 'radial-gradient(ellipse at 50% 45%, transparent 40%, rgb(7 7 7 / 0.6) 100%)'

const GRADES = {
  sunset: 'linear-gradient(180deg, rgb(92 36 27 / 0.22), rgb(224 105 54 / 0.28) 58%, rgb(13 9 16 / 0.56))',
  night: 'linear-gradient(180deg, rgb(4 9 24 / 0.62), rgb(5 8 18 / 0.78))',
  dawn: 'radial-gradient(ellipse at 50% 100%, rgb(255 188 112 / 0.4), transparent 68%), linear-gradient(180deg, rgb(28 22 32 / 0.12), rgb(173 107 75 / 0.2))',
} as const

export default function Scene({
  id,
  image,
  num,
  title,
  jp,
  dim = 0.3,
  tone = 'dark',
  grade,
  pinContent = false,
  children,
}: SceneProps) {
  const rootRef = useRef<HTMLElement>(null)
  const paper = tone === 'paper'

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    const bg = root.querySelector('[data-scene="bg"]')
    const img = root.querySelector('[data-scene="img"]')
    const gradeLayer = root.querySelector('[data-scene="grade"]')

    const ctx = gsap.context(() => {
      const scrub = { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true }
      if (bg) gsap.fromTo(bg, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: scrub })
      if (img) gsap.fromTo(img, { scale: 1.05 }, { scale: 1.2, ease: 'none', scrollTrigger: scrub })
      if (gradeLayer && grade !== 'night') {
        gsap.fromTo(gradeLayer, { opacity: 0.2 }, { opacity: 1, ease: 'none', scrollTrigger: scrub })
      }

      root.querySelectorAll<HTMLElement>('[data-words]').forEach((el) => {
        gsap.from(el.querySelectorAll('[data-w]'), {
          yPercent: 115,
          duration: 1.1,
          stagger: 0.05,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })

      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
    }, root)

    return () => ctx.revert()
  }, [grade])

  return (
    <section ref={rootRef} id={id} className={`relative bg-bg ${pinContent ? 'overflow-x-clip' : 'overflow-hidden'}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div data-scene="bg" className="absolute inset-x-0 -top-[15%] -bottom-[15%] will-change-transform">
          <img data-scene="img" src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      </div>

      {grade && (
        <div
          data-scene="grade"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: GRADES[grade], opacity: grade === 'night' ? 0.8 : 0.2 }}
        />
      )}

      <div className="absolute inset-0 bg-bg" style={{ opacity: dim }} />
      <div className="absolute inset-x-0 top-0 h-56 bg-linear-to-b from-bg to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-linear-to-t from-bg to-transparent" />
      {!paper && <div className="absolute inset-0" style={{ background: VIGNETTE }} />}

      <div
        className={`relative z-10 mx-auto flex min-h-svh w-full max-w-[1600px] flex-col px-6 py-20 md:px-12 ${
          paper ? 'text-[#111] [&_.label]:text-[#111]/60' : ''
        }`}
      >
        <header className="flex items-center justify-between border-b border-current/15 pb-4">
          <span className="label">
            <span className="text-red">{num}</span> — {title}
          </span>
          {jp && <span className="label jp">{jp}</span>}
        </header>
        {children}
      </div>
    </section>
  )
}
