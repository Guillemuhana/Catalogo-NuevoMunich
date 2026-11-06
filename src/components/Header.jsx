import { motion, AnimatePresence, useDragControls, useScroll, useMotionValueEvent } from 'motion/react'
import { useEffect, useState } from 'react'
import { ChevronRight, Download, Home, LayoutGrid, Menu, MessageCircle, Search, ShoppingBag, Star, X } from 'lucide-react'
import { IconoInstagram } from './Instagram'
import { categorias, marca } from '../data/seed'
import { irA, pausarScroll } from '../lib/scroll'
import { linkWhatsApp } from '../lib/usePedido'

const enlaces = [
  { t: 'Catálogo', id: 'catalogo', ir: () => irA('#categorias', -30) },
  { t: 'Food Truck', id: 'foodtruck', ir: () => irA('#foodtruck', -110) },
  { t: 'Historia', id: 'historia', ir: () => irA('#historia', -80) },
  { t: 'Contacto', id: 'contacto', ir: () => irA('#contacto', -80) },
]

function TabBoton({ icono: I, texto, activo, etiqueta, contador = 0, onClick }) {
  return (
    <button onClick={onClick} aria-label={etiqueta || texto} aria-current={activo ? 'true' : undefined}
      className={`relative flex h-full flex-col items-center justify-center gap-1 text-[10px] transition active:scale-90 ${activo ? 'font-bold text-oro' : 'text-crema/70'}`}>
      <span className="relative">
        <I size={21} />
        <AnimatePresence>
          {contador > 0 && (
            <motion.span key={contador} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-1.5 -right-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-oro px-1 text-[10px] font-bold text-humo">{contador}</motion.span>
          )}
        </AnimatePresence>
      </span>
      {texto}
    </button>
  )
}

export default function Header({ total, listo, onBuscar, onPedido }) {
  const arrastre = useDragControls()
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
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${solido ? 'border-b border-white/5 bg-humo lg:bg-humo/85 lg:backdrop-blur-xl' : ''}`}
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
            <a href={marca.instagram} target="_blank" rel="noreferrer" aria-label="Instagram de Nuevo Munich"
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-humo/30 text-crema transition hover:border-transparent hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white lg:flex">
              <IconoInstagram size={18} />
            </a>
            <button onClick={onBuscar} aria-label="Buscar productos"
              className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-humo/30 text-crema transition hover:border-oro/60 hover:text-oro lg:w-auto lg:px-4">
              <Search size={18} />
              <span className="hidden text-sm lg:inline">Buscar</span>
            </button>
            <button onClick={onPedido} aria-label="Mi pedido"
              className="relative flex h-11 w-11 con-barra:hidden items-center justify-center rounded-full bg-munich text-crema shadow-lg shadow-munich/30 transition hover:bg-munich-deep">
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
              className="flex h-11 w-11 con-barra:hidden items-center justify-center rounded-full border border-white/15 bg-humo/30 text-crema transition hover:border-oro/60 hover:text-oro lg:hidden">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Barra inferior estilo app: lo importante queda al alcance del pulgar */}
      <nav aria-label="Accesos rápidos"
        className="fixed inset-x-0 bottom-0 z-40 hidden border-t border-white/10 bg-carbon pb-[env(safe-area-inset-bottom)] con-barra:block">
        <span className="franja absolute inset-x-0 -top-[3px] !h-[3px]" />
        <div className="mx-auto grid h-16 max-w-xl grid-cols-5 items-center">
          <TabBoton icono={Home} texto="Inicio" activo={!seccion} onClick={() => irA('#top', 0)} />
          <TabBoton icono={LayoutGrid} texto="Productos" activo={seccion === 'catalogo'} onClick={() => irA('#categorias', -30)} />
          <a href={linkWhatsApp('¡Hola Nuevo Munich! Vengo del catálogo online.', marca.whatsappBot)} target="_blank" rel="noreferrer" aria-label="Chatear con el asistente virtual"
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#25D366]">
            <span className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full border-4 border-carbon bg-[#25D366] text-humo shadow-lg shadow-black/50 transition active:scale-90"><MessageCircle size={24} /></span>
            Chat
          </a>
          <TabBoton icono={ShoppingBag} texto="Pedido" onClick={onPedido} etiqueta="Mi pedido" contador={total} />
          <TabBoton icono={Menu} texto="Menú" onClick={() => setMenu(true)} etiqueta="Abrir menú" />
        </div>
      </nav>

      <AnimatePresence>
        {menu && (
          <motion.div key="menu" role="dialog" aria-modal aria-label="Menú" className="fixed inset-0 z-[55] flex items-end justify-center">
            <motion.div onClick={() => setMenu(false)} className="absolute inset-0 bg-black/70"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div data-lenis-prevent
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              drag="y" dragListener={false} dragControls={arrastre} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: .8 }}
              onDragEnd={(_, i) => { if (i.offset.y > 90 || i.velocity.y > 500) setMenu(false) }}
              className="doodles relative flex max-h-[90svh] w-full max-w-xl flex-col overflow-hidden rounded-t-[1.75rem] border-t border-white/10 bg-carbon">
              <div onPointerDown={(e) => arrastre.start(e)} className="shrink-0 cursor-grab touch-none px-5 pt-2.5 pb-1">
                <span className="mx-auto mb-2 block h-1 w-11 rounded-full bg-white/25" />
                <div className="flex items-center justify-between">
                  <img src={marca.logo} alt="Nuevo Munich" className="h-14 w-auto" />
                  <button onClick={() => setMenu(false)} aria-label="Cerrar menú"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-crema active:bg-munich"><X size={20} /></button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
                <p className="mt-2 mb-2.5 text-[11px] tracking-[.3em] text-oro uppercase">Productos</p>
                <div className="grid grid-cols-2 gap-2">
                  {categorias.map((c, i) => (
                    <motion.button key={c.slug} onClick={() => irDesdeMenu(() => irA(`#cat-${c.slug}`, -80))}
                      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 + i * .03 }}
                      className="flex h-14 items-center gap-2.5 rounded-xl border border-white/10 bg-humo/60 p-1 pr-2 text-left transition active:scale-[.97]">
                      <img src={c.banner_url} alt="" loading="lazy" className="h-full w-12 shrink-0 rounded-lg object-cover" />
                      <span className="min-w-0 font-display text-[.95rem] leading-none text-crema min-[380px]:text-base">{c.nombre}</span>
                    </motion.button>
                  ))}
                  <motion.button onClick={() => irDesdeMenu(() => irA('#clasicos', -10))}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}
                    className="flex h-14 items-center gap-2.5 rounded-xl border border-oro/40 bg-oro/10 p-1 pr-2 text-left transition active:scale-[.97]">
                    <span className="flex h-full w-12 shrink-0 items-center justify-center rounded-lg bg-oro text-humo"><Star size={18} fill="currentColor" /></span>
                    <span className="font-display text-[1.05rem] leading-none text-crema">Clásicos</span>
                  </motion.button>
                </div>

                <ul className="mt-3">
                  {enlaces.filter((e) => e.id !== 'catalogo').map((e) => (
                    <li key={e.id}>
                      <button onClick={() => irDesdeMenu(e.ir)} aria-current={seccion === e.id ? 'true' : undefined}
                        className={`flex h-12 w-full items-center justify-between border-b border-white/10 font-display text-xl ${seccion === e.id ? 'text-oro' : 'text-crema'}`}>
                        {e.t} <ChevronRight size={18} className="text-crema/40" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="shrink-0 border-t border-white/10 bg-carbon px-5 pt-3 pb-[max(.9rem,env(safe-area-inset-bottom))]">
                <div className="grid grid-cols-2 gap-2">
                  <a href={marca.catalogoPdf} download className="flex h-12 items-center justify-center gap-2 rounded-full border border-oro/60 text-sm font-bold text-oro"><Download size={16} /> Catálogo PDF</a>
                  <a href={marca.instagram} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-sm font-bold text-white"><IconoInstagram size={16} /> Instagram</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
