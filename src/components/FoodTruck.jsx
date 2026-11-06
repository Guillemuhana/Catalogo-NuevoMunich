import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { MessageCircle } from 'lucide-react'
import { marca } from '../data/seed'

const propuestas = [
  {
    t: 'Superpancho Premium',
    s: 'El clásico alemán, con el sello Nuevo Munich.',
    d: 'Salchicha alemana Nuevo Munich en pan de papa con queso gratinado. Para terminarlo a gusto: mayonesa, mostaza, kétchup, lluvia de papa, chucrut, panceta crispy y salsa criolla.',
  },
  {
    t: 'Picada Nuevo Munich',
    s: 'Una opción premium para compartir.',
    d: 'Salame tipo Colonia, bondiola, lomo de cerdo ahumado, entre otras variedades de fiambres, y tres variedades de quesos. Ideal para recepciones, encuentros y celebraciones.',
  },
]

export default function FoodTruck() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rot = useTransform(scrollYProgress, [0, 1], [-12, 12])
  const y = useTransform(scrollYProgress, [0, 1], [60, -60])
  const wa = `https://wa.me/${marca.whatsappFoodTruck}?text=${encodeURIComponent('¡Hola! Quiero consultar por el Food Truck de Nuevo Munich para un evento.')}`

  return (
    <section id="foodtruck" ref={ref} className="relative mx-auto mt-32 max-w-7xl px-5 md:px-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-munich-deep via-munich to-cuero p-8 md:p-16">
        <div className="absolute inset-0 rautenmuster opacity-60" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="mb-5 text-[11px] tracking-[.4em] text-oro uppercase">Food Truck · Para tu evento</p>
            <h2 className="font-display text-5xl leading-[.92] text-crema md:text-6xl">
              Vos ponés el evento.<br /><span className="italic text-humo/80">Nosotros llevamos el sabor.</span>
            </h2>
            <p className="mt-6 max-w-lg font-light text-crema/85">
              Una experiencia gastronómica con identidad propia, productos Nuevo Munich y atención cuidada para eventos sociales, empresariales y celebraciones.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {propuestas.map((p, i) => (
                <motion.div key={p.t} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * .12, duration: .8, ease: [.22, 1, .36, 1] }}
                  className="rounded-2xl border border-crema/15 bg-humo/25 p-5 backdrop-blur-sm">
                  <h3 className="font-display text-2xl text-crema">{p.t}</h3>
                  <p className="mt-1 text-sm text-oro">{p.s}</p>
                  <p className="mt-3 text-sm leading-relaxed font-light text-crema/75">{p.d}</p>
                </motion.div>
              ))}
            </div>

            <a href={wa} target="_blank" rel="noreferrer"
              className="mt-10 inline-flex h-14 items-center gap-3 rounded-full bg-crema px-7 text-xs font-bold tracking-[.2em] text-humo uppercase transition hover:bg-oro">
              <MessageCircle size={17} /> Consultas y reservas
            </a>
            <p className="mt-4 text-xs tracking-wide text-crema/60">Personal capacitado · Atención cuidada · Presentación premium</p>
          </div>

          <motion.div style={{ rotate: rot, y }} className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-[10%] rounded-full bg-oro/30 blur-3xl" />
            <img src={marca.foodtruck} alt="Superpancho Nuevo Munich" loading="lazy" className="relative w-full drop-shadow-[0_40px_60px_rgba(0,0,0,.5)]" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
