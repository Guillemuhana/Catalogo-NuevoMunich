// Recorta el fondo blanco de la foto del envase de cada producto para "Armá tu caja".
// Uso: node scripts/recortes-caja.mjs  →  public/img/caja/<slug>.webp y src/data/recortes.json
import sharp from 'sharp'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { productos } from '../src/data/seed.js'

const SALIDA = 'public/img/caja'
mkdirSync(SALIDA, { recursive: true })

const blanco = (d, i) => {
  const r = d[i], g = d[i + 1], b = d[i + 2]
  return r > 228 && g > 228 && b > 228 && Math.max(r, g, b) - Math.min(r, g, b) < 22
}

async function recortar(src, destino) {
  const img = sharp(`public/${src}`).resize({ width: 520, withoutEnlargement: true }).ensureAlpha()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  // Solo sirve si el fondo es blanco: al menos 85 % del borde tiene que ser blanco
  let bordeBlanco = 0, borde = 0
  for (let x = 0; x < w; x++) for (const y of [0, h - 1]) { borde++; if (blanco(data, (y * w + x) * 4)) bordeBlanco++ }
  for (let y = 0; y < h; y++) for (const x of [0, w - 1]) { borde++; if (blanco(data, (y * w + x) * 4)) bordeBlanco++ }
  if (bordeBlanco / borde < .85) return false

  // Relleno desde el borde: todo el blanco conectado con el borde pasa a ser transparente
  const fondo = new Uint8Array(w * h)
  const cola = []
  const meter = (x, y) => {
    const k = y * w + x
    if (x < 0 || y < 0 || x >= w || y >= h || fondo[k] || !blanco(data, k * 4)) return
    fondo[k] = 1; cola.push(k)
  }
  for (let x = 0; x < w; x++) { meter(x, 0); meter(x, h - 1) }
  for (let y = 0; y < h; y++) { meter(0, y); meter(w - 1, y) }
  while (cola.length) {
    const k = cola.pop(), x = k % w, y = (k / w) | 0
    meter(x + 1, y); meter(x - 1, y); meter(x, y + 1); meter(x, y - 1)
  }
  // Borde suave: los píxeles de fondo pegados al producto quedan semitransparentes
  for (let k = 0; k < w * h; k++) {
    if (!fondo[k]) continue
    const x = k % w, y = (k / w) | 0
    const vecino = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
      const nx = x + dx, ny = y + dy
      return nx >= 0 && ny >= 0 && nx < w && ny < h && !fondo[ny * w + nx]
    })
    data[k * 4 + 3] = vecino ? 45 : 0
  }
  await sharp(data, { raw: { width: w, height: h, channels: 4 } }).trim({ threshold: 1 }).webp({ quality: 82, alphaQuality: 90 }).toFile(destino)
  return true
}

const listos = []
for (const p of productos) {
  const fotos = p.imagenes?.length ? p.imagenes : [p.imagen_url].filter(Boolean)
  for (const f of fotos) {
    if (!f || !existsSync(`public/${f}`)) continue
    if (await recortar(f, `${SALIDA}/${p.slug}.webp`)) { listos.push(p.slug); break }
  }
}
writeFileSync('src/data/recortes.json', JSON.stringify(listos, null, 1) + '\n')
console.log(`${listos.length} de ${productos.length} productos recortados`)
