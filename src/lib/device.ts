export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

// Rough capability check: small screens and weak devices get a lighter scene
export function isLowPower(): boolean {
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  return window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4 || (mem !== undefined && mem <= 4)
}
