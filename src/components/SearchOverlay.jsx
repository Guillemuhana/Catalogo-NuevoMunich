import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, ArrowUpRight } from 'lucide-react'
import { buscar } from '../lib/data'
import ProductImage from './ProductImage'

const sugerencias = ['Salchichas', 'Jamón', 'Ahumado', 'Bondiola', 'Ogianco', 'Weisswurst']

export default function SearchOverlay({ productos, catMap, onCerrar, onAbrir }) {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const input = useRef(null)
  const res = useMemo(() => buscar(productos, q).slice(0, 12), [productos, q])

  useEffect(() => { input.current?.focus() }, [])
  useEffect(() => setIdx(0), [q])

  const tecla = (e) => {
    if (e.key === 'Escape') onCerrar()
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, res.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && res[idx]) { onCerrar(); onAbrir(res[idx]) }
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex justify-center px-4 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div onClick={onCerrar} className="absolute inset-0 bg-humo/85 backdrop-blur-xl" />
      <motion.div initial={{ y: -20, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: -20, scale: .97 }}
        transition={{ duration: .35, ease: [.22, 1, .36, 1] }}
        className="relative h-fit max-h-[75svh] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-carbon shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/5 px-6">
          <Search size={20} className="text-munich" />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={tecla}
            placeholder="Buscá un producto…" aria-label="Buscar productos"
            className="h-16 flex-1 bg-transparent font-display text-2xl text-crema outline-none placeholder:text-crema/25" />
          <kbd className="rounded border border-white/10 px-2 py-1 text-[10px] text-crema/40">ESC</kbd>
        </div>

        <div data-lenis-prevent className="max-h-[60svh] overflow-y-auto p-3">
          {!q && (
            <div className="p-3">
              <p className="mb-3 text-[11px] tracking-[.3em] text-crema/40 uppercase">Probá con</p>
              <div className="flex flex-wrap gap-2">
                {sugerencias.map((s) => (
                  <button key={s} onClick={() => setQ(s)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-crema/70 transition hover:border-oro hover:text-oro">{s}</button>
                ))}
              </div>
            </div>
          )}
          {q && res.length === 0 && <p className="p-6 text-center text-crema/50">Nada con “{q}”. Probá otra palabra.</p>}
          {res.map((p, i) => (
            <button key={p.slug} onMouseEnter={() => setIdx(i)} onClick={() => { onCerrar(); onAbrir(p) }}
              className={`flex w-full items-center gap-4 rounded-2xl p-3 text-left transition ${i === idx ? 'bg-white/5' : ''}`}>
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl"><ProductImage producto={p} categoria={catMap[p.categoria]} mini /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-crema">{p.nombre}</p>
                <p className="text-xs text-munich">{catMap[p.categoria]?.nombre}</p>
              </div>
              <ArrowUpRight size={18} className={i === idx ? 'text-oro' : 'text-crema/20'} />
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
