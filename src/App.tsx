import { useState } from 'react'
import Hero from './components/sections/Hero'
import Preloader from './components/common/Preloader'
import { backgrounds } from './data/backgrounds'
import { education, hackathons } from './data/experience'
import { profile } from './data/profile'
import { projects } from './data/projects'
import { skillGroups } from './data/skills'

const swatches = [
  ['bg', '#070707'],
  ['surface', '#0D0D0D'],
  ['paper', '#E8E2D0'],
  ['text', '#F2F2F2'],
  ['red', '#FF3B30'],
  ['ember', '#FF7A2E'],
  ['cyan', '#7DE7FF'],
] as const

export default function App() {
  const [ready, setReady] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <main className="min-h-screen bg-bg text-text">
      {!loaded && <Preloader onExit={() => setReady(true)} onDone={() => setLoaded(true)} />}
      <Hero ready={ready} />

      <section className="grid gap-12 p-6 md:p-12">
        <div>
          <p className="label mb-4">01 / COLOR</p>
          <div className="flex flex-wrap gap-3">
            {swatches.map(([name, hex]) => (
              <div key={name} className="card w-28 overflow-hidden">
                <div className="h-16" style={{ background: hex }} />
                <div className="label p-2">{name}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="label mb-4">02 / BUTTONS + CARD</p>
          <div className="flex flex-wrap items-start gap-6">
            <button className="btn">View project →</button>
            <a className="btn" href={profile.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <div className="card max-w-md p-6">
              <p className="label">{projects[0].id} / {projects[0].category}</p>
              <h2 className="mt-2 text-4xl font-medium">{projects[0].title}</h2>
              <p className="mt-3 text-muted">{projects[0].description}</p>
              <p className="label mt-4 text-cyan">{projects[0].technologies.slice(0, 4).join(' / ')}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="label mb-4">03 / BACKGROUNDS (orientation check)</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Object.entries(backgrounds).map(([name, src]) => (
              <figure key={name} className="card overflow-hidden">
                <img src={src} alt={`${name} scene background`} className="aspect-video w-full object-cover" />
                <figcaption className="label p-3">{name}</figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div>
          <p className="label mb-4">04 / DATA LOADED</p>
          <p className="label leading-loose">
            {projects.length} projects / {skillGroups.length} skill groups / {hackathons.length} hackathons /
            BCA {education.expected} / CGPA {education.cgpa}
          </p>
        </div>
      </section>
    </main>
  )
}
