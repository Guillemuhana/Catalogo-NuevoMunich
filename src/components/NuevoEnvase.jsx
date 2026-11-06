import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { marca } from '../data/seed'

// Presentación del envase nuevo: el paquete se inclina siguiendo el puntero.
export default function NuevoEnvase({ producto, onAbrir }) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateY = useSpring(useTransform(mx, [-.5, .5], [-14, 14]), { stiffness: 140, damping: 18 })
  const rotateX = useSpring(useTransform(my, [-.5, .5], [10, -10]), { stiffness: 140, damping: 18 })
  const mover = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - .5)
    my.set((e.clientY - r.top) / r.height - .5)
  }
  const salir = () => { mx.set(0); my.set(0) }
  if (!producto) return null

  return (
    <section id="nuevo-envase" className="mx-auto mt-16 max-w-7xl px-5 md:mt-24 md:px-8">
      <div className="doodles relative overflow-hidden rounded-[2rem] border border-white/10 bg-carbon">
        <div className="grid items-center gap-8 p-6 md:grid-cols-2 md:gap-12 md:p-14">
          <div onPointerMove={mover} onPointerLeave={salir} className="flex justify-center [perspective:1100px]">
            <motion.img src={marca.envaseNuevo} alt="Nuevo envase de la salchicha con piel tipo Frankfurt, libre de gluten" loading="lazy" decoding="async"
              style={{ rotateX, rotateY }}
              initial={{ opacity: 0, y: 40, rotate: -4 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: .9, ease: [.22, 1, .36, 1] }}
              width="611" height="1100"
              className="aspect-[407/733] h-[62svh] w-auto rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,.65)] md:h-[560px]" />
          </div>
          <div>
            <span className="inline-block rounded-full bg-oro px-3 py-1 text-[11px] font-bold tracking-wider text-humo uppercase">Nuevo envase</span>
            <h2 className="mt-4 font-display text-4xl leading-[1] text-crema md:text-6xl">Salchicha con piel tipo <span className="texto-oro block text-5xl font-bold tracking-wide md:text-7xl">Frankfurt</span></h2>
            <p className="mt-4 text-lg font-light text-crema/85">Libre de gluten. Artesanos del Sabor.</p>
            <span className="franja mt-6 block max-w-xs" />
            <button onClick={() => onAbrir(producto)}
              className="mt-7 inline-flex h-13 items-center gap-2 rounded-full bg-crema px-6 py-3.5 text-xs font-bold tracking-[.2em] text-humo uppercase transition hover:bg-oro">
              Ver producto <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
