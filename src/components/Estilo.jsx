// Piezas gráficas copiadas del estilo de los estados de WhatsApp de la marca:
// título en letra de pincel, trazos celestes, sellos redondos y fila de beneficios.
import { WheatOff } from 'lucide-react'

// Dos rayitas celestes a cada lado del título
export function Chispas({ lado = 'izq', className = '' }) {
  const d = lado === 'izq' ? 'M20 6 L8 2 M22 14 L4 14 M20 22 L8 26' : 'M4 6 L16 2 M2 14 L20 14 M4 22 L16 26'
  return (
    <svg viewBox="0 0 24 28" aria-hidden className={`h-[.42em] w-auto shrink-0 text-celeste ${className}`}>
      <path d={d} stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

// Pincelada celeste debajo del título, más gruesa en el centro
export function Trazo({ className = '' }) {
  return (
    <svg viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden className={`block h-2.5 text-celeste ${className}`}>
      <path d="M2 9 C 60 4, 140 2, 298 5 C 200 8, 110 11, 30 12 Z" fill="currentColor" />
    </svg>
  )
}

// Título blanco en letra de pincel con chispas y pincelada, y una bajada manuscrita opcional
export function TituloPincel({ children, bajada, as: Tag = 'h2', className = '', tamano = 'text-6xl md:text-8xl' }) {
  return (
    <div className={`w-fit ${className}`}>
      <Tag className={`flex items-center gap-[.18em] font-pincel leading-[1.1] text-white ${tamano}`}>
        <Chispas lado="izq" /><span className="pr-[.06em]">{children}</span><Chispas lado="der" />
      </Tag>
      <Trazo className="mx-auto -mt-1 w-4/5" />
      {bajada && <p className="mt-2 text-center font-manuscrita text-2xl text-white/90 md:text-3xl">{bajada}</p>}
    </div>
  )
}

// Sello redondo tipo "Excelente sabor"
export function Sello({ arriba, abajo, estrellas = true, chico = false, className = '' }) {
  const letra = chico ? 'text-[11px]' : 'text-[15px]'
  return (
    <span className={`flex aspect-square ${chico ? 'w-20' : 'w-28'} shrink-0 -rotate-6 flex-col items-center justify-center rounded-full border-2 border-white/80 bg-humo/85 text-center shadow-xl outline-2 outline-offset-[-7px] outline-celeste/70 outline-dashed backdrop-blur-sm ${className}`}>
      {estrellas && <span className="text-[10px] tracking-[.2em] text-oro">★★★</span>}
      <span className={`${letra} leading-[1.05] font-bold text-white uppercase`}>{arriba}</span>
      {abajo && <span className={`${letra} leading-[1.05] font-bold text-white uppercase`}>{abajo}</span>}
      <span className="mt-1 h-0.5 w-10 rounded-full bg-celeste" />
    </span>
  )
}

// Insignia roja "Sin gluten"
export function SinGluten({ className = '' }) {
  return (
    <span title="Sin gluten" className={`flex aspect-square flex-col items-center justify-center rounded-full border-2 border-white bg-munich-deep text-white shadow-lg ${className}`}>
      <WheatOff className="h-[45%] w-[45%] text-oro" strokeWidth={2.2} />
      <span className="text-[.5em] leading-none font-bold tracking-tight uppercase">Sin gluten</span>
    </span>
  )
}

// Fila de tres beneficios separados por rayas celestes
export function Beneficios({ items, className = '' }) {
  return (
    <ul className={`grid grid-cols-3 ${className}`}>
      {items.map(({ icono: Icono, texto }, i) => (
        <li key={texto} className={`flex flex-col items-center gap-1.5 px-2 text-center ${i ? 'border-l-2 border-celeste/80' : ''}`}>
          <Icono size={26} strokeWidth={1.6} className="text-white" />
          <span className="text-[11px] leading-tight font-bold tracking-wide text-white uppercase md:text-xs">{texto}</span>
        </li>
      ))}
    </ul>
  )
}
