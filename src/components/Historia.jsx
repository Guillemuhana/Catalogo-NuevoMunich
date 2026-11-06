import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { marca } from '../data/seed'

const hitos = [
  { n: '1972', t: 'Nace Nuevo Munich', d: 'Sus fundadores, de origen austríaco, traen a Córdoba recetas centroeuropeas transmitidas por generaciones.' },
  { n: '2008', t: 'Certificación SENASA', d: 'Calidad controlada en cada etapa de elaboración.' },
  { n: 'Hoy', t: 'Oktoberfest & Food Truck', d: 'Proveedores de la Fiesta Nacional de la Cerveza y presentes en eventos con hot dogs y sándwiches gourmet.' },
]

export default function Historia() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [24, -24])
  const y2 = useTransform(scrollYProgress, [0, 1], [-24, 24])
  const x = useTransform(scrollYProgress, [0, 1], ['10%', '-30%'])

  return (
    <section id="historia" ref={ref} className="rautenmuster relative mt-32 overflow-hidden border-y border-white/5 bg-carbon py-28 md:py-40">
      <motion.p style={{ x }} className="pointer-events-none absolute top-10 left-0 font-display text-[22vw] leading-none whitespace-nowrap text-outline opacity-20">
        Tradition seit 1972
      </motion.p>

      <div className="relative mx-auto grid max-w-7xl gap-16 px-5 md:grid-cols-2 md:px-8">
        <div className="relative aspect-square w-full self-center">
          <motion.img style={{ y: y1 }} src={marca.oktoberfest[0]} alt="Servicio de Nuevo Munich en la Oktoberfest" loading="lazy" decoding="async"
            className="absolute top-0 left-0 aspect-[4/5] w-[64%] rounded-3xl object-cover shadow-2xl" />
          <motion.img style={{ y: y2 }} src={marca.oktoberfest[1]} alt="Salchichas a la parrilla en la Oktoberfest" loading="lazy" decoding="async"
            className="absolute right-0 bottom-0 aspect-[4/5] w-[50%] rounded-3xl border-8 border-carbon object-cover shadow-2xl" />
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-5 flex items-center gap-3 text-[11px] tracking-[.4em] text-oro uppercase"><span className="h-px w-10 bg-oro" />Nuestra historia</p>
          <h2 className="font-display text-5xl leading-[.95] md:text-7xl">
            Una empresa <span className="italic text-munich">familiar</span>, un oficio heredado.
          </h2>
          <div className="mt-12 space-y-8">
            {hitos.map((h, i) => (
              <motion.div key={h.n} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * .12, duration: .8, ease: [.22, 1, .36, 1] }}
                className="grid grid-cols-[90px_1fr] gap-6 border-t border-white/10 pt-6">
                <span className="font-display text-3xl text-oro">{h.n}</span>
                <div>
                  <h3 className="text-lg text-crema">{h.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed font-light text-crema/60">{h.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
