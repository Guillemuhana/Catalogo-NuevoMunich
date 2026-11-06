import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { Plus, Star } from 'lucide-react'
import ProductImage from './ProductImage'

export default function ProductCard({ producto, categoria, index, onAbrir, onAgregar }) {
  // Tilt 3D siguiendo el mouse
  const mx = useMotionValue(.5)
  const my = useMotionValue(.5)
  const rx = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 200, damping: 20 })
  const brillo = useTransform([mx, my], ([x, y]) => `radial-gradient(400px circle at ${x * 100}% ${y * 100}%, rgb(255 255 255 / .12), transparent 45%)`)

  const mover = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const salir = () => { mx.set(.5); my.set(.5) }

  const pres = producto.presentaciones || []

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: .8, ease: [.22, 1, .36, 1], delay: (index % 4) * .07 }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        onMouseMove={mover} onMouseLeave={salir}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[.06] bg-carbon"
        onClick={() => onAbrir(producto)}
      >
        <motion.div layoutId={`img-${producto.slug}`} className="relative aspect-[4/5] overflow-hidden">
          <div className="h-full w-full transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.07]">
            <ProductImage producto={producto} categoria={categoria} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-transparent" />
          {producto.destacado && (
            <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-oro px-2.5 py-1 text-[10px] font-bold tracking-wider text-humo uppercase">
              <Star size={10} fill="currentColor" /> Clásico
            </span>
          )}
        </motion.div>

        <motion.div style={{ background: brillo }} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative p-5" style={{ transform: 'translateZ(30px)' }}>
          <p className="mb-1.5 text-[10px] tracking-[.3em] text-munich uppercase">{categoria?.nombre}</p>
          <h3 className="font-display text-2xl leading-[1.05] text-crema">{producto.nombre}</h3>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {pres.slice(0, 2).map((x) => (
                <span key={x} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-crema/60">{x}</span>
              ))}
              {pres.length > 2 && <span className="px-1 py-1 text-[10px] text-crema/40">+{pres.length - 2}</span>}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onAgregar(producto, pres[0], e) }}
              aria-label={`Agregar ${producto.nombre} al pedido`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-crema transition-all duration-300 hover:rotate-90 hover:border-munich hover:bg-munich"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.article>
  )
}
