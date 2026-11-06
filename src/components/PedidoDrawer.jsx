import { motion, AnimatePresence } from 'motion/react'
import { Minus, Plus, X, Trash2, MessageCircle, ArrowLeft, MailCheck, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
  if (!emailOk(c.email)) e.email = 'Necesitamos un email válido para mandarte el código.'
  if (!telOk(c.telefono)) e.telefono = 'Ingresá un WhatsApp con código de área.'
  if (c.tipo === 'Comercio' && c.razonSocial.trim().length < 2) e.razonSocial = 'Ingresá el nombre del comercio.'
  if (c.entrega === 'Delivery' && !c.direccion.trim()) e.direccion = 'Necesitamos la dirección para el delivery.'
  if (c.entrega === 'Delivery' && !c.localidad.trim()) e.localidad = 'Indicá la localidad o barrio.'
  return e
}

async function post(url, datos) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) })
  let j = {}
  try { j = await r.json() } catch { /* sin cuerpo */ }
  return { status: r.status, ...j }
}

const campo = 'w-full rounded-xl border border-white/10 bg-humo/60 px-3.5 py-3 text-base text-crema outline-none transition placeholder:text-crema/35 focus:border-oro/60 md:text-sm'
const Aviso = ({ children }) => (children ? <p className="mt-1 text-xs text-oro">{children}</p> : null)

function Opciones({ valor, opciones, onCambio, etiqueta }) {
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={valor === o} onClick={() => onCambio(o)}
          className={`h-11 rounded-xl border text-sm transition ${valor === o ? 'border-oro bg-oro font-bold text-humo' : 'border-white/10 text-crema/75 hover:border-crema/40'}`}>{o}</button>
      ))}
    </div>
  )
}

export default function PedidoDrawer({ pedido, onCerrar }) {
  const { items, cambiar, vaciar, total } = pedido
  const [c, setC] = useState(leerCliente)
  const [errores, setErrores] = useState({})
  const [paso, setPaso] = useState('pedido') // pedido → codigo → listo
  const [token, setToken] = useState('')
  const [codigo, setCodigo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [espera, setEspera] = useState(0)
  const [final, setFinal] = useState(null) // { numero, link }
  const trampa = useRef(null)
  const inputCodigo = useRef(null)
  const cuerpo = useRef(null)

  const set = (k) => (e) => {
    setC((v) => ({ ...v, [k]: typeof e === 'string' ? e : e.target.value }))
    setErrores((v) => (v[k] ? { ...v, [k]: undefined } : v))
  }

  useEffect(() => {
    if (espera <= 0) return undefined
    const t = setTimeout(() => setEspera((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [espera])
  useEffect(() => { cuerpo.current?.scrollTo({ top: 0 }) }, [paso])
  useEffect(() => { if (paso === 'codigo') setTimeout(() => inputCodigo.current?.focus(), 350) }, [paso])

  const terminar = (numero = '') => {
    guardarCliente(c)
    setFinal({ numero, link: linkWhatsApp(mensajePedido(items, { ...c, numero }), marca.whatsappBot) })
    setPaso('listo')
  }

  const pedirCodigo = async () => {
    const e = validar(c)
    setErrores(e)
    if (Object.keys(e).length) {
      cuerpo.current?.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setCargando(true); setAviso('')
    try {
      const r = await post('/api/codigo', { email: c.email.trim(), nombre: c.nombre.trim(), web: trampa.current?.value || '' })
      if (r.status === 503 || r.status === 404) return terminar() // validación por mail todavía sin configurar
      if (!r.token) { setAviso(r.error || 'No pudimos enviar el código. Probá de nuevo.'); return }
      guardarCliente(c)
      setToken(r.token); setCodigo(''); setEspera(45); setPaso('codigo')
    } catch {
      setAviso('No hay conexión. Revisá internet y probá de nuevo.')
    } finally { setCargando(false) }
  }

  const confirmar = async (valor = codigo) => {
    if (valor.length !== 6 || cargando) return
    setCargando(true); setAviso('')
    try {
      const r = await post('/api/confirmar', { token, codigo: valor, cliente: { ...c, email: c.email.trim() }, items })
      if (r.ok) return terminar(r.numero)
      setAviso(r.error || 'No pudimos validar el código.')
      if (r.estado === 'incorrecto') { setCodigo(''); inputCodigo.current?.focus() }
    } catch {
      setAviso('No hay conexión. Revisá internet y probá de nuevo.')
    } finally { setCargando(false) }
  }

  const reenviar = async () => {
    if (espera > 0 || cargando) return
    setCargando(true); setAviso('')
    try {
      const r = await post('/api/codigo', { email: c.email.trim(), nombre: c.nombre.trim() })
      if (r.token) { setToken(r.token); setCodigo(''); setEspera(45); setAviso('Te mandamos un código nuevo.') }
      else setAviso(r.error || 'No pudimos reenviar el código.')
    } catch { setAviso('No hay conexión.') } finally { setCargando(false) }
  }

  const nuevoPedido = () => { vaciar(); setFinal(null); setPaso('pedido'); onCerrar() }

  const titulo = { pedido: 'Mi pedido', codigo: 'Confirmá tu email', listo: '¡Pedido listo!' }[paso]

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
          <div className="flex min-w-0 items-center gap-3">
            {paso === 'codigo' && (
              <button onClick={() => { setPaso('pedido'); setAviso('') }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 transition hover:bg-white/5" aria-label="Volver">
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="truncate font-display text-3xl">{titulo}</h2>
              {paso === 'pedido' && <p className="text-xs text-crema/50">{total} {total === 1 ? 'unidad' : 'unidades'}</p>}
              {paso !== 'listo' && items.length > 0 && (
                <div className="mt-2 flex gap-1.5" aria-hidden>
                  {['pedido', 'codigo', 'listo'].map((p, i) => (
                    <span key={p} className={`h-1 w-8 rounded-full ${['pedido', 'codigo', 'listo'].indexOf(paso) >= i ? 'bg-oro' : 'bg-white/10'}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
          <button onClick={onCerrar} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 transition hover:rotate-90 hover:bg-munich" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div ref={cuerpo} className="flex-1 overflow-y-auto overscroll-contain p-6">
          {paso === 'pedido' && (items.length === 0 ? (
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
                {/* Campo trampa: invisible para personas, los bots lo completan */}
                <input ref={trampa} name="web" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                <div data-error={!!errores.nombre}>
                  <input value={c.nombre} onChange={set('nombre')} placeholder="Nombre y apellido" aria-label="Nombre y apellido" autoComplete="name" className={campo} />
                  <Aviso>{errores.nombre}</Aviso>
                </div>
                <div data-error={!!errores.email}>
                  <input value={c.email} onChange={set('email')} type="email" inputMode="email" placeholder="Email (te llega un código)" aria-label="Email" autoComplete="email" className={campo} />
                  <Aviso>{errores.email}</Aviso>
                </div>
                <div data-error={!!errores.telefono}>
                  <input value={c.telefono} onChange={set('telefono')} type="tel" inputMode="tel" placeholder="WhatsApp · ej. 351 555-1234" aria-label="WhatsApp" autoComplete="tel" className={campo} />
                  <Aviso>{errores.telefono}</Aviso>
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
                <Opciones valor={c.entrega} opciones={['Retiro en local', 'Delivery']} onCambio={set('entrega')} etiqueta="Forma de entrega" />
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
          ))}

          {paso === 'codigo' && (
            <div className="flex flex-col items-center pt-4 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-oro/15 text-oro"><MailCheck size={30} /></span>
              <p className="mt-5 text-sm text-crema/75">Te mandamos un código de 6 dígitos a</p>
              <p className="mt-1 max-w-full truncate font-bold text-crema">{c.email.trim()}</p>
              <input ref={inputCodigo} value={codigo} inputMode="numeric" autoComplete="one-time-code" maxLength={6} aria-label="Código de verificación"
                onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setCodigo(v); if (v.length === 6) confirmar(v) }}
                placeholder="••••••"
                className="mt-7 h-16 w-full max-w-[16rem] rounded-2xl border border-white/15 bg-humo/60 text-center font-mono text-3xl tracking-[.5em] text-crema outline-none transition placeholder:text-crema/20 focus:border-oro" />
              <p className="mt-4 text-xs text-crema/45">Revisá también la carpeta de spam o promociones.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">
                <button onClick={reenviar} disabled={espera > 0 || cargando} className="text-oro underline-offset-4 hover:underline disabled:text-crema/35 disabled:no-underline">
                  {espera > 0 ? `Reenviar código en ${espera} s` : 'Reenviar código'}
                </button>
                <button onClick={() => { setPaso('pedido'); setAviso('') }} className="text-crema/60 underline-offset-4 hover:underline">Cambiar email</button>
              </div>
            </div>
          )}

          {paso === 'listo' && final && (
            <div className="flex flex-col items-center pt-4 text-center">
              <motion.span initial={{ scale: .5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]"><CheckCircle2 size={34} /></motion.span>
              {final.numero ? (
                <>
                  <p className="mt-5 text-sm text-crema/70">Email verificado. Tu número de pedido es</p>
                  <p className="mt-1 font-display text-4xl text-oro">{final.numero}</p>
                  <p className="mt-3 max-w-xs text-sm text-crema/60">Te mandamos el resumen a <span className="text-crema">{c.email.trim()}</span>.</p>
                </>
              ) : (
                <p className="mt-5 max-w-xs text-sm text-crema/70">Tu pedido está listo para enviar.</p>
              )}
              <p className="mt-6 max-w-xs text-sm text-crema/75">Último paso: mandalo por WhatsApp y te confirmamos disponibilidad y precio.</p>
            </div>
          )}
        </div>

        {items.length > 0 && paso !== 'listo' && (
          <div className="space-y-2 border-t border-white/5 p-5">
            {aviso && <p role="status" className="pb-1 text-center text-xs text-oro">{aviso}</p>}
            {paso === 'pedido' ? (
              <button onClick={pedirCodigo} disabled={cargando}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-oro text-sm font-bold tracking-[.12em] text-humo uppercase transition hover:brightness-110 disabled:opacity-60">
                {cargando ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />} {cargando ? 'Enviando código…' : 'Confirmar pedido'}
              </button>
            ) : (
              <button onClick={() => confirmar()} disabled={codigo.length !== 6 || cargando}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-oro text-sm font-bold tracking-[.12em] text-humo uppercase transition hover:brightness-110 disabled:opacity-50">
                {cargando ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />} {cargando ? 'Verificando…' : 'Verificar código'}
              </button>
            )}
            <p className="text-center text-[11px] text-crema/45">
              {paso === 'pedido' ? 'Te enviamos un código por email para validar el pedido.' : 'El código vence en 10 minutos.'}
            </p>
            {paso === 'pedido' && (
              <button onClick={vaciar} className="flex w-full items-center justify-center gap-2 py-2 text-xs text-crema/40 transition hover:text-munich">
                <Trash2 size={13} /> Vaciar pedido
              </button>
            )}
          </div>
        )}

        {paso === 'listo' && final && (
          <div className="space-y-2 border-t border-white/5 p-5">
            <a href={final.link} target="_blank" rel="noreferrer"
              className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-bold tracking-[.12em] text-humo uppercase transition hover:brightness-110">
              <MessageCircle size={18} /> Enviar pedido por WhatsApp
            </a>
            <p className="text-center text-[11px] text-crema/45">Llega a nuestro asistente virtual, ordenado por categoría.</p>
            <button onClick={nuevoPedido} className="flex w-full items-center justify-center gap-2 py-2 text-xs text-crema/40 transition hover:text-crema">
              Ya lo envié · empezar un pedido nuevo
            </button>
          </div>
        )}
      </motion.aside>
    </motion.div>
  )
}
