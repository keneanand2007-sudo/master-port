import { useEffect, useState, type MouseEvent } from 'react'
import { ScrollTrigger } from '../../lib/gsap'
import { getLenis } from '../../lib/lenis'
import { scrollToId } from '../../lib/scroll'
import { navItems } from '../../data/navigation'
import { profile } from '../../data/profile'

const SECTION_IDS = ['hero', 'story', 'world', 'work', 'about', 'skills', 'contact']

export default function Navigation() {
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)

  // Show after half a screen of scroll, and find the section nearest the middle of the screen.
  // Sections are looked up on every update, so lazy-loaded ones (the 3D interlude) are always current.
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        setVisible(self.scroll() > window.innerHeight * 0.5)
        let current = ''
        for (const id of SECTION_IDS) {
          const el = document.getElementById(id)
          if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) current = id
        }
        setActive(current)
      },
    })
    return () => trigger.kill()
  }, [])

  // Mobile menu: lock scroll, close on Escape
  useEffect(() => {
    if (!open) return
    const lenis = getLenis()
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      lenis?.start()
    }
  }, [open])

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    const wasOpen = open
    setOpen(false)
    window.setTimeout(() => scrollToId(id), wasOpen ? 350 : 0)
  }

  return (
    <>
      <header
        className={`ease-cine fixed inset-x-0 top-0 z-[60] border-b border-line bg-bg/55 backdrop-blur-md transition-[transform,opacity,visibility] duration-500 ${
          visible ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-full opacity-0'
        }`}
      >
        <nav aria-label="Primary" className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-12">
          <a href="#hero" onClick={go('hero')} className="label flex items-center gap-2 text-text">
            <span className="inline-block h-2 w-2 rounded-full bg-red" />
            {profile.name}
          </a>

          <ul className="hidden items-center gap-10 md:flex">
            {navItems.map((n) => {
              const on = active === n.id
              return (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={go(n.id)}
                    aria-current={on ? 'location' : undefined}
                    className={`label group relative py-1 transition-colors duration-300 hover:text-text ${on ? 'text-text' : ''}`}
                  >
                    {n.label}
                    <span
                      className={`ease-cine absolute inset-x-0 -bottom-0.5 h-px origin-left bg-red transition-transform duration-500 ${
                        on ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </a>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            className="label text-text md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'CLOSE' : 'MENU'}
          </button>
        </nav>
      </header>

      <div
        id="mobile-menu"
        className={`ease-cine fixed inset-0 z-[58] bg-bg/95 backdrop-blur-md transition-[clip-path,visibility] duration-500 md:hidden ${
          open ? 'visible [clip-path:inset(0)]' : 'invisible [clip-path:inset(0_0_100%_0)]'
        }`}
      >
        <div className="flex h-full flex-col justify-between px-6 pt-28 pb-10">
          <ul className="space-y-4">
            {navItems.map((n, i) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={go(n.id)}
                  className="flex items-baseline gap-4 text-5xl font-medium tracking-tighter"
                >
                  <span className="label text-red">0{i + 1}</span>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="label leading-loose">
            <div>{profile.name}</div>
            <div>{profile.location}</div>
          </div>
        </div>
      </div>
    </>
  )
}
