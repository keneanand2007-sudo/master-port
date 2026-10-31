import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import Headline from '../animation/Headline'
import Fireflies from '../scenes/Fireflies'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { getLenis } from '../../lib/lenis'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { isLowPower } from '../../lib/device'
import { backgrounds } from '../../data/backgrounds'
import { skillGroups } from '../../data/skills'

const covers = [
  { image: backgrounds.story, cloth: '#6e1713', foil: '#e8c48a' },
  { image: backgrounds.projects, cloth: '#14233f', foil: '#d9c08a' },
  { image: backgrounds.hero, cloth: '#1b1b1e', foil: '#e0c58f' },
  { image: backgrounds.autumn, cloth: '#5b3a14', foil: '#f0cf94' },
]

const volumes = skillGroups.map((group, i) => ({ ...covers[i % covers.length], group }))
const N = volumes.length

type Drag = { on: boolean; x: number; moved: boolean }

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const shelfRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const stRef = useRef<ScrollTrigger | null>(null)
  const lockRef = useRef<number | null>(null)
  const lockTimer = useRef<number | undefined>(undefined)
  const drag = useRef<Drag>({ on: false, x: 0, moved: false })
  const intensityRef = useRef(0.4)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    const img = imgRef.current
    if (!section || !track || !img) return

    const reduced = prefersReducedMotion()

    // Desktop + motion allowed: scroll chooses which volume is pulled out
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const st = ScrollTrigger.create({
        trigger: track,
        start: 'top 10%',
        end: 'bottom 90%',
        onUpdate: (self) => {
          if (lockRef.current !== null) return
          setActive(Math.min(N - 1, Math.max(0, Math.floor(self.progress * N))))
        },
      })
      stRef.current = st
      return () => {
        st.kill()
        stRef.current = null
      }
    })

    const ctx = gsap.context(() => {
      if (reduced) return
      gsap.fromTo(
        img,
        { scale: 1.05 },
        {
          scale: 1.2,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
      section.querySelectorAll<HTMLElement>('[data-words]').forEach((el) => {
        gsap.from(el.querySelectorAll('[data-w]'), {
          yPercent: 115,
          duration: 1.1,
          stagger: 0.05,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })
      section.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 1,
          ease: 'expo.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
    }, section)

    return () => {
      window.clearTimeout(lockTimer.current)
      mm.revert()
      ctx.revert()
    }
  }, [])

  // Choosing a volume scrolls to its place, so scroll stays the single source of truth
  const goTo = (i: number) => {
    const st = stRef.current
    if (!st || i === active) return
    lockRef.current = i
    setActive(i)
    window.clearTimeout(lockTimer.current)
    lockTimer.current = window.setTimeout(() => {
      lockRef.current = null
    }, 1700)
    const y = st.start + ((i + 0.5) / N) * (st.end - st.start)
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(y, { duration: 1.4 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }

  const onKey = (i: number) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      goTo(i)
    }
  }

  // Drag to turn the open volume
  const onStageDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const t = e.target
    if (!(t instanceof Element) || !t.closest('[data-state="open"]')) return
    drag.current = { on: true, x: e.clientX, moved: false }
  }
  const onStageMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const shelf = shelfRef.current
    if (!d.on || !shelf) return
    const dx = e.clientX - d.x
    if (!d.moved) {
      if (Math.abs(dx) < 5) return
      d.moved = true
      e.currentTarget.setPointerCapture(e.pointerId)
      shelf.classList.add('is-dragging')
    }
    shelf.style.setProperty('--yaw', `${Math.max(-38, Math.min(38, dx * 0.25))}deg`)
  }
  const endDrag = () => {
    const shelf = shelfRef.current
    if (!drag.current.on || !shelf) return
    drag.current.on = false
    shelf.classList.remove('is-dragging')
    shelf.style.setProperty('--yaw', '0deg')
  }

  const current = volumes[active]

  return (
    <section ref={sectionRef} id="skills" aria-label="Skills" className="relative overflow-x-clip bg-bg">
      {/* Night world behind everything */}
      <div className="pointer-events-none sticky top-0 -mb-[100svh] h-svh overflow-hidden" aria-hidden="true">
        <img
          ref={imgRef}
          src={backgrounds.skills}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
        />
        <div className="absolute inset-0 bg-bg/45" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgb(4 9 24 / 0.55), rgb(5 8 18 / 0.75))' }}
        />
        <Fireflies intensityRef={intensityRef} count={isLowPower() ? 10 : 22} />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgb(7 7 7 / 0.7) 100%)' }}
        />
        <div className="absolute inset-x-0 top-0 h-[18svh] bg-linear-to-b from-bg/85 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[24svh] bg-linear-to-t from-bg to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 py-20 md:px-12">
        <header className="flex items-center justify-between border-b border-white/15 pb-4">
          <span className="label">
            <span className="text-red">04</span> — SKILLS
          </span>
          <span className="label jp">技</span>
        </header>

        <div className="pt-16 md:pt-24">
          <Headline lines={['THE', 'TOOLKIT.']} />
        </div>

        {/* Desktop: the shelf. Scroll pulls out the next volume. */}
        <div
          ref={trackRef}
          className="skills-stage relative mt-12"
          style={{ height: `${N * 65 + 20}svh` }}
        >
          <div
            className="sticky top-[10svh] flex h-[80svh] items-center"
            onPointerDown={onStageDown}
            onPointerMove={onStageMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div className="grid w-full grid-cols-[1.1fr_1fr] items-center gap-10">
              <div>
                <div ref={shelfRef} className="shelf">
                  <div className="shelf-row">
                    {volumes.map((v, i) => {
                      const on = i === active
                      return (
                        <div
                          key={v.group.id}
                          role="button"
                          tabIndex={0}
                          aria-pressed={on}
                          aria-label={`Volume ${v.group.id}: ${v.group.title}`}
                          data-state={on ? 'open' : 'shut'}
                          className="slot"
                          style={
                            {
                              '--cloth': v.cloth,
                              '--foil': v.foil,
                              '--plate': `url(${v.image})`,
                            } as CSSProperties
                          }
                          onClick={() => goTo(i)}
                          onKeyDown={onKey(i)}
                        >
                          <div className="book">
                            <div className="face spine">
                              <span className="spine-no">{v.group.id}</span>
                              <span className="spine-title">{v.group.title}</span>
                            </div>
                            <div className="face edge" />
                            <div className="face back" />
                            <div className="face top" />
                            <div className="face bottom" />
                            <div className="face plate" />
                            <div className="hinge">
                              <div className="cover">
                                <div className="cover-out">
                                  <span className="cover-no">VOLUME {v.group.id}</span>
                                  <span className="cover-title">{v.group.title}</span>
                                </div>
                                <div className="cover-in" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="plank" />
                </div>

                <div className="mt-10 flex items-center gap-4">
                  {volumes.map((v, i) => (
                    <button
                      key={v.group.id}
                      type="button"
                      aria-label={`Open volume ${v.group.id}`}
                      data-on={i === active}
                      className="vol-tick"
                      onClick={() => goTo(i)}
                    />
                  ))}
                  <span className="label ml-2">SCROLL — NEXT VOLUME / CLICK — OPEN / DRAG — TURN</span>
                </div>
              </div>

              <div aria-live="polite">
                <div key={active} className="vol-panel">
                  <p className="label">
                    <span className="text-red">{current.group.id}</span> / 0{N} — VOLUME
                  </p>
                  <h3 className="mt-4 text-[clamp(2.5rem,5vw,5.5rem)] leading-[0.92] font-bold tracking-tighter uppercase">
                    {current.group.title}
                  </h3>
                  <ol className="mt-8 grid grid-cols-1 gap-x-10 xl:grid-cols-2">
                    {current.group.items.map((item, k) => (
                      <li
                        key={item}
                        className="vol-item flex items-baseline gap-4 border-t border-line py-3"
                        style={{ animationDelay: `${160 + k * 70}ms` }}
                      >
                        <span className="label text-red">{String(k + 1).padStart(2, '0')}</span>
                        <span className="text-[clamp(1.25rem,2vw,2rem)] leading-tight font-medium tracking-tight">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile and reduced motion: plain cards, everything readable */}
        <div className="skills-fallback mt-12 grid-cols-1 gap-6 md:grid-cols-2">
          {volumes.map((v) => (
            <div key={v.group.id} data-reveal className="glass-card p-6 md:p-8">
              <p className="label">
                <span className="text-red">{v.group.id}</span> / {v.group.title}
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[clamp(1.4rem,2.6vw,2.4rem)] leading-tight font-medium tracking-tight">
                {v.group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
