import { AnimatePresence, motion, LayoutGroup } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import Header from './components/Header'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import CategoryNav from './components/CategoryNav'
import CategorySection from './components/CategorySection'
import ProductModal from './components/ProductModal'
import PedidoDrawer from './components/PedidoDrawer'
import SearchOverlay from './components/SearchOverlay'
import Historia from './components/Historia'
import FoodTruck from './components/FoodTruck'
import Footer from './components/Footer'
import { cargarCatalogo } from './lib/data'
import { iniciarScroll, pausarScroll } from './lib/scroll'
import { usePedido } from './lib/usePedido'
import { marca } from './data/seed'

function Intro() {
  return (
    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-humo"
      exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: .9, ease: [.76, 0, .24, 1] }}>
      <motion.img src={marca.logo} alt="Nuevo Munich" className="h-20 md:h-24"
        initial={{ opacity: 0, scale: .85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8 }} />
    </motion.div>
  )
}

export default function App() {
  const [data, setData] = useState(null)
  const [intro, setIntro] = useState(true)
  const [activa, setActiva] = useState(null)
  const [abierto, setAbierto] = useState(null)
  const [verPedido, setVerPedido] = useState(false)
  const [verBuscar, setVerBuscar] = useState(false)
  const [toast, setToast] = useState(null)
  const pedido = usePedido()

  useEffect(() => iniciarScroll(), [])
  useEffect(() => {
    const t0 = Date.now()
    cargarCatalogo().then((d) => {
      setData(d)
      setTimeout(() => setIntro(false), Math.max(0, 1300 - (Date.now() - t0)))
    })
  }, [])

  const categorias = useMemo(() => (data?.categorias || []).slice().sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)), [data])
  const productos = useMemo(() => data?.productos || [], [data])
  const catMap = useMemo(() => Object.fromEntries(categorias.map((c) => [c.slug, c])), [categorias])
  const porCat = useMemo(() => {
    const m = {}
    productos.forEach((p) => (m[p.categoria] ||= []).push(p))
    return m
  }, [productos])
  const conteo = useMemo(() => Object.fromEntries(Object.entries(porCat).map(([k, v]) => [k, v.length])), [porCat])

  // Scroll-spy de categorías
  useEffect(() => {
    if (!categorias.length) return
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActiva(e.target.dataset.seccion)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    document.querySelectorAll('[data-seccion]').forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [categorias])

  // Deep link: #p=slug abre el producto (para compartir por WhatsApp)
  useEffect(() => {
    if (!productos.length) return
    const m = location.hash.match(/p=([\w-]+)/)
    const p = m && productos.find((x) => x.slug === m[1])
    if (p) setAbierto(p)
  }, [productos])
  useEffect(() => {
    if (!productos.length) return
    history.replaceState(null, '', abierto ? `#p=${abierto.slug}` : location.pathname + location.search)
  }, [abierto, productos])

  // ⌘K / Ctrl+K y "/" abren la búsqueda
  useEffect(() => {
    const k = (e) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !/input|textarea/i.test(e.target.tagName))) {
        e.preventDefault(); setVerBuscar(true)
      }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const hayOverlay = !!abierto || verPedido || verBuscar
  useEffect(() => {
    pausarScroll(hayOverlay)
    document.documentElement.style.overflow = hayOverlay ? 'hidden' : ''
  }, [hayOverlay])

  const agregar = useCallback((producto, presentacion, _e, cantidad = 1) => {
    pedido.agregar(producto, presentacion, cantidad)
    setToast({ id: Date.now(), texto: `${cantidad} × ${producto.nombre}` })
  }, [pedido])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <div className="grain">
      <AnimatePresence>{intro && <Intro key="intro" />}</AnimatePresence>

      <Header total={pedido.total} onBuscar={() => setVerBuscar(true)} onPedido={() => setVerPedido(true)} />

      {data && (
        <LayoutGroup>
          <Hero categorias={categorias} />
          <Marquee items={categorias.map((c) => c.nombre)} />

          <main id="catalogo" className="scroll-mt-20">
            <CategoryNav categorias={categorias} activa={activa} conteo={conteo} />
            <div className="mx-auto max-w-7xl px-5 md:px-8">
              {categorias.map((c, i) => porCat[c.slug]?.length ? (
                <CategorySection key={c.slug} categoria={c} productos={porCat[c.slug]} numero={i + 1}
                  onAbrir={setAbierto} onAgregar={agregar} />
              ) : null)}
            </div>
          </main>

          <FoodTruck />
          <Historia />
          <Footer />

          <AnimatePresence>
            {abierto && (
              <ProductModal key="modal" producto={abierto} categoria={catMap[abierto.categoria]}
                relacionados={(porCat[abierto.categoria] || []).filter((p) => p.slug !== abierto.slug).slice(0, 8)}
                onCerrar={() => setAbierto(null)} onAgregar={agregar} onAbrir={setAbierto} />
            )}
          </AnimatePresence>
        </LayoutGroup>
      )}

      <AnimatePresence>{verPedido && <PedidoDrawer key="pedido" pedido={pedido} onCerrar={() => setVerPedido(false)} />}</AnimatePresence>
      <AnimatePresence>
        {verBuscar && <SearchOverlay key="buscar" productos={productos} catMap={catMap} onCerrar={() => setVerBuscar(false)} onAbrir={setAbierto} />}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.button key={toast.id} onClick={() => { setToast(null); setVerPedido(true) }}
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-crema py-2 pr-5 pl-2 text-sm text-humo shadow-2xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-munich text-crema"><Check size={16} /></span>
            <span className="max-w-[55vw] truncate">{toast.texto}</span>
            <span className="text-xs font-bold tracking-wider text-munich uppercase">Ver pedido</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
