interface HeadlineProps {
  lines: string[]
  className?: string
}

// Big editorial headline. Words are animated by <Scene> via [data-words] / [data-w].
export default function Headline({ lines, className = '' }: HeadlineProps) {
  return (
    <h2
      data-words
      aria-label={lines.join(' ')}
      className={`text-[clamp(2.5rem,8.5vw,9rem)] leading-[0.9] font-bold tracking-tighter uppercase ${className}`}
    >
      {lines.map((line, li) => (
        <span key={li} aria-hidden="true" className="block">
          {line.split(' ').map((word, wi) => (
            <span key={wi} className="mr-[0.25em] inline-block overflow-hidden pb-[0.06em] align-top">
              <span data-w className="inline-block">
                {word}
              </span>
            </span>
          ))}
        </span>
      ))}
    </h2>
  )
}
