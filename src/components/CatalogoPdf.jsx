import { motion } from 'motion/react'
import { Download } from 'lucide-react'
import { marca } from '../data/seed'
import info from '../data/catalogo-pdf.json'

export const datoPdf = `PDF · ${info.paginas} páginas · ${String(info.tamanoMB).replace('.', ',')} MB`

export default function CatalogoPdf() {
  return (
    <section id="catalogo-pdf" className="mx-auto mt-10 max-w-7xl px-5 md:mt-14 md:px-8">
      <div className="doodles relative grid items-center gap-6 overflow-hidden rounded-[2rem] border border-white/10 bg-carbon p-6 sm:grid-cols-[auto_1fr] md:gap-12 md:p-10">
        <motion.a href={marca.catalogoPdf} download aria-hidden tabIndex={-1}
          initial={{ opacity: 0, rotate: -9, y: 24 }} whileInView={{ opacity: 1, rotate: -5, y: 0 }} viewport={{ once: true }} transition={{ duration: .8 }}
          whileHover={{ rotate: 0, scale: 1.05 }}
          className="mx-auto block w-36 overflow-hidden rounded-lg shadow-[0_24px_50px_rgba(0,0,0,.6)] md:w-44">
          <img src={marca.catalogoTapa} alt="" loading="lazy" width="520" height="735" className="block aspect-[520/735] h-auto w-full" />
        </motion.a>
        <div>
          <p className="mb-2 text-[11px] tracking-[.35em] text-oro uppercase">Para compartir o imprimir</p>
          <h2 className="font-display text-4xl leading-none text-crema md:text-5xl">Llevate el catálogo <span className="texto-oro italic">completo</span></h2>
          <p className="mt-3 max-w-xl text-sm font-light text-crema/75 md:text-base">Todos los productos con fotos, ingredientes y presentaciones. Tocá cualquiera dentro del PDF para consultarlo por WhatsApp.</p>
          <a href={marca.catalogoPdf} download className="mt-5 inline-flex h-14 items-center gap-3 rounded-full bg-oro px-7 text-xs font-bold tracking-[.18em] text-humo uppercase transition hover:brightness-110">
            <Download size={18} /> Descargar PDF
          </a>
          <p className="mt-2 text-xs text-crema/50">{datoPdf}</p>
        </div>
      </div>
    </section>
  )
}
