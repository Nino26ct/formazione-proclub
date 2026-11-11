export function Sheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-slate-900 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl ring-1 ring-white/10 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-full px-3 py-1 text-2xl leading-none text-slate-400 hover:text-white" aria-label="Chiudi">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Button({ variant = 'default', className = '', ...props }) {
  const styles = {
    default: 'bg-slate-800 text-slate-100 hover:bg-slate-700 ring-1 ring-white/10',
    primary: 'bg-lime-400 text-slate-950 hover:bg-lime-300 font-bold',
    danger: 'bg-red-500/15 text-red-300 hover:bg-red-500/25 ring-1 ring-red-400/30',
    ghost: 'text-slate-300 hover:bg-slate-800',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}

export const inputClass =
  'min-w-0 rounded-xl bg-slate-800 px-3 py-2.5 text-base text-white ring-1 ring-white/10 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400'

export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/5 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
