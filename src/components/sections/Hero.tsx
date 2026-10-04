import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { backgrounds } from '../../data/backgrounds'
import { profile } from '../../data/profile'
import TokyoClock from '../common/TokyoClock'
import GlassHeadlineHero from '../ui/glass-headline-hero'

const FALLBACK_COLORS = ['#070707', '#FF3B30', '#8A8A8A', '#555555', '#F2F2F2']

export default function Hero({ ready }: { ready: boolean }) {
  const rootRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef(0)

  // Scroll: the glass image zooms (via zoomRef), the UI fades, the scene darkens into the next one
  useEffect(() => {
    const root = rootRef.current
    const overlay = overlayRef.current
    const veil = veilRef.current
    if (!root || !overlay || !veil) return
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        const p = self.progress
        zoomRef.current = p
        veil.style.opacity = String(Math.max(0, (p - 0.35) / 0.65))
        overlay.style.opacity = String(Math.max(0, 1 - p * 1.8))
      },
    })
    return () => trigger.kill()
  }, [])

  // Overlay intro: starts when the preloader begins to open
  useEffect(() => {
    if (!ready) return
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-hero="in"]', { opacity: 0, y: 20, duration: 1, stagger: 0.1, delay: 0.8, ease: 'expo.out' })
      gsap.fromTo(
        '[data-hero="cue"]',
        { scaleY: 0 },
        { scaleY: 1, duration: 1.4, repeat: -1, repeatDelay: 0.3, ease: 'power2.inOut' },
      )
    }, root)
    return () => ctx.revert()
  }, [ready])

  return (
    <section ref={rootRef} id="hero" aria-label="Introduction" className="relative overflow-hidden">
      <GlassHeadlineHero
        title={profile.brand}
        image={backgrounds.hero}
        colors={FALLBACK_COLORS}
        height="max(100svh, 600px)"
        titleSize="clamp(4rem, 22cqw, 28rem)"
        play={ready}
        zoomRef={zoomRef}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-1/3 bg-linear-to-t from-bg/80 to-transparent" />
      <div ref={veilRef} className="pointer-events-none absolute inset-0 z-[5] bg-bg opacity-0" />

      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-12"
      >
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

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div data-hero="in">
            <p className="label mb-3">
              <span className="jp">東京</span> / TOKYO — AFTER DARK
            </p>
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
    </section>
  )
}
