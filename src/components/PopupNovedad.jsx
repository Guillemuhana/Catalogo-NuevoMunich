import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const DURACION = 5000

// Ventana emergente de bienvenida: se cierra con la cruz, el fondo, Escape o sola a los 5 s.
// Mientras el puntero está encima, la cuenta regresiva se pausa.
export default function PopupNovedad({ producto, onCerrar, onAbrir }) {
  const [pausa, setPausa] = useState(false)

  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onCerrar])

  const verProducto = () => { onCerrar(); onAbrir(producto) }

  return (
    <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCerrar}>
      <motion.div role="dialog" aria-modal="true" aria-label="Nuevo producto: Salame Pepperoni"
        initial={{ opacity: 0, scale: .82, y: 40, rotate: -1.5 }} animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, scale: .94, y: 20 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
        onPointerEnter={() => setPausa(true)} onPointerLeave={() => setPausa(false)}
        className="relative w-full max-w-3xl">

        {/* Resplandor rojo detrás de la tarjeta */}
        <div aria-hidden className="absolute -inset-6 -z-10 rounded-[3rem] bg-munich/40 blur-3xl" />

        <div className="relative overflow-hidden rounded-3xl bg-humo shadow-[0_40px_100px_rgba(0,0,0,.8)] ring-2 ring-oro/60">
          <button onClick={producto ? verProducto : undefined} tabIndex={producto ? 0 : -1}
            aria-label="Ver el Salame Pepperoni" className={`group relative block w-full overflow-hidden ${producto ? 'cursor-pointer' : 'cursor-default'}`}>
            <motion.img src="/img/marca/popup-pepperoni.webp" alt="Pepperoni, nuevo producto sin gluten"
              width="1200" height="720" className="block h-auto w-full"
              initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: 'easeOut' }} />
            {/* Brillo que cruza la imagen */}
            <motion.span aria-hidden className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
              initial={{ left: '-40%' }} animate={{ left: '130%' }} transition={{ delay: .5, duration: 1.1, ease: 'easeInOut' }} />
          </button>

          {/* Sello "¡Nuevo!" */}
          <motion.span aria-hidden
            initial={{ scale: 0, rotate: -40 }} animate={{ scale: [0, 1.2, 1], rotate: -12 }} transition={{ delay: .35, duration: .6 }}
            className="absolute top-2 left-2 flex h-12 w-12 items-center justify-center rounded-full bg-oro text-center text-[9px] leading-none font-black tracking-wide text-humo uppercase shadow-lg ring-4 ring-oro/30 sm:h-16 sm:w-16 sm:text-[11px] md:top-5 md:left-5 md:h-20 md:w-20 md:text-sm">
            <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}>¡Nuevo!</motion.span>
          </motion.span>

          <button onClick={onCerrar} aria-label="Cerrar" autoFocus
            className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/30 backdrop-blur transition hover:rotate-90 hover:bg-black/85">
            <X size={20} />
          </button>

          {/* Cuenta regresiva: al terminar cierra la ventana */}
          <div className="h-1 w-full bg-white/10">
            <div className="h-full origin-left bg-gradient-to-r from-munich to-oro"
              style={{ animation: `popup-cuenta ${DURACION}ms linear forwards`, animationPlayState: pausa ? 'paused' : 'running' }}
              onAnimationEnd={onCerrar} />
          </div>

          <div className="p-5 text-center md:px-7">
            <p className="text-[11px] font-bold tracking-[.3em] text-oro uppercase">Llegó a la familia</p>
            <p className="mt-1 font-display text-3xl leading-none text-crema md:text-4xl">Salame Pepperoni</p>
            <p className="mt-1.5 text-sm font-light text-crema/70">Con pimentón y pimiento de Cayena · Ideal para pizzas</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
