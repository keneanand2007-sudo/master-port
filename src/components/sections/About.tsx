import Scene from '../scenes/Scene'
import Headline from '../animation/Headline'
import { backgrounds } from '../../data/backgrounds'
import { education, hackathons } from '../../data/experience'
import { profile } from '../../data/profile'

export default function About() {
  const facts: [string, string][] = [
    ['EDUCATION', education.degree],
    ['INSTITUTE', `${education.institute}, ${education.university}`],
    ['EXPECTED / NOW', `${education.expected} / ${education.current}`],
    ['CGPA', education.cgpa],
    ['LANGUAGES', profile.languages.join(' / ')],
  ]

  return (
    <Scene id="about" image={backgrounds.about} num="03" title="ABOUT / JOURNEY" jp="旅" dim={0.4}>
      <div className="flex flex-1 flex-col justify-center gap-20 py-16">
        <Headline lines={['CURIOSITY FIRST.', 'THEN CODE.', 'NOW AGENTS.']} />

        <div className="grid gap-6 md:grid-cols-2">
          <dl data-reveal className="glass-card space-y-5 p-6 md:p-8">
            {facts.map(([k, v], i) => (
              <div key={k} className={`grid grid-cols-3 gap-4 ${i > 0 ? 'border-t border-line pt-4' : ''}`}>
                <dt className="label">{k}</dt>
                <dd className="col-span-2 text-text/90">{v}</dd>
              </div>
            ))}
          </dl>

          <div data-reveal className="glass-card p-6 md:p-8">
            <p className="label mb-4">HACKATHONS</p>
            <ul className="space-y-5">
              {hackathons.map((h, i) => (
                <li key={h.id} className={i > 0 ? 'border-t border-line pt-4' : ''}>
                  <span className="label text-red">{h.id}</span>
                  <p className="mt-1 text-2xl font-medium tracking-tight">{h.name}</p>
                  <p className="label mt-1">{h.host}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Scene>
  )
}
