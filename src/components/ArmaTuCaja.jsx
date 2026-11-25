import { AnimatePresence, motion, useAnimate, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Award, BadgeCheck, Minus, PackageCheck, Plus, ShoppingCart, Star, ThumbsUp, Trash2 } from 'lucide-react'
import { fotosDe, miniatura } from '../lib/data'
import { marca } from '../data/seed'
import recortes from '../data/recortes.json'
import { Beneficios, Chispas } from './Estilo'

const CLAVE = 'nm-caja-v1'
const conRecorte = new Set(recortes)
const foto = (p) => (conRecorte.has(p.slug) ? `img/caja/${p.slug}.webp` : miniatura(fotosDe(p)[0]))

// Lugares dentro de la caja: primero la fila del fondo, después las de adelante.
// y = dónde apoya la base del producto (en % del alto del escenario).
// luz: los del fondo quedan más en sombra; inclina: los de atrás se apoyan contra la pared.
const FILAS = [
  { y: 48, s: .86, luz: .72, inclina: 16, xs: [26, 39, 52, 65, 77] },
  { y: 55, s: .96, luz: .84, inclina: 8, xs: [22, 36, 50, 64, 78] },
  { y: 62, s: 1.06, luz: .96, inclina: 0, xs: [29, 45, 61, 75] },
]
const LUGARES = FILAS.flatMap((f, n) => f.xs.map((x) => ({ x, y: f.y, s: f.s, luz: f.luz, inclina: f.inclina, fila: n })))
const ALTO = 31 // alto base de cada producto, en % del escenario
const MAX_VISIBLES = LUGARES.length * 2

const giro = (txt) => {
  let h = 0
  for (const c of txt) h = (h * 31 + c.charCodeAt(0)) | 0
  return ((h % 25) + 25) % 25 - 12
}

const leer = () => {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || [] } catch { return [] }
}

// Caja de cartón dibujada en SVG: la parte de atrás va detrás de los productos y el frente delante.
// Luz desde arriba a la izquierda; fibras del cartón, canto corrugado y sombras de contacto.
const KRAFT = (
  <defs>
    <linearGradient id="k-frente" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#d7a56a" /><stop offset=".5" stopColor="#c38d55" /><stop offset="1" stopColor="#9c6935" />
    </linearGradient>
    <linearGradient id="k-frente-luz" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#000" stopOpacity=".28" /><stop offset=".18" stopColor="#000" stopOpacity="0" />
      <stop offset=".8" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".22" />
    </linearGradient>
    <linearGradient id="k-solapa-atras" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stopColor="#a8753f" /><stop offset=".6" stopColor="#c99158" /><stop offset="1" stopColor="#ddae74" />
    </linearGradient>
    <linearGradient id="k-solapa-izq" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stopColor="#b17b43" /><stop offset="1" stopColor="#dcaa6e" />
    </linearGradient>
    <linearGradient id="k-solapa-der" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#a06c37" /><stop offset="1" stopColor="#c08850" />
    </linearGradient>
    <linearGradient id="k-solapa-frente" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#e2b57c" /><stop offset="1" stopColor="#c9935a" />
    </linearGradient>
    <linearGradient id="k-pared-atras" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#9a6a39" /><stop offset="1" stopColor="#6b4524" />
    </linearGradient>
    <linearGradient id="k-piso" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#5a3a1e" /><stop offset="1" stopColor="#3a2512" />
    </linearGradient>
    <linearGradient id="k-sombra-frente" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#1a0f06" stopOpacity="0" /><stop offset="1" stopColor="#1a0f06" stopOpacity=".55" />
    </linearGradient>
    <radialGradient id="k-brillo" cx=".3" cy=".1" r=".9">
      <stop offset="0" stopColor="#fff3dc" stopOpacity=".28" /><stop offset=".6" stopColor="#fff3dc" stopOpacity="0" />
    </radialGradient>
    {/* Canto corrugado del cartón */}
    <pattern id="k-flauta" width="5" height="5" patternUnits="userSpaceOnUse">
      <rect width="5" height="5" fill="#e9c897" />
      <path d="M0 2.5 Q1.25 0 2.5 2.5 T5 2.5" fill="none" stroke="#a87741" strokeWidth="1" />
    </pattern>
    <filter id="k-textura" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4" result="fino" />
      <feColorMatrix in="fino" type="matrix" values="0 0 0 0 .25  0 0 0 0 .15  0 0 0 0 .05  0 0 0 .32 -.04" result="motas" />
      <feTurbulence type="fractalNoise" baseFrequency=".012 .03" numOctaves="2" seed="9" result="manchas" />
      <feColorMatrix in="manchas" type="matrix" values="0 0 0 0 .3  0 0 0 0 .18  0 0 0 0 .06  0 0 0 .5 -.2" result="tono" />
      <feComposite in="motas" in2="SourceGraphic" operator="in" result="m" />
      <feComposite in="tono" in2="SourceGraphic" operator="in" result="t" />
      <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="t" /><feMergeNode in="m" /></feMerge>
    </filter>
    <filter id="k-desenfoque"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="k-desenfoque-chico"><feGaussianBlur stdDeviation="1.6" /></filter>
  </defs>
)

// Boca de la caja: atrás 84–316 en y=150, adelante 48–352 en y=200
const SOLAPAS = {
  abierta: {
    izq: '84,150 48,200 8,186 38,118',
    der: '316,150 352,200 392,186 362,118',
    atras: '84,150 316,150 304,70 96,70',
    frente: '48,200 352,200 364,230 36,230',
  },
  cerrada: {
    izq: '84,150 48,200 202,200 200,150',
    der: '316,150 352,200 198,200 200,150',
    atras: '84,150 316,150 334,177 66,177',
    frente: '48,200 352,200 334,177 66,177',
  },
}
const RELLENO = { izq: 'url(#k-solapa-izq)', der: 'url(#k-solapa-der)', atras: 'url(#k-solapa-atras)', frente: 'url(#k-solapa-frente)' }

function CajaAtras({ cerrando }) {
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
      {KRAFT}
      {/* Sombra sobre la mesa: amplia y suave, más una de contacto bien pegada */}
      <ellipse cx="206" cy="364" rx="196" ry="20" fill="#000" opacity=".55" filter="url(#k-desenfoque)" />
      <rect x="46" y="356" width="308" height="8" rx="3" fill="#000" opacity=".7" filter="url(#k-desenfoque-chico)" />
      {!cerrando && (
        <g filter="url(#k-textura)">
          <polygon points={SOLAPAS.abierta.atras} fill={RELLENO.atras} />
          <polygon points="96,70 304,70 305,74 95,74" fill="url(#k-flauta)" />
          <polygon points={SOLAPAS.abierta.izq} fill={RELLENO.izq} />
          <polygon points="8,186 38,118 41,119 12,187" fill="url(#k-flauta)" />
          <polygon points={SOLAPAS.abierta.der} fill={RELLENO.der} />
          <polygon points="392,186 362,118 359,119 388,187" fill="url(#k-flauta)" />
          {/* pliegues de las bisagras */}
          <polyline points="84,150 316,150" stroke="#7a5128" strokeWidth="1.2" opacity=".7" />
          <polyline points="84,150 48,200" stroke="#7a5128" strokeWidth="1" opacity=".6" />
          <polyline points="316,150 352,200" stroke="#5c3b1c" strokeWidth="1" opacity=".7" />
        </g>
      )}
      {/* Interior: pared de atrás, paredes laterales y piso con luces distintas */}
      <g filter="url(#k-textura)">
        <polygon points="84,150 316,150 302,177 98,177" fill="url(#k-pared-atras)" />
        <polygon points="84,150 98,177 72,200 48,200" fill="#a9763f" />
        <polygon points="316,150 352,200 328,200 302,177" fill="#5e3d1e" />
        <polygon points="98,177 302,177 328,200 72,200" fill="url(#k-piso)" />
      </g>
      <polygon points="84,150 316,150 312,156 88,156" fill="#000" opacity=".22" />
      <polygon points="84,150 316,150 316,151.5 84,151.5" fill="url(#k-flauta)" />
    </svg>
  )
}

function CajaFrente({ cerrando, total }) {
  const t = { duration: .45, ease: [.6, 0, .3, 1] }
  const orden = ['izq', 'der', 'atras', 'frente']
  return (
    <svg viewBox="0 0 400 400" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      {KRAFT}
      {/* Sombra que la pared de adelante proyecta sobre los productos */}
      {!cerrando && <rect x="50" y="176" width="300" height="25" fill="url(#k-sombra-frente)" />}

      <g filter="url(#k-textura)">
        <rect x="48" y="200" width="304" height="160" fill="url(#k-frente)" />
        <rect x="48" y="200" width="304" height="160" fill="url(#k-frente-luz)" />
        <rect x="48" y="200" width="304" height="160" fill="url(#k-brillo)" />
        {/* aristas verticales del frente */}
        <rect x="48" y="200" width="3" height="160" fill="#f0c993" opacity=".5" />
        <rect x="349" y="200" width="3" height="160" fill="#5a3818" opacity=".45" />
      </g>

      {/* Logo y textos impresos sobre el cartón (tinta absorbida) */}
      <g style={{ mixBlendMode: 'multiply' }} opacity=".9">
        <image href={marca.logo} x="104" y="236" width="192" height="62" />
        <text x="200" y="318" textAnchor="middle" fill="#2a1a0c" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="12.5" letterSpacing="1.2">ARTESANOS DEL SABOR</text>
        {/* WhatsApp */}
        <g transform="translate(163 323.5)" fill="none" stroke="#2a1a0c" strokeWidth="1.1">
          <circle cx="4" cy="4" r="3.6" /><path d="M1.3 6.9 0.6 8.2 2.1 7.6" fill="#2a1a0c" />
        </g>
        <text x="175" y="330.5" fill="#2a1a0c" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="7.5">3513844802</text>
        {/* Instagram */}
        <g transform="translate(163 334.5)" fill="none" stroke="#2a1a0c" strokeWidth="1.1">
          <rect x=".4" y=".4" width="7.2" height="7.2" rx="2" /><circle cx="4" cy="4" r="1.8" /><circle cx="6" cy="2" r=".4" fill="#2a1a0c" />
        </g>
        <text x="175" y="341.5" fill="#2a1a0c" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="7.5">nuevomunich</text>
        <text x="200" y="354" textAnchor="middle" fill="#2a1a0c" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="10.5">www.nuevomunich.com.ar</text>
      </g>

      {/* Solapa de adelante doblada hacia el frente, con su sombra */}
      {!cerrando && (
        <g filter="url(#k-textura)">
          <polygon points="36,230 364,230 358,238 42,238" fill="#000" opacity=".25" filter="url(#k-desenfoque-chico)" />
          <polygon points={SOLAPAS.abierta.frente} fill={RELLENO.frente} />
          <polygon points="36,230 364,230 363,233 37,233" fill="url(#k-flauta)" />
          <polyline points="48,200 352,200" stroke="#8a5c2e" strokeWidth="1.3" opacity=".8" />
        </g>
      )}

      {/* Solapas que se cierran al pedir */}
      {cerrando && (
        <g filter="url(#k-textura)">
          {orden.map((k, n) => (
            <motion.polygon key={k} initial={{ points: SOLAPAS.abierta[k] }} animate={{ points: SOLAPAS.cerrada[k] }}
              transition={{ ...t, delay: .35 + n * .2 }} fill={RELLENO[k]} stroke="#8a5c2e" strokeWidth=".8" />
          ))}
          <motion.polygon points="190,150 210,150 214,200 186,200" fill="#efe3c4"
            initial={{ opacity: 0 }} animate={{ opacity: .8 }} transition={{ delay: 1.3, duration: .25 }} />
          <motion.rect x="186" y="200" width="28" height="44" fill="#efe3c4" opacity=".8"
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: 0 }} transition={{ delay: 1.45, duration: .25 }} />
        </g>
      )}

      {/* Etiqueta con la cantidad */}
      {total > 0 && !cerrando && (
        <g transform="rotate(-8 330 268)">
          <circle cx="332" cy="271" r="21" fill="#000" opacity=".25" filter="url(#k-desenfoque-chico)" />
          <circle cx="330" cy="268" r="21" fill="#fff8ea" stroke="#c8102e" strokeWidth="2" />
          <text x="330" y="271" textAnchor="middle" fill="#c8102e" fontFamily="Georgia, serif" fontWeight="700" fontSize="16">{total}</text>
          <text x="330" y="280" textAnchor="middle" fill="#3b2410" fontSize="5.5" fontWeight="700" letterSpacing=".5">{total === 1 ? 'PRODUCTO' : 'PRODUCTOS'}</text>
        </g>
      )}
    </svg>
  )
}

function Escenario({ unidades, total, cerrando, escenarioRef, desde }) {
  const [caja, animarCaja] = useAnimate()
  const ultimo = useRef(0)
  const [polvo, setPolvo] = useState([])

  // Pequeño rebote de la caja cuando cae un producto
  useEffect(() => {
    if (total > ultimo.current && caja.current)
      animarCaja(caja.current, { y: [0, 5, -1, 0], scaleY: [1, .985, 1.005, 1] }, { duration: .45, delay: .62 })
    ultimo.current = total
  }, [total, animarCaja, caja])

  return (
    <div ref={escenarioRef} className="relative aspect-square w-full">
      <motion.div ref={caja} className="absolute inset-0 origin-bottom">
        <CajaAtras cerrando={cerrando} />
        {/* Productos dentro de la caja: al cerrar se acomodan hacia abajo */}
        <motion.div className="absolute inset-0" animate={cerrando ? { y: '24%', opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: cerrando ? .45 : 0, ease: 'easeIn' }}>
          <AnimatePresence>
            {unidades.slice(0, MAX_VISIBLES).map((u, n) => {
              const l = LUGARES[n % LUGARES.length]
              const capa = Math.floor(n / LUGARES.length)
              const rot = giro(u.key)
              const d = desde.current[u.key]
              const alto = ALTO * l.s
              const corrido = giro(u.key + 'x') / 5 // pequeño desorden natural
              return (
                <motion.div key={u.key} className="absolute -translate-x-1/2"
                  style={{ left: `${l.x + corrido}%`, top: `${l.y - capa * 7 - alto + Math.abs(corrido) * .4}%`, height: `${alto}%`, width: '27%', zIndex: capa * 10 + l.fila }}
                  exit={{ opacity: 0, transition: { duration: .3 } }}>
                  <motion.img src={u.src} alt="" draggable={false}
                    initial={d ? { x: d.dx, y: d.dy, rotate: 0, scale: 1.15 } : { y: -30, opacity: 0, rotate: rot }}
                    animate={d
                      ? { x: [d.dx, d.dx * .3, 0], y: [d.dy, Math.min(d.dy, 0) - d.alto * .3, 0], rotate: [0, rot * 2, rot], scale: [1.15, .95, 1], rotateX: [0, 0, l.inclina] }
                      : { y: 0, opacity: 1, rotate: rot, rotateX: l.inclina }}
                    transition={d ? { duration: .75, times: [0, .55, 1], ease: 'easeInOut' } : { type: 'spring', stiffness: 260, damping: 20 }}
                    onAnimationComplete={() => {
                      if (desde.current[u.key]) setPolvo((v) => [...v, { id: u.key + Date.now(), x: l.x + corrido }])
                      delete desde.current[u.key]
                    }}
                    style={{
                      transformPerspective: 600, originY: 1,
                      // tono de la luz cálida de la escena + sombra propia y de contacto
                      filter: `brightness(${l.luz}) sepia(.12) saturate(1.05) drop-shadow(0 2px 1.5px rgba(0,0,0,.55)) drop-shadow(0 10px 10px rgba(20,10,0,.45))`,
                    }}
                    className="h-full w-full object-contain object-bottom" />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
        <CajaFrente cerrando={cerrando} total={total} />
        {/* Polvillo de cartón cuando cae un producto */}
        {polvo.map((p) => (
          <span key={p.id} className="pointer-events-none absolute" style={{ left: `${p.x}%`, top: '49%' }}>
            {[-150, -120, -95, -60, -30, -10].map((ang, i) => (
              <motion.span key={i} className="absolute h-1.5 w-1.5 rounded-full bg-[#e8c99a]"
                initial={{ x: 0, y: 0, opacity: .9, scale: 1 }}
                animate={{ x: Math.cos(ang * Math.PI / 180) * (26 + i * 4), y: Math.sin(ang * Math.PI / 180) * (20 + i * 3), opacity: 0, scale: .3 }}
                transition={{ duration: .6, ease: 'easeOut' }}
                onAnimationComplete={i === 0 ? () => setPolvo((v) => v.filter((x) => x.id !== p.id)) : undefined} />
            ))}
          </span>
        ))}
      </motion.div>

      <AnimatePresence>
        {!total && !cerrando && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-[24%] text-center font-manuscrita text-2xl text-crema/85 md:text-3xl">
            Tu caja está vacía…<br /><span className="text-celeste">¡elegí tus favoritos!</span>
          </motion.p>
        )}
        {cerrando && (
          <motion.span initial={{ scale: 2.4, opacity: 0, rotate: -25 }} animate={{ scale: 1, opacity: 1, rotate: -12 }} transition={{ delay: 1.6, type: 'spring', stiffness: 300, damping: 16 }}
            className="absolute top-[12%] left-1/2 -translate-x-1/2 rounded-xl border-4 border-[#25d366] bg-humo/70 px-5 py-2 font-pincel text-3xl text-[#25d366] backdrop-blur-sm md:text-4xl">
            ¡Caja lista!
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

// Pantalla aparte, fuera del inicio: se abre desde el botón "Armá tu caja" del costado.
export default function ArmaTuCaja({ categorias, productos, onPedir, onCerrar }) {
  const [caja, setCaja] = useState(leer)
  const [filtro, setFiltro] = useState('todos')
  const [cerrando, setCerrando] = useState(false)
  const escenario = useRef(null)
  const desde = useRef({})

  // El bloqueo del scroll de fondo lo maneja App (hayOverlay)
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onCerrar])

  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify(caja)) } catch { /* sin storage */ }
  }, [caja])

  const porSlug = useMemo(() => Object.fromEntries(productos.map((p) => [p.slug, p])), [productos])
  const lista = caja.filter((c) => porSlug[c.slug])
  const total = lista.reduce((a, c) => a + c.n, 0)
  const unidades = lista.flatMap((c) => Array.from({ length: c.n }, (_, k) => ({ key: `${c.slug}#${k}`, src: foto(porSlug[c.slug]) })))
  const visibles = filtro === 'todos' ? productos : productos.filter((p) => p.categoria === filtro)
  const cuantos = (slug) => lista.find((c) => c.slug === slug)?.n || 0

  const sumar = (p, origen) => {
    if (cerrando) return
    const n = cuantos(p.slug)
    const lugar = total < MAX_VISIBLES ? LUGARES[total % LUGARES.length] : null
    const e = escenario.current?.getBoundingClientRect()
    if (origen && e && lugar && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const capa = Math.floor(total / LUGARES.length)
      const alto = e.height * ALTO / 100 * lugar.s
      const fx = e.left + e.width * lugar.x / 100
      const fy = e.top + e.height * (lugar.y - capa * 7) / 100 - alto / 2
      desde.current[`${p.slug}#${n}`] = { dx: origen.left + origen.width / 2 - fx, dy: origen.top + origen.height / 2 - fy, alto: e.height }
    }
    setCaja((v) => (n ? v.map((c) => (c.slug === p.slug ? { ...c, n: c.n + 1 } : c)) : [...v, { slug: p.slug, pres: p.presentaciones?.[0], n: 1 }]))
  }
  const sacar = (p) => setCaja((v) => v.flatMap((c) => (c.slug !== p.slug ? [c] : c.n > 1 ? [{ ...c, n: c.n - 1 }] : [])))

  const pedir = () => {
    if (!total || cerrando) return
    setCerrando(true)
    setTimeout(() => {
      onPedir(lista.map((c) => ({ producto: porSlug[c.slug], presentacion: c.pres, cantidad: c.n })))
      setCaja([])
      setCerrando(false)
    }, 2700)
  }

  return (
    <motion.div id="arma-tu-caja" role="dialog" aria-modal aria-label="Armá tu caja de productos" data-lenis-prevent
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .4 }}
      className="fixed inset-0 z-[45] overflow-y-auto overscroll-contain bg-humo partido:grid partido:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] partido:overflow-hidden">

      {/* Mesa: la caja es la protagonista. Arriba y fija en celular; mitad izquierda a pantalla completa en compu. */}
      <Mesa total={total} cerrando={cerrando} onCerrar={onCerrar} onPedir={pedir} onVaciar={() => setCaja([])}>
        <Escenario unidades={unidades} total={total} cerrando={cerrando} escenarioRef={escenario} desde={desde} />
      </Mesa>

      {/* Productos para elegir */}
      <div data-lenis-prevent className="@container relative min-w-0 px-4 pt-6 pb-28 sm:px-6 partido:h-svh partido:overflow-y-auto partido:overscroll-contain lg:px-10 lg:pt-10 partido:pb-12 bajo:pt-3">
        <h2 className="hidden font-pincel text-3xl text-white bajo:block">¡Armá tu <span className="text-celeste">caja!</span></h2>
        <motion.div className="bajo:hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .15 }}>
          <p className="mb-2 flex items-center gap-2.5 text-[11px] tracking-[.4em] text-celeste uppercase"><ShoppingCart size={16} /> Nuevo · Hacé tu pedido</p>
          <h2 className="font-pincel leading-[1.05] text-white">
            <span className="flex items-center gap-2 text-4xl md:text-5xl xl:text-6xl"><Chispas />¡Armá tu</span>
            <span className="relative mt-1 inline-block -rotate-2 px-3.5 pt-0.5 pb-1.5 text-3xl md:text-4xl xl:text-5xl">
              <span aria-hidden className="absolute inset-0 -skew-x-6 rounded-[.6rem_1.4rem_.8rem_1.6rem] bg-munich-deep shadow-[0_8px_24px_rgba(0,0,0,.45)]" />
              <span className="relative">caja de productos!</span>
            </span>
          </h2>
          <p className="mt-3 font-manuscrita text-xl text-crema/90 md:text-2xl">Elegí tus favoritos y disfrutá la calidad de siempre</p>
        </motion.div>

        {/* Filtros fijos arriba mientras se recorre la lista */}
        <div className="sticky top-[max(46svh,300px)] z-10 -mx-4 mt-5 bajo:mt-2 bg-humo/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 partido:top-0 lg:-mx-10 lg:px-10 bajo:py-2">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
            {[{ slug: 'todos', nombre: 'Todos' }, ...categorias].map((c) => (
              <button key={c.slug} onClick={() => setFiltro(c.slug)} aria-pressed={filtro === c.slug}
                className={`min-h-10 shrink-0 rounded-full border px-4 text-sm transition ${filtro === c.slug ? 'border-celeste bg-celeste font-bold text-humo' : 'border-white/15 text-crema/75 hover:border-crema/40'}`}>
                {c.nombre}
              </button>
            ))}
          </div>
        </div>

        <motion.ul layout className="mt-2 grid grid-cols-2 gap-3 @md:grid-cols-3 @3xl:grid-cols-4 partido:gap-4">
          <AnimatePresence mode="popLayout">
            {visibles.map((p, i) => {
              const n = cuantos(p.slug)
              return (
                <motion.li key={p.slug} layout initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .94 }}
                  transition={{ duration: .3, delay: Math.min(i, 8) * .02 }}
                  className={`group relative flex flex-col rounded-2xl border bg-carbon p-2.5 transition-colors ${n ? 'border-celeste/70 shadow-[0_0_0_1px_rgba(63,196,230,.25),0_10px_30px_-10px_rgba(63,196,230,.35)]' : 'border-white/[.07] hover:border-white/20'}`}>
                  {/* Foto original (fondo blanco), como en el catálogo; el recorte va solo dentro de la caja */}
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
                    <img src={miniatura(fotosDe(p)[0])} alt="" loading="lazy" decoding="async" data-foto
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <AnimatePresence>
                      {n > 0 && (
                        <motion.span key={n} initial={{ scale: .4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                          className="absolute top-1.5 right-1.5 flex h-7 min-w-7 items-center justify-center rounded-full bg-celeste px-1.5 text-sm font-bold text-humo shadow">{n}</motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-[2.5em] text-[13px] leading-tight font-bold text-crema">{p.nombre}</p>
                  <p className="mt-0.5 truncate text-[11px] text-crema/50">{p.presentaciones?.[0]}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    {n > 0 && (
                      <button onClick={() => sacar(p)} aria-label={`Sacar ${p.nombre} de la caja`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-crema transition hover:border-munich"><Minus size={16} /></button>
                    )}
                    <button onClick={(e) => sumar(p, e.currentTarget.closest('li').querySelector('[data-foto]')?.getBoundingClientRect())}
                      aria-label={`Sumar ${p.nombre} a la caja`}
                      className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-crema text-xs font-bold tracking-wide text-humo uppercase transition hover:bg-celeste active:scale-95">
                      <Plus size={15} strokeWidth={3} /> {n ? 'Otro' : 'A la caja'}
                    </button>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </motion.ul>

        <Beneficios className="mt-10 grid-cols-2 gap-y-5 sm:grid-cols-4" items={[
          { icono: BadgeCheck, texto: 'Calidad premium' },
          { icono: Award, texto: 'Productos seleccionados' },
          { icono: Star, texto: 'Variedad de fiambres' },
          { icono: ThumbsUp, texto: 'Sabor incomparable' },
        ]} />
      </div>
    </motion.div>
  )
}

// Motas de polvo flotando en la luz (posiciones fijas para que no cambien entre renders)
const MOTAS = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100, top: 8 + ((i * 53) % 70), t: 1 + (i % 3), d: 7 + (i % 5) * 1.7, del: -(i * .9),
}))

// La mesa de madera con la caja: luz cálida que sigue al puntero y polvo en el aire.
function Mesa({ children, total, cerrando, onCerrar, onPedir, onVaciar }) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 120, damping: 18 })
  const sy = useSpring(my, { stiffness: 120, damping: 18 })
  const luzX = useTransform(sx, [-.5, .5], ['25%', '75%'])
  const luzY = useTransform(sy, [-.5, .5], ['15%', '55%'])
  const luz = useMotionTemplate`radial-gradient(ellipse 55% 45% at ${luzX} ${luzY}, rgba(255,196,120,.26), rgba(255,150,60,.08) 45%, transparent 75%)`

  const mover = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - .5)
    my.set((e.clientY - r.top) / r.height - .5)
  }

  return (
    <div className="sticky top-0 z-20 partido:relative partido:h-svh">
      <div onPointerMove={mover} onPointerLeave={() => { mx.set(0); my.set(0) }}
        className="relative flex h-[46svh] min-h-[300px] flex-col bg-cover bg-center shadow-[0_20px_40px_-10px_rgba(0,0,0,.8)] partido:h-full"
        style={{ backgroundImage: `url(${marca.madera})` }}>
        {/* Viñeta, luz cálida que sigue al mouse y polvo en el aire */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_45%,transparent_30%,rgba(0,0,0,.7))]" />
          <motion.div className="absolute inset-0 mix-blend-screen" style={{ background: luz }} />
          <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/50 to-transparent" />
          {MOTAS.map((m, i) => (
            <span key={i} className="mota" style={{ left: `${m.left}%`, top: `${m.top}%`, width: m.t, height: m.t, '--d': `${m.d}s`, '--del': `${m.del}s` }} />
          ))}
        </div>

        {/* Barra superior sobre la mesa */}
        <div className="relative z-10 flex items-center justify-between gap-3 px-4 pt-3 sm:px-6 lg:px-8 lg:pt-6">
          <button onClick={onCerrar}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 text-sm text-crema backdrop-blur-md transition hover:border-crema/40">
            <ArrowLeft size={17} /> <span>Volver<span className="hidden sm:inline"> al catálogo</span></span>
          </button>
          <img src={marca.logo} alt="Nuevo Munich" className="h-8 w-auto drop-shadow-lg partido:h-10" />
        </div>

        {/* La caja, lo más grande posible según el lugar disponible */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 lg:px-8 partido:pb-[4.5rem] lg:pb-24" style={{ containerType: 'size' }}>
          <div style={{ width: 'min(100cqw, 100cqh)' }}>
            {children}
          </div>
        </div>

        {/* Pedir: abajo de la mesa en compu; en celular va fija abajo de la pantalla */}
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-white/10 bg-humo/90 px-4 pt-3 pb-[max(.75rem,env(safe-area-inset-bottom))] backdrop-blur-md partido:absolute partido:inset-x-4 partido:bottom-3 lg:inset-x-8 lg:bottom-6 partido:rounded-full partido:border partido:bg-black/45 partido:p-2">
          <motion.button onClick={onPedir} disabled={!total || cerrando} whileTap={{ scale: .97 }}
            className="relative inline-flex min-h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-munich px-5 text-sm font-bold tracking-wide text-crema uppercase shadow-lg transition-colors hover:bg-munich-deep disabled:opacity-40">
            {total > 0 && !cerrando && <span aria-hidden className="brillo-boton absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />}
            <PackageCheck size={18} /> {cerrando ? 'Cerrando tu caja…' : total ? `Pedir mi caja (${total})` : 'Pedir mi caja'}
          </motion.button>
          <button onClick={onVaciar} disabled={!total || cerrando} aria-label="Vaciar la caja"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 text-crema/80 transition hover:border-munich hover:text-crema disabled:opacity-30"><Trash2 size={18} /></button>
        </div>
      </div>
    </div>
  )
}
