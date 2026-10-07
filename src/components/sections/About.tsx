import { useEffect, useRef } from 'react'
import Scene from '../scenes/Scene'
import Headline from '../animation/Headline'
import { gsap } from '../../lib/gsap'
import { backgrounds } from '../../data/backgrounds'
import { education, hackathons } from '../../data/experience'
import { projects } from '../../data/projects'

export default function About() {
  const journeyRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const shadeRef = useRef<HTMLDivElement>(null)

  const aura = projects.find((project) => project.title === 'AURA')
  const stops = [
    {
      id: '01',
      title: 'EDUCATION',
      detail: education.degree,
      meta: `${education.institute} · ${education.university}`,
      note: `${education.current} / EXPECTED ${education.expected} / CGPA ${education.cgpa}`,
    },
    {
      id: '02',
      title: 'RISING INDIA',
      detail: hackathons[0].name,
      meta: hackathons[0].host,
      note: 'HACKATHON',
    },
    {
      id: '03',
      title: 'YCCE',
      detail: hackathons[1].name,
      meta: hackathons[1].host,
      note: 'HACKATHON / NAGPUR',
    },
    {
      id: '04',
      title: 'AURA',
      detail: aura?.description ?? '',
      meta: aura?.status ?? '',
      note: aura?.category ?? '',
    },
  ]

  useEffect(() => {
    const journey = journeyRef.current
    const stage = stageRef.current
    const track = trackRef.current
    const shade = shadeRef.current
    if (!journey || !stage || !track || !shade) return

    const stops = Array.from(track.querySelectorAll<HTMLElement>('[data-journey-stop]'))
    const lanterns = stops.map((stop) => stop.querySelector<HTMLElement>('[data-lantern]'))
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.to(track, {
        x: () => -window.innerWidth * (stops.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: journey,
          start: 'top top',
          end: () => `+=${window.innerWidth * (stops.length - 1)}`,
          pin: stage,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const active = Math.round(self.progress * (stops.length - 1))
            journey.dataset.activeStop = String(active)
            lanterns.forEach((lantern, i) => lantern?.classList.toggle('is-lit', i <= active))
          },
        },
      })
    }, journey)

    const updateSpotlight = (event: PointerEvent) => {
      const bounds = stage.getBoundingClientRect()
      stage.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`)
      stage.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`)
    }
    const resetSpotlight = () => {
      stage.style.setProperty('--spot-x', '50%')
      stage.style.setProperty('--spot-y', '50%')
    }
    stage.addEventListener('pointermove', updateSpotlight)
    stage.addEventListener('pointerleave', resetSpotlight)

    return () => {
      stage.removeEventListener('pointermove', updateSpotlight)
      stage.removeEventListener('pointerleave', resetSpotlight)
      mm.revert()
    }
  }, [])

  return (
    <Scene
      id="about"
      image={backgrounds.about}
      num="03"
      title="ABOUT / JOURNEY"
      jp="旅"
      dim={0.36}
      grade="sunset"
      pinContent
    >
      <div className="flex flex-1 flex-col justify-center gap-8 pt-12">
        <Headline lines={['CURIOSITY FIRST.', 'THEN CODE.', 'NOW AGENTS.']} />

        <div ref={journeyRef} className="relative -mx-6 md:-mx-12">
          <div
            ref={stageRef}
            role="region"
            aria-label="Horizontal journey through education, hackathons, and AURA"
            tabIndex={0}
            className="journey-stage relative left-1/2 -ml-[50vw] h-[min(78svh,780px)] min-h-[520px] w-screen overflow-x-auto overscroll-x-contain"
          >
            <div
              ref={trackRef}
              className="flex h-full w-max touch-pan-x"
              style={{ willChange: 'transform' }}
            >
              {stops.map((stop, i) => (
                <article
                  key={stop.id}
                  data-journey-stop
                  tabIndex={0}
                  className="group relative flex h-full w-screen shrink-0 snap-start items-center px-[8vw] md:px-[12vw]"
                >
                  <div className="relative z-[1] max-w-2xl">
                    <p className="label flex items-center gap-3 text-[#f0bd85]">
                      <span>{stop.id} / 04</span>
                      <span className="h-px w-12 bg-[#f0bd85]/50" />
                      {stop.note}
                    </p>
                    <h3 className="mt-6 text-[clamp(3rem,8vw,8rem)] leading-[0.88] font-medium tracking-tighter text-white">
                      {stop.title}
                    </h3>
                    <p className="mt-6 max-w-xl text-xl leading-relaxed text-white/90 md:text-2xl">
                      {stop.detail}
                    </p>
                    <p className="label mt-5 max-w-xl leading-loose text-white/65">{stop.meta}</p>
                    <span data-lantern aria-hidden="true" className="journey-lantern">
                      <svg viewBox="0 0 32 48" fill="none">
                        <path d="M11 4h10M13 4v5l-5 5v22l8 8 8-8V14l-5-5V4M8 17h16M9 34h14" />
                        <path d="M16 16c-6 7-5 13 0 17 5-4 6-10 0-17Z" />
                      </svg>
                    </span>
                  </div>
                  <span aria-hidden="true" className="journey-index">{String(i + 1).padStart(2, '0')}</span>
                </article>
              ))}
            </div>
            <div
              ref={shadeRef}
              aria-hidden="true"
              className="journey-darkness"
            />
            <div aria-hidden="true" className="journey-instruction label">
              SCROLL TO TRAVEL <span className="text-[#f0bd85]">/</span> MOVE THE LIGHT
            </div>
          </div>
        </div>
      </div>
    </Scene>
  )
}
