import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react'
import { useEffect, useState } from 'react'
import { ChefHat, ChevronDown, Download, MessageCircle, Search, ShoppingBag } from 'lucide-react'
import { IconoInstagram } from './Instagram'
import { categorias, marca } from '../data/seed'
import { irA, irACategoria, pausarScroll } from '../lib/scroll'
import { linkWhatsApp } from '../lib/usePedido'

const enlaces = [
  { t: 'Catálogo', id: 'catalogo', ir: () => irA('#categorias', -30) },
  { t: 'Recetas', id: 'recetas', icono: ChefHat, ir: () => irA('#recetas', -100) },
  { t: 'Food Truck', id: 'foodtruck', ir: () => irA('#foodtruck', -110) },
  { t: 'Historia', id: 'historia', ir: () => irA('#historia', -80) },
  { t: 'Contacto', id: 'contacto', ir: () => irA('#contacto', -80) },
]

// Tres líneas que se convierten en una cruz
function Hamburguesa({ abierto, onClick }) {
  const linea = 'absolute left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-current transition-all duration-300'
  return (
    <button onClick={onClick} aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={abierto}
      className="relative h-11 w-11 shrink-0 rounded-full border border-white/15 bg-humo/40 text-crema transition active:scale-95 lg:hidden">
      <span className={`${linea} ${abierto ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[15px]'}`} />
      <span className={`${linea} top-1/2 -translate-y-1/2 ${abierto ? 'opacity-0' : ''}`} />
      <span className={`${linea} ${abierto ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-[15px]'}`} />
    </button>
  )
}

export default function Header({ total, listo, onBuscar, onPedido }) {
  const { scrollY } = useScroll()
  const [solido, setSolido] = useState(false)
  const [menu, setMenu] = useState(false)
  const [productos, setProductos] = useState(false)
  const [seccion, setSeccion] = useState(null)
  useMotionValueEvent(scrollY, 'change', (v) => setSolido(v > 60))

  // Marca en el menú la sección que se está viendo
  useEffect(() => {
    if (!listo) return
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setSeccion(e.target.id === 'top' ? null : e.target.id === 'categorias' ? 'catalogo' : e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ;['top', 'categorias', 'catalogo', 'recetas', 'foodtruck', 'historia', 'contacto'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [listo])

  // Menú abierto: frena el scroll de atrás y cierra con Escape
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

  const irDesdeMenu = (ir) => { setMenu(false); setProductos(false); setTimeout(ir, 80) }
  const fila = 'flex min-h-16 w-full items-center justify-between border-b border-white/10 py-3 text-left font-display text-[1.9rem] leading-none transition active:text-oro'

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: .9, ease: [.22, 1, .36, 1], delay: .2 }}
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${solido ? 'border-b border-white/5 bg-humo lg:bg-humo/85 lg:backdrop-blur-xl' : ''}`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-3 sm:px-4 md:h-24 md:gap-4 md:px-8">
          <button onClick={() => irA('#top', 0)} className="min-w-0 shrink transition-transform duration-300 hover:scale-105" aria-label="Inicio">
            <img src={marca.logo} alt="Nuevo Munich" className={`w-auto max-w-full transition-all duration-500 ${solido ? 'h-14 md:h-16' : 'h-16 md:h-20'}`} />
          </button>

          <nav className="hidden items-center gap-5 xl:gap-9 lg:flex" aria-label="Principal">
            {enlaces.map((e) => (
              <button key={e.id} onClick={e.ir} aria-current={seccion === e.id ? 'true' : undefined}
                className={`group relative flex items-center gap-1.5 py-2 font-display text-xl tracking-wide whitespace-nowrap transition duration-300 hover:-translate-y-0.5 hover:text-oro xl:text-[1.4rem] ${seccion === e.id ? 'text-oro' : 'text-crema'}`}>
                {e.id === 'recetas' ? (
                  <span><span className="recetas-inicial">R<span className="gorro-chef" aria-hidden="true">
                    <span className="gorro-chef__copa" />
                    <span className="gorro-chef__pliegues" />
                    <span className="gorro-chef__banda" />
                  </span></span>ecetas</span>
                ) : e.t}
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-center scale-x-0 rounded-full bg-oro transition-transform duration-300 ease-out group-hover:scale-x-100" />
                {seccion === e.id && <motion.span layoutId="menu-activo" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-oro" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button onClick={onBuscar} aria-label="Buscar productos"
              className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-humo/40 text-crema transition hover:border-oro/60 hover:text-oro lg:w-auto lg:px-4">
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
            <Hamburguesa abierto={false} onClick={() => setMenu(true)} />
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div key="menu" role="dialog" aria-modal aria-label="Menú" data-lenis-prevent
            initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: .4, ease: [.76, 0, .24, 1] }}
            className="doodles fixed inset-0 z-[55] flex flex-col overflow-y-auto overscroll-contain bg-carbon px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8">
            <div className="-mx-2 flex h-20 shrink-0 items-center justify-between md:mx-0 md:h-24">
              <img src={marca.logo} alt="Nuevo Munich" className="h-16 w-auto md:h-20" />
              <Hamburguesa abierto onClick={() => setMenu(false)} />
            </div>

            <nav className="mx-auto my-auto w-full max-w-xl py-4" aria-label="Menú principal">
              <button onClick={() => setProductos((v) => !v)} aria-expanded={productos} className={`${fila} ${productos ? 'text-oro' : 'text-crema'}`}>
                Productos <ChevronDown size={24} className={`shrink-0 transition-transform duration-300 ${productos ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {productos && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .28 }} className="overflow-hidden border-b border-white/10">
                    {categorias.map((c) => (
                      <li key={c.slug}>
                        <button onClick={() => irDesdeMenu(() => irACategoria(c.slug))} className="flex min-h-12 w-full items-center py-2 text-left text-lg text-crema/90 active:text-oro">
                          <span aria-hidden className="mr-3 h-px w-5 bg-oro" />{c.nombre}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
              {enlaces.filter((e) => e.id !== 'catalogo').map((e) => (
                <button key={e.id} onClick={() => irDesdeMenu(e.ir)} aria-current={seccion === e.id ? 'true' : undefined}
                  className={`${fila} ${seccion === e.id ? 'text-oro' : 'text-crema'}`}>
                  <span className="flex items-center gap-3">{e.t}{e.icono && <e.icono size={26} className="text-oro" aria-hidden />}</span>
                </button>
              ))}
            </nav>

            <div className="mx-auto w-full max-w-xl shrink-0 space-y-2.5">
              <a href={linkWhatsApp('¡Hola Nuevo Munich! Vengo del catálogo online.', marca.whatsappBot)} target="_blank" rel="noreferrer"
                className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#25D366] text-base font-bold text-humo">
                <MessageCircle size={20} /> Escribinos por WhatsApp
              </a>
              <div className="grid grid-cols-2 gap-2.5">
                <a href={marca.catalogoPdf} download className="flex h-12 items-center justify-center gap-2 rounded-full border border-oro/60 text-sm font-bold text-oro"><Download size={16} /> Catálogo PDF</a>
                <a href={marca.instagram} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 text-sm font-bold text-crema"><IconoInstagram size={16} /> Instagram</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
