import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { pausarScroll } from '../lib/scroll'

// Piezas publicadas en los estados de WhatsApp de Nuevo Munich.
const estados = [
  { src: 'img/estados/frankfurt.webp', titulo: 'Salchichas tipo Frankfurt', producto: 'salchichas-salchicha-tipo-frankfurt' },
  { src: 'img/estados/kassler.webp', titulo: 'Kassler', producto: 'especialidades-kassler' },
  { src: 'img/estados/focaccia.webp', titulo: 'Focaccia de bondiola', producto: 'feteados-bondiola' },
  { src: 'img/estados/tentador.webp', titulo: 'Tentador', producto: 'feteados-bondiola' },
]
const DURACION = 5000

function Visor({ inicio, productos, onCerrar, onAbrir }) {
  const [i, setI] = useState(inicio)
  const [pausa, setPausa] = useState(false)
  const e = estados[i]
  const producto = productos.find((p) => p.slug === e.producto)

  const ir = (d) => {
    const n = i + d
    if (n < 0) return
    if (n >= estados.length) onCerrar()
    else setI(n)
  }

  useEffect(() => {
    pausarScroll(true)
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = ''; pausarScroll(false) }
  }, [])

  useEffect(() => {
    const k = (ev) => {
      if (ev.key === 'Escape') onCerrar()
      if (ev.key === 'ArrowRight') ir(1)
      if (ev.key === 'ArrowLeft') ir(-1)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  return (
    <motion.div role="dialog" aria-modal aria-label={`Estado: ${e.titulo}`}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="relative h-[100svh] w-full max-w-[min(100vw,56svh)] overflow-hidden bg-humo md:h-[92svh] md:rounded-2xl">
        <AnimatePresence initial={false}>
          <motion.img key={e.src} src={e.src} alt={e.titulo}
            initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .35 }}
            className="absolute inset-0 h-full w-full object-cover" />
        </AnimatePresence>

        {/* Barras de avance, como en WhatsApp */}
        <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/60 to-transparent px-3 pt-3 pb-8">
          <div className="flex gap-1">
            {estados.map((x, n) => (
              <span key={x.src} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
                {n < i && <span className="block h-full w-full bg-white" />}
                {n === i && (
                  <span key={i} onAnimationEnd={() => ir(1)} className="block h-full w-full origin-left bg-white"
                    style={{ animation: `estado-avance ${DURACION}ms linear forwards`, animationPlayState: pausa ? 'paused' : 'running' }} />
                )}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <img src="img/marca/icono.png" alt="" className="h-8 w-8 rounded-full bg-white object-contain p-0.5" />
            <span className="text-sm font-bold text-white">Nuevo Munich</span>
            <button onClick={onCerrar} aria-label="Cerrar" className="ml-auto flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/15"><X size={22} /></button>
          </div>
        </div>

        {/* Toque a la izquierda o derecha para pasar; mantener apretado pausa */}
        <div className="absolute inset-0 top-24 bottom-24 flex"
          onPointerDown={() => setPausa(true)} onPointerUp={() => setPausa(false)} onPointerLeave={() => setPausa(false)}>
          <button aria-label="Estado anterior" onClick={() => ir(-1)} className="h-full w-1/3" />
          <button aria-label="Estado siguiente" onClick={() => ir(1)} className="h-full flex-1" />
        </div>

        {producto && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center bg-gradient-to-t from-black/70 to-transparent px-4 pt-10 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button onClick={() => { onCerrar(); onAbrir(producto) }}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-humo shadow-xl transition hover:bg-celeste">
              Ver {producto.nombre} <ArrowUpRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Flechas en pantalla grande */}
      <button onClick={() => ir(-1)} disabled={i === 0} aria-label="Anterior"
        className="absolute left-6 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 disabled:opacity-0 md:flex"><ChevronLeft /></button>
      <button onClick={() => ir(1)} aria-label="Siguiente"
        className="absolute right-6 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 md:flex"><ChevronRight /></button>
    </motion.div>
  )
}

export default function Estados({ productos, onAbrir }) {
  const [abierto, setAbierto] = useState(null)

  return (
    <div className="mb-12 md:mb-16">
      <p className="mb-4 flex items-center gap-2 text-xs font-bold tracking-[.25em] text-crema/70 uppercase">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#25d366]" /> Nuestros estados de WhatsApp
      </p>
      <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
        {estados.map((e, n) => (
          <motion.button key={e.src} onClick={() => setAbierto(n)} aria-label={`Ver estado: ${e.titulo}`}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: .6, delay: n * .08, ease: [.22, 1, .36, 1] }}
            className="group relative w-[42vw] max-w-[220px] shrink-0 snap-start rounded-[1.4rem] bg-gradient-to-br from-[#25d366] via-celeste to-[#25d366] p-[3px] md:w-auto md:max-w-none">
            <span className="block aspect-[9/15] overflow-hidden rounded-[1.25rem] bg-humo">
              <img src={e.src} alt="" loading="lazy" decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {abierto !== null && <Visor key="visor" inicio={abierto} productos={productos} onCerrar={() => setAbierto(null)} onAbrir={onAbrir} />}
      </AnimatePresence>
    </div>
  )
}
