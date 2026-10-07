import { useEffect, useRef } from 'react'
import Headline from '../animation/Headline'
import Fireflies from '../scenes/Fireflies'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { isLowPower } from '../../lib/device'
import { backgrounds } from '../../data/backgrounds'
import { education, hackathons } from '../../data/experience'
import { profile } from '../../data/profile'
import { projects } from '../../data/projects'

const aura = projects.find((p) => p.title === 'AURA')

const stops = [
  {
    id: '01',
    title: 'EDUCATION',
    label: 'BCA / NEP PATTERN',
    detail: education.degree,
    meta: `${education.institute} · ${education.university}`,
    chips: [education.current, `EXPECTED ${education.expected}`, `CGPA ${education.cgpa}`],
    image: backgrounds.projects,
    pos: '50% 60%',
  },
  {
    id: '02',
    title: 'RISING INDIA',
    label: 'HACKATHON',
    detail: hackathons[0].name,
    meta: hackathons[0].host,
    chips: ['HACKATHON', 'NAGPUR'],
    image: backgrounds.hero,
    pos: '50% 35%',
  },
  {
    id: '03',
    title: 'YCCE NAGPUR',
    label: 'HACKATHON',
    detail: hackathons[1].name,
    meta: hackathons[1].host,
    chips: ['HACKATHON', 'YCCE'],
    image: backgrounds.story,
    pos: '50% 45%',
  },
  {
    id: '04',
    title: 'AURA',
    label: 'NOW BUILDING',
    detail: aura?.description ?? '',
    meta: aura?.status ?? '',
    chips: aura ? aura.technologies.slice(0, 5) : [],
    image: backgrounds.skills,
    pos: '60% 40%',
  },
]

type Pt = { x: number; y: number }

// Smooth curve through points (Catmull-Rom converted to cubic Beziers)
function smoothPath(p: Pt[]): string {
  let d = `M${p[0].x},${p[0].y}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i]
    const p1 = p[i]
    const p2 = p[i + 1]
    const p3 = p[i + 2] ?? p[i + 1]
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`
  }
  return d
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const pathRootRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const trackRef = useRef<SVGPathElement>(null)
  const progRef = useRef<SVGPathElement>(null)
  const orbRef = useRef<SVGGElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const warmRef = useRef<HTMLDivElement>(null)
  const nightRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const intensityRef = useRef(0.35)

  useEffect(() => {
    const section = sectionRef.current
    const pathRoot = pathRootRef.current
    const svg = svgRef.current
    const track = trackRef.current
    const prog = progRef.current
    const orb = orbRef.current
    const img = imgRef.current
    const warm = warmRef.current
    const night = nightRef.current
    const glow = glowRef.current
    if (!section || !pathRoot || !svg || !track || !prog || !orb || !img || !warm || !night || !glow) return

    const anchors = Array.from(pathRoot.querySelectorAll<HTMLElement>('[data-anchor]'))
    const cards = Array.from(pathRoot.querySelectorAll<HTMLElement>('[data-card]'))
    const reduced = prefersReducedMotion()

    let len = 1
    let fracs: number[] = []

    // The path is drawn from where the lanterns really are, so it fits every screen size
    const build = () => {
      const c = pathRoot.getBoundingClientRect()
      svg.setAttribute('viewBox', `0 0 ${c.width} ${c.height}`)
      const pts = anchors.map((a) => {
        const r = a.getBoundingClientRect()
        return { x: r.left + r.width / 2 - c.left, y: r.top + r.height / 2 - c.top }
      })
      if (pts.length < 2) return
      const amp = c.width < 768 ? 14 : Math.min(90, c.width * 0.05)
      const seq: Pt[] = [{ x: pts[0].x, y: Math.max(-20, pts[0].y - 160) }]
      pts.forEach((p, i) => {
        seq.push(p)
        if (i < pts.length - 1) {
          seq.push({ x: p.x + (i % 2 ? 1 : -1) * amp, y: (p.y + pts[i + 1].y) / 2 })
        }
      })
      const last = pts[pts.length - 1]
      seq.push({ x: last.x, y: Math.min(c.height + 40, last.y + 160) })

      const d = smoothPath(seq)
      track.setAttribute('d', d)
      prog.setAttribute('d', d)
      len = prog.getTotalLength()
      prog.style.strokeDasharray = String(len)
      prog.style.strokeDashoffset = String(len)

      fracs = pts.map((p) => {
        let lo = 0
        let hi = len
        for (let k = 0; k < 16; k++) {
          const mid = (lo + hi) / 2
          if (prog.getPointAtLength(mid).y < p.y) lo = mid
          else hi = mid
        }
        return lo / len
      })
    }

    // Length along the path where it crosses a given y
    const lengthAtY = (y: number) => {
      let lo = 0
      let hi = len
      for (let k = 0; k < 16; k++) {
        const mid = (lo + hi) / 2
        if (prog.getPointAtLength(mid).y < y) lo = mid
        else hi = mid
      }
      return lo
    }

    // The light travels to where the reader is looking (60% down the screen)
    const update = () => {
      const c = pathRoot.getBoundingClientRect()
      const at = reduced ? len : Math.min(len, Math.max(0, lengthAtY(window.innerHeight * 0.6 - c.top)))
      prog.style.strokeDashoffset = String(len - at)
      const pt = prog.getPointAtLength(at)
      orb.setAttribute('transform', `translate(${pt.x} ${pt.y})`)
      let active = -1
      anchors.forEach((a, i) => {
        const lit = reduced || at >= (fracs[i] ?? 1) * len - 2
        a.classList.toggle('is-lit', lit)
        if (lit) active = i
      })
      cards.forEach((card, i) => {
        card.dataset.active = String(i === active)
      })
    }

    // Background: sunset becomes night as you travel down the section
    const grade = (p: number) => {
      img.style.transform = `scale(${1.06 + p * 0.18})`
      warm.style.opacity = String((1 - p) * 0.6)
      night.style.opacity = String(Math.min(0.78, Math.max(0, (p - 0.1) / 0.8) * 0.78))
      intensityRef.current = 0.3 + 0.7 * p
    }

    const ctx = gsap.context(() => {
      if (reduced) {
        grade(0.5)
      } else {
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => grade(self.progress),
        })

        section.querySelectorAll<HTMLElement>('[data-words]').forEach((el) => {
          gsap.from(el.querySelectorAll('[data-w]'), {
            yPercent: 115,
            duration: 1.1,
            stagger: 0.05,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          })
        })

        section.querySelectorAll<HTMLElement>('[data-card-wrap], [data-reveal]').forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 60,
            duration: 1.1,
            ease: 'expo.out',
            clearProps: 'transform,opacity',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })
        grade(0)
      }

      ScrollTrigger.create({
        trigger: pathRoot,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: update,
        onRefresh: () => {
          build()
          update()
        },
      })
    }, section)

    build()
    update()
    const ro = new ResizeObserver(() => {
      build()
      update()
    })
    ro.observe(pathRoot)

    // Soft warm glow that follows the mouse (desktop only). It adds light, it hides nothing.
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const onMove = (e: PointerEvent) => {
      glow.style.setProperty('--mx', `${e.clientX}px`)
      glow.style.setProperty('--my', `${e.clientY}px`)
    }
    if (fine && !reduced) section.addEventListener('pointermove', onMove)

    return () => {
      section.removeEventListener('pointermove', onMove)
      ro.disconnect()
      ctx.revert()
    }
  }, [])

  return (
    <section ref={sectionRef} id="about" aria-label="About and journey" className="relative overflow-x-clip bg-bg">
      {/* Sticky world behind the whole journey */}
      <div className="pointer-events-none sticky top-0 -mb-[100svh] h-svh overflow-hidden" aria-hidden="true">
        <img
          ref={imgRef}
          src={backgrounds.about}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
        />
        <div className="absolute inset-0 bg-bg/30" />
        <div
          ref={warmRef}
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgb(224 105 54 / 0.4), rgb(92 36 27 / 0.25) 60%, transparent)',
          }}
        />
        <div
          ref={nightRef}
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgb(4 9 24 / 0.88), rgb(5 8 18 / 0.92))', opacity: 0 }}
        />
        <Fireflies intensityRef={intensityRef} count={isLowPower() ? 18 : 40} />
        <div
          ref={glowRef}
          className="absolute inset-0 mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle 18rem at var(--mx, 50%) var(--my, 60%), rgb(255 164 91 / 0.16), transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgb(7 7 7 / 0.6) 100%)' }}
        />
        <div className="absolute inset-x-0 top-0 h-[18svh] bg-linear-to-b from-bg/85 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[24svh] bg-linear-to-t from-bg to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 py-20 md:px-12">
        <header className="flex items-center justify-between border-b border-white/15 pb-4">
          <span className="label">
            <span className="text-red">03</span> — ABOUT / JOURNEY
          </span>
          <span className="label jp">旅</span>
        </header>

        <div className="pt-16 md:pt-24">
          <Headline lines={['CURIOSITY FIRST.', 'THEN CODE.', 'NOW AGENTS.']} />
        </div>

        <div ref={pathRootRef} className="relative mt-16 md:mt-24">
          <svg
            ref={svgRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          >
            <path
              ref={trackRef}
              fill="none"
              stroke="rgb(255 255 255 / 0.14)"
              strokeWidth="1.5"
              strokeDasharray="2 8"
              strokeLinecap="round"
            />
            <path
              ref={progRef}
              fill="none"
              stroke="#ffad60"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 6px rgb(255 140 60 / 0.7))' }}
            />
            <g ref={orbRef}>
              <circle r="18" fill="rgb(255 170 90 / 0.18)" />
              <circle r="5" fill="#ffe3b8" />
            </g>
          </svg>

          {stops.map((s, i) => (
            <article
              key={s.id}
              className="relative grid min-h-[72svh] grid-cols-[3rem_1fr] items-center gap-x-4 py-10 md:min-h-[78svh] md:grid-cols-[1fr_5rem_1fr] md:gap-x-10"
            >
              <span
                data-anchor
                aria-hidden="true"
                className="path-lantern relative z-10 col-start-1 row-start-1 justify-self-center md:col-start-2"
              >
                <svg viewBox="0 0 32 48">
                  <path d="M11 4h10M13 4v5l-5 5v22l8 8 8-8V14l-5-5V4M8 17h16M9 34h14" />
                  <path d="M16 16c-6 7-5 13 0 17 5-4 6-10 0-17Z" />
                </svg>
              </span>

              <div
                data-card-wrap
                className={`relative z-10 col-start-2 row-start-1 w-full max-w-xl ${
                  i % 2 ? 'md:col-start-3 md:justify-self-start' : 'md:col-start-1 md:justify-self-end'
                }`}
              >
                <div data-card className="path-card glass-card overflow-hidden">
                  <div className="relative aspect-[16/8] overflow-hidden">
                    <img
                      src={s.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ objectPosition: s.pos }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-bg/85 via-bg/10 to-transparent" />
                    <span className="label absolute bottom-3 left-4 text-text/80">
                      <span className="text-red">{s.id}</span> / 04 — {s.label}
                    </span>
                  </div>
                  <div className="p-6 md:p-8">
                    <h3 className="text-[clamp(2rem,4.2vw,4rem)] leading-[0.95] font-medium tracking-tighter">
                      {s.title}
                    </h3>
                    <p className="mt-4 text-lg text-text/85 md:text-xl">{s.detail}</p>
                    {s.meta && <p className="label mt-4 leading-loose text-text/60">{s.meta}</p>}
                    {s.chips.length > 0 && (
                      <ul className="mt-5 flex flex-wrap gap-2">
                        {s.chips.map((c) => (
                          <li key={c} className="label rounded-full border border-line px-3 py-1 text-text/75">
                            {c}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-[2fr_1fr]">
          <div data-reveal className="glass-card p-6 md:p-10">
            <p className="label mb-4">SUMMARY</p>
            <p className="text-xl leading-snug tracking-tight text-text/90 md:text-3xl">{profile.summary}</p>
          </div>
          <div data-reveal className="glass-card p-6 md:p-10">
            <p className="label mb-4">LANGUAGES</p>
            <ul className="space-y-2 text-2xl font-medium tracking-tight">
              {profile.languages.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
