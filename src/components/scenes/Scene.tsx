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
  children: ReactNode
}

const VIGNETTE = 'radial-gradient(ellipse at 50% 45%, transparent 40%, rgb(7 7 7 / 0.6) 100%)'

export default function Scene({ id, image, num, title, jp, dim = 0.3, tone = 'dark', children }: SceneProps) {
  const rootRef = useRef<HTMLElement>(null)
  const paper = tone === 'paper'

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    const bg = root.querySelector('[data-scene="bg"]')
    const img = root.querySelector('[data-scene="img"]')

    const ctx = gsap.context(() => {
      const scrub = { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true }
      if (bg) gsap.fromTo(bg, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: scrub })
      if (img) gsap.fromTo(img, { scale: 1.05 }, { scale: 1.2, ease: 'none', scrollTrigger: scrub })

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
  }, [])

  return (
    <section ref={rootRef} id={id} className="relative overflow-hidden bg-bg">
      <div data-scene="bg" className="absolute inset-x-0 -top-[15%] -bottom-[15%] will-change-transform">
        <img data-scene="img" src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
      </div>

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
