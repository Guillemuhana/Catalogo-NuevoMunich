// Recorta el fondo de la foto de cada producto para "Armá tu caja", con un modelo de segmentación local.
// Requiere (no queda en package.json porque es pesado): npm i --no-save @imgly/background-removal-node
// Uso: node scripts/recortes-caja.mjs [slug ...]  →  public/img/caja/<slug>.webp y src/data/recortes.json
import { mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// El modelo trae su propia versión de sharp, que choca con la del proyecto: corre en un proceso aparte.
// node recortes-caja.mjs --modelo entrada.png salida.png ...
if (process.argv[2] === '--modelo') {
  let removeBackground
  try {
    ({ removeBackground } = await import('@imgly/background-removal-node'))
  } catch {
    console.error('Falta el modelo de recorte. Instalalo con:\n  npm i --no-save @imgly/background-removal-node')
    process.exit(1)
  }
  const pares = process.argv.slice(3)
  for (let i = 0; i < pares.length; i += 2) {
    const blob = await removeBackground(new Blob([readFileSync(pares[i])], { type: 'image/png' }), { model: 'medium', output: { format: 'image/png' } })
    writeFileSync(pares[i + 1], Buffer.from(await blob.arrayBuffer()))
  }
  process.exit(0)
}

const sharp = (await import('sharp')).default
const { productos } = await import('../src/data/seed.js')
const TEMP = join(tmpdir(), 'nm-recortes')
mkdirSync(TEMP, { recursive: true })

const SALIDA = 'public/img/caja'
const ANCHO = 600
mkdirSync(SALIDA, { recursive: true })

// Fotos donde el producto aparece solo (la primera tiene otras cosas alrededor) y recorte previo de la zona.
const ELEGIDA = {
  'salames-salame-pepperoni': { foto: 'img/productos/salames-salame-pepperoni/2.webp', zona: { left: 300, top: 60, width: 700, height: 560 } },
  'salchichas-salchicha-tipo-frankfurt': { foto: 'img/productos/salchichas-salchicha-tipo-frankfurt/2.webp' },
}

// Se queda con la mancha más grande de la máscara (saca sellos, migas, reflejos sueltos)
function mayorMancha(alfa, w, h) {
  const marca = new Int32Array(w * h)
  let mejor = 0, mejorTam = 0, id = 0
  for (let k = 0; k < w * h; k++) {
    if (alfa[k] < 128 || marca[k]) continue
    id++
    let tam = 0
    const pila = [k]
    marca[k] = id
    while (pila.length) {
      const q = pila.pop(), x = q % w, y = (q / w) | 0
      tam++
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
        const n = ny * w + nx
        if (!marca[n] && alfa[n] >= 128) { marca[n] = id; pila.push(n) }
      }
    }
    if (tam > mejorTam) { mejorTam = tam; mejor = id }
  }
  // Conserva el borde suave alrededor de la mancha elegida
  const dentro = new Uint8Array(w * h)
  for (let k = 0; k < w * h; k++) if (marca[k] === mejor) dentro[k] = 1
  const r = 3
  const cerca = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!dentro[y * w + x]) continue
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const nx = x + dx, ny = y + dy
      if (nx >= 0 && ny >= 0 && nx < w && ny < h) cerca[ny * w + nx] = 1
    }
  }
  return cerca
}

// Primera pasada: prepara la foto de cada producto
function preparar(p) {
  const fotos = p.imagenes?.length ? p.imagenes : [p.imagen_url].filter(Boolean)
  const elegida = ELEGIDA[p.slug]
  const src = elegida?.foto || fotos[0]
  if (!src || !existsSync(`public/${src}`)) return false

  let img = sharp(`public/${src}`)
  if (elegida?.zona) img = img.extract(elegida.zona)
  return img.png().toFile(join(TEMP, `${p.slug}.png`)).then(() => true)
}

// Segunda pasada: limpia la máscara que devolvió el modelo y guarda el recorte
async function terminar(p) {
  const { data, info } = await sharp(join(TEMP, `${p.slug}-sin-fondo.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info

  // El modelo a veces se queda solo con la etiqueta: se suma todo lo que tiene color propio
  // (la carne contra el fondo blanco/gris), suavizado para que no quede dentado.
  // Los colores salen de la foto original: en lo transparente el modelo deja cualquier cosa.
  const orig = await sharp(join(TEMP, `${p.slug}.png`)).removeAlpha().raw().toBuffer()
  const fondoBlanco = !ELEGIDA[p.slug]?.zona
  const colorido = Buffer.alloc(w * h)
  for (let k = 0; k < w * h; k++) {
    const r = orig[k * 3], g = orig[k * 3 + 1], b = orig[k * 3 + 2]
    data[k * 4] = r; data[k * 4 + 1] = g; data[k * 4 + 2] = b
    const croma = Math.max(r, g, b) - Math.min(r, g, b)
    colorido[k] = fondoBlanco && (croma > 34 || (r + g + b) / 3 < 120) ? 255 : 0
  }
  const colSuave = await sharp(colorido, { raw: { width: w, height: h, channels: 1 } }).median(5).blur(1.2).extractChannel(0).raw().toBuffer()
  const alfa = new Uint8Array(w * h)
  for (let k = 0; k < w * h; k++) alfa[k] = Math.max(data[k * 4 + 3], colSuave[k])

  // Rellena los agujeros: lo transparente que no toca el borde es parte del producto (etiquetas)
  const afuera = new Uint8Array(w * h)
  const cola = []
  const meter = (x, y) => {
    const k = y * w + x
    if (afuera[k] || alfa[k] >= 128) return
    afuera[k] = 1; cola.push(k)
  }
  for (let x = 0; x < w; x++) { meter(x, 0); meter(x, h - 1) }
  for (let y = 0; y < h; y++) { meter(0, y); meter(w - 1, y) }
  while (cola.length) {
    const k = cola.pop(), x = k % w, y = (k / w) | 0
    if (x > 0) meter(x - 1, y)
    if (x < w - 1) meter(x + 1, y)
    if (y > 0) meter(x, y - 1)
    if (y < h - 1) meter(x, y + 1)
  }
  for (let k = 0; k < w * h; k++) if (!afuera[k] && alfa[k] < 128) alfa[k] = 255

  const vale = mayorMancha(alfa, w, h)
  for (let k = 0; k < w * h; k++) {
    // Curva de alfa: borra sombras y reflejos fantasma, deja el borde con antialias
    const a = vale[k] ? Math.max(0, Math.min(255, (alfa[k] - 40) * 1.4)) : 0
    data[k * 4 + 3] = a
  }
  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 1 })
    .resize({ width: ANCHO, height: ANCHO, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 95 })
    .toFile(`${SALIDA}/${p.slug}.webp`)
  return true
}

const pedidos = process.argv.slice(2)
const archivo = 'src/data/recortes.json'
const listos = new Set(pedidos.length && existsSync(archivo) ? JSON.parse(readFileSync(archivo, 'utf8')) : [])
const lote = []
for (const p of productos) {
  if (pedidos.length && !pedidos.includes(p.slug)) continue
  if (await preparar(p)) lote.push(p); else console.log('✗', p.slug, '(sin foto)')
}
execFileSync(process.execPath, [import.meta.filename, '--modelo', ...lote.flatMap((p) => [join(TEMP, `${p.slug}.png`), join(TEMP, `${p.slug}-sin-fondo.png`)])], { stdio: 'inherit' })
for (const p of lote) {
  await terminar(p)
  listos.add(p.slug)
  console.log('✓', p.slug)
}
rmSync(TEMP, { recursive: true, force: true })
const orden = productos.map((p) => p.slug).filter((s) => listos.has(s))
writeFileSync(archivo, JSON.stringify(orden, null, 1) + '\n')
console.log(`${orden.length} de ${productos.length} productos recortados`)
