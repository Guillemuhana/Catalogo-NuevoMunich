import { motion } from 'motion/react'
import { Bot, Download, MessageCircle, Phone, Mail, Globe } from 'lucide-react'

const Instagram = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
)
const Facebook = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z" /></svg>
)
import { marca } from '../data/seed'
import { linkWhatsApp } from '../lib/usePedido'

export default function Footer() {
  const links = [
    { i: Bot, t: 'Asistente virtual', v: '+54 9 351 701-0545', h: linkWhatsApp('¡Hola Nuevo Munich! Vengo del catálogo online.', marca.whatsappBot) },
    { i: MessageCircle, t: 'Ventas', v: '+54 9 351 384-4802', h: linkWhatsApp('¡Hola Nuevo Munich! Vengo del catálogo online.') },
    { i: Phone, t: 'Teléfono', v: marca.telefono, h: 'tel:+543514998803' },
    { i: Mail, t: 'Email', v: marca.email, h: `mailto:${marca.email}` },
    { i: Instagram, t: 'Instagram', v: marca.instagramUsuario, h: marca.instagram },
    { i: Download, t: 'Catálogo PDF', v: 'Descargar', h: marca.catalogoPdf, descarga: true },
  ]
  return (
    <footer id="contacto" className="relative overflow-hidden pt-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: [.22, 1, .36, 1] }}
          className="font-display text-6xl leading-[.9] md:text-[8rem]">
          ¿Hacemos <br /><span className="texto-oro pr-[.08em] italic">tu pedido?</span>
        </motion.h2>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {links.map(({ i: I, t, v, h, descarga }) => (
            <a key={t} href={h} {...(descarga ? { download: true } : { target: '_blank', rel: 'noreferrer' })}
              className="group flex min-w-0 items-center gap-5 rounded-3xl border border-white/10 p-5 transition hover:border-munich hover:bg-munich/10 md:p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-crema text-humo transition group-hover:bg-munich group-hover:text-crema"><I size={20} /></span>
              <span className="min-w-0">
                <span className="block text-[11px] tracking-[.25em] text-crema/50 uppercase">{t}</span>
                <span className="block truncate text-crema">{v}</span>
              </span>
            </a>
          ))}
        </div>

        <div className="mt-24 flex flex-col items-center justify-between gap-6 border-t border-white/5 py-10 md:flex-row">
          <img src={marca.logo} alt="Nuevo Munich" className="h-20" />
          <p className="text-center text-xs text-crema/40">Nuevo Munich SRL · Fiambres artesanales · Córdoba, Argentina · Desde 1972</p>
          <div className="flex gap-2">
            {[[Instagram, marca.instagram], [Facebook, marca.facebook], [Globe, marca.web]].map(([I, h]) => (
              <a key={h} href={h} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-crema/70 transition hover:border-oro hover:text-oro"><I size={16} /></a>
            ))}
          </div>
        </div>
      </div>
      <p className="pointer-events-none -mb-[2.5vw] text-center font-display text-[17vw] leading-none text-white/[.03] select-none">Nuevo Munich</p>
    </footer>
  )
}
