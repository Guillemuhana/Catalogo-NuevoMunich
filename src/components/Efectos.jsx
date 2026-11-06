import { AnimatePresence, animate, motion, useInView, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { marca } from '../data/seed'
import { linkWhatsApp } from '../lib/usePedido'

// Barra de avance de lectura con los colores de la franja del envase.
export function Progreso() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30 })
  return <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-0 z-[45] h-[3px] origin-left bg-gradient-to-r from-[#c8102e] via-[#f7a600] to-oro" />
}

// Botón del asistente virtual: aparece al empezar a bajar, para no tapar el hero.
const IconoWhatsApp = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35ZM12.05 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.93.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47a9.4 9.4 0 0 1 6.7 2.78 9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46Zm8.06-17.52A11.33 11.33 0 0 0 12.05.64C5.77.64.66 5.75.66 12.03c0 2 .52 3.96 1.52 5.69L.57 23.64l6.05-1.59a11.37 11.37 0 0 0 5.43 1.38h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.19-5.9-3.34-8.06Z" />
  </svg>
)

const ATAJOS = [
  { t: 'Quiero hacer un pedido', m: '¡Hola Nuevo Munich! Quiero hacer un pedido.' },
  { t: 'Consultar precios', m: '¡Hola Nuevo Munich! Quería consultar precios.' },
  { t: 'Dónde comprar', m: '¡Hola Nuevo Munich! ¿Dónde puedo comprar sus productos?' },
]

function leerVisto() {
  try { return sessionStorage.getItem('nm-chat-visto') === '1' } catch { return false }
}

export function BotonBot() {
  const { scrollY } = useScroll()
  const [ver, setVer] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [aviso, setAviso] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setVer(v > 120))

  // El globito aparece una sola vez por visita y se va solo.
  useEffect(() => {
    if (!ver || leerVisto()) return undefined
    const entra = setTimeout(() => setAviso(true), 1200)
    const sale = setTimeout(() => {
      setAviso(false)
      try { sessionStorage.setItem('nm-chat-visto', '1') } catch { /* sin storage */ }
    }, 7200)
    return () => { clearTimeout(entra); clearTimeout(sale) }
  }, [ver])

  useEffect(() => {
    if (!abierto) return undefined
    const k = (e) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [abierto])

  const alternar = () => {
    setAviso(false)
    try { sessionStorage.setItem('nm-chat-visto', '1') } catch { /* sin storage */ }
    setAbierto((v) => !v)
  }

  return (
    <motion.div initial={false} animate={{ scale: ver ? 1 : 0, opacity: ver ? 1 : 0 }} transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      style={{ pointerEvents: ver ? 'auto' : 'none', transformOrigin: 'bottom right' }}
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 md:right-6 md:bottom-6">
      <AnimatePresence>
        {abierto && (
          <motion.div role="dialog" aria-label="Chat con el asistente de Nuevo Munich"
            initial={{ opacity: 0, y: 16, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .95 }} transition={{ duration: .22, ease: [.22, 1, .36, 1] }}
            style={{ transformOrigin: 'bottom right' }}
            className="absolute right-0 bottom-[4.5rem] w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-carbon shadow-2xl shadow-black/60">
            <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white p-1"><img src={marca.logo} alt="" className="w-full" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">Nuevo Munich</span>
                <span className="block text-xs text-white/80">Asistente virtual</span>
              </span>
              <button onClick={() => setAbierto(false)} aria-label="Cerrar chat" className="flex h-11 w-11 -mr-2 shrink-0 items-center justify-center rounded-full active:bg-white/15"><X size={19} /></button>
            </div>
            <div className="doodles space-y-3 p-4">
              <p className="w-fit max-w-[90%] rounded-2xl rounded-tl-sm bg-roble px-3.5 py-2.5 text-sm leading-snug text-crema">¡Hola! ¿En qué te ayudamos? Elegí una opción y seguimos por WhatsApp.</p>
              <div className="flex flex-col items-end gap-2">
                {ATAJOS.map((a) => (
                  <a key={a.t} href={linkWhatsApp(a.m, marca.whatsappBot)} target="_blank" rel="noreferrer"
                    className="flex min-h-11 items-center rounded-2xl rounded-tr-sm border border-[#25D366]/50 bg-[#25D366]/10 px-4 py-2 text-sm font-bold text-[#6df0a0] transition hover:bg-[#25D366]/25">{a.t}</a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aviso && !abierto && (
          <motion.button onClick={alternar} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
            className="absolute right-[4.25rem] bottom-2 max-w-[calc(100vw-6rem)] rounded-2xl rounded-br-sm bg-crema px-4 py-2.5 text-left text-sm font-bold whitespace-nowrap text-humo shadow-xl shadow-black/40">
            ¿Te ayudamos con tu pedido?
          </motion.button>
        )}
      </AnimatePresence>

      <button onClick={alternar} aria-expanded={abierto} aria-label={abierto ? 'Cerrar chat' : 'Abrir chat con el asistente virtual'}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/50 transition duration-300 hover:scale-105 active:scale-95">
        {!abierto && !leerVisto() && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-25 [animation-duration:2.4s]" />}
        <span className="relative">{abierto ? <X size={25} /> : <IconoWhatsApp size={29} />}</span>
      </button>
    </motion.div>
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
