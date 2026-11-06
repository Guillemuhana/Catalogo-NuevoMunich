import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Minus, Plus, X, MessageCircle, ShoppingBag } from 'lucide-react'
import ProductImage from './ProductImage'
import { linkWhatsApp } from '../lib/usePedido'
import { fotosDe, miniatura } from '../lib/data'

const ease = [.22, 1, .36, 1]

function Galeria({ producto, categoria }) {
  const fotos = fotosDe(producto)
  const [i, setI] = useState(0)
  const varias = fotos.length > 1
  const mover = (d) => setI((x) => (x + d + fotos.length) % fotos.length)

  useEffect(() => {
    if (!varias) return
    const k = (e) => {
      if (e.key === 'ArrowLeft') setI((x) => (x - 1 + fotos.length) % fotos.length)
      if (e.key === 'ArrowRight') setI((x) => (x + 1) % fotos.length)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [varias, fotos.length])

  if (!fotos.length)
    return <div className="aspect-square"><ProductImage producto={producto} categoria={categoria} /></div>

  return (
    <div>
      {/* El fondo oscuro solo se ve en fotos apaisadas: nunca se recorta el producto */}
      <div className="relative aspect-square overflow-hidden bg-humo">
        <AnimatePresence initial={false}>
          <motion.img key={fotos[i]} src={fotos[i]} alt={`${producto.nombre}, foto ${i + 1} de ${fotos.length}`} decoding="async"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}
            className="absolute inset-0 h-full w-full object-contain" />
        </AnimatePresence>
        {varias && (
          <>
            <button onClick={() => mover(-1)} aria-label="Foto anterior"
              className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-humo/70 text-crema backdrop-blur transition hover:bg-munich"><ChevronLeft size={20} /></button>
            <button onClick={() => mover(1)} aria-label="Foto siguiente"
              className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-humo/70 text-crema backdrop-blur transition hover:bg-munich"><ChevronRight size={20} /></button>
            <span className="absolute bottom-3 left-3 rounded-full bg-humo/70 px-2.5 py-1 text-[11px] text-crema backdrop-blur">{i + 1} / {fotos.length}</span>
          </>
        )}
      </div>
      {varias && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto p-3">
          {fotos.map((f, n) => (
            <button key={f} onClick={() => setI(n)} aria-label={`Ver foto ${n + 1}`} aria-current={n === i}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition ${n === i ? 'border-oro' : 'border-transparent opacity-80 hover:opacity-100'}`}>
              <img src={miniatura(f)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Dato({ titulo, children }) {
  return (
    <div className="mt-6">
      <p className="mb-1.5 text-[11px] tracking-[.3em] text-crema/45 uppercase">{titulo}</p>
      <p className="text-sm leading-relaxed font-light text-crema/80 md:text-base">{children}</p>
    </div>
  )
}

// Va con key={slug}: al pasar a un producto relacionado, presentación y cantidad arrancan de cero.
function Detalle({ producto, categoria, relacionados, onCerrar, onAgregar, onAbrir }) {
  const pres = producto.presentaciones || []
  const [sel, setSel] = useState(pres[0])
  const [cant, setCant] = useState(1)

  const consulta = `¡Hola Nuevo Munich! Quería consultar por ${producto.nombre}${sel ? ` (${sel})` : ''}. ¿Precio y disponibilidad?`
  const texto = producto.descripcion || (!producto.ingredientes && categoria?.bajada)

  return (
        <div className="flex min-w-0 flex-col p-6 md:p-9">
          <p className="mb-3 pr-10 text-[11px] tracking-[.35em] text-munich uppercase">{categoria?.nombre}</p>
          <h2 className="pr-10 font-display text-4xl leading-[1] text-crema md:text-5xl">{producto.nombre}</h2>

          {texto && <p className="mt-4 leading-relaxed font-light text-crema/80">{texto}</p>}
          {producto.ingredientes && <Dato titulo="Ingredientes">{producto.ingredientes}</Dato>}
          {producto.sugerencias && <Dato titulo="Sugerencia">{producto.sugerencias}</Dato>}

          {pres.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-[11px] tracking-[.3em] text-crema/45 uppercase">Presentación</p>
              <div className="flex flex-wrap gap-2">
                {pres.map((x) => (
                  <button key={x} onClick={() => setSel(x)} aria-pressed={sel === x}
                    className={`rounded-full border px-4 py-2 text-sm transition ${sel === x ? 'border-oro bg-oro text-humo' : 'border-white/15 text-crema/75 hover:border-crema/40'}`}>
                    {x}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="flex items-center gap-3">
              <div className="flex h-14 shrink-0 items-center rounded-full border border-white/15">
                <button onClick={() => setCant((c) => Math.max(1, c - 1))} className="flex h-14 w-11 items-center justify-center text-crema/70 hover:text-crema" aria-label="Menos"><Minus size={16} /></button>
                <span className="w-7 text-center font-display text-2xl">{cant}</span>
                <button onClick={() => setCant((c) => c + 1)} className="flex h-14 w-11 items-center justify-center text-crema/70 hover:text-crema" aria-label="Más"><Plus size={16} /></button>
              </div>
              <button onClick={() => { onAgregar(producto, sel, cant); onCerrar() }}
                className="flex h-14 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-munich px-3 text-xs font-bold tracking-[.12em] text-crema uppercase shadow-xl shadow-munich/25 transition hover:bg-munich-deep md:text-sm">
                <ShoppingBag size={17} className="shrink-0" /> Agregar al pedido
              </button>
            </div>
            <a href={linkWhatsApp(consulta)} target="_blank" rel="noreferrer"
              className="mt-3 flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 text-sm text-crema/75 transition hover:border-[#25D366] hover:text-[#25D366]">
              <MessageCircle size={16} /> Consultar por WhatsApp
            </a>
          </div>

          {relacionados.length > 0 && (
            <div className="mt-9 border-t border-white/5 pt-6">
              <p className="mb-4 text-[11px] tracking-[.3em] text-crema/45 uppercase">También de {categoria?.nombre}</p>
              <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1">
                {relacionados.map((r) => (
                  <button key={r.slug} onClick={() => onAbrir(r)} className="group w-24 shrink-0 text-left">
                    <div className="aspect-square overflow-hidden rounded-xl bg-white">
                      <div className="h-full w-full transition duration-500 group-hover:scale-105">
                        <ProductImage producto={r} categoria={categoria} mini />
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-crema/70 group-hover:text-crema">{r.nombre}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
  )
}

export default function ProductModal({ producto, categoria, relacionados, onCerrar, onAgregar, onAbrir }) {
  const caja = useRef(null)

  useEffect(() => { caja.current?.scrollTo({ top: 0 }) }, [producto.slug])

  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onCerrar])

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal aria-label={producto.nombre}>
      <motion.div onClick={onCerrar} className="absolute inset-0 bg-black/75 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ duration: .4, ease }}
        className="relative w-full max-w-5xl"
      >
        <button onClick={onCerrar} aria-label="Cerrar"
          className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-humo/85 text-crema backdrop-blur transition hover:rotate-90 hover:bg-munich md:top-4 md:right-4">
          <X size={18} />
        </button>

        <div ref={caja} data-lenis-prevent
          className="grid max-h-[92svh] grid-cols-1 overflow-y-auto overscroll-contain rounded-t-3xl border border-white/10 bg-carbon md:grid-cols-2 md:rounded-3xl [&>*]:min-w-0">
          <div className="md:sticky md:top-0 md:self-start">
            <Galeria key={producto.slug} producto={producto} categoria={categoria} />
          </div>
          <Detalle key={`d-${producto.slug}`} producto={producto} categoria={categoria} relacionados={relacionados}
            onCerrar={onCerrar} onAgregar={onAgregar} onAbrir={onAbrir} />
        </div>
      </motion.div>
    </motion.div>
  )
}
