import { motion } from 'motion/react'
import { ArrowDown, Download } from 'lucide-react'
import { irA } from '../lib/scroll'
import { marca } from '../data/seed'
import Humo from './Humo'

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

// La comida de la foto está a la izquierda y la derecha queda libre.
// Pantalla ancha: el texto va en esa zona libre. Celular y tablet: la foto arriba y el texto abajo.
// En ningún caso hay letras encima de la comida.
export default function Hero() {
  return (
    <section id="top" className="relative flex flex-col bg-humo sm:min-h-[100svh] ancho:block ancho:h-[100svh] ancho:min-h-[420px]">
      <div className="relative mt-20 aspect-[4/3] w-full shrink-0 overflow-hidden sm:aspect-video ancho:absolute ancho:inset-0 ancho:mt-0 ancho:aspect-auto ancho:h-full">
        <motion.img
          src={marca.hero} alt="Trío de panchos y salchicha con piel tipo Frankfurt Nuevo Munich" fetchPriority="high"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease }}
          className="h-full w-full origin-left object-cover object-[left_35%] sm:object-[left_top]"
        />
        <Humo />
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-humo to-transparent ancho:h-28 ancho:from-humo/70" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-humo to-transparent ancho:h-20" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-start px-5 pt-2 pb-4 sm:justify-center sm:px-8 ancho:justify-center hero-texto ancho:absolute ancho:inset-y-0 ancho:px-0 ancho:pt-24 ancho:pr-[3vw] ancho:pb-6">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5, duration: .8 }}
          className="mb-3 flex items-center gap-3 text-[11px] tracking-[.35em] text-oro uppercase sm:mb-5">
          <span className="h-px w-8 shrink-0 bg-oro" /> Córdoba · Desde 1972
        </motion.p>

        <h1 className="hero-titulo font-display text-[min(17vw,7.5rem)] leading-[.92] text-crema">
          <Palabra delay={.35}>Artesanos</Palabra><br />
          <Palabra delay={.5}><span className="text-crema/75">del</span></Palabra>{' '}
          <Palabra delay={.62}><span className="texto-oro pr-[.08em] italic">Sabor</span></Palabra>
        </h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }}
          className="mt-4 max-w-xl text-base leading-relaxed font-light text-crema/80 sm:mt-6 sm:text-lg ancho:text-[clamp(.95rem,1.2vw,1.2rem)] [@media(max-height:520px)]:hidden">
          Recetas centroeuropeas heredadas de generación en generación. Fiambres, salchichas y especialidades hechas como en Austria.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.25, duration: .9, ease }}
          className="mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
          <button onClick={() => irA('#categorias', -30)}
            className="group relative min-w-0 flex-1 overflow-hidden rounded-full bg-crema px-4 py-4 text-[11px] font-bold tracking-[.14em] text-humo uppercase sm:flex-none sm:px-7 sm:text-xs sm:tracking-[.2em]">
            <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap transition-colors duration-500 group-hover:text-crema">
              Ver catálogo <ArrowDown size={15} className="transition-transform duration-500 group-hover:translate-y-1" />
            </span>
            <span className="absolute inset-0 translate-y-full rounded-full bg-munich transition-transform duration-500 ease-out group-hover:translate-y-0" />
          </button>
          <a href={marca.catalogoPdf} download
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-oro/60 px-4 py-4 text-[11px] font-bold tracking-[.14em] whitespace-nowrap text-oro uppercase transition hover:bg-oro hover:text-humo sm:flex-none sm:px-7 sm:text-xs sm:tracking-[.2em]">
            <Download size={15} /> Catálogo PDF
          </a>
        </motion.div>
      </div>

      {/* Brasas que suben por la zona libre de la foto */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] hidden overflow-hidden ancho:block">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="brasa" style={{ left: `${62 + (i * 37) % 36}%`, animationDelay: `${(i * 1.3) % 9}s`, animationDuration: `${7 + (i * 3) % 7}s` }} />
        ))}
      </div>

      {/* Sello giratorio: solo en pantallas anchas y altas, en la esquina libre de la foto */}
      <motion.div initial={{ opacity: 0, scale: .6, rotate: -40 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 1.3, duration: 1.2, ease }}
        className="absolute right-[3vw] bottom-8 z-10 hidden h-28 w-28 ancho:block xl:h-32 xl:w-32 [@media(max-height:780px)]:!hidden">
        <svg viewBox="0 0 200 200" className="h-full w-full animate-spin-slow">
          <defs><path id="c" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
          <text className="fill-crema/85 font-display" fontSize="16">
            <textPath href="#c" textLength="486" lengthAdjust="spacing">Fiambres artesanales · Recetas austríacas · </textPath>
          </text>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-3xl text-oro xl:text-4xl">1972</span>
        </div>
      </motion.div>
    </section>
  )
}
