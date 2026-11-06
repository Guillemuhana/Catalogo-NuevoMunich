import { animate, motion, useInView, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { marca } from '../data/seed'
import { linkWhatsApp } from '../lib/usePedido'

// Barra de avance de lectura con los colores de la franja del envase.
export function Progreso() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30 })
  return <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-0 z-[45] h-[3px] origin-left bg-gradient-to-r from-[#c8102e] via-[#f7a600] to-oro" />
}

// Botón del asistente virtual: aparece al empezar a bajar, para no tapar el hero.
export function BotonBot() {
  const { scrollY } = useScroll()
  const [ver, setVer] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setVer(v > 120))
  return (
    <motion.a href={linkWhatsApp('¡Hola Nuevo Munich! Vengo del catálogo online.', marca.whatsappBot)} target="_blank" rel="noreferrer"
      aria-label="Chatear con el asistente virtual de Nuevo Munich por WhatsApp"
      initial={false} animate={{ scale: ver ? 1 : 0, opacity: ver ? 1 : 0 }} transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      style={{ pointerEvents: ver ? 'auto' : 'none' }}
      className="group fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex h-14 items-center overflow-hidden rounded-full bg-[#25D366] text-humo shadow-xl shadow-black/40 md:right-6 md:bottom-6">
      <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20 [animation-duration:2.6s]" />
      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center"><MessageCircle size={25} /></span>
      <span className="relative max-w-0 overflow-hidden text-sm font-bold whitespace-nowrap transition-all duration-500 group-hover:max-w-56 group-hover:pr-5">Asistente virtual</span>
    </motion.a>
  )
}

function Numero({ valor }) {
  const ref = useRef(null)
  const visto = useInView(ref, { once: true, margin: '-60px' })
  useEffect(() => {
    if (!visto) return undefined
    const c = animate(0, valor, {
      duration: 2.2, ease: [.16, 1, .3, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('es-AR') },
    })
    return () => c.stop()
  }, [visto, valor])
  return <span ref={ref}>{valor.toLocaleString('es-AR')}</span>
}

function PalabraLuz({ children, progreso, desde, hasta }) {
  const opacity = useTransform(progreso, [desde, hasta], [.16, 1])
  return <><motion.span style={{ opacity }} className="inline-block">{children}</motion.span>{' '}</>
}

const MANIFIESTO = 'En Nuevo Munich, cada bocado cuenta una historia. Nuestros fiambres son elaborados siguiendo las recetas originales traídas por los inmigrantes centroeuropeos.'
const DATOS = [
  { n: 5700000, t: 'Salchichas servidas' },
  { n: 150, t: 'Puntos de venta' },
  { n: 15, t: 'Puntos de distribución nacional' },
]

// Texto que se enciende palabra por palabra al bajar, y contadores con los datos del sitio.
export function Manifiesto() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start .85', 'end .55'] })
  const palabras = MANIFIESTO.split(' ')
  return (
    <section className="doodles relative border-y border-white/5 bg-carbon">
      <div className="mx-auto max-w-5xl px-5 py-20 md:px-8 md:py-32">
        <p ref={ref} className="font-display text-[2rem] leading-[1.14] text-crema sm:text-5xl lg:text-6xl">
          {palabras.map((p, i) => (
            <PalabraLuz key={`${p}${i}`} progreso={scrollYProgress} desde={i / palabras.length} hasta={(i + 3) / palabras.length}>{p}</PalabraLuz>
          ))}
        </p>
        <div className="mt-14 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3 md:mt-20">
          {DATOS.map((d) => (
            <div key={d.t}>
              <p className="texto-oro font-display text-5xl leading-none md:text-6xl"><Numero valor={d.n} /></p>
              <p className="mt-2 text-sm text-crema/70">{d.t}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
