import { motion } from 'motion/react'
import { irA } from '../lib/scroll'
import { marca } from '../data/seed'

// Las piezas de categoría ya traen el nombre en la cinta roja: van tal cual, sin texto encima.
export default function Categorias({ categorias }) {
  return (
    <section id="categorias" className="mx-auto max-w-7xl px-5 pt-16 md:px-8 md:pt-24">
      <p className="mb-4 flex items-center gap-3 text-[11px] tracking-[.4em] text-oro uppercase"><span className="h-px w-10 bg-oro" />Nuestros productos</p>
      <h2 className="mb-8 font-display text-4xl leading-none text-crema md:mb-12 md:text-6xl">Elegí por dónde empezar</h2>

      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {categorias.map((c, i) => {
          const oscura = c.slug === 'linea-ogianco'
          return (
            <motion.button key={c.slug} onClick={() => irA(`#cat-${c.slug}`, -80)} aria-label={`Ver ${c.nombre}`}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: .6, delay: (i % 4) * .06, ease: [.22, 1, .36, 1] }}
              className={`group aspect-[3/2] overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 ${oscura ? 'border-white/10 bg-roble hover:border-oro/40' : 'border-transparent bg-white'}`}>
              <img src={c.imagen_url} alt="" loading="lazy" decoding="async"
                className={`h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.05] ${oscura ? 'object-contain p-4' : 'object-cover'}`} />
            </motion.button>
          )
        })}

        <motion.button onClick={() => irA('#foodtruck', -110)} aria-label="Ver Food Truck"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: .6, delay: .18, ease: [.22, 1, .36, 1] }}
          className="group relative aspect-[3/2] overflow-hidden rounded-2xl border border-white/10 transition duration-300 hover:-translate-y-1 hover:border-oro/40 hover:shadow-2xl hover:shadow-black/50">
          <img src={marca.foodtruck[0]} alt="" loading="lazy" decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
          <span className="absolute bottom-2 left-2 rounded-full bg-humo/90 px-3 py-1 font-display text-base text-crema md:bottom-3 md:left-3 md:px-4 md:text-xl">Food Truck</span>
        </motion.button>
      </div>
    </section>
  )
}
