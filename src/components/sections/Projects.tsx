import Scene from '../scenes/Scene'
import Headline from '../animation/Headline'
import { backgrounds } from '../../data/backgrounds'
import { projects } from '../../data/projects'

export default function Projects() {
  return (
    <Scene id="work" image={backgrounds.projects} num="02" title="SELECTED WORK" jp="作品" dim={0.35}>
      <div className="flex flex-1 flex-col justify-center py-16">
        <Headline lines={['THINGS I', 'HAVE BUILT.']} />

        <ul className="mt-16 space-y-4">
          {projects.map((p) => (
            <li key={p.id} data-reveal className="glass-card glass-card--hover group">
              <a
                href={p.githubUrl}
                target="_blank"
                rel="noreferrer"
                data-cursor="open"
                aria-label={`View ${p.title} on GitHub`}
                className="grid grid-cols-12 items-start gap-x-4 gap-y-4 p-6 md:p-10"
              >
                <span className="label col-span-2 pt-3 md:col-span-1">{p.id}</span>

                <div className="col-span-10 md:col-span-6">
                  <h3 className="ease-cine text-[clamp(2rem,6vw,6rem)] leading-none font-medium tracking-tighter transition-all duration-500 group-hover:translate-x-4 group-hover:text-red">
                    {p.title}
                  </h3>
                  {p.status && <p className="label mt-3 text-red">● {p.status}</p>}
                </div>

                <div className="col-span-12 md:col-span-4">
                  <p className="label">{p.category}</p>
                  <p className="mt-2 text-text/75">{p.description}</p>
                  {p.highlights.length > 0 && (
                    <ul className="label mt-3 space-y-1 text-text/60">
                      {p.highlights.map((h) => (
                        <li key={h}>/ {h}</li>
                      ))}
                    </ul>
                  )}
                  {p.technologies.length > 0 && (
                    <p className="label mt-3 text-cyan">{p.technologies.join(' / ')}</p>
                  )}
                </div>

                <span className="ease-cine hidden pt-2 text-right text-2xl transition-transform duration-500 group-hover:translate-x-2 md:col-span-1 md:block">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Scene>
  )
}
