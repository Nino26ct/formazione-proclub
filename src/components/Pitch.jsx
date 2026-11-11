import { forwardRef, useEffect, useRef } from 'react'
import { Shirt } from './Shirt'

export const PITCH_W = 1000
export const PITCH_H = 1400
const FONT = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

function Markings() {
  const line = { fill: 'none', stroke: 'rgba(255,255,255,0.75)', strokeWidth: 5 }
  const m = 40 // margine del campo
  const w = PITCH_W - m * 2
  const h = PITCH_H - m * 2
  const boxW = 580
  const boxH = 230
  const smallW = 270
  const smallH = 85
  const cx = PITCH_W / 2
  return (
    <g>
      <rect x="0" y="0" width={PITCH_W} height={PITCH_H} fill="#15803d" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x="0" y={(PITCH_H / 10) * i} width={PITCH_W} height={PITCH_H / 10} fill={i % 2 ? '#166534' : '#15803d'} />
      ))}
      <rect x={m} y={m} width={w} height={h} {...line} />
      <line x1={m} y1={PITCH_H / 2} x2={PITCH_W - m} y2={PITCH_H / 2} {...line} />
      <circle cx={cx} cy={PITCH_H / 2} r="110" {...line} />
      <circle cx={cx} cy={PITCH_H / 2} r="7" fill="rgba(255,255,255,0.75)" />
      {/* area avversaria (in alto) */}
      <rect x={cx - boxW / 2} y={m} width={boxW} height={boxH} {...line} />
      <rect x={cx - smallW / 2} y={m} width={smallW} height={smallH} {...line} />
      <path d={`M ${cx - 95} ${m + boxH} A 110 110 0 0 0 ${cx + 95} ${m + boxH}`} {...line} />
      <rect x={cx - 75} y={m - 22} width="150" height="22" {...line} />
      {/* nostra area (in basso) */}
      <rect x={cx - boxW / 2} y={PITCH_H - m - boxH} width={boxW} height={boxH} {...line} />
      <rect x={cx - smallW / 2} y={PITCH_H - m - smallH} width={smallW} height={smallH} {...line} />
      <path d={`M ${cx - 95} ${PITCH_H - m - boxH} A 110 110 0 0 1 ${cx + 95} ${PITCH_H - m - boxH}`} {...line} />
      <rect x={cx - 75} y={PITCH_H - m} width="150" height="22" {...line} />
    </g>
  )
}

/**
 * Campo con i giocatori. Tocco = apre la modifica, trascinamento = sposta.
 * slots: [{ role, x, y }] in percentuale (già con le posizioni personalizzate).
 */
const Pitch = forwardRef(function Pitch({ slots, players, captain, kit, gkKit, onMove, onTap, interactive = true }, ref) {
  const svgRef = useRef(null)
  const drag = useRef(null)

  const setRefs = (node) => {
    svgRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  // Su mobile impedisce lo scroll della pagina solo quando si tocca una maglia.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !interactive) return
    const block = (e) => {
      if (e.target.closest?.('[data-player]')) e.preventDefault()
    }
    svg.addEventListener('touchstart', block, { passive: false })
    return () => svg.removeEventListener('touchstart', block)
  }, [interactive])

  const toPitch = (e) => {
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(svg.getScreenCTM().inverse())
    return { x: clamp((p.x / PITCH_W) * 100, 7, 93), y: clamp((p.y / PITCH_H) * 100, 4, 96) }
  }

  const onPointerDown = (i) => (e) => {
    if (!interactive) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const start = toPitch(e)
    drag.current = { i, sx: e.clientX, sy: e.clientY, moved: false, offX: slots[i].x - start.x, offY: slots[i].y - start.y }
  }

  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 8) return
    d.moved = true
    const p = toPitch(e)
    onMove?.(d.i, { x: clamp(p.x + d.offX, 7, 93), y: clamp(p.y + d.offY, 5, 94) })
  }

  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    if (d && !d.moved) onTap?.(d.i)
  }

  return (
    <svg
      ref={setRefs}
      viewBox={`0 0 ${PITCH_W} ${PITCH_H}`}
      xmlns="http://www.w3.org/2000/svg"
      className="block h-auto w-full select-none rounded-xl"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (drag.current = null)}
    >
      <Markings />
      {slots.map((s, i) => {
        const p = players[i]
        const name = (p?.name || '').trim()
        return (
          <g
            key={i}
            data-player={i}
            transform={`translate(${(s.x / 100) * PITCH_W} ${(s.y / 100) * PITCH_H})`}
            onPointerDown={onPointerDown(i)}
            style={{ cursor: interactive ? 'grab' : 'default' }}
          >
            <circle r="70" fill="transparent" />
            <Shirt kit={i === 0 ? gkKit : kit} number={p?.number ?? ''} captain={captain === i} />
            <text
              y="78"
              textAnchor="middle"
              fontSize={name.length > 11 ? 26 : 31}
              fontWeight="700"
              fontFamily={FONT}
              fill="#ffffff"
              stroke="rgba(0,0,0,0.85)"
              strokeWidth="7"
              strokeLinejoin="round"
              paintOrder="stroke"
            >
              {name ? name.toUpperCase() : s.role}
            </text>
          </g>
        )
      })}
    </svg>
  )
})

export default Pitch
