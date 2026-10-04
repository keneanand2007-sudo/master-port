import Scene from '../scenes/Scene'
import Headline from '../animation/Headline'
import { backgrounds } from '../../data/backgrounds'
import { profile } from '../../data/profile'

export default function Contact() {
  const links: [string, string, string][] = [
    ['EMAIL', profile.email, `mailto:${profile.email}`],
    ['GITHUB', 'keneanand2007-sudo', profile.github],
    ['LINKEDIN', 'anand-kene', profile.linkedin],
  ]

  return (
    <Scene id="contact" image={backgrounds.contact} num="05" title="CONTACT" jp="連絡" dim={0.65}>
      <div className="flex flex-1 flex-col justify-center py-16">
        <p data-reveal className="label mb-6">SO...</p>
        <Headline lines={['WHAT SHOULD', 'WE BUILD', 'NEXT?']} />

        <div data-reveal className="mt-12">
          <a className="btn" href={`mailto:${profile.email}`}>
            LET’S TALK →
          </a>
        </div>

        <ul className="mt-20 grid gap-8 md:grid-cols-3">
          {links.map(([k, label, href]) => (
            <li key={k} data-reveal className="border-t border-line pt-4">
              <p className="label">{k}</p>
              <a
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noreferrer"
                className="mt-2 inline-block text-xl transition-colors duration-300 hover:text-red"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer className="flex flex-wrap items-end justify-between gap-6 border-t border-current/15 pt-8">
        <div>
          <p className="label">THANK YOU FOR SCROLLING.</p>
          <p className="mt-1 text-2xl font-medium tracking-tight">THE END</p>
        </div>
        <p className="label">
          {profile.brand} / DEVELOPER © {new Date().getFullYear()}
        </p>
        <span className="jp text-sm text-muted">東京</span>
      </footer>
    </Scene>
  )
}
