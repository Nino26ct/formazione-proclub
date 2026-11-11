import { useEffect, useMemo, useRef, useState } from 'react'
import Pitch from './components/Pitch'
import KitEditor from './components/KitEditor'
import Templates from './components/Templates'
import { Button, Card, Sheet, inputClass } from './components/ui'
import { FORMATIONS, FORMATION_GROUPS, getFormation } from './data/formations'
import { loadState, loadTemplates, normalizeState, saveState, saveTemplates } from './lib/storage'
import { renderFormationImage, shareOrDownload } from './lib/share'

const TABS = [
  ['campo', 'Campo'],
  ['maglie', 'Maglie'],
  ['template', 'Template'],
]

const onlyNumber = (v) => v.replace(/\D/g, '').slice(0, 2)

export default function App() {
  const [state, setState] = useState(loadState)
  const [templates, setTemplatesState] = useState(loadTemplates)
  const [tab, setTab] = useState('campo')
  const [editing, setEditing] = useState(null)
  const [shareImg, setShareImg] = useState(null) // { blob, url }
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const pitchRef = useRef(null)
  const toastTimer = useRef(null)

  useEffect(() => saveState(state), [state])

  const setTemplates = (t) => {
    setTemplatesState(t)
    saveTemplates(t)
  }

  const notify = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }

  const formation = getFormation(state.formationId)
  const slots = useMemo(
    () => formation.slots.map((s, i) => ({ ...s, ...(state.positions[i] || {}) })),
    [formation, state.positions],
  )

  const patch = (p) => setState((s) => ({ ...s, ...p }))
  const updatePlayer = (i, p) => setState((s) => ({ ...s, players: s.players.map((x, j) => (j === i ? { ...x, ...p } : x)) }))
  const updateBench = (i, p) => setState((s) => ({ ...s, bench: s.bench.map((x, j) => (j === i ? { ...x, ...p } : x)) }))
  const movePlayer = (i, pos) => setState((s) => ({ ...s, positions: { ...s.positions, [i]: pos } }))
  const resetPosition = (i) =>
    setState((s) => {
      const positions = { ...s.positions }
      delete positions[i]
      return { ...s, positions }
    })
  const toggleCaptain = (i) => setState((s) => ({ ...s, captain: s.captain === i ? null : i }))

  const swapWithBench = (i, b) =>
    setState((s) => {
      const starter = s.players[i]
      const sub = s.bench[b]
      return {
        ...s,
        players: s.players.map((x, j) => (j === i ? { ...sub } : x)),
        bench: s.bench.map((x, j) => (j === b ? { ...starter } : x)),
        captain: s.captain === i ? null : s.captain,
      }
    })

  const hasMoved = Object.keys(state.positions).length > 0
  const captainName = state.captain != null ? state.players[state.captain]?.name.trim() : ''

  const share = async () => {
    if (!pitchRef.current) return
    setBusy(true)
    try {
      const blob = await renderFormationImage({
        svg: pitchRef.current,
        teamName: state.teamName,
        formationId: formation.id,
        bench: state.bench,
        captainName,
      })
      setShareImg({ blob, url: URL.createObjectURL(blob) })
    } catch {
      notify("Impossibile creare l'immagine")
    } finally {
      setBusy(false)
    }
  }

  const closeShare = () => {
    if (shareImg) URL.revokeObjectURL(shareImg.url)
    setShareImg(null)
  }

  const fileName = `formazione-${(state.teamName || 'proclub').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`

  const editingPlayer = editing != null ? state.players[editing] : null

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="sticky top-0 z-30 bg-slate-950/90 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur">
        <div className="mb-3 flex items-center gap-2">
          <input
            className="min-w-0 flex-1 bg-transparent text-xl font-extrabold tracking-tight text-white placeholder:text-slate-600 focus:outline-none"
            placeholder="Nome squadra"
            value={state.teamName}
            maxLength={30}
            onChange={(e) => patch({ teamName: e.target.value })}
          />
          <select
            className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-bold text-lime-300 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-lime-400"
            value={formation.id}
            onChange={(e) => patch({ formationId: e.target.value, positions: {} })}
            aria-label="Modulo"
          >
            {FORMATION_GROUPS.map((g) => (
              <optgroup key={g} label={g}>
                {FORMATIONS.filter((f) => f.group === g).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <nav className="grid grid-cols-3 gap-1 rounded-xl bg-slate-900 p-1">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-lg py-2 text-sm font-bold transition ${tab === id ? 'bg-lime-400 text-slate-950' : 'text-slate-400'}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {tab === 'campo' && (
          <>
            <div className="-mx-1">
              <Pitch
                ref={pitchRef}
                slots={slots}
                players={state.players}
                captain={state.captain}
                kit={state.kit}
                gkKit={state.gkKit}
                onMove={movePlayer}
                onTap={setEditing}
              />
              <p className="mt-2 text-center text-xs text-slate-500">Tocca una maglia per modificarla, trascinala per spostarla.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="primary" onClick={share} disabled={busy}>
                {busy ? 'Creo immagine…' : 'Condividi immagine'}
              </Button>
              <Button onClick={() => patch({ positions: {} })} disabled={!hasMoved}>
                Ripristina posizioni
              </Button>
            </div>

            <Card title="Titolari">
              <ul className="flex flex-col gap-2">
                {state.players.map((p, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-11 shrink-0 rounded-lg bg-slate-800 py-2 text-center text-[11px] font-bold text-slate-300">
                      {formation.slots[i].role}
                    </span>
                    <input
                      className={`${inputClass} w-14 shrink-0 px-2 text-center font-bold`}
                      inputMode="numeric"
                      placeholder="#"
                      value={p.number}
                      onChange={(e) => updatePlayer(i, { number: onlyNumber(e.target.value) })}
                      aria-label={`Numero ${formation.slots[i].role}`}
                    />
                    <input
                      className={`${inputClass} flex-1`}
                      placeholder="Cognome"
                      value={p.name}
                      maxLength={16}
                      onChange={(e) => updatePlayer(i, { name: e.target.value })}
                      aria-label={`Cognome ${formation.slots[i].role}`}
                    />
                    <button
                      onClick={() => toggleCaptain(i)}
                      className={`h-10 w-10 shrink-0 rounded-full text-sm font-black ${
                        state.captain === i ? 'bg-yellow-400 text-slate-950' : 'bg-slate-800 text-slate-500 ring-1 ring-white/10'
                      }`}
                      aria-label="Capitano"
                      aria-pressed={state.captain === i}
                    >
                      C
                    </button>
                  </li>
                ))}
              </ul>
            </Card>

            <Card
              title={`Panchina (${state.bench.length})`}
              action={
                <Button
                  variant="ghost"
                  className="px-3 py-1.5"
                  disabled={state.bench.length >= 12}
                  onClick={() => patch({ bench: [...state.bench, { name: '', number: '' }] })}
                >
                  + Aggiungi
                </Button>
              }
            >
              {state.bench.length === 0 ? (
                <p className="text-sm text-slate-400">Nessuna riserva.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {state.bench.map((b, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-11 shrink-0 rounded-lg bg-slate-800 py-2 text-center text-[11px] font-bold text-slate-400">RIS</span>
                      <input
                        className={`${inputClass} w-14 shrink-0 px-2 text-center font-bold`}
                        inputMode="numeric"
                        placeholder="#"
                        value={b.number}
                        onChange={(e) => updateBench(i, { number: onlyNumber(e.target.value) })}
                        aria-label="Numero riserva"
                      />
                      <input
                        className={`${inputClass} flex-1`}
                        placeholder="Cognome"
                        value={b.name}
                        maxLength={16}
                        onChange={(e) => updateBench(i, { name: e.target.value })}
                        aria-label="Cognome riserva"
                      />
                      <button
                        onClick={() => patch({ bench: state.bench.filter((_, j) => j !== i) })}
                        className="h-10 w-10 shrink-0 rounded-full bg-slate-800 text-xl text-slate-400 ring-1 ring-white/10 hover:text-red-300"
                        aria-label="Rimuovi riserva"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}

        {tab === 'maglie' && <KitEditor kit={state.kit} gkKit={state.gkKit} onChange={(key, kit) => patch({ [key]: kit })} />}

        {tab === 'template' && (
          <Templates
            templates={templates}
            setTemplates={setTemplates}
            current={state}
            onLoad={(data) => {
              setState(normalizeState(data))
              setTab('campo')
            }}
            notify={notify}
          />
        )}
      </main>

      <Sheet open={editing != null} onClose={() => setEditing(null)} title={editing != null ? `Modifica ${formation.slots[editing].role}` : ''}>
        {editingPlayer && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <label className="w-20 shrink-0 text-xs font-semibold text-slate-400">
                Numero
                <input
                  className={`${inputClass} mt-1 w-full text-center font-bold`}
                  inputMode="numeric"
                  value={editingPlayer.number}
                  onChange={(e) => updatePlayer(editing, { number: onlyNumber(e.target.value) })}
                />
              </label>
              <label className="flex-1 text-xs font-semibold text-slate-400">
                Cognome
                <input
                  className={`${inputClass} mt-1 w-full`}
                  value={editingPlayer.name}
                  maxLength={16}
                  autoFocus
                  onChange={(e) => updatePlayer(editing, { name: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && setEditing(null)}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant={state.captain === editing ? 'primary' : 'default'} onClick={() => toggleCaptain(editing)}>
                {state.captain === editing ? '✓ Capitano' : 'Fai capitano'}
              </Button>
              <Button onClick={() => resetPosition(editing)} disabled={!state.positions[editing]}>
                Ripristina posizione
              </Button>
            </div>
            {state.bench.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-400">Scambia con una riserva</p>
                <div className="flex flex-wrap gap-2">
                  {state.bench.map((b, i) => (
                    <Button key={i} className="px-3 py-2" onClick={() => swapWithBench(editing, i)}>
                      <span className="text-lime-300">{b.number || '–'}</span> {b.name || 'Riserva'}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <Button variant="primary" onClick={() => setEditing(null)}>
              Fatto
            </Button>
          </div>
        )}
      </Sheet>

      <Sheet open={!!shareImg} onClose={closeShare} title="Condividi formazione">
        {shareImg && (
          <div className="flex flex-col gap-3">
            <img src={shareImg.url} alt="Anteprima formazione" className="max-h-[55dvh] w-full rounded-xl object-contain" />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="primary" onClick={() => shareOrDownload(shareImg.blob, fileName)}>
                Condividi
              </Button>
              <a href={shareImg.url} download={fileName} className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold ring-1 ring-white/10">
                Scarica
              </a>
            </div>
          </div>
        )}
      </Sheet>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-[60] flex justify-center px-4">
          <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 shadow-xl">{toast}</div>
        </div>
      )}
    </div>
  )
}
