import { useEffect, useRef } from 'react'

const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Tokyo',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export default function TokyoClock() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const tick = () => {
      if (ref.current) ref.current.textContent = fmt.format(new Date())
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span className="label">
      <span ref={ref}>00:00:00</span> / TOKYO JST
    </span>
  )
}
