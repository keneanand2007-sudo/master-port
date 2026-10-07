import Scene from '../scenes/Scene'
import Headline from '../animation/Headline'
import { backgrounds } from '../../data/backgrounds'
import { skillGroups } from '../../data/skills'

export default function Skills() {
  return (
    <Scene id="skills" image={backgrounds.skills} num="04" title="SKILLS" jp="技" dim={0.5} grade="night">
      <div className="flex flex-1 flex-col justify-center gap-20 py-16">
        <Headline lines={['THE', 'TOOLKIT.']} />

        <div className="grid gap-6 md:grid-cols-2">
          {skillGroups.map((g) => (
            <div key={g.id} data-reveal className="glass-card glass-card--hover p-6 md:p-8">
              <p className="label">
                <span className="text-red">{g.id}</span> / {g.title}
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[clamp(1.4rem,2.6vw,2.4rem)] leading-tight font-medium tracking-tight">
                {g.items.map((item) => (
                  <li key={item} className="transition-colors duration-300 hover:text-cyan">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Scene>
  )
}
