const STATE_KEY = 'proclub.formazione.v1'
const TEMPLATES_KEY = 'proclub.templates.v1'

export const KIT_STYLES = [
  { id: 'solid', label: 'Tinta unita' },
  { id: 'vstripes', label: 'Strisce verticali' },
  { id: 'hstripes', label: 'Strisce orizzontali' },
  { id: 'halves', label: 'Metà e metà' },
  { id: 'sash', label: 'Fascia diagonale' },
  { id: 'chestband', label: 'Banda sul petto' },
  { id: 'sleeves', label: 'Maniche a contrasto' },
  { id: 'pinstripe', label: 'Gessato' },
]

const DEFAULT_NUMBERS = [1, 2, 4, 5, 3, 6, 8, 10, 7, 9, 11]

export function defaultState() {
  return {
    teamName: '',
    formationId: '4-3-3 Holding',
    players: DEFAULT_NUMBERS.map((n) => ({ name: '', number: String(n) })),
    // posizioni spostate a mano: { [slotIndex]: { x, y } }
    positions: {},
    captain: null,
    kit: { style: 'vstripes', primary: '#1d4ed8', secondary: '#f8fafc', number: '#0f172a' },
    gkKit: { style: 'solid', primary: '#16a34a', secondary: '#0f172a', number: '#f8fafc' },
    bench: [
      { name: '', number: '12' },
      { name: '', number: '14' },
      { name: '', number: '17' },
    ],
  }
}

// Riempie i campi mancanti, così anche dati vecchi o importati non rompono l'app.
export function normalizeState(raw) {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base
  const players = Array.from({ length: 11 }, (_, i) => {
    const p = raw.players?.[i]
    return {
      name: typeof p?.name === 'string' ? p.name : '',
      number: p?.number != null ? String(p.number) : base.players[i].number,
    }
  })
  const bench = Array.isArray(raw.bench)
    ? raw.bench.slice(0, 12).map((p) => ({ name: String(p?.name ?? ''), number: String(p?.number ?? '') }))
    : base.bench
  return {
    teamName: typeof raw.teamName === 'string' ? raw.teamName : '',
    formationId: typeof raw.formationId === 'string' ? raw.formationId : base.formationId,
    players,
    positions: raw.positions && typeof raw.positions === 'object' ? raw.positions : {},
    captain: Number.isInteger(raw.captain) ? raw.captain : null,
    kit: { ...base.kit, ...(raw.kit || {}) },
    gkKit: { ...base.gkKit, ...(raw.gkKit || {}) },
    bench,
  }
}

function read(key) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : null
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* spazio pieno o storage non disponibile */
  }
}

export const loadState = () => normalizeState(read(STATE_KEY))
export const saveState = (s) => write(STATE_KEY, s)

export const loadTemplates = () => {
  const t = read(TEMPLATES_KEY)
  return Array.isArray(t) ? t.filter((x) => x && typeof x.name === 'string') : []
}
export const saveTemplates = (t) => write(TEMPLATES_KEY, t)

export function exportBackup(templates) {
  const data = { app: 'formazione-proclub', version: 1, exportedAt: new Date().toISOString(), templates }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `formazioni-proclub-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function parseBackup(file) {
  const text = await file.text()
  const data = JSON.parse(text)
  const list = Array.isArray(data) ? data : data?.templates
  if (!Array.isArray(list)) throw new Error('File non valido')
  return list
    .filter((t) => t && typeof t.name === 'string' && t.data)
    .map((t) => ({ name: t.name.trim().slice(0, 40), savedAt: t.savedAt || new Date().toISOString(), data: normalizeState(t.data) }))
}
