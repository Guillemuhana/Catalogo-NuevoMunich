import { motion } from 'motion/react'
import ProductCard from './ProductCard'
import { marca } from '../data/seed'

export default function CategorySection({ categoria, productos, numero, onAbrir, onAgregar }) {
  const n = String(numero).padStart(2, '0')
  const ogianco = categoria.slug === 'linea-ogianco'

  return (
    <section id={`cat-${categoria.slug}`} data-seccion={categoria.slug} className="pt-16 md:pt-24">
      {/* Celular: foto arriba y texto abajo. Pantalla grande: texto a la izquierda y foto a la derecha. */}
      <div className="relative mb-5 overflow-hidden rounded-3xl border border-white/[.06] bg-carbon md:mb-10 md:h-80">
        {categoria.banner_url && (
          <div className="relative aspect-[16/9] md:absolute md:inset-y-0 md:right-0 md:aspect-auto md:w-[62%]">
            <img src={categoria.banner_url} alt="" aria-hidden loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute inset-y-0 left-0 hidden w-2/5 bg-gradient-to-r from-carbon to-transparent md:block" />
          </div>
        )}

        <div className="relative flex flex-col justify-end p-5 md:absolute md:inset-y-0 md:left-0 md:w-[45%] md:p-10">
          {ogianco && <img src={marca.ogianco} alt="Ogianco" loading="lazy" className="mb-3 h-12 w-fit md:h-14" />}
          <motion.span initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}
            className="mb-2 block text-[11px] tracking-[.35em] text-oro uppercase md:mb-3">
            {n} — {productos.length} productos
          </motion.span>
          <h2 className="overflow-hidden pb-[.08em] font-display text-[2.75rem] leading-none text-crema md:text-6xl lg:text-7xl">
            <motion.span className="inline-block" initial={{ y: '100%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: .9, ease: [.22, 1, .36, 1] }}>
              {categoria.nombre}
            </motion.span>
          </h2>
          {categoria.bajada && <p className="mt-2 text-sm font-light text-crema/80 md:mt-3 md:text-base">{categoria.bajada}</p>}
        </div>
        <span className="franja absolute inset-x-0 bottom-0" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {productos.map((p, i) => (
          <ProductCard key={p.slug} producto={p} categoria={categoria} index={i} onAbrir={onAbrir} onAgregar={onAgregar} />
        ))}
      </div>
    </section>
  )
}
