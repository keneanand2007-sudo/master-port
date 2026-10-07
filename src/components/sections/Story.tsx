import { useEffect, useRef } from 'react'
import Scene from '../scenes/Scene'
import { gsap } from '../../lib/gsap'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { backgrounds } from '../../data/backgrounds'
import { profile } from '../../data/profile'

const summaryWords = profile.summary.split(/\s+/)

export default function Story() {
  const storyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = storyRef.current
    if (!root || prefersReducedMotion()) return
    const words = root.querySelectorAll<HTMLElement>('[data-story-word]')
    if (!words.length) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { color: '#a49b88', opacity: 0.42 },
        {
          color: '#161512',
          opacity: 1,
          ease: 'none',
          stagger: 0.055,
          scrollTrigger: {
            trigger: root.querySelector('[data-story-copy]'),
            start: 'top 82%',
            end: 'bottom 45%',
            scrub: 0.8,
          },
        },
      )

      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('[data-ink-line]'),
        {
          clipPath:
            'polygon(0 0, 0 15%, 0 30%, 0 50%, 0 70%, 0 85%, 0 100%, 0 100%, 0 0)',
        },
        {
          clipPath:
            'polygon(0 0, 100% 0, 98% 20%, 100% 38%, 97% 54%, 100% 73%, 98% 88%, 100% 100%, 0 100%)',
          duration: 1.2,
          stagger: 0.22,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.querySelector('[data-ink-heading]'), start: 'top 78%', once: true },
        },
      )
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <Scene id="story" image={backgrounds.story} num="01" title="THE STORY" jp="物語" tone="paper" dim={0}>
      <div ref={storyRef} className="flex flex-1 flex-col justify-between gap-24 py-16 md:min-h-[120svh]">
        <div data-ink-heading className="space-y-2">
          <h2
            aria-label="I don't just build websites. I build experiences."
            className="text-[clamp(2.5rem,8.5vw,9rem)] leading-[0.9] font-bold tracking-tighter uppercase"
          >
            <span aria-hidden="true" className="block">
              <span data-ink-line className="inline-block">I DON'T JUST</span>
            </span>
            <span aria-hidden="true" className="block">
              <span data-ink-line className="inline-block">BUILD WEBSITES.</span>
            </span>
            <span aria-hidden="true" className="mt-5 block opacity-90">
              <span data-ink-line className="inline-block">I BUILD</span>
            </span>
            <span aria-hidden="true" className="block opacity-90">
              <span data-ink-line className="inline-block">EXPERIENCES.</span>
            </span>
          </h2>
        </div>
        <div data-reveal className="glass-card glass-card--paper max-w-md self-end p-6 md:p-8">
          <p className="label mb-3">{profile.name} / {profile.location}</p>
          <p data-story-copy aria-label={profile.summary} className="text-lg leading-relaxed">
            {summaryWords.map((word, i) => (
              <span key={`${i}-${word}`} aria-hidden="true" data-story-word className="inline-block">
                {word}{i < summaryWords.length - 1 ? '\u00a0' : ''}
              </span>
            ))}
          </p>
        </div>
      </div>
    </Scene>
  )
}
