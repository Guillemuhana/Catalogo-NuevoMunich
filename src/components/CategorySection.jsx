import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import ProductCard from './ProductCard'

export default function CategorySection({ categoria, productos, numero, onAbrir, onAgregar }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-15%', '10%'])

  return (
    <section id={`cat-${categoria.slug}`} data-seccion={categoria.slug} className="scroll-mt-40 pt-20 md:pt-28">
      <div ref={ref} className="relative mb-10 overflow-hidden rounded-3xl md:mb-14">
        <div className="relative h-64 md:h-80">
          <motion.img style={{ y }} src={categoria.imagen_url} alt={categoria.nombre} loading="lazy"
            className="absolute inset-0 h-[130%] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-humo via-humo/70 to-humo/10" />
        </div>
        <div className="absolute inset-0 flex items-end justify-between gap-6 p-6 md:p-10">
          <div>
            <motion.span initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}
              className="mb-3 block text-[11px] tracking-[.4em] text-oro uppercase">
              {String(numero).padStart(2, '0')} — {productos.length} productos
            </motion.span>
            <h2 className="overflow-hidden font-display text-5xl leading-none text-crema md:text-7xl">
              <motion.span className="inline-block" initial={{ y: '100%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: [.22, 1, .36, 1] }}>
                {categoria.nombre}
              </motion.span>
            </h2>
            {categoria.bajada && <p className="mt-3 max-w-md text-sm font-light text-crema/65 md:text-base">{categoria.bajada}</p>}
          </div>
          <span className="hidden font-display text-[9rem] leading-none text-outline opacity-40 lg:block">{String(numero).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productos.map((p, i) => (
          <ProductCard key={p.slug} producto={p} categoria={categoria} index={i} onAbrir={onAbrir} onAgregar={onAgregar} />
        ))}
      </div>
    </section>
  )
}
