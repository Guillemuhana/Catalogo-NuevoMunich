import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Minus, Plus, X, MessageCircle, ShoppingBag } from 'lucide-react'
import ProductImage from './ProductImage'
import { linkWhatsApp } from '../lib/usePedido'

const ease = [.22, 1, .36, 1]

export default function ProductModal({ producto, categoria, relacionados, onCerrar, onAgregar, onAbrir }) {
  const pres = producto.presentaciones || []
  const [sel, setSel] = useState(pres[0])
  const [cant, setCant] = useState(1)

  useEffect(() => { setSel(pres[0]); setCant(1) }, [producto.slug]) // eslint-disable-line

  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onCerrar])

  const consulta = `¡Hola Nuevo Munich! Quería consultar por ${producto.nombre}${sel ? ` (${sel})` : ''}. ¿Precio y disponibilidad?`

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal aria-label={producto.nombre}>
      <motion.div onClick={onCerrar} className="absolute inset-0 bg-black/70 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ duration: .55, ease }}
        data-lenis-prevent
        className="relative grid max-h-[92svh] w-full max-w-5xl grid-cols-1 overflow-y-auto rounded-t-3xl border border-white/10 bg-carbon md:grid-cols-2 md:rounded-3xl [&>*]:min-w-0"
      >
        <button onClick={onCerrar} aria-label="Cerrar"
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-humo/70 text-crema backdrop-blur transition hover:rotate-90 hover:bg-munich">
          <X size={18} />
        </button>

        <motion.div layoutId={`img-${producto.slug}`} className="relative aspect-square overflow-hidden md:aspect-auto md:min-h-[560px]">
          <ProductImage producto={producto} categoria={categoria} grande />
        </motion.div>

        <div className="flex min-w-0 flex-col p-7 md:p-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }}
            className="mb-3 text-[11px] tracking-[.35em] text-munich uppercase">{categoria?.nombre}</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25, duration: .7, ease }}
            className="font-display text-4xl leading-[1] text-crema md:text-5xl">{producto.nombre}</motion.h2>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .35 }}
            className="mt-5 leading-relaxed font-light text-crema/70">
            {producto.descripcion || categoria?.bajada || 'Elaborado con recetas centroeuropeas que traemos desde 1972.'}
          </motion.p>

          {pres.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-[11px] tracking-[.3em] text-crema/40 uppercase">Presentación</p>
              <div className="flex flex-wrap gap-2">
                {pres.map((x) => (
                  <button key={x} onClick={() => setSel(x)}
                    className={`relative rounded-full px-4 py-2.5 text-sm transition ${sel === x ? 'text-humo' : 'border border-white/15 text-crema/75 hover:border-crema/40'}`}>
                    {sel === x && <motion.span layoutId="pres" className="absolute inset-0 rounded-full bg-oro" />}
                    <span className="relative">{x}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-10">
            <div className="flex items-center gap-3">
              <div className="flex h-14 items-center rounded-full border border-white/15">
                <button onClick={() => setCant((c) => Math.max(1, c - 1))} className="flex h-14 w-12 items-center justify-center text-crema/70 hover:text-crema" aria-label="Menos"><Minus size={16} /></button>
                <span className="w-8 text-center font-display text-2xl">{cant}</span>
                <button onClick={() => setCant((c) => c + 1)} className="flex h-14 w-12 items-center justify-center text-crema/70 hover:text-crema" aria-label="Más"><Plus size={16} /></button>
              </div>
              <button onClick={(e) => { onAgregar(producto, sel, e, cant); onCerrar() }}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-munich text-sm font-bold tracking-[.15em] text-crema uppercase shadow-xl shadow-munich/25 transition hover:bg-munich-deep">
                <ShoppingBag size={17} /> Agregar al pedido
              </button>
            </div>
            <a href={linkWhatsApp(consulta)} target="_blank" rel="noreferrer"
              className="mt-3 flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 text-sm text-crema/70 transition hover:border-[#25D366] hover:text-[#25D366]">
              <MessageCircle size={16} /> Consultar por WhatsApp
            </a>
          </div>

          {relacionados.length > 0 && (
            <div className="mt-10 border-t border-white/5 pt-6">
              <p className="mb-4 text-[11px] tracking-[.3em] text-crema/40 uppercase">También de {categoria?.nombre}</p>
              <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1">
                {relacionados.map((r) => (
                  <button key={r.slug} onClick={() => onAbrir(r)} className="group w-28 shrink-0 text-left">
                    <div className="aspect-square overflow-hidden rounded-xl">
                      <div className="h-full w-full transition duration-700 group-hover:scale-110">
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
      </motion.div>
    </motion.div>
  )
}
