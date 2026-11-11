import { motion } from 'motion/react'
import { useEffect } from 'react'
import { ArrowRight, Check, MapPin, Plus } from 'lucide-react'
import { Carrusel } from './Negocios'
import { ventajas, waNegocios, zonas } from '../lib/negocios'

// Botón "+" del menú: gira hasta formar una cruz cuando el panel está abierto.
export function BotonMas({ abierto, onClick, className = '' }) {
  return (
    <button onClick={onClick} aria-expanded={abierto} aria-label={abierto ? 'Cerrar Sumate a la familia' : 'Sumate a la familia Nuevo Munich'}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${abierto ? 'border-oro bg-oro text-humo' : 'border-oro/70 text-oro hover:bg-oro hover:text-humo'} ${className}`}>
      {!abierto && <span aria-hidden className="absolute inset-0 animate-ping rounded-full border border-oro/50 [animation-duration:2.4s]" />}
      <motion.span animate={{ rotate: abierto ? 135 : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} className="flex">
        <Plus size={20} strokeWidth={2.6} />
      </motion.span>
    </button>
  )
}

const entrar = (i) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { delay: .18 + i * .07, duration: .55, ease: [.22, 1, .36, 1] } },
})

// Contenido de "Sumate a la familia"; en el celular se muestra sin el carrusel.
export function ContenidoSumate({ compacto = false }) {
  return (
    <div className={compacto ? '' : 'grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]'}>
      <div>
        {!compacto && <motion.p {...entrar(0)} className="mb-3 text-[11px] tracking-[.4em] text-oro uppercase">Para negocios · Venta mayorista</motion.p>}
        {!compacto && (
          <motion.h2 {...entrar(1)} className="font-display text-4xl leading-[.95] text-crema xl:text-5xl">
            Sumate a la familia <span className="text-oro italic">Nuevo Munich.</span>
          </motion.h2>
        )}
        <motion.p {...entrar(2)} className={`${compacto ? 'text-base' : 'mt-4'} max-w-xl font-light text-crema/85`}>
          Más de 50 años llevando calidad, sabor y confianza a cada cocina. Acompañamos a restaurantes, bares, hamburgueserías,
          pancherías, food trucks y distribuidores.
        </motion.p>
        <motion.div {...entrar(3)} className="mt-5 flex flex-wrap gap-2">
          {zonas.map((z) => (
            <span key={z} className="inline-flex items-center gap-1.5 rounded-full bg-munich px-3.5 py-1.5 text-sm font-bold text-crema">
              <MapPin size={13} /> {z}
            </span>
          ))}
        </motion.div>
        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {ventajas.map((v, i) => (
            <motion.li key={v} {...entrar(4 + i * .5)} className="flex items-center gap-2.5 text-sm text-crema/90">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-oro text-humo"><Check size={13} strokeWidth={3} /></span>{v}
            </motion.li>
          ))}
        </ul>
        <motion.div {...entrar(7)} className="mt-6 border-t border-crema/10 pt-5">
          <a href={waNegocios} target="_blank" rel="noreferrer"
          className="group relative inline-flex h-13 items-center overflow-hidden rounded-full bg-crema px-7 py-4 text-xs font-bold tracking-[.2em] text-humo uppercase">
            <span className="relative z-10 flex items-center gap-2 whitespace-nowrap transition-colors duration-500 group-hover:text-crema">
              Quiero sumarme <ArrowRight size={15} className="transition-transform duration-500 group-hover:translate-x-1" />
            </span>
            <span className="absolute inset-0 translate-y-full rounded-full bg-munich transition-transform duration-500 ease-out group-hover:translate-y-0" />
          </a>
        </motion.div>
      </div>
      {!compacto && (
        <motion.div initial={{ opacity: 0, scale: .92, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: .3, type: 'spring', stiffness: 160, damping: 18 }}>
          <Carrusel />
        </motion.div>
      )}
    </div>
  )
}

// Panel que baja desde el encabezado (pantallas grandes).
export default function PanelSumate({ onCerrar }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onCerrar])

  return (
    <>
      <motion.div key="velo" className="fixed inset-0 z-30 bg-black/55 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCerrar} />
      <motion.div key="panel" role="dialog" aria-label="Sumate a la familia Nuevo Munich" data-lenis-prevent
        initial={{ clipPath: 'inset(0 0 100% 0 round 0 0 2rem 2rem)', y: -12 }}
        animate={{ clipPath: 'inset(0 0 0% 0 round 0 0 2rem 2rem)', y: 0 }}
        exit={{ clipPath: 'inset(0 0 100% 0 round 0 0 2rem 2rem)', y: -12, transition: { duration: .35, ease: [.76, 0, .24, 1] } }}
        transition={{ duration: .6, ease: [.76, 0, .24, 1] }}
        className="fixed inset-x-0 top-24 z-[35] mx-auto max-h-[calc(100svh-7rem)] max-w-7xl overflow-y-auto px-8">
        <div className="doodles relative overflow-hidden rounded-b-[2rem] border border-t-0 border-white/10 bg-carbon p-10 shadow-[0_40px_80px_rgba(0,0,0,.6)]">
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-munich via-oro to-munich" />
          <ContenidoSumate />
        </div>
      </motion.div>
    </>
  )
}
