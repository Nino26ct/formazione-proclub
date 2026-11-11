import { useRef, useState } from 'react'
import { exportBackup, parseBackup } from '../lib/storage'
import { Button, Card, inputClass } from './ui'

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function Templates({ templates, setTemplates, current, onLoad, notify }) {
  const [name, setName] = useState('')
  const fileRef = useRef(null)

  const save = () => {
    const n = name.trim().slice(0, 40)
    if (!n) return
    const exists = templates.some((t) => t.name.toLowerCase() === n.toLowerCase())
    if (exists && !confirm(`Esiste già "${n}". Vuoi sovrascriverlo?`)) return
    const entry = { name: n, savedAt: new Date().toISOString(), data: current }
    setTemplates([entry, ...templates.filter((t) => t.name.toLowerCase() !== n.toLowerCase())])
    setName('')
    notify(`Salvato "${n}"`)
  }

  const overwrite = (t) => {
    if (!confirm(`Sovrascrivere "${t.name}" con la formazione attuale?`)) return
    setTemplates(templates.map((x) => (x === t ? { ...x, savedAt: new Date().toISOString(), data: current } : x)))
    notify(`Aggiornato "${t.name}"`)
  }

  const remove = (t) => {
    if (!confirm(`Eliminare "${t.name}"?`)) return
    setTemplates(templates.filter((x) => x !== t))
  }

  const load = (t) => {
    onLoad(t.data)
    notify(`Caricato "${t.name}"`)
  }

  const onImport = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const incoming = await parseBackup(file)
      if (!incoming.length) return notify('Nessun template nel file')
      const names = new Set(incoming.map((t) => t.name.toLowerCase()))
      setTemplates([...incoming, ...templates.filter((t) => !names.has(t.name.toLowerCase()))])
      notify(`Importati ${incoming.length} template`)
    } catch {
      notify('File non valido')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Salva formazione attuale">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <input className={`${inputClass} flex-1`} placeholder="Nome (es. Campionato sabato)" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
          <Button variant="primary" type="submit" disabled={!name.trim()}>
            Salva
          </Button>
        </form>
      </Card>

      <Card title={`Template salvati (${templates.length})`}>
        {templates.length === 0 ? (
          <p className="text-sm text-slate-400">Nessun template. Salva la formazione attuale con un nome per ritrovarla qui.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {templates.map((t) => (
              <li key={t.name} className="rounded-xl bg-slate-800/70 p-3">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <span className="truncate font-bold">{t.name}</span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {t.data.formationId} · {fmtDate(t.savedAt)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="primary" className="px-2 py-2" onClick={() => load(t)}>
                    Carica
                  </Button>
                  <Button className="px-2 py-2" onClick={() => overwrite(t)}>
                    Sovrascrivi
                  </Button>
                  <Button variant="danger" className="px-2 py-2" onClick={() => remove(t)}>
                    Elimina
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Backup">
        <p className="mb-3 text-sm text-slate-400">
          Esporta i template in un file JSON e importalo su un altro telefono. Nell'importazione, i template con lo stesso nome vengono sostituiti.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => exportBackup(templates)} disabled={!templates.length}>
            Esporta JSON
          </Button>
          <Button onClick={() => fileRef.current?.click()}>Importa JSON</Button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onImport} />
      </Card>
    </div>
  )
}
