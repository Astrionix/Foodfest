type SpiceMeterProps = {
  level: number
  size?: 'sm' | 'md'
}

const MAX_LEVEL = 5

function SpiceMeter({ level, size = 'md' }: SpiceMeterProps) {
  const clamped = Math.max(0, Math.min(level, MAX_LEVEL))
  const emojis = Array.from({ length: MAX_LEVEL }, (_, idx) => {
    const filled = idx < clamped
    return (
      <span
        key={idx}
        style={{
          filter: filled ? 'drop-shadow(0 0 6px rgba(255, 69, 0, 0.6))' : 'none',
          opacity: filled ? 1 : 0.36,
          fontSize: size === 'md' ? '1.3rem' : '1rem',
          transition: 'opacity 0.2s ease',
        }}
        aria-hidden
      >
        🌶️
      </span>
    )
  })

  return (
    <div
      style={{
        display: 'inline-flex',
        gap: size === 'md' ? '0.2rem' : '0.15rem',
        alignItems: 'center',
      }}
      aria-label={`Spice level ${clamped} of ${MAX_LEVEL}`}
    >
      {emojis}
    </div>
  )
}

export default SpiceMeter
