import Scene from '../scenes/Scene'
import Headline from '../animation/Headline'
import { backgrounds } from '../../data/backgrounds'
import { profile } from '../../data/profile'

export default function Story() {
  return (
    <Scene id="story" image={backgrounds.story} num="01" title="THE STORY" jp="物語" tone="paper" dim={0}>
      <div className="flex flex-1 flex-col justify-between gap-24 py-16 md:min-h-[120svh]">
        <div className="space-y-6">
          <Headline lines={["I DON'T JUST", 'BUILD WEBSITES.']} />
          <Headline lines={['I BUILD', 'EXPERIENCES.']} className="opacity-90" />
        </div>
        <div data-reveal className="glass-card glass-card--paper max-w-md self-end p-6 md:p-8">
          <p className="label mb-3">{profile.name} / {profile.location}</p>
          <p className="text-lg leading-relaxed">{profile.summary}</p>
        </div>
      </div>
    </Scene>
  )
}
