import { useState } from 'react'
import { fotosDe, miniatura } from '../lib/data'

// Foto principal del producto. Si no hay (o falla), un placeholder tipográfico.
export default function ProductImage({ producto, categoria, className = '', mini = false }) {
  const [error, setError] = useState(false)
  const foto = fotosDe(producto)[0]

  if (foto && !error)
    return (
      <img
        src={miniatura(foto)}
        alt={mini ? '' : producto.nombre}
        loading="lazy"
        decoding="async"
        onError={() => setError(true)}
        className={`h-full w-full bg-white object-cover ${className}`}
      />
    )

  if (mini)
    return <div className={`flex h-full w-full items-center justify-center bg-roble font-display text-2xl text-munich ${className}`}>{producto.nombre[0]}</div>

  return (
    <div className={`flex h-full w-full flex-col items-center justify-center bg-roble p-6 text-center ${className}`}>
      <span className="mb-2 text-[10px] tracking-[.35em] text-oro/80 uppercase">{categoria?.nombre}</span>
      <span className="font-display text-2xl leading-[.95] text-crema">{producto.nombre}</span>
      <span className="mt-3 h-px w-10 bg-munich" />
    </div>
  )
}
