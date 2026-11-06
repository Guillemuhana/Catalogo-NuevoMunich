import { useEffect, useRef } from 'react'

// Humo que sube de los panchos de la foto principal.
const FOTO = { ancho: 1672, alto: 941 }
// Dónde está cada pancho en la foto (fracción del ancho y del alto), con su dispersión.
const FOCOS = [
  { x: .105, y: .30, dx: .045, dy: .10 },
  { x: .245, y: .37, dx: .045, dy: .09 },
  { x: .375, y: .37, dx: .045, dy: .09 },
]
const azar = (a, b) => a + Math.random() * (b - a)

// Voluta: varias nubecitas blandas a lo largo de una línea ondulada, para que no parezca una esfera.
function crearVoluta() {
  const t = 256
  const c = document.createElement('canvas')
  c.width = c.height = t
  const g = c.getContext('2d')
  const fase = azar(0, 6.28)
  const onda = azar(.09, .2)
  for (let i = 0; i < 70; i++) {
    const v = Math.random()
    const x = t * (.5 + Math.sin(v * 5 + fase) * onda + azar(-.05, .05))
    const y = t * (.12 + v * .76)
    const r = t * azar(.05, .16) * (1 - Math.abs(v - .5))  + t * .02
    const grad = g.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, 'rgba(244,238,230,.085)')
    grad.addColorStop(.55, 'rgba(236,228,218,.03)')
    grad.addColorStop(1, 'rgba(230,222,210,0)')
    g.fillStyle = grad
    g.beginPath()
    g.arc(x, y, r, 0, 6.3)
    g.fill()
  }
  return c
}

export default function Humo() {
  const ref = useRef(null)

  useEffect(() => {
    const lienzo = ref.current
    if (!lienzo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const ctx = lienzo.getContext('2d')
    const tactil = window.matchMedia('(pointer: coarse)').matches
    const volutas = Array.from({ length: 5 }, crearVoluta)
    const maximo = tactil ? 22 : 36
    const pasoMinimo = tactil ? 1000 / 30 : 0
    const vecino = lienzo.parentElement.querySelector('img')
    const caja = { w: 0, h: 0, escala: 1, ox: 0, oy: 0 }

    const medir = () => {
      const r = lienzo.parentElement.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, tactil ? 1.25 : 1.5)
      lienzo.width = Math.round(r.width * dpr)
      lienzo.height = Math.round(r.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Repite el cálculo de object-fit: cover para ubicar los panchos en cualquier pantalla
      const escala = Math.max(r.width / FOTO.ancho, r.height / FOTO.alto)
      const [px, py] = getComputedStyle(vecino).objectPosition.split(' ').map((v) => parseFloat(v) / 100)
      Object.assign(caja, { w: r.width, h: r.height, escala, ox: (r.width - FOTO.ancho * escala) * (px || 0), oy: (r.height - FOTO.alto * escala) * (py || 0) })
    }

    const nueva = (edad = 0) => {
      const f = FOCOS[Math.floor(Math.random() * FOCOS.length)]
      const anchoFoto = FOTO.ancho * caja.escala
      const vida = azar(5.5, 9.5)
      return {
        x: caja.ox + anchoFoto * (f.x + azar(-f.dx, f.dx)),
        y: caja.oy + FOTO.alto * caja.escala * (f.y + azar(-f.dy, f.dy)),
        vy: anchoFoto * azar(.014, .028),
        deriva: anchoFoto * azar(.004, .012),
        fase: azar(0, 6.28),
        giro: azar(-.1, .1),
        angulo: azar(-.25, .25),
        tam: anchoFoto * azar(.1, .17),
        fuerza: azar(.5, 1),
        sprite: volutas[Math.floor(Math.random() * volutas.length)],
        vida,
        edad,
      }
    }

    medir()
    // Arranca ya formado, sin esperar a que suba el primero
    let humo = Array.from({ length: maximo }, () => { const p = nueva(); p.edad = azar(0, p.vida); return p })
    let raf = 0
    let previo = 0
    const vista = { dentro: true }

    const cuadro = (ahora) => {
      raf = requestAnimationFrame(cuadro)
      if (!vista.dentro || document.hidden) { previo = ahora; return }
      const delta = ahora - previo
      if (delta < pasoMinimo) return
      const dt = Math.min(delta / 1000, .1)
      previo = ahora
      ctx.clearRect(0, 0, caja.w, caja.h)
      ctx.globalCompositeOperation = 'screen'
      humo = humo.map((p) => (p.edad + dt >= p.vida ? nueva() : p))
      for (const p of humo) {
        p.edad += dt
        const t = p.edad / p.vida
        const subida = p.vy * p.edad
        const x = p.x + Math.sin(p.fase + p.edad * .7) * p.deriva * (1 + t * 3)
        const y = p.y - subida
        // Aparece suave y se disipa al subir
        const alfa = Math.min(t / .18, 1) * (1 - t) ** 1.6 * p.fuerza
        const tam = p.tam * (.65 + t * 1.9)
        ctx.globalAlpha = alfa
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(p.angulo + p.giro * p.edad)
        ctx.drawImage(p.sprite, -tam / 2, -tam * .75, tam, tam * 1.5)
        ctx.restore()
      }
    }
    raf = requestAnimationFrame(cuadro)

    const ro = new ResizeObserver(medir)
    ro.observe(lienzo.parentElement)
    const io = new IntersectionObserver(([e]) => { vista.dentro = e.isIntersecting })
    io.observe(lienzo)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [])

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
}
