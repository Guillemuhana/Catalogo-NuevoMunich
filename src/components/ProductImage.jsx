import { useState } from 'react'

// Muestra la foto del producto; si no hay (o falla), un placeholder tipográfico
// sobre la foto de la categoría, para que nunca quede un hueco feo.
export default function ProductImage({ producto, categoria, className = '', grande = false, mini = false }) {
  const [error, setError] = useState(false)
  const src = !error && producto.imagen_url

  if (src)
    return (
      <img
        src={src}
        alt={producto.nombre}
        loading="lazy"
        decoding="async"
        onError={() => setError(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    )

  return (
    <div className={`relative h-full w-full overflow-hidden bg-roble ${className}`}>
      {categoria?.imagen_url && (
        <img src={categoria.imagen_url} alt="" aria-hidden loading="lazy"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-[2px] saturate-[.8]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-humo via-humo/40 to-transparent" />
      {mini ? (
        <div className="relative flex h-full items-center justify-center font-display text-3xl text-munich">{producto.nombre[0]}</div>
      ) : (
      <div className="relative flex h-full flex-col items-center justify-center p-6 text-center">
        <span className="mb-2 text-[10px] tracking-[.35em] text-oro/80 uppercase">{categoria?.nombre}</span>
        <span className={`font-display leading-[.95] text-crema ${grande ? 'text-5xl' : 'text-2xl'}`}>{producto.nombre}</span>
        <span className="mt-3 h-px w-10 bg-munich" />
      </div>
      )}
    </div>
  )
}
