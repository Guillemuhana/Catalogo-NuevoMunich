import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Check, MapPin } from 'lucide-react'
import { marca } from '../data/seed'

const zonas = ['Mendoza', 'San Juan', 'Córdoba', 'Patagonia']
const ventajas = ['Amplia variedad de productos', 'Calidad garantizada', 'Atención personalizada', 'Respaldo de una marca con trayectoria']

const fotos = [
  { src: marca.negocios, alt: 'Trío de panchos con salchichas Nuevo Munich sobre una tabla' },
  { src: 'img/marca/negocios-2.webp', alt: 'Panchos Nuevo Munich con una cerveza' },
  { src: 'img/productos/salames-salame-pepperoni/3.webp', alt: 'Pizza con Salame Pepperoni Nuevo Munich' },
  { src: marca.foodtruck[1], alt: 'Atención en la barra del food truck de Nuevo Munich' },
  { src: marca.oktoberfest[0], alt: 'Parrilla con productos Nuevo Munich en la Fiesta de la Cerveza' },
  { src: marca.oktoberfest[4], alt: 'Plato de salchichas Nuevo Munich listo para servir' },
]
const INTERVALO = 3500

// Fotos que pasan solas; se pausa con el puntero encima y se puede elegir con los puntos.
function Carrusel() {
  const [i, setI] = useState(0)
  const [pausa, setPausa] = useState(false)
  useEffect(() => {
    if (pausa) return
    const t = setTimeout(() => setI((x) => (x + 1) % fotos.length), INTERVALO)
    return () => clearTimeout(t)
  }, [i, pausa])

  return (
    <div onPointerEnter={() => setPausa(true)} onPointerLeave={() => setPausa(false)}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-humo shadow-2xl shadow-black/40">
      <AnimatePresence initial={false}>
        <motion.img key={i} src={fotos[i].src} alt={fotos[i].alt} decoding="async"
          initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ opacity: { duration: .9 }, scale: { duration: INTERVALO / 1000 + 1, ease: 'linear' } }}
          className="absolute inset-0 h-full w-full object-cover" />
      </AnimatePresence>
      {/* Precarga de las fotos para que el cambio sea inmediato */}
      <div hidden>{fotos.map((f) => <img key={f.src} src={f.src} alt="" />)}</div>
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {fotos.map((f, n) => (
          <button key={f.src} onClick={() => setI(n)} aria-label={`Ver foto ${n + 1}`}
            className={`h-2 rounded-full transition-all ${n === i ? 'w-6 bg-oro' : 'w-2 bg-white/60 hover:bg-white'}`} />
        ))}
      </div>
    </div>
  )
}

const telVisible = (n) => `${n.slice(-10, -7)}-${n.slice(-7, -4)} ${n.slice(-4)}`

// Venta a negocios gastronómicos: el contacto es el equipo comercial.
export default function Negocios() {
  const wa = `https://wa.me/${marca.whatsappComercial}?text=${encodeURIComponent('¡Hola Nuevo Munich! Tengo un negocio y quiero sumar sus productos.')}`

  return (
    <section id="negocios" className="relative mx-auto mt-20 max-w-7xl px-5 md:mt-32 md:px-8">
      <div className="relative grid items-center gap-10 overflow-hidden rounded-[2rem] border border-white/10 bg-carbon p-7 md:p-14 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="mb-5 text-[11px] tracking-[.4em] text-oro uppercase">Para negocios · Venta mayorista</p>
          <h2 className="font-display text-5xl leading-[.92] text-crema md:text-6xl">
            Sumate a la familia<br /><span className="text-oro italic">Nuevo Munich.</span>
          </h2>
          <p className="mt-6 max-w-xl font-light text-crema/85">
            Más de 50 años llevando calidad, sabor y confianza a cada cocina. Acompañamos a restaurantes, bares, hamburgueserías,
            pancherías, food trucks y distribuidores que buscan ofrecer productos de primera a sus clientes.
          </p>

          <div className="mt-8">
            <p className="text-xs tracking-[.25em] text-crema/60 uppercase">Hoy seguimos creciendo en</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {zonas.map((z) => (
                <span key={z} className="inline-flex items-center gap-1.5 rounded-full bg-munich px-4 py-2 text-sm font-bold text-crema">
                  <MapPin size={14} /> {z}
                </span>
              ))}
            </div>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {ventajas.map((v, i) => (
              <motion.li key={v} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * .08, duration: .6 }}
                className="flex items-center gap-3 text-sm text-crema/90">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-oro text-humo"><Check size={15} strokeWidth={3} /></span>
                {v}
              </motion.li>
            ))}
          </ul>

          <p className="mt-8 max-w-xl border-t border-crema/10 pt-6 text-sm font-light text-crema/75">
            Escribinos por mensaje privado o comunicate con nuestro equipo comercial al{' '}
            <a href={wa} target="_blank" rel="noreferrer" className="font-bold whitespace-nowrap text-oro underline-offset-4 hover:underline">{telVisible(marca.whatsappComercial)}</a>.
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .9, ease: [.22, 1, .36, 1] }}>
          <Carrusel />
        </motion.div>
      </div>
    </section>
  )
}
