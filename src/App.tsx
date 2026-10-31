import CurrentFocus from './components/sections/CurrentFocus'
import { lazy, Suspense, useEffect, useState } from 'react'
import { ScrollTrigger } from './lib/gsap'
import Preloader from './components/common/Preloader'
import Hero from './components/sections/Hero'
import Story from './components/sections/Story'
import Projects from './components/sections/Projects'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Contact from './components/sections/Contact'

// The 3D scene (three.js) is a separate chunk, loaded only after the preloader is done
const World = lazy(() => import('./components/sections/World'))

function WorldSpace() {
  return <div id="world" aria-hidden="true" className="h-[260svh] bg-bg" />
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Web fonts change text height, so recalculate scroll triggers once they are in
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <main className="bg-bg text-text">
      {!loaded && <Preloader onExit={() => setReady(true)} onDone={() => setLoaded(true)} />}
      <Hero ready={ready} /><CurrentFocus />
      <Story />
      {loaded ? (
        <Suspense fallback={<WorldSpace />}>
          <World />
        </Suspense>
      ) : (
        <WorldSpace />
      )}
      <Projects />
      <About />
      <Skills />
      <Contact />
    </main>
  )
}
