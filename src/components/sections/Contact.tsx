import Scene from '../scenes/Scene'
import Headline from '../animation/Headline'
import { PearlButton } from '../ui/pearl-button'
import { backgrounds } from '../../data/backgrounds'
import { profile } from '../../data/profile'

// Clicking a button opens its link: mail app for mailto:, a new tab for everything else
const open = (href: string) => () => {
  if (href.startsWith('mailto:')) window.location.href = href
  else window.open(href, '_blank', 'noopener,noreferrer')
}

export default function Contact() {
  const mail = `mailto:${profile.email}`
  const links: [string, string, string][] = [
    ['EMAIL', profile.email, mail],
    ['GITHUB', 'keneanand2007-sudo', profile.github],
    ['LINKEDIN', 'anand-kene', profile.linkedin],
  ]

  return (
    <Scene id="contact" image={backgrounds.contact} num="05" title="CONTACT" jp="連絡" dim={0.6}>
      <div className="flex flex-1 flex-col justify-center py-16">
        <p data-reveal className="label mb-6">SO...</p>
        <Headline lines={['WHAT SHOULD', 'WE BUILD', 'NEXT?']} />

        <div data-reveal className="mt-12">
          <PearlButton label="LET'S TALK" onClick={open(mail)} aria-label="Email Anand" />
        </div>

        <ul className="mt-16 grid gap-4 md:grid-cols-3">
          {links.map(([k, label, href]) => (
            <li key={k} data-reveal className="glass-card flex flex-col items-start gap-6 p-6">
              <div>
                <p className="label">{k}</p>
                <p className="mt-2 text-lg break-all text-text/90">{label}</p>
              </div>
              <PearlButton compact label={k} onClick={open(href)} aria-label={`Open ${k}`} />
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
