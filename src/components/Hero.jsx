import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { irA } from '../lib/scroll'

const ease = [.22, 1, .36, 1]

function Palabra({ children, delay }) {
  return (
    <span className="inline-block overflow-hidden pb-[.08em] align-bottom">
      <motion.span className="inline-block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1.1, ease, delay }}>
        {children}
      </motion.span>
    </span>
  )
}

export default function Hero({ categorias }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yImg = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25])
  const yTxt = useTransform(scrollYProgress, [0, 1], ['0%', '60%'])
  const fade = useTransform(scrollYProgress, [0, .7], [1, 0])

  const fondo = categorias.find((c) => c.slug === 'especialidades')?.imagen_url || categorias[0]?.imagen_url
  const tiles = categorias.filter((c) => !c.imagen_url?.endsWith('.png')).slice(0, 3)

  return (
    <section id="top" ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <motion.div style={{ y: yImg, scale }} className="absolute inset-0">
        <motion.img
          src={fondo} alt="" aria-hidden
          initial={{ opacity: 0, filter: 'blur(20px)' }}
          animate={{ opacity: .55, filter: 'blur(0px)' }}
          transition={{ duration: 2, ease }}
          className="h-full w-full object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,var(--color-humo)_78%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-humo/70 via-transparent to-humo" />

      <motion.div style={{ y: yTxt, opacity: fade }} className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-24 md:px-8 md:pb-28">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5, duration: .8 }}
          className="mb-6 flex items-center gap-3 text-[11px] tracking-[.4em] text-oro uppercase">
          <span className="h-px w-10 bg-oro" /> Córdoba · Desde 1972
        </motion.p>

        <h1 className="font-display text-[15vw] leading-[.85] text-crema md:text-[9.5vw] lg:text-[8.5rem]">
          <Palabra delay={.35}>Artesanos</Palabra><br />
          <Palabra delay={.5}><span className="text-outline">del</span></Palabra>{' '}
          <Palabra delay={.62}><span className="italic text-munich">Sabor</span></Palabra>
        </h1>

        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }}
            className="max-w-md text-base leading-relaxed font-light text-crema/70 md:text-lg">
            Recetas centroeuropeas heredadas de generación en generación. Fiambres, salchichas y especialidades hechas como en Austria.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.25, duration: .9, ease }}
            className="flex items-center gap-4">
            <button onClick={() => irA('#catalogo')}
              className="group relative overflow-hidden rounded-full bg-crema px-7 py-4 text-xs font-bold tracking-[.25em] text-humo uppercase">
              <span className="relative z-10 flex items-center gap-3 transition-colors duration-500 group-hover:text-crema">
                Ver catálogo <ArrowDown size={15} className="transition-transform duration-500 group-hover:translate-y-1" />
              </span>
              <span className="absolute inset-0 translate-y-full rounded-full bg-munich transition-transform duration-500 ease-out group-hover:translate-y-0" />
            </button>
            <div className="hidden -space-x-4 sm:flex">
              {tiles.map((c, i) => (
                <motion.img key={c.slug} src={c.imagen_url} alt={c.nombre}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 + i * .1 }}
                  className="h-12 w-12 rounded-full border-2 border-humo object-cover" />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Sello giratorio */}
      <motion.div initial={{ opacity: 0, scale: .6, rotate: -40 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 1.3, duration: 1.2, ease }}
        className="absolute top-28 right-6 z-10 hidden h-36 w-36 md:block lg:right-16 lg:h-44 lg:w-44">
        <svg viewBox="0 0 200 200" className="h-full w-full animate-spin-slow">
          <defs><path id="c" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
          <text className="fill-crema/80 font-display" fontSize="17" letterSpacing="5">
            <textPath href="#c">Fiambres artesanales · Recetas austríacas · </textPath>
          </text>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl text-oro lg:text-5xl">1972</span>
        </div>
      </motion.div>
    </section>
  )
}
