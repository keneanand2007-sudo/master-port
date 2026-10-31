import Scene from '../scenes/Scene'
import { backgrounds } from '../../data/backgrounds'
import { projects } from '../../data/projects'

const updates = projects
  .filter((project) => project.status && project.highlights.length > 0)
  .flatMap((project) =>
    project.highlights.map((highlight, index) => ({
      id: `${project.id}-${index}`,
      project: project.title,
      category: project.category,
      status: project.status,
      highlight,
    })),
  )

export default function ActivityFeed() {
  return (
    <Scene
      id="build-log"
      image={backgrounds.projects}
      num="01"
      title="BUILD LOG"
      jp="制作記録"
      dim={0.55}
    >
      <div className="flex flex-1 flex-col justify-center gap-8 py-16">
        <div className="max-w-3xl">
          <p className="label text-red">RECENT PROGRESS / PROJECT NOTES</p>
          <p className="mt-5 text-lg leading-relaxed text-text/65">
            A running log of what is being built, explored, and refined.
          </p>
        </div>

        <div className="grid max-w-5xl gap-4 md:grid-cols-2">
          {updates.map((update, index) => (
            <article
              key={update.id}
              data-reveal
              className="glass-card glass-card--hover flex min-h-52 flex-col justify-between p-6 md:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="label text-red">
                  LOG / {String(index + 1).padStart(2, '0')}
                </p>
                <p className="label text-text/45">{update.project}</p>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-medium tracking-tight md:text-2xl">
                  {update.highlight}
                </h2>
                <p className="label mt-4 text-text/45">
                  {update.category} · {update.status}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Scene>
  )
}
