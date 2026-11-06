import { motion } from 'motion/react'
import { useState } from 'react'
import { Plus, Star } from 'lucide-react'
import ProductImage from './ProductImage'
import { fotosDe, miniatura } from '../lib/data'

export default function ProductCard({ producto, categoria, index, onAbrir, onAgregar }) {
  // La segunda foto (ambiente) se carga recién cuando se pasa el mouse.
  const [activa, setActiva] = useState(false)
  const pres = producto.presentaciones || []
  const fotos = fotosDe(producto)
  const alterna = fotos.length > 1 ? fotos[fotos.length - 1] : null

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: .6, ease: [.22, 1, .36, 1], delay: (index % 4) * .05 }}
      onMouseEnter={() => setActiva(true)}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[.07] bg-carbon transition duration-300 hover:-translate-y-1 hover:border-oro/40 hover:shadow-2xl hover:shadow-black/50"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <ProductImage producto={producto} categoria={categoria} />
        {alterna && activa && (
          <img src={miniatura(alterna)} alt="" aria-hidden decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        )}
        {producto.destacado && (
          <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-oro px-2.5 py-1 text-[10px] font-bold tracking-wider text-humo uppercase shadow-md">
            <Star size={10} fill="currentColor" /> Clásico
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 md:p-5">
        <h3 className="font-display text-lg leading-[1.08] text-crema md:text-2xl">
          <button onClick={() => onAbrir(producto)} className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {producto.nombre}
          </button>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3 md:pt-4">
          <p className="min-w-0 text-[11px] leading-snug text-crema/60 md:text-xs">
            {pres[0]}
            {pres.length > 1 && <span className="block text-crema/40">+{pres.length - 1} {pres.length === 2 ? 'opción' : 'opciones'}</span>}
          </p>
          <button
            onClick={() => onAgregar(producto, pres[0])}
            aria-label={`Agregar ${producto.nombre} al pedido`}
            className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-crema transition duration-300 hover:rotate-90 hover:border-munich hover:bg-munich md:h-10 md:w-10"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </motion.article>
  )
}
