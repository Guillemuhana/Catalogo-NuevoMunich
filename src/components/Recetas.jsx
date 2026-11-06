import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { ChefHat, X } from 'lucide-react'
import { IconoInstagram } from './Instagram'
import { marca } from '../data/seed'
import { recetas } from '../data/recetas'
import { pausarScroll } from '../lib/scroll'

function RecetaModal({ receta, productos, onCerrar, onAbrir }) {
  useEffect(() => {
    pausarScroll(true)
    document.documentElement.style.overflow = 'hidden'
    const k = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', k)
    return () => {
      window.removeEventListener('keydown', k)
      document.documentElement.style.overflow = ''
      pausarScroll(false)
    }
  }, [onCerrar])

  const usados = receta.productos.map((s) => productos.find((p) => p.slug === s)).filter(Boolean)
  const subtitulo = 'mb-3 text-xs font-bold tracking-[.14em] uppercase'

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal aria-label={receta.titulo}>
      <motion.div onClick={onCerrar} className="absolute inset-0 bg-black/75 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: .4, ease: [.22, 1, .36, 1] }} className="relative w-full max-w-4xl">
        <button onClick={onCerrar} aria-label="Cerrar receta"
          className="absolute top-3 right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-humo/85 text-crema backdrop-blur transition hover:bg-munich"><X size={19} /></button>
        <div data-lenis-prevent className="grid max-h-[92svh] overflow-y-auto overscroll-contain rounded-t-3xl border border-white/10 bg-carbon md:grid-cols-[2fr_3fr] md:rounded-3xl">
          <img src={receta.foto} alt={receta.titulo} className="aspect-[4/3] w-full object-cover md:sticky md:top-0 md:aspect-auto md:h-full md:max-h-[92svh]" />
          <div className="min-w-0 p-6 md:p-9">
            <p className="mb-2 flex items-center gap-2 text-[11px] tracking-[.3em] text-oro uppercase"><ChefHat size={16} /> {receta.etiqueta}</p>
            <h3 className="pr-8 font-display text-4xl leading-[1.02] text-crema md:text-5xl">{receta.titulo}</h3>
            <p className="mt-3 leading-relaxed font-light text-crema/80">{receta.bajada}</p>

            <h4 className={`texto-oro mt-7 ${subtitulo}`}>{receta.tituloIngredientes || 'Ingredientes'}</h4>
            <ul className="space-y-1.5 text-crema/90">
              {receta.ingredientes.map((i) => (
                <li key={i} className="flex gap-2.5 leading-snug"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-oro" />{i}</li>
              ))}
            </ul>

            {receta.pasos.length > 0 && (
              <>
                <h4 className={`texto-oro mt-7 ${subtitulo}`}>Procedimiento</h4>
                <ol className="space-y-3">
                  {receta.pasos.map((p, n) => (
                    <li key={p} className="flex gap-3 leading-relaxed text-crema/90">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-oro text-sm font-bold text-humo">{n + 1}</span>{p}
                    </li>
                  ))}
                </ol>
              </>
            )}

            {receta.pendiente && <p className="mt-4 text-sm text-crema/70">El paso a paso completo está en nuestro Instagram.</p>}
            {receta.nota && <p className="mt-5 text-sm text-crema/70">{receta.nota}</p>}

            {usados.length > 0 && (
              <>
                <h4 className={`mt-7 text-crema/60 ${subtitulo}`}>Productos de esta receta</h4>
                <div className="flex flex-wrap gap-2">
                  {usados.map((p) => (
                    <button key={p.slug} onClick={() => { onCerrar(); onAbrir(p) }}
                      className="min-h-11 rounded-full border border-white/15 px-4 py-2 text-left text-sm text-crema transition hover:border-oro hover:text-oro">{p.nombre}</button>
                  ))}
                </div>
              </>
            )}

            <a href={marca.instagram} target="_blank" rel="noreferrer"
              className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-oro underline-offset-4 hover:underline">
              <IconoInstagram size={16} /> Publicada en {marca.instagramUsuario}
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Recetas({ productos, onAbrir }) {
  const [abierta, setAbierta] = useState(null)
  const cerrar = useState(() => () => setAbierta(null))[0]

  return (
    <section id="recetas" className="mx-auto mt-20 max-w-7xl px-5 md:mt-32 md:px-8">
      <div className="mb-8 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}>
          <p className="mb-3 flex items-center gap-2.5 text-[11px] tracking-[.4em] text-oro uppercase"><ChefHat size={18} /> Rincón del Chef</p>
          <h2 className="texto-oro w-fit pr-[.08em] font-display text-5xl leading-none italic md:text-7xl">Recetas</h2>
          <p className="mt-4 max-w-xl font-light text-crema/80">Ideas de nuestra cocina para disfrutar los productos Nuevo Munich en casa.</p>
        </motion.div>
        <a href={marca.instagram} target="_blank" rel="noreferrer"
          className="inline-flex min-h-12 w-fit shrink-0 items-center gap-2.5 rounded-full border border-oro/60 px-6 py-3 text-sm font-bold text-oro transition hover:bg-oro hover:text-humo">
          <IconoInstagram size={17} /> Más recetas en Instagram
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {recetas.map((r, i) => (
          <motion.button key={r.slug} onClick={() => setAbierta(r)} aria-label={`Ver receta: ${r.titulo}`}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: .6, delay: i * .07, ease: [.22, 1, .36, 1] }}
            className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/[.07] bg-carbon text-left transition duration-300 hover:-translate-y-1 hover:border-oro/40">
            <span className="block aspect-[4/3] w-full overflow-hidden bg-roble lg:aspect-[4/5]">
              <img src={r.foto} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            </span>
            <span className="flex flex-1 flex-col p-5 md:p-6">
              <span className="mb-2 text-[11px] tracking-[.25em] text-oro uppercase">{r.etiqueta}</span>
              <span className="font-display text-3xl leading-[1.05] text-crema">{r.titulo}</span>
              <span className="mt-2 leading-snug font-light text-crema/75">{r.bajada}</span>
              <span className="mt-auto pt-4 text-sm font-bold text-oro">{r.pasos.length ? 'Ver receta' : 'Ver qué trae'} →</span>
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {abierta && <RecetaModal key={abierta.slug} receta={abierta} productos={productos} onCerrar={cerrar} onAbrir={onAbrir} />}
      </AnimatePresence>
    </section>
  )
}
