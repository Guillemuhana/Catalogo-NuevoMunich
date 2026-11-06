import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { fotosDe } from '../lib/data'

// Sección fijada: al bajar, los productos clásicos pasan de costado.
export default function Clasicos({ productos, onAbrir }) {
  const zona = useRef(null)
  const pista = useRef(null)
  const [recorrido, setRecorrido] = useState(0)
  const sinMovimiento = useReducedMotion()
  // En celular se desliza de costado con el dedo: fijar la sección haría sentir trabado el scroll.
  const [tactil] = useState(() => window.matchMedia('(pointer: coarse), (max-width: 767px)').matches)
  const quieto = sinMovimiento || tactil
  const { scrollYProgress } = useScroll({ target: zona, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -recorrido])

  useEffect(() => {
    const medir = () => setRecorrido(Math.max(0, (pista.current?.scrollWidth || 0) - window.innerWidth))
    medir()
    document.fonts?.ready.then(medir)
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [productos])

  const lista = productos.filter((p) => p.destacado)
  if (!lista.length) return null

  return (
    <section ref={zona} id="clasicos" className="relative mt-16 bg-humo md:mt-24" style={{ height: quieto ? 'auto' : `${100 + lista.length * 45}svh` }}>
      <div className={`flex flex-col justify-center overflow-hidden ${quieto ? '' : 'sticky top-0 h-[100svh] pt-24'}`}>
        <div className="mx-auto mb-4 w-full max-w-7xl px-5 md:mb-7 md:px-8">
          <p className="mb-2 flex items-center gap-3 text-[11px] tracking-[.4em] text-oro uppercase"><span className="h-px w-8 bg-oro" />Los favoritos</p>
          <h2 className="font-display text-4xl leading-none text-crema md:text-6xl">Los <span className="texto-oro italic">clásicos</span> de la casa</h2>
        </div>
        <motion.div ref={pista} style={quieto ? undefined : { x }} className={quieto ? 'mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-3 gap-y-5 px-5 md:grid-cols-4 md:gap-5 md:px-8' : 'flex w-max gap-6 px-[max(2rem,calc((100vw-80rem)/2+2rem))]'}>
          {lista.map((p, i) => {
            const fotos = fotosDe(p)
            return (
              <button key={p.slug} onClick={() => onAbrir(p)} className={`group block self-start text-left ${quieto ? 'w-full' : 'w-[min(30vw,54svh)] shrink-0'}`}>
                <span className="relative block aspect-square overflow-hidden rounded-3xl border border-white/10 bg-carbon">
                  <img src={fotos[fotos.length - 1]} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
                </span>
                <span className="mt-2 flex items-baseline gap-2 md:mt-3 md:gap-3">
                  <span className="texto-oro font-display text-lg md:text-2xl">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display text-lg leading-[1.05] text-crema md:text-2xl">{p.nombre}</span>
                </span>
              </button>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
