import Lenis from 'lenis'

let lenis = null

export function iniciarScroll() {
  // En pantallas táctiles queda el scroll nativo: es el que el dedo espera y el más fluido.
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return () => {}
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) })
  let raf
  const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); lenis.destroy(); lenis = null }
}

export function irA(target, offset = -120) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset })
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' })
}

export const pausarScroll = (p) => (p ? lenis?.stop() : lenis?.start())
