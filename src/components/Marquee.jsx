import { motion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'

// La cinta se inclina según la velocidad con la que se baja.
export default function Marquee({ items }) {
  const fila = [...items, ...items]
  const { scrollY } = useScroll()
  const velocidad = useSpring(useVelocity(scrollY), { stiffness: 120, damping: 30 })
  const tactil = window.matchMedia('(pointer: coarse)').matches
  const inclinacion = useTransform(velocidad, [-2500, 2500], [-14, 14], { clamp: true })
  const skewX = tactil ? 0 : inclinacion
  return (
    <div className="relative hidden overflow-hidden bg-carbon py-5 md:block">
      <span className="franja absolute inset-x-0 top-0" />
      <motion.div style={{ skewX }} className="flex w-max animate-marquee items-center gap-10">
        {[...fila, ...fila].map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-3xl whitespace-nowrap text-crema/85 md:text-4xl">
            {t}
            <svg width="14" height="14" viewBox="0 0 10 10" className="fill-oro"><path d="M5 0 10 5 5 10 0 5z" /></svg>
          </span>
        ))}
      </motion.div>
      <span className="franja absolute inset-x-0 bottom-0" />
    </div>
  )
}
