import { motion } from 'motion/react'
import { useEffect } from 'react'
import { X } from 'lucide-react'

const DURACION = 5000

// Ventana emergente de bienvenida: se cierra con la cruz, el fondo, Escape o sola a los 5 s.
export default function PopupNovedad({ producto, onCerrar, onAbrir }) {
  useEffect(() => {
    const t = setTimeout(onCerrar, DURACION)
    const k = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', k)
    return () => { clearTimeout(t); window.removeEventListener('keydown', k) }
  }, [onCerrar])

  return (
    <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCerrar}>
      <motion.div role="dialog" aria-modal="true" aria-label="Nuevo producto: Pepperoni"
        initial={{ opacity: 0, scale: .9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .95 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,.7)]">
        {producto ? (
          <button onClick={() => { onCerrar(); onAbrir(producto) }} aria-label="Ver producto Pepperoni" className="block w-full cursor-pointer">
            <img src="/img/marca/popup-pepperoni.webp" alt="Pepperoni, nuevo producto sin gluten"
              width="1200" height="720" className="block h-auto w-full" />
          </button>
        ) : (
          <img src="/img/marca/popup-pepperoni.webp" alt="Pepperoni, nuevo producto sin gluten"
            width="1200" height="720" className="block h-auto w-full" />
        )}
        <button onClick={onCerrar} aria-label="Cerrar" autoFocus
          className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/85">
          <X size={20} />
        </button>
        <motion.span aria-hidden className="absolute bottom-0 left-0 h-1 bg-munich"
          initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: DURACION / 1000, ease: 'linear' }} />
      </motion.div>
    </motion.div>
  )
}
