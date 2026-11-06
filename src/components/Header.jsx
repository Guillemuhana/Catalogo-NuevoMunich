import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react'
import { useEffect, useState } from 'react'
import { Menu, MessageCircle, Search, ShoppingBag, X } from 'lucide-react'
import { marca } from '../data/seed'
import { irA, pausarScroll } from '../lib/scroll'
import { linkWhatsApp } from '../lib/usePedido'

const enlaces = [
  { t: 'Catálogo', id: 'catalogo', ir: () => irA('#categorias', -30) },
  { t: 'Food Truck', id: 'foodtruck', ir: () => irA('#foodtruck', -110) },
  { t: 'Historia', id: 'historia', ir: () => irA('#historia', -80) },
  { t: 'Contacto', id: 'contacto', ir: () => irA('#contacto', -80) },
]

export default function Header({ total, listo, onBuscar, onPedido }) {
  const { scrollY } = useScroll()
  const [solido, setSolido] = useState(false)
  const [menu, setMenu] = useState(false)
  const [seccion, setSeccion] = useState(null)
  useMotionValueEvent(scrollY, 'change', (v) => setSolido(v > 60))

  // Marca en el menú la sección que se está viendo
  useEffect(() => {
    if (!listo) return
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setSeccion(e.target.id === 'top' ? null : e.target.id === 'categorias' ? 'catalogo' : e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ;['top', 'categorias', 'catalogo', 'foodtruck', 'historia', 'contacto'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [listo])

  // Menú del celular: frena el scroll de atrás y cierra con Escape
  useEffect(() => {
    if (!menu) return
    pausarScroll(true)
    document.documentElement.style.overflow = 'hidden'
    const k = (e) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', k)
    return () => {
      window.removeEventListener('keydown', k)
      document.documentElement.style.overflow = ''
      pausarScroll(false)
    }
  }, [menu])

  const irDesdeMenu = (ir) => { setMenu(false); setTimeout(ir, 80) }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: .9, ease: [.22, 1, .36, 1], delay: .2 }}
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${solido ? 'border-b border-white/5 bg-humo/85 backdrop-blur-xl' : ''}`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:h-24 md:px-8">
          <button onClick={() => irA('#top', 0)} className="shrink-0 transition-transform duration-300 hover:scale-105" aria-label="Inicio">
            <img src={marca.logo} alt="Nuevo Munich" className={`w-auto transition-all duration-500 ${solido ? 'h-14 md:h-16' : 'h-16 md:h-20'}`} />
          </button>

          <nav className="hidden items-center gap-8 xl:gap-10 lg:flex" aria-label="Principal">
            {enlaces.map((e) => (
              <button key={e.id} onClick={e.ir} aria-current={seccion === e.id ? 'true' : undefined}
                className={`group relative py-2 font-display text-xl tracking-wide transition duration-300 hover:-translate-y-0.5 hover:text-oro xl:text-[1.4rem] ${seccion === e.id ? 'text-oro' : 'text-crema'}`}>
                {e.t}
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-center scale-x-0 rounded-full bg-oro transition-transform duration-300 ease-out group-hover:scale-x-100" />
                {seccion === e.id && <motion.span layoutId="menu-activo" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-oro" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={onBuscar} aria-label="Buscar productos"
              className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-humo/30 text-crema transition hover:border-oro/60 hover:text-oro lg:w-auto lg:px-4">
              <Search size={18} />
              <span className="hidden text-sm lg:inline">Buscar</span>
            </button>
            <button onClick={onPedido} aria-label="Mi pedido"
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-munich text-crema shadow-lg shadow-munich/30 transition hover:bg-munich-deep">
              <ShoppingBag size={18} />
              <AnimatePresence>
                {total > 0 && (
                  <motion.span key={total} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-oro px-1 text-[10px] font-bold text-humo">
                    {total}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button onClick={() => setMenu(true)} aria-label="Abrir menú" aria-expanded={menu}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-humo/30 text-crema transition hover:border-oro/60 hover:text-oro lg:hidden">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div key="menu" role="dialog" aria-modal aria-label="Menú"
            initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: .5, ease: [.76, 0, .24, 1] }}
            className="rautenmuster fixed inset-0 z-[55] flex flex-col overflow-y-auto bg-carbon px-5 pb-8" data-lenis-prevent>
            <div className="flex h-20 shrink-0 items-center justify-between">
              <img src={marca.logo} alt="Nuevo Munich" className="h-16 w-auto" />
              <button onClick={() => setMenu(false)} aria-label="Cerrar menú"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-crema transition hover:rotate-90 hover:bg-munich"><X size={20} /></button>
            </div>

            <nav className="my-auto flex flex-col py-6" aria-label="Principal">
              {enlaces.map((e, i) => (
                <motion.button key={e.id} onClick={() => irDesdeMenu(e.ir)}
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 + i * .07, duration: .5, ease: [.22, 1, .36, 1] }}
                  className={`border-b border-white/10 py-4 text-left font-display text-[2.6rem] leading-none transition active:text-oro sm:text-6xl ${seccion === e.id ? 'text-oro' : 'text-crema'}`}>
                  {e.t}
                </motion.button>
              ))}
            </nav>

            <motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5 }}
              href={linkWhatsApp('¡Hola Nuevo Munich! Vengo del catálogo online.')} target="_blank" rel="noreferrer"
              className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-bold tracking-[.12em] text-humo uppercase">
              <MessageCircle size={18} /> Escribinos por WhatsApp
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
