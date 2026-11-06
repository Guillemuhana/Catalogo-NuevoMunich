import { MessageCircle } from 'lucide-react'
import { linkWhatsApp } from '../lib/usePedido'
import { marca } from '../data/seed'

// Sello octogonal, como en el frente del envase.
function Sello({ texto }) {
  return (
    <div role="img" aria-label={`Exceso en ${texto.toLowerCase()}`} className="relative h-[68px] w-[68px] shrink-0 bg-white p-[2px] [clip-path:polygon(29%_0,71%_0,100%_29%,100%_71%,71%_100%,29%_100%,0_71%,0_29%)]">
      <div className="flex h-full w-full flex-col items-center justify-center bg-black px-1 text-center font-bold text-white uppercase [clip-path:polygon(29%_0,71%_0,100%_29%,100%_71%,71%_100%,29%_100%,0_71%,0_29%)]">
        <span className="text-[7.5px] leading-tight">Exceso en</span>
        <span className="text-[7.5px] leading-tight">{texto}</span>
      </div>
    </div>
  )
}

const celda = (v) => (v === null || v === undefined ? '—' : v)

export default function FichaNutricional({ producto }) {
  const { tabla, ingredientes, alergenos, sellos, nombre, pendienteTexto } = producto
  const consulta = `¡Hola Nuevo Munich! ¿Me pasan la información nutricional de ${nombre}?`
  const incompleta = tabla?.filas.some((f) => f.valor === null)

  return (
    <section aria-label="Información nutricional" className="mt-8 border-t border-white/10 pt-7">
      <h3 className="font-display text-2xl leading-none text-crema">Información nutricional</h3>

      {tabla ? (
        <>
          {tabla.porcion && <p className="texto-oro mt-3 text-sm font-bold">Porción {tabla.porcion}</p>}
          <div className="mt-3 overflow-hidden rounded-xl border border-white/10 text-sm">
            <div className="grid grid-cols-[1fr_auto_3.2rem] gap-2 bg-roble px-3 py-2.5 text-[11px] font-bold text-crema/75">
              <span />
              <span className="text-right">Cant. por porción</span>
              <span className="text-right">% VD (*)</span>
            </div>
            {tabla.filas.map((f, i) => (
              <div key={f.nombre} className={`grid grid-cols-[1fr_auto_3.2rem] items-center gap-2 px-3 py-2.5 ${i % 2 ? 'bg-humo/50' : 'bg-white/[.03]'}`}>
                <span className={`min-w-0 ${f.sub ? 'pl-3 text-crema/70' : 'text-crema'}`}>{f.nombre}</span>
                <span className="text-right whitespace-nowrap text-crema">{celda(f.valor)}</span>
                <span className="text-right text-crema/70">{f.vd === null ? '—' : f.vd}</span>
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] leading-relaxed text-crema/55">
            * % Valores Diarios con base a una dieta de 2.000 kcal u 8.400 kJ. Sus valores diarios pueden ser mayores o menores dependiendo de sus necesidades energéticas.
            {incompleta && ' "—": dato no disponible en esta ficha.'}
          </p>
        </>
      ) : (
        <div className="mt-3 rounded-xl border border-white/10 bg-humo/50 p-4">
          <p className="text-sm leading-relaxed text-crema/80">{pendienteTexto || 'Estamos cargando la tabla de este producto.'} La encontrás en la etiqueta del envase o te la pasamos por WhatsApp.</p>
          <a href={linkWhatsApp(consulta, marca.whatsappBot)} target="_blank" rel="noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#25D366]/60 px-4 text-sm font-bold text-[#25D366]">
            <MessageCircle size={16} /> Pedir la ficha
          </a>
        </div>
      )}

      {sellos?.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {sellos.map((s) => <Sello key={s} texto={s} />)}
        </div>
      )}

      {ingredientes && (
        <div className="mt-5">
          <h4 className="texto-oro text-xs font-bold tracking-[.14em] uppercase">Ingredientes</h4>
          <p className="mt-1.5 text-sm leading-relaxed font-light text-crema/85">{ingredientes}</p>
        </div>
      )}
      {alergenos && <p className="mt-3 text-sm font-bold text-oro uppercase">{alergenos}</p>}
      <p className="mt-3 text-[11px] leading-relaxed text-crema/50">Ante cualquier diferencia o por alergias, vale siempre la etiqueta del envase.</p>
    </section>
  )
}
