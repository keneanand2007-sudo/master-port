import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { backgrounds } from '../../data/backgrounds'
import { profile } from '../../data/profile'
import TokyoClock from '../common/TokyoClock'

export default function Hero({ ready }: { ready: boolean }) {
  const rootRef = useRef<HTMLElement>(null)
  const mouseRef = useRef<HTMLDivElement>(null)

  // Scroll-linked: zoom in, title drifts up, scene darkens into the next one
  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } })
        .to('[data-hero="bg"]', { scale: 1.35, yPercent: 12, ease: 'none' }, 0)
        .to('[data-hero="title"]', { yPercent: -35, ease: 'none' }, 0)
        .to('[data-hero="fade"]', { opacity: 0, ease: 'none' }, 0.1)
        .to('[data-hero="veil"]', { opacity: 1, ease: 'none' }, 0.4)
    }, root)
    return () => ctx.revert()
  }, [])

  // Mouse parallax (desktop pointers only, no React state)
  useEffect(() => {
    const root = rootRef.current
    const layer = mouseRef.current
    if (!root || !layer) return
    if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return
    const x = gsap.quickTo(layer, 'x', { duration: 1.2, ease: 'power3.out' })
    const y = gsap.quickTo(layer, 'y', { duration: 1.2, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      x((e.clientX / window.innerWidth - 0.5) * -30)
      y((e.clientY / window.innerHeight - 0.5) * -20)
    }
    root.addEventListener('pointermove', move)
    return () => {
      root.removeEventListener('pointermove', move)
      gsap.set(layer, { clearProps: 'transform' })
    }
  }, [])

  // Intro: starts when the preloader begins to open
  useEffect(() => {
    if (!ready) return
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('[data-hero="img"]', { scale: 1.25, duration: 2.4, ease: 'power3.out' }, 0)
      tl.from('[data-ch]', { yPercent: 115, duration: 1.3, stagger: 0.07 }, 0.3)
      tl.from('[data-hero="in"]', { opacity: 0, y: 20, duration: 1, stagger: 0.1 }, 0.8)
      gsap.fromTo(
        '[data-hero="cue"]',
        { scaleY: 0 },
        { scaleY: 1, duration: 1.4, repeat: -1, repeatDelay: 0.3, ease: 'power2.inOut' },
      )
    }, root)
    return () => ctx.revert()
  }, [ready])

  return (
    <section ref={rootRef} id="hero" aria-label="Introduction" className="relative h-svh min-h-[600px] overflow-hidden">
      <div data-hero="bg" className="absolute inset-0 will-change-transform">
        <div ref={mouseRef} className="absolute -inset-[3%]">
          <img data-hero="img" src={backgrounds.hero} alt="" className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-bg via-transparent to-bg/60" />
      <div className="absolute inset-0 bg-linear-to-r from-bg/70 via-transparent to-transparent" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 60% 45%, transparent 35%, rgb(7 7 7 / 0.7) 100%)' }}
      />
      <div data-hero="veil" className="absolute inset-0 bg-bg opacity-0" />

      <div data-hero="fade" className="relative z-10 flex h-full flex-col justify-between p-6 md:p-12">
        <div className="flex items-start justify-between">
          <span className="label flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-red" /> LIVE
          </span>
          <span className="label hidden md:block">CHAPTER 00 — PROLOGUE</span>
          <TokyoClock />
        </div>

        <span className="vertical jp absolute top-[28%] right-6 text-sm text-muted md:right-12">東京 夜 開発</span>
        <div data-hero="in" className="absolute top-[50%] right-6 flex flex-col items-center gap-3 md:right-12">
          <span className="label vertical">SCROLL</span>
          <span data-hero="cue" className="block h-16 w-px origin-top bg-red" />
        </div>

        <div data-hero="title">
          <p data-hero="in" className="label mb-4">
            <span className="jp">東京</span> / TOKYO — AFTER DARK
          </p>
          <h1
            aria-label={profile.brand}
            className="text-[clamp(4.5rem,22vw,22rem)] leading-[0.85] font-bold tracking-tighter"
          >
            {profile.brand.split('').map((c, i) => (
              <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-top">
                <span data-ch className="inline-block">
                  {c}
                </span>
              </span>
            ))}
          </h1>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div data-hero="in">
              <p className="text-2xl md:text-4xl">{profile.role}</p>
              <p className="label mt-2">{profile.tagline}</p>
            </div>
            <div data-hero="in" className="label text-right leading-loose">
              <div>{profile.name}</div>
              <div>{profile.location}</div>
              <div>{profile.focus}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
