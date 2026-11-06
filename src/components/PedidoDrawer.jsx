import { motion, AnimatePresence } from 'motion/react'
import { Minus, Plus, X, Trash2, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { linkWhatsApp, mensajePedido } from '../lib/usePedido'
import { marca } from '../data/seed'
import { miniatura } from '../lib/data'

const leerNombre = () => {
  try { return localStorage.getItem('nm-cliente') || '' } catch { return '' }
}
const campo = 'w-full rounded-xl border border-white/10 bg-humo/60 px-3.5 py-3 text-base text-crema outline-none transition placeholder:text-crema/35 focus:border-oro/60 md:text-sm'

export default function PedidoDrawer({ pedido, onCerrar }) {
  const { items, cambiar, vaciar, total } = pedido
  const [nombre, setNombre] = useState(leerNombre)
  const [entrega, setEntrega] = useState('Retiro en local')
  const [direccion, setDireccion] = useState('')
  const [comentario, setComentario] = useState('')
  const [revisar, setRevisar] = useState(false)

  const faltaNombre = !nombre.trim()
  const faltaDireccion = entrega === 'Delivery' && !direccion.trim()
  const enviar = (e) => {
    if (faltaNombre || faltaDireccion) { e.preventDefault(); setRevisar(true); return }
    try { localStorage.setItem('nm-cliente', nombre.trim()) } catch { /* sin storage */ }
  }
  const link = linkWhatsApp(mensajePedido(items, { nombre, entrega, direccion, comentario }), marca.whatsappBot)

  return (
    <motion.div className="fixed inset-0 z-50">
      <motion.div onClick={onCerrar} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 32 }}
        data-lenis-prevent
        className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-carbon"
      >
        <div className="flex items-center justify-between border-b border-white/5 p-6">
          <div>
            <h2 className="font-display text-3xl">Mi pedido</h2>
            <p className="text-xs text-crema/50">{total} {total === 1 ? 'unidad' : 'unidades'}</p>
          </div>
          <button onClick={onCerrar} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition hover:rotate-90 hover:bg-munich" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="font-display text-6xl text-outline">vacío</span>
              <p className="mt-4 max-w-xs text-sm text-crema/50">Sumá productos con el botón + y mandanos el pedido por WhatsApp en un toque.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {items.map((i) => (
                  <motion.li key={i.id} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30, height: 0 }}
                    className="flex items-center gap-4 rounded-2xl border border-white/5 bg-roble/50 p-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                      {i.imagen_url
                        ? <img src={miniatura(i.imagen_url)} alt="" className="h-full w-full object-cover" />
                        : <span className="font-display text-2xl text-munich">{i.nombre[0]}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-crema">{i.nombre}</p>
                      {i.presentacion && <p className="text-xs text-crema/45">{i.presentacion}</p>}
                    </div>
                    <div className="flex items-center rounded-full border border-white/10">
                      <button onClick={() => cambiar(i.id, -1)} className="flex h-8 w-8 items-center justify-center text-crema/60 hover:text-crema" aria-label="Menos"><Minus size={13} /></button>
                      <span className="w-5 text-center text-sm">{i.cantidad}</span>
                      <button onClick={() => cambiar(i.id, 1)} className="flex h-8 w-8 items-center justify-center text-crema/60 hover:text-crema" aria-label="Más"><Plus size={13} /></button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          {items.length > 0 && (
            <div className="mt-6 space-y-3 border-t border-white/5 pt-6">
              <p className="text-[11px] tracking-[.3em] text-crema/50 uppercase">Tus datos</p>
              <div>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre o comercio" aria-label="Tu nombre o comercio" autoComplete="name" className={campo} />
                {revisar && faltaNombre && <p className="mt-1 text-xs text-oro">Contanos a nombre de quién va el pedido.</p>}
              </div>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Forma de entrega">
                {['Retiro en local', 'Delivery'].map((o) => (
                  <button key={o} type="button" role="radio" aria-checked={entrega === o} onClick={() => setEntrega(o)}
                    className={`h-11 rounded-xl border text-sm transition ${entrega === o ? 'border-oro bg-oro font-bold text-humo' : 'border-white/10 text-crema/75 hover:border-crema/40'}`}>{o}</button>
                ))}
              </div>
              {entrega === 'Delivery' && (
                <div>
                  <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección de entrega" aria-label="Dirección de entrega" autoComplete="street-address" className={campo} />
                  {revisar && faltaDireccion && <p className="mt-1 text-xs text-oro">Necesitamos la dirección para el delivery.</p>}
                </div>
              )}
              <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={2} placeholder="Comentarios (opcional)" aria-label="Comentarios" className={`${campo} resize-none`} />
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-2 border-t border-white/5 p-5">
            <a href={link} onClick={enviar} target="_blank" rel="noreferrer"
              className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-bold tracking-[.12em] text-humo uppercase transition hover:brightness-110">
              <MessageCircle size={18} /> Enviar pedido por WhatsApp
            </a>
            <p className="text-center text-[11px] text-crema/45">Llega a nuestro asistente virtual, ordenado por categoría.</p>
            <button onClick={vaciar} className="flex w-full items-center justify-center gap-2 py-2 text-xs text-crema/40 transition hover:text-munich">
              <Trash2 size={13} /> Vaciar pedido
            </button>
          </div>
        )}
      </motion.aside>
    </motion.div>
  )
}
