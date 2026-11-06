import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react'
import { useState } from 'react'
import { Search, ShoppingBag } from 'lucide-react'
import { marca } from '../data/seed'
import { irA } from '../lib/scroll'

export default function Header({ total, onBuscar, onPedido }) {
  const { scrollY } = useScroll()
  const [solido, setSolido] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setSolido(v > 60))

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: .9, ease: [.22, 1, .36, 1], delay: .2 }}
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${solido ? 'border-b border-white/5 bg-humo/75 backdrop-blur-xl' : ''}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
        <button onClick={() => irA('#top', 0)} className="flex items-center gap-3" aria-label="Inicio">
          <img src={marca.logo} alt="Nuevo Munich" className={`w-auto transition-all duration-500 ${solido ? 'h-9' : 'h-11 md:h-12'}`} />
        </button>

        <nav className="hidden items-center gap-8 text-[11px] tracking-[.3em] text-crema/70 uppercase md:flex">
          <button onClick={() => irA('#catalogo')} className="transition hover:text-oro">Catálogo</button>
          <button onClick={() => irA('#foodtruck')} className="transition hover:text-oro">Food Truck</button>
          <button onClick={() => irA('#historia')} className="transition hover:text-oro">Historia</button>
          <button onClick={() => irA('#contacto')} className="transition hover:text-oro">Contacto</button>
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={onBuscar}
            className="group flex h-10 items-center gap-2 rounded-full border border-white/10 px-3 text-crema/80 transition hover:border-oro/50 hover:text-crema md:px-4">
            <Search size={16} />
            <span className="hidden text-xs text-crema/50 md:inline">Buscar</span>
            <kbd className="hidden rounded border border-white/10 px-1.5 text-[10px] text-crema/40 lg:inline">⌘K</kbd>
          </button>
          <button onClick={onPedido} aria-label="Mi pedido"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-munich text-crema shadow-lg shadow-munich/30 transition hover:bg-munich-deep">
            <ShoppingBag size={17} />
            <AnimatePresence>
              {total > 0 && (
                <motion.span key={total} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-oro px-1 text-[10px] font-bold text-humo">
                  {total}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.header>
  )
}
