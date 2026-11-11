import { useId } from 'react'

// Sagoma della maglia centrata in (0,0), larga circa 110 e alta 84.
export const SHIRT_PATH =
  'M-21 -40 L-44 -30 L-56 -2 L-38 6 L-33 -6 L-33 42 L33 42 L33 -6 L38 6 L56 -2 L44 -30 L21 -40 Q0 -24 -21 -40 Z'
const SLEEVE_L = 'M-21 -40 L-44 -30 L-56 -2 L-38 6 L-33 -6 L-31 -36 Z'
const SLEEVE_R = 'M21 -40 L44 -30 L56 -2 L38 6 L33 -6 L31 -36 Z'

function Pattern({ style, primary, secondary }) {
  const base = <rect x="-60" y="-45" width="120" height="90" fill={primary} />
  switch (style) {
    case 'vstripes':
      return (
        <>
          {base}
          {[-38, -16, 6, 28].map((x) => (
            <rect key={x} x={x} y="-45" width="11" height="90" fill={secondary} />
          ))}
        </>
      )
    case 'hstripes':
      return (
        <>
          {base}
          {[-34, -14, 6, 26].map((y) => (
            <rect key={y} x="-60" y={y} width="120" height="10" fill={secondary} />
          ))}
        </>
      )
    case 'halves':
      return (
        <>
          {base}
          <rect x="0" y="-45" width="60" height="90" fill={secondary} />
        </>
      )
    case 'sash':
      return (
        <>
          {base}
          <polygon points="-40,-45 -22,-45 40,45 22,45" fill={secondary} />
        </>
      )
    case 'chestband':
      return (
        <>
          {base}
          <rect x="-60" y="-14" width="120" height="16" fill={secondary} />
        </>
      )
    case 'sleeves':
      return (
        <>
          {base}
          <path d={SLEEVE_L} fill={secondary} />
          <path d={SLEEVE_R} fill={secondary} />
        </>
      )
    case 'pinstripe':
      return (
        <>
          {base}
          {[-44, -33, -22, -11, 0, 11, 22, 33, 44].map((x) => (
            <rect key={x} x={x - 1} y="-45" width="2" height="90" fill={secondary} />
          ))}
        </>
      )
    default:
      return base
  }
}

// Maglia SVG da usare dentro un <svg>. Coordinate locali centrate in (0,0).
export function Shirt({ kit, number, captain = false }) {
  const clipId = 'clip' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={SHIRT_PATH} />
        </clipPath>
      </defs>
      <path d={SHIRT_PATH} transform="translate(0 4)" fill="rgba(0,0,0,0.35)" />
      <g clipPath={`url(#${clipId})`}>
        <Pattern style={kit.style} primary={kit.primary} secondary={kit.secondary} />
      </g>
      <path d={SHIRT_PATH} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="2.5" strokeLinejoin="round" />
      {number !== undefined && number !== '' && (
        <text
          x="0"
          y="20"
          textAnchor="middle"
          fontSize="36"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
          fill={kit.number}
          stroke={kit.style === 'solid' ? 'none' : kit.primary}
          strokeWidth="6"
          strokeLinejoin="round"
          paintOrder="stroke"
        >
          {number}
        </text>
      )}
      {captain && (
        <g transform="translate(42 -34)">
          <circle r="15" fill="#facc15" stroke="#0f172a" strokeWidth="3" />
          <text
            y="6"
            textAnchor="middle"
            fontSize="18"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
            fill="#0f172a"
          >
            C
          </text>
        </g>
      )}
    </g>
  )
}

// Piccola anteprima autonoma (per bottoni ed elenchi).
export function ShirtIcon({ kit, number, size = 40 }) {
  return (
    <svg viewBox="-60 -46 120 94" width={size} height={size * 0.78} aria-hidden="true">
      <Shirt kit={kit} number={number} />
    </svg>
  )
}
