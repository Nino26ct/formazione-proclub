import { useState } from 'react'
import { KIT_STYLES } from '../lib/storage'
import { Shirt, ShirtIcon } from './Shirt'
import { Card } from './ui'

function ColorField({ label, value, onChange }) {
  return (
    <label className="flex flex-col items-center gap-1.5 text-xs font-semibold text-slate-300">
      <span className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/20">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -inset-2 h-16 w-16 cursor-pointer border-0 p-0"
        />
      </span>
      {label}
    </label>
  )
}

export default function KitEditor({ kit, gkKit, onChange }) {
  const [tab, setTab] = useState('kit')
  const current = tab === 'kit' ? kit : gkKit
  const update = (patch) => onChange(tab, { ...current, ...patch })

  return (
    <Card title="Maglie">
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-800 p-1">
        {[
          ['kit', 'Giocatori'],
          ['gkKit', 'Portiere'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-lg py-2 text-sm font-bold ${tab === id ? 'bg-lime-400 text-slate-950' : 'text-slate-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-col items-center gap-4">
        <svg viewBox="-70 -55 140 115" className="h-36 w-36 drop-shadow-lg" aria-label="Anteprima maglia">
          <Shirt kit={current} number={tab === 'kit' ? '10' : '1'} />
        </svg>
        <div className="flex justify-center gap-8">
          <ColorField label="Principale" value={current.primary} onChange={(v) => update({ primary: v })} />
          <ColorField label="Secondario" value={current.secondary} onChange={(v) => update({ secondary: v })} />
          <ColorField label="Numero" value={current.number} onChange={(v) => update({ number: v })} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {KIT_STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => update({ style: s.id })}
            className={`flex flex-col items-center gap-1 rounded-xl p-2 text-[11px] font-semibold leading-tight ${
              current.style === s.id ? 'bg-lime-400/15 text-lime-300 ring-2 ring-lime-400' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <ShirtIcon kit={{ ...current, style: s.id }} size={44} />
            <span className="text-center">{s.label}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}
