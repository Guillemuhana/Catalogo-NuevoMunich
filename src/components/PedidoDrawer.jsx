import { motion, AnimatePresence } from 'motion/react'
import { Minus, Plus, X, Trash2, MessageCircle, MapPin } from 'lucide-react'
import { useRef, useState } from 'react'
import { linkWhatsApp, mensajePedido } from '../lib/usePedido'
import { marca } from '../data/seed'
import { miniatura } from '../lib/data'

const CLAVE = 'nm-cliente-v2'
const VACIO = { nombre: '', email: '', telefono: '', tipo: 'Consumidor final', razonSocial: '', cuit: '', entrega: 'Retiro en local', direccion: '', localidad: '', horario: '', comentario: '' }
const leerCliente = () => {
  try {
    const viejo = localStorage.getItem('nm-cliente') || ''
    return { ...VACIO, nombre: viejo, ...JSON.parse(localStorage.getItem(CLAVE) || '{}'), comentario: '' }
  } catch { return { ...VACIO } }
}
const guardarCliente = (c) => {
  try { const { comentario: _c, ...resto } = c; localStorage.setItem(CLAVE, JSON.stringify(resto)) } catch { /* sin storage */ }
}

const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim())
const telOk = (t) => t.replace(/\D/g, '').length >= 8

function validar(c) {
  const e = {}
  if (c.nombre.trim().length < 3) e.nombre = 'Ingresá tu nombre y apellido.'
  if (c.email.trim() && !emailOk(c.email)) e.email = 'Revisá el email o dejalo vacío.'
  if (!telOk(c.telefono)) e.telefono = 'Ingresá un WhatsApp con código de área.'
  if (c.tipo === 'Comercio' && c.razonSocial.trim().length < 2) e.razonSocial = 'Ingresá el nombre del comercio.'
  if (c.entrega === 'Delivery' && !c.direccion.trim()) e.direccion = 'Necesitamos la dirección para el delivery.'
  if (c.entrega === 'Delivery' && !c.localidad.trim()) e.localidad = 'Indicá la localidad o barrio.'
  return e
}

const campo = 'w-full rounded-xl border border-white/10 bg-humo/60 px-3.5 py-3 text-base text-crema outline-none transition placeholder:text-crema/35 focus:border-oro/60 md:text-sm'
const Aviso = ({ children }) => (children ? <p className="mt-1 text-xs text-oro">{children}</p> : null)

function Opciones({ valor, opciones, onCambio, etiqueta }) {
  return (
    <div className={`grid gap-2 ${opciones.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`} role="radiogroup" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={valor === o} onClick={() => onCambio(o)}
          className={`min-h-12 rounded-xl border px-1.5 py-1 text-sm leading-tight transition ${valor === o ? 'border-oro bg-oro font-bold text-humo' : 'border-white/10 text-crema/75 hover:border-crema/40'}`}>{o}</button>
      ))}
    </div>
  )
}

export default function PedidoDrawer({ pedido, onCerrar }) {
  const { items, cambiar, vaciar, total } = pedido
  const [c, setC] = useState(leerCliente)
  const [errores, setErrores] = useState({})
  const [enviado, setEnviado] = useState(false)
  const cuerpo = useRef(null)

  const set = (k) => (e) => {
    setC((v) => ({ ...v, [k]: typeof e === 'string' ? e : e.target.value }))
    setErrores((v) => (v[k] ? { ...v, [k]: undefined } : v))
  }

  const enviar = (ev) => {
    const e = validar(c)
    setErrores(e)
    if (Object.keys(e).length) {
      ev.preventDefault()
      // Espera a que se pinten los avisos para llevar la vista al primer campo con error
      setTimeout(() => cuerpo.current?.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0)
      return
    }
    guardarCliente(c)
    setEnviado(true)
  }

  const nuevoPedido = () => { vaciar(); setEnviado(false); onCerrar() }
  const link = linkWhatsApp(mensajePedido(items, c), marca.whatsappBot)

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
        <div className="flex items-center justify-between gap-3 border-b border-white/5 p-6">
          <div className="min-w-0">
            <h2 className="truncate font-display text-3xl">Mi pedido</h2>
            <p className="text-xs text-crema/50">{total} {total === 1 ? 'unidad' : 'unidades'}</p>
          </div>
          <button onClick={onCerrar} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 transition hover:rotate-90 hover:bg-munich" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div ref={cuerpo} className="flex-1 overflow-y-auto overscroll-contain p-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="font-display text-6xl text-outline">vacío</span>
              <p className="mt-4 max-w-xs text-sm text-crema/50">Sumá productos con el botón + y mandanos el pedido por WhatsApp en un toque.</p>
            </div>
          ) : (
            <>
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

              <div className="mt-6 space-y-3 border-t border-white/5 pt-6">
                <p className="text-[11px] tracking-[.3em] text-crema/50 uppercase">Tus datos</p>
                <div data-error={!!errores.nombre}>
                  <input value={c.nombre} onChange={set('nombre')} placeholder="Nombre y apellido" aria-label="Nombre y apellido" autoComplete="name" className={campo} />
                  <Aviso>{errores.nombre}</Aviso>
                </div>
                <div data-error={!!errores.telefono}>
                  <input value={c.telefono} onChange={set('telefono')} type="tel" inputMode="tel" placeholder="WhatsApp · ej. 351 555-1234" aria-label="WhatsApp" autoComplete="tel" className={campo} />
                  <Aviso>{errores.telefono}</Aviso>
                </div>
                <div data-error={!!errores.email}>
                  <input value={c.email} onChange={set('email')} type="email" inputMode="email" placeholder="Email (opcional)" aria-label="Email" autoComplete="email" className={campo} />
                  <Aviso>{errores.email}</Aviso>
                </div>

                <p className="pt-2 text-[11px] tracking-[.3em] text-crema/50 uppercase">Tipo de cliente</p>
                <Opciones valor={c.tipo} opciones={['Consumidor final', 'Comercio']} onCambio={set('tipo')} etiqueta="Tipo de cliente" />
                {c.tipo === 'Comercio' && (
                  <div className="grid grid-cols-[1fr_9rem] gap-2">
                    <div data-error={!!errores.razonSocial}>
                      <input value={c.razonSocial} onChange={set('razonSocial')} placeholder="Nombre del comercio" aria-label="Nombre del comercio" autoComplete="organization" className={campo} />
                      <Aviso>{errores.razonSocial}</Aviso>
                    </div>
                    <input value={c.cuit} onChange={set('cuit')} inputMode="numeric" placeholder="CUIT (opcional)" aria-label="CUIT" className={campo} />
                  </div>
                )}

                <p className="pt-2 text-[11px] tracking-[.3em] text-crema/50 uppercase">Entrega</p>
                <Opciones valor={c.entrega} opciones={['Retiro en local', 'Retiro en fábrica', 'Delivery']} onCambio={set('entrega')} etiqueta="Forma de entrega" />
                {c.entrega === 'Retiro en fábrica' && (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(marca.fabrica)}`} target="_blank" rel="noreferrer"
                    className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-humo/60 p-3.5 text-sm leading-snug text-crema/85">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-oro" />
                    <span>{marca.fabrica}<span className="mt-1 block font-bold text-oro">Ver en el mapa</span></span>
                  </a>
                )}
                {c.entrega === 'Delivery' && (
                  <>
                    <div data-error={!!errores.direccion}>
                      <input value={c.direccion} onChange={set('direccion')} placeholder="Dirección (calle y número)" aria-label="Dirección de entrega" autoComplete="street-address" className={campo} />
                      <Aviso>{errores.direccion}</Aviso>
                    </div>
                    <div data-error={!!errores.localidad}>
                      <input value={c.localidad} onChange={set('localidad')} placeholder="Barrio / localidad" aria-label="Barrio o localidad" autoComplete="address-level2" className={campo} />
                      <Aviso>{errores.localidad}</Aviso>
                    </div>
                  </>
                )}
                <select value={c.horario} onChange={set('horario')} aria-label="Horario preferido" className={`${campo} ${c.horario ? '' : 'text-crema/35'}`}>
                  <option value="">Horario preferido (opcional)</option>
                  <option value="Mañana (8 a 12 h)">Mañana (8 a 12 h)</option>
                  <option value="Tarde (14 a 18 h)">Tarde (14 a 18 h)</option>
                  <option value="Cualquier horario">Cualquier horario</option>
                </select>
                <textarea value={c.comentario} onChange={set('comentario')} rows={2} placeholder="Comentarios (opcional)" aria-label="Comentarios" className={`${campo} resize-none`} />
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-2 border-t border-white/5 p-5">
            <a href={link} onClick={enviar} target="_blank" rel="noreferrer"
              className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-bold tracking-[.12em] text-humo uppercase transition hover:brightness-110">
              <MessageCircle size={18} /> Enviar pedido por WhatsApp
            </a>
            {enviado ? (
              <button onClick={nuevoPedido} className="flex min-h-11 w-full items-center justify-center gap-2 text-sm font-bold text-oro">
                Ya lo envié · empezar un pedido nuevo
              </button>
            ) : (
              <button onClick={vaciar} className="flex min-h-11 w-full items-center justify-center gap-2 text-xs text-crema/50 transition hover:text-munich">
                <Trash2 size={13} /> Vaciar pedido
              </button>
            )}
          </div>
        )}
      </motion.aside>
    </motion.div>
  )
}
