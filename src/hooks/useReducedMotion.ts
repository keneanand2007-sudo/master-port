import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches
}

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false)
}
