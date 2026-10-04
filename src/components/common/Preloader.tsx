import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { getLenis } from '../../lib/lenis'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { backgrounds } from '../../data/backgrounds'
import { profile } from '../../data/profile'

interface Props {
  onExit: () => void
  onDone: () => void
}

export default function Preloader({ onExit, onDone }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const cbRef = useRef({ onExit, onDone })

  useEffect(() => {
    cbRef.current = { onExit, onDone }
  })

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const count = root.querySelector<HTMLElement>('[data-pre="count"]')
    const bar = root.querySelector<HTMLElement>('[data-pre="bar"]')
    const log = root.querySelector<HTMLElement>('[data-pre="log"]')
    const top = root.querySelector<HTMLElement>('[data-pre="top"]')
    const bottom = root.querySelector<HTMLElement>('[data-pre="bottom"]')
    const content = root.querySelector<HTMLElement>('[data-pre="content"]')
    if (!count || !bar || !log || !top || !bottom || !content) return

    const html = document.documentElement
    html.style.overflow = 'hidden'
    getLenis()?.stop()

    const reduced = prefersReducedMotion()
    let cancelled = false
    let imageReady = false
    let poll: ReturnType<typeof gsap.delayedCall> | undefined

    const img = new Image()
    img.onload = img.onerror = () => {
      imageReady = true
    }
    img.src = backgrounds.hero
    const safety = window.setTimeout(() => {
      imageReady = true
    }, 4000)

    const unlock = () => {
      html.style.overflow = ''
      getLenis()?.start()
    }

    const exit = () => {
      if (cancelled) return
      cbRef.current.onExit()
      ctx.add(() => {
        const d = reduced ? 0.01 : 1.2
        gsap.to(content, { opacity: 0, y: -24, duration: reduced ? 0.01 : 0.5, ease: 'power2.in' })
        gsap.to(top, { yPercent: -100, duration: d, delay: 0.35, ease: 'expo.inOut' })
        gsap.to(bottom, {
          yPercent: 100,
          duration: d,
          delay: 0.35,
          ease: 'expo.inOut',
          onComplete: () => {
            if (cancelled) return
            unlock()
            cbRef.current.onDone()
          },
        })
      })
    }

    const state = { v: 0 }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.from(root.querySelectorAll('[data-ch]'), {
        yPercent: 115,
        duration: 1,
        stagger: 0.06,
        ease: 'expo.out',
      }, 0.1)
      tl.to(state, {
        v: 100,
        duration: reduced ? 0.2 : 1.8,
        ease: 'power2.inOut',
        onUpdate: () => {
          const n = Math.round(state.v)
          count.textContent = String(n).padStart(3, '0')
          bar.style.transform = `scaleX(${state.v / 100})`
          log.textContent =
            n < 30
              ? '> initializing experience...'
              : n < 60
                ? '> loading scene...'
                : n < 90
                  ? '> connecting webgl...'
                  : '> rendering...'
        },
      }, 0.2)
      tl.add(() => {
        const wait = () => {
          if (cancelled) return
          if (imageReady) exit()
          else poll = gsap.delayedCall(0.1, wait)
        }
        wait()
      })
    }, root)

    return () => {
      cancelled = true
      window.clearTimeout(safety)
      poll?.kill()
      ctx.revert()
      unlock()
    }
  }, [])

  return (
    <div ref={rootRef} className="fixed inset-0 z-[90]" role="status" aria-label="Loading">
      <div data-pre="top" className="absolute top-0 left-0 h-1/2 w-full bg-bg" />
      <div data-pre="bottom" className="absolute bottom-0 left-0 h-1/2 w-full bg-bg" />

      <div data-pre="content" className="relative flex h-full flex-col items-center justify-between p-6 md:p-12">
        <div className="flex w-full justify-between">
          <span className="label">01 / LOADING</span>
          <span className="label">TOKYO / JST</span>
        </div>

        <div className="text-center">
          <p data-pre="count" className="font-mono text-[clamp(3rem,10vw,8rem)] leading-none font-medium tabular-nums">
            000
          </p>
          <div className="mx-auto mt-6 h-px w-48 bg-line md:w-72">
            <div data-pre="bar" className="h-full origin-left bg-red" style={{ transform: 'scaleX(0)' }} />
          </div>
          <h2
            aria-label={profile.brand}
            className="mt-8 flex justify-center text-4xl font-bold tracking-tighter sm:text-5xl md:text-7xl"
          >
            {profile.brand.split('').map((c, i) => (
              <span key={i} aria-hidden="true" className="inline-block overflow-hidden">
                <span data-ch className="inline-block">
                  {c === ' ' ? '\u00A0' : c}
                </span>
              </span>
            ))}
          </h2>
        </div>

        <p data-pre="log" className="label">
          {'> initializing experience...'}
        </p>
      </div>
    </div>
  )
}
