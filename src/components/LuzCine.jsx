// Iluminación de cine sobre la foto principal:
// - luz cálida que titila sobre los panchos, como el reflejo de la parrilla;
// - haces de luz en diagonal que atraviesan el humo, con motas de polvo flotando.
// La posición de la comida se ajusta por CSS (--fx, --fy) según la foto que se muestre.
const rayos = [
  { x: '8%', w: '9%', d: '9s', del: '0s' },
  { x: '22%', w: '14%', d: '12s', del: '-4s' },
  { x: '40%', w: '7%', d: '10s', del: '-7s' },
]

const motas = Array.from({ length: 22 }, (_, i) => ({
  left: `${8 + ((i * 41) % 44)}%`,
  top: `${10 + ((i * 29) % 60)}%`,
  size: 1.5 + (i % 3) * .8,
  dur: `${11 + ((i * 7) % 10)}s`,
  del: `${-((i * 3.1) % 14)}s`,
}))

export default function LuzCine() {
  return (
    <div aria-hidden className="luz-cine pointer-events-none absolute inset-0">
      <div className="luz-brasa" />
      <div className="rayos">
        {rayos.map((r) => (
          <span key={r.x} className="rayo" style={{ '--x': r.x, '--w': r.w, '--d': r.d, '--del': r.del }} />
        ))}
        {motas.map((m, i) => (
          <span key={i} className="mota" style={{ left: m.left, top: m.top, width: m.size, height: m.size, '--d': m.dur, '--del': m.del }} />
        ))}
      </div>
    </div>
  )
}
