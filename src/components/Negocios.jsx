import { motion } from 'motion/react'
import { useState } from 'react'
import { Check, MapPin, MessageCircle } from 'lucide-react'
import { marca } from '../data/seed'

const rubros = ['Restaurante', 'Bar', 'Hamburguesería', 'Panchería', 'Food truck', 'Distribuidor', 'Otro']
const zonas = ['Mendoza', 'San Juan', 'Córdoba', 'Patagonia']
const ventajas = ['Amplia variedad de productos', 'Calidad garantizada', 'Atención personalizada', 'Respaldo de una marca con trayectoria']

const telVisible = (n) => `${n.slice(-10, -7)}-${n.slice(-7, -4)} ${n.slice(-4)}`

// Alta de negocios: el formulario arma el mensaje y lo abre en el WhatsApp del equipo comercial.
export default function Negocios() {
  const [f, setF] = useState({ negocio: '', rubro: '', ciudad: '', nombre: '' })
  const cambiar = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  const enviar = (e) => {
    e.preventDefault()
    const lineas = [
      '¡Hola Nuevo Munich! Quiero sumar sus productos a mi negocio.',
      f.negocio && `Negocio: ${f.negocio}`,
      f.rubro && `Rubro: ${f.rubro}`,
      f.ciudad && `Ciudad: ${f.ciudad}`,
      f.nombre && `Mi nombre: ${f.nombre}`,
    ].filter(Boolean)
    window.open(`https://wa.me/${marca.whatsappComercial}?text=${encodeURIComponent(lineas.join('\n'))}`, '_blank', 'noopener')
  }

  const campo = 'h-12 w-full rounded-xl border border-crema/15 bg-humo/60 px-4 text-sm text-crema placeholder:text-crema/40 outline-none transition focus:border-oro'

  return (
    <section id="negocios" className="relative mx-auto mt-20 max-w-7xl px-5 md:mt-32 md:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-carbon">
        <div className="relative h-48 md:h-72">
          <img src={marca.negocios} alt="Trío de panchos con salchichas Nuevo Munich sobre una tabla" loading="lazy" decoding="async"
            className="h-full w-full object-cover object-[30%_60%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/30 to-transparent" />
        </div>

        <div className="relative -mt-10 grid gap-10 px-7 pb-7 md:-mt-16 md:px-14 md:pb-14 lg:grid-cols-[1.15fr_.85fr]">
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
          </div>

          <form onSubmit={enviar} className="self-center rounded-2xl border border-crema/15 bg-humo/70 p-6 backdrop-blur-md md:p-7">
            <h3 className="font-display text-3xl text-crema">Quiero ser cliente</h3>
            <p className="mt-1 text-sm font-light text-crema/70">Completá tus datos y te escribimos por WhatsApp.</p>
            <div className="mt-5 grid gap-3">
              <input required value={f.negocio} onChange={cambiar('negocio')} placeholder="Nombre del negocio" className={campo} />
              <select required value={f.rubro} onChange={cambiar('rubro')} className={campo + (f.rubro ? '' : ' text-crema/40')}>
                <option value="" disabled>Rubro</option>
                {rubros.map((r) => <option key={r} value={r} className="text-humo">{r}</option>)}
              </select>
              <input required value={f.ciudad} onChange={cambiar('ciudad')} placeholder="Ciudad / provincia" className={campo} />
              <input value={f.nombre} onChange={cambiar('nombre')} placeholder="Tu nombre (opcional)" className={campo} />
            </div>
            <button type="submit"
              className="mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-xs font-bold tracking-[.18em] text-humo uppercase transition hover:brightness-110">
              <MessageCircle size={17} /> Enviar por WhatsApp
            </button>
            <p className="mt-4 text-center text-xs text-crema/60">
              Equipo comercial: <a className="text-crema underline-offset-4 hover:underline" href={`https://wa.me/${marca.whatsappComercial}`} target="_blank" rel="noreferrer">{telVisible(marca.whatsappComercial)}</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
