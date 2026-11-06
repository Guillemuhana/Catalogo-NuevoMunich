import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { irA } from '../lib/scroll'

export default function CategoryNav({ categorias, activa, conteo }) {
  const barra = useRef(null)

  // Mantiene visible la pill activa moviendo solo la barra.
  // scrollIntoView también toca el scroll de la página y corta el deslizamiento con el dedo.
  useEffect(() => {
    const caja = barra.current
    const el = caja?.querySelector(`[data-cat="${activa}"]`)
    if (!el) return
    caja.scrollTo({ left: el.offsetLeft - (caja.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' })
  }, [activa])

  return (
    <div className="sticky top-20 z-30 border-b border-white/5 bg-humo md:top-24 md:bg-humo/90 md:backdrop-blur-xl">
      <div ref={barra} className="no-scrollbar relative mx-auto flex max-w-7xl gap-1 overflow-x-auto overscroll-x-contain px-5 py-3 md:px-8">
        {categorias.map((c) => {
          const on = activa === c.slug
          return (
            <button key={c.slug} data-cat={c.slug} onClick={() => irA(`#cat-${c.slug}`, -80)}
              className={`relative shrink-0 rounded-full px-4 py-2.5 text-xs tracking-[.15em] uppercase transition-colors ${on ? 'text-humo' : 'text-crema/60 hover:text-crema'}`}>
              {on && <motion.span layoutId="pill" className="absolute inset-0 rounded-full bg-crema" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className="relative z-10 flex items-center gap-2">
                {c.nombre}
                <span className={`text-[10px] ${on ? 'text-munich' : 'text-crema/45'}`}>{conteo[c.slug] || 0}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
