import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ScrollTrigger } from '../../lib/gsap'
import { hasWebGL, isLowPower } from '../../lib/device'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { backgrounds } from '../../data/backgrounds'
import ErrorBoundary from '../common/ErrorBoundary'

// ---- tuning knobs -------------------------------------------------------
const LEAVES_HIGH = 150 // total sharp leaves on a normal device
const LEAVES_LOW = 70 // on weak devices / small screens
const GUST = 3.2 // how strong the wind bursts are
// -------------------------------------------------------------------------

type Ref<T> = { current: T }
type PointerState = { x: number; push: number; lastX: number }
type Palette = [string, string, string]

const CAM_Z = 10
const FOV = 40
const TAN = Math.tan(((FOV / 2) * Math.PI) / 180)
const dummy = new THREE.Object3D()

const RED: Palette = ['#d9401f', '#a8221a', '#5e0e0d']
const ORANGE: Palette = ['#f59a38', '#d9631a', '#7d3509']
const AMBER: Palette = ['#ecc04a', '#c98a1c', '#6e4309']

// A maple-style leaf drawn on a canvas: lobes, serrated edge, veins and a stem.
function leafTexture(palette: Palette, blur = 0): THREE.CanvasTexture {
  const S = 128
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const ctx = canvas.getContext('2d')
  if (!ctx) return tex

  if (blur) ctx.filter = `blur(${blur}px)`
  const cx = S / 2
  const cy = S * 0.55
  const R = S * 0.4
  // [angle in degrees, height, width]
  const lobes: [number, number, number][] = [
    [90, 1, 13],
    [40, 0.82, 12],
    [140, 0.82, 12],
    [-22, 0.5, 12],
    [202, 0.5, 12],
  ]

  ctx.beginPath()
  for (let a = 0; a <= 360; a += 1.5) {
    let r = 0.3
    for (const [ang, h, w] of lobes) {
      const d = Math.abs(((a - ang + 540) % 360) - 180)
      r += h * 0.7 * Math.exp(-(d * d) / (2 * w * w))
    }
    r += Math.sin(a * 0.5934) * 0.022
    const rad = (a * Math.PI) / 180
    const x = cx + Math.cos(rad) * r * R
    const y = cy - Math.sin(rad) * r * R
    if (a === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()

  const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, R)
  g.addColorStop(0, palette[0])
  g.addColorStop(0.55, palette[1])
  g.addColorStop(1, palette[2])
  ctx.fillStyle = g
  ctx.fill()
  ctx.lineWidth = 1.2
  ctx.strokeStyle = 'rgba(50,12,4,0.55)'
  ctx.stroke()

  ctx.strokeStyle = 'rgba(255,225,170,0.35)'
  ctx.lineWidth = 1.4
  for (const [ang, len] of [
    [90, 0.95],
    [40, 0.8],
    [140, 0.8],
    [-22, 0.5],
    [202, 0.5],
  ]) {
    const rad = (ang * Math.PI) / 180
    ctx.beginPath()
    ctx.moveTo(cx, cy + R * 0.28)
    ctx.lineTo(cx + Math.cos(rad) * len * R, cy - Math.sin(rad) * len * R)
    ctx.stroke()
  }

  ctx.strokeStyle = '#4e2410'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx, cy + R * 0.3)
  ctx.lineTo(cx, S * 0.93)
  ctx.stroke()

  return tex
}

// Wind: a steady breeze plus irregular strong gusts. Mouse swipes and fast scrolling add to it.
function windAt(t: number, push: number, boost: number): [number, number] {
  const g = Math.max(0, Math.sin(t * 0.45) * 0.7 + Math.sin(t * 1.13 + 1.7) * 0.3)
  const gust = g * g * GUST
  return [Math.max(0.15, 0.8 + gust + push * 3 + boost * 2), gust]
}

type LayerProps = {
  count: number
  tex: THREE.Texture
  zMin: number
  zMax: number
  sMin: number
  sMax: number
  blurred?: boolean
  pointer: Ref<PointerState>
  boost: Ref<number>
}

// One instanced mesh = one draw call. Positions live in screen-relative units so the
// leaves fill any aspect ratio; wind moves them, gusts lift and spin them.
function LeafLayer({ count, tex, zMin, zMax, sMin, sMax, blurred = false, pointer, boost }: LayerProps) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const data = useRef<Float32Array | null>(null)

  useEffect(() => {
    // per leaf: nx, ny, z, size, fall, phase, spin, drag
    const d = new Float32Array(count * 8)
    for (let i = 0; i < count; i++) {
      const o = i * 8
      d[o] = Math.random() * 2.7 - 1.35
      d[o + 1] = Math.random() * 2.7 - 1.35
      d[o + 2] = zMin + Math.random() * (zMax - zMin)
      d[o + 3] = sMin + Math.random() * (sMax - sMin)
      d[o + 4] = 0.9 + Math.random() * 0.6
      d[o + 5] = Math.random() * Math.PI * 2
      d[o + 6] = 0.6 + Math.random() * 1.6
      d[o + 7] = 0.7 + Math.random() * 0.6
    }
    data.current = d
  }, [count, zMin, zMax, sMin, sMax])

  useFrame((state, delta) => {
    const m = mesh.current
    const d = data.current
    if (!m || !d) return
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const aspect = state.size.width / state.size.height
    const [wind, gust] = windAt(t, pointer.current.push, boost.current)

    for (let i = 0; i < count; i++) {
      const o = i * 8
      const z = d[o + 2]
      const dist = CAM_Z - z
      const sf = CAM_Z / dist
      const halfH = dist * TAN
      const halfW = halfH * aspect
      const phase = d[o + 5]
      const spin = d[o + 6]

      let nx = d[o] + (wind * d[o + 7] * 0.2 + Math.sin(t * 1.3 + phase) * 0.12) * dt * sf
      const lift = gust * 0.09 * (0.4 + 0.6 * Math.sin(phase * 3 + t * 1.6))
      let ny = d[o + 1] + (-d[o + 4] * 0.2 + lift) * dt * sf

      if (nx > 1.35) {
        nx = -1.35
        ny = Math.random() * 2.4 - 1.2
      } else if (nx < -1.35) {
        nx = 1.35
        ny = Math.random() * 2.4 - 1.2
      }
      if (ny < -1.3) {
        ny = 1.3
        nx = Math.random() * 2.7 - 1.35
      } else if (ny > 1.5) {
        ny = -1.2
      }
      d[o] = nx
      d[o + 1] = ny

      dummy.position.set(nx * halfW, ny * halfH, z)
      dummy.rotation.set(
        t * spin * (0.8 + gust * 0.5) + phase,
        t * spin * 0.7 + phase * 2,
        Math.sin(t * 1.1 + phase) * 0.9 + phase,
      )
      dummy.scale.setScalar(d[o + 3])
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      {blurred ? (
        <meshLambertMaterial map={tex} transparent opacity={0.55} depthWrite={false} side={THREE.DoubleSide} />
      ) : (
        <meshLambertMaterial
          map={tex}
          alphaTest={0.35}
          side={THREE.DoubleSide}
          emissive="#3a1208"
          emissiveIntensity={0.6}
        />
      )}
    </instancedMesh>
  )
}

// Camera drifts slightly with the mouse; swipe and scroll gusts fade out here
function Rig({ pointerRef, boostRef }: { pointerRef: Ref<PointerState>; boostRef: Ref<number> }) {
  useFrame((state, dt) => {
    pointerRef.current.push *= Math.exp(-3 * dt)
    boostRef.current *= Math.exp(-2.5 * dt)
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, pointerRef.current.x * 0.5, 2, dt)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function SceneContent({ low, pointer, boost }: { low: boolean; pointer: Ref<PointerState>; boost: Ref<number> }) {
  const red = useMemo(() => leafTexture(RED), [])
  const orange = useMemo(() => leafTexture(ORANGE), [])
  const amber = useMemo(() => leafTexture(AMBER), [])
  const soft = useMemo(() => leafTexture(ORANGE, 5), [])

  useEffect(
    () => () => {
      red.dispose()
      orange.dispose()
      amber.dispose()
      soft.dispose()
    },
    [red, orange, amber, soft],
  )

  const each = Math.round((low ? LEAVES_LOW : LEAVES_HIGH) / 3)
  const common = { pointer, boost, zMin: -3, zMax: 4, sMin: 0.15, sMax: 0.28 }

  return (
    <>
      <ambientLight intensity={1.1} color="#ffd9b0" />
      <directionalLight position={[-5, 6, 6]} intensity={2.4} color="#ffb070" />
      <directionalLight position={[5, -2, 3]} intensity={0.6} color="#7de7ff" />
      <Rig pointerRef={pointer} boostRef={boost} />
      <LeafLayer {...common} count={each} tex={red} />
      <LeafLayer {...common} count={each} tex={orange} />
      <LeafLayer {...common} count={each} tex={amber} />
      <LeafLayer
        pointer={pointer}
        boost={boost}
        count={low ? 3 : 6}
        tex={soft}
        zMin={6}
        zMax={8}
        sMin={0.3}
        sMax={0.5}
        blurred
      />
    </>
  )
}

// 0..1 bump centred between a and b
const tent = (p: number, a: number, b: number) => Math.max(0, 1 - Math.abs(p - (a + b) / 2) / ((b - a) / 2))

const H2 = 'text-[clamp(2rem,6vw,6rem)] leading-[0.9] font-bold tracking-tighter uppercase'

export default function World() {
  const rootRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLImageElement>(null)
  const line1 = useRef<HTMLDivElement>(null)
  const line2 = useRef<HTMLDivElement>(null)
  const pointer = useRef<PointerState>({ x: 0, push: 0, lastX: 0 })
  const boost = useRef(0)
  const [inView, setInView] = useState(false)

  const webgl = useMemo(() => hasWebGL(), [])
  const low = useMemo(() => isLowPower(), [])
  const reduced = useMemo(() => prefersReducedMotion(), [])

  // Scroll: the background drifts closer, the two lines fade in turn, fast scrolling raises the wind
  useEffect(() => {
    const root = rootRef.current
    const bg = bgRef.current
    const a = line1.current
    const b = line2.current
    if (!root || !bg || !a || !b) return

    const apply = (p: number) => {
      if (reduced) return
      bg.style.transform = `scale(${1.06 + p * 0.1})`
      const oa = Math.min(1, tent(p, -0.2, 0.55) * 2)
      const ob = Math.min(1, tent(p, 0.45, 1.2) * 2)
      a.style.opacity = String(oa)
      a.style.transform = `translateY(${(1 - oa) * 24}px)`
      b.style.opacity = String(ob)
      b.style.transform = `translateY(${(1 - ob) * 24}px)`
    }
    apply(0)

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        apply(self.progress)
        boost.current = Math.min(2.5, Math.abs(self.getVelocity()) / 900)
      },
    })
    return () => trigger.kill()
  }, [reduced])

  // Only render while the scene is near the screen
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Mouse position steers the camera; a fast swipe blows the leaves
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const p = pointer.current
    p.x = ((e.clientX - r.left) / r.width - 0.5) * 2
    p.push = THREE.MathUtils.clamp(p.push + (e.clientX - p.lastX) * 0.004, -2, 2)
    p.lastX = e.clientX
  }

  return (
    <section ref={rootRef} id="world" aria-label="Autumn interlude" className="relative h-[260svh] bg-bg">
      <div className="sticky top-0 h-svh touch-pan-y overflow-hidden" onPointerMove={onPointerMove}>
        <img
          ref={bgRef}
          src={backgrounds.autumn}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{ filter: 'brightness(0.8) contrast(1.05) saturate(1.1)' }}
        />
        <div className="absolute inset-0 bg-bg/50" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 78% 22%, rgb(255 140 60 / 0.28), transparent 70%), radial-gradient(ellipse at 50% 50%, transparent 40%, rgb(7 7 7 / 0.65) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-bg/70 via-transparent to-transparent" />

        {webgl && !reduced && (
          <div className="absolute inset-0" aria-hidden="true">
            <ErrorBoundary>
              <Canvas
                flat
                frameloop={inView ? 'always' : 'never'}
                dpr={low ? 1 : [1, 1.75]}
                camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.1, far: 60 }}
                gl={{ antialias: !low, powerPreference: 'high-performance' }}
              >
                <SceneContent low={low} pointer={pointer} boost={boost} />
              </Canvas>
            </ErrorBoundary>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-bg to-transparent" />

        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between p-6 md:p-12">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <span className="label">
              <span className="text-red">—</span> INTERLUDE
            </span>
            <span className="label jp">紅葉</span>
          </div>

          <div className="space-y-10">
            <div ref={line1}>
              <h2 className={H2}>
                Code is only
                <br />
                the first layer.
              </h2>
            </div>
            <div ref={line2}>
              <h2 className={H2}>
                The rest is
                <br />
                experience.
              </h2>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="label">MOVE THE MOUSE — GUSTS FOLLOW</span>
            <span className="label">SCROLL — THE WIND RISES</span>
          </div>
        </div>
      </div>
    </section>
  )
}
