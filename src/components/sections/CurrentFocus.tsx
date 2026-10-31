import Scene from '../scenes/Scene'
import { backgrounds } from '../../data/backgrounds'
import { projects } from '../../data/projects'

const activeProjects = projects.filter((project) => project.status)

export default function CurrentFocus() {
  return (
    <Scene
      id="focus"
      image={backgrounds.projects}
      num="00"
      title="CURRENT FOCUS"
      jp="現在"
      dim={0.4}
    >
      <div className="flex flex-1 flex-col justify-center gap-8 py-16">
        <p className="label text-red">IN PROGRESS / WHAT I'M WORKING ON</p>

        {activeProjects.map((project) => (
          <article
            key={project.id}
            data-reveal
            className="glass-card glass-card--hover max-w-4xl p-6 md:p-10"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="label">{project.category}</p>
              {project.status && (
                <p className="label text-red">● {project.status}</p>
              )}
            </div>

            <h2 className="mt-6 text-[clamp(2.5rem,8vw,7rem)] leading-none font-medium tracking-tighter">
              {project.title}
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text/75">
              {project.description}
            </p>

            {project.highlights.length > 0 && (
              <ul className="label mt-6 space-y-2 text-text/60">
                {project.highlights.map((highlight) => (
                  <li key={highlight}>/ {highlight}</li>
                ))}
              </ul>
            )}

            {project.technologies.length > 0 && (
              <p className="label mt-8 text-cyan">
                {project.technologies.join(' / ')}
              </p>
            )}
          </article>
        ))}
      </div>
    </Scene>
  )
}
