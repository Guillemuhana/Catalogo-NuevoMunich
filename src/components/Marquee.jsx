export default function Marquee({ items }) {
  const fila = [...items, ...items]
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-carbon py-5">
      <div className="flex w-max animate-marquee items-center gap-10">
        {[...fila, ...fila].map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-3xl whitespace-nowrap text-crema/80 md:text-4xl">
            {t}
            <svg width="14" height="14" viewBox="0 0 10 10" className="fill-munich"><path d="M5 0 10 5 5 10 0 5z" /></svg>
          </span>
        ))}
      </div>
    </div>
  )
}
