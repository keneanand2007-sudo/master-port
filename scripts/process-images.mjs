import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

// Usage: node scripts/process-images.mjs [rotationDegrees]
// Default 270 = 90 degrees counter-clockwise. Try 90 or 0 if images look wrong.
const ROT = Number(process.argv[2] ?? 270)

const MAP = {
  hero: 'download7',
  story: 'download6',
  projects: 'download2',
  about: 'download5',
  skills: 'download3',
  contact: 'download4',
}

await mkdir('public/images/bg', { recursive: true })

for (const [name, src] of Object.entries(MAP)) {
  const info = await sharp(`public/images/raw/${src}.jpg`)
    .rotate(ROT)
    .webp({ quality: 82 })
    .toFile(`public/images/bg/${name}.webp`)
  console.log(`${name}: ${info.width}x${info.height} ${Math.round(info.size / 1024)}KB (rot ${ROT})`)
}
