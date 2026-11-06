import { motion } from 'motion/react'
import { marca, productos } from '../data/seed'

export const IconoInstagram = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
)

// Son fotos de la marca que llevan al perfil. No es el feed en vivo: eso requiere conectar la cuenta.
const ambiente = productos.filter((p) => p.destacado).map((p) => p.imagenes[p.imagenes.length - 1])
const fila1 = [marca.oktoberfest[4], ambiente[4], marca.foodtruck[1], ambiente[1], marca.oktoberfest[3], ambiente[5]]
const fila2 = [ambiente[0], marca.oktoberfest[2], ambiente[2], marca.foodtruck[0], ambiente[6], marca.oktoberfest[0]]

function Fila({ fotos, reves }) {
  return (
    <div className={`flex w-max gap-3 hover:[animation-play-state:paused] md:gap-4 ${reves ? 'animate-marquee-inverso' : 'animate-marquee-lento'}`}>
      {[...fotos, ...fotos].map((f, i) => (
        <a key={`${f}${i}`} href={marca.instagram} target="_blank" rel="noreferrer" aria-hidden={i >= fotos.length} tabIndex={i >= fotos.length ? -1 : undefined}
          aria-label={`Ver ${marca.instagramUsuario} en Instagram`}
          className="group relative block h-40 w-40 shrink-0 overflow-hidden rounded-2xl md:h-60 md:w-60">
          <img src={f} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-[#f9ce34]/85 via-[#ee2a7b]/85 to-[#6228d7]/85 text-white opacity-0 transition duration-300 group-hover:opacity-100"><IconoInstagram size={34} /></span>
        </a>
      ))}
    </div>
  )
}

export default function Instagram() {
  return (
    <section id="instagram" className="relative mt-20 overflow-hidden md:mt-32">
      <div className="mx-auto mb-8 flex max-w-7xl flex-col gap-5 px-5 md:mb-12 md:flex-row md:items-end md:justify-between md:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .8 }}>
          <p className="mb-2 flex items-center gap-3 text-[11px] tracking-[.4em] text-oro uppercase"><span className="h-px w-8 bg-oro" />Seguinos en Instagram</p>
          <a href={marca.instagram} target="_blank" rel="noreferrer" className="texto-instagram font-display text-[13vw] leading-[1.05] sm:text-7xl lg:text-8xl">{marca.instagramUsuario}</a>
        </motion.div>
        <a href={marca.instagram} target="_blank" rel="noreferrer"
          className="inline-flex h-14 w-fit shrink-0 items-center gap-3 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] px-7 text-xs font-bold tracking-[.18em] text-white uppercase shadow-lg shadow-[#ee2a7b]/30 transition hover:scale-105">
          <IconoInstagram size={19} /> Seguir
        </a>
      </div>
      <div className="space-y-3 md:space-y-4">
        <Fila fotos={fila1} />
        <Fila fotos={fila2} reves />
      </div>
    </section>
  )
}
