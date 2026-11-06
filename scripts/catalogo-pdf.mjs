// Genera public/catalogo-nuevo-munich.pdf a partir de src/data/seed.js.
//   npm run catalogo
// Usa el Chrome instalado en la PC (o el que indique CHROME_PATH).
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'
import { categorias, marca, productos } from '../src/data/seed.js'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(raiz, 'public')
const temp = join(tmpdir(), 'nm-catalogo-pdf')
mkdirSync(temp, { recursive: true })

const SITIO = process.env.CATALOGO_URL || 'https://catalogo-nuevo-munich.vercel.app'
const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find((c) => c && existsSync(c))
if (!CHROME) throw new Error('No encontré Chrome. Indicá la ruta con CHROME_PATH.')

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const wa = (numero, texto) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
const telVisible = (n) => `+54 9 351 ${n.slice(-7, -4)}-${n.slice(-4)}`

// El PDF guarda los JPEG tal cual; otros formatos los infla. Por eso se convierte todo acá.
const usadas = new Map()
async function jpg(ruta, ancho, calidad = 78) {
  const clave = `${ruta}|${ancho}`
  if (!usadas.has(clave)) {
    const destino = join(temp, `${clave.replace(/[^\w]+/g, '_')}.jpg`)
    await sharp(join(pub, ruta)).flatten({ background: '#ffffff' }).resize({ width: ancho, withoutEnlargement: true }).jpeg({ quality: calidad, mozjpeg: true }).toFile(destino)
    usadas.set(clave, pathToFileURL(destino).href)
  }
  return usadas.get(clave)
}
// Los degradados transparentes no se ven igual en todos los visores de PDF: se integran en la imagen.
const CARBON = '#1d1815'
const HUMO = '#14100d'
async function bandaImg(ruta) {
  const destino = join(temp, `banda_${ruta.replace(/[^\w]+/g, '_')}.jpg`)
  const W = 1400, H = 400, ancho = Math.round(W * .62)
  const foto = await sharp(join(pub, ruta)).flatten({ background: '#ffffff' }).resize(ancho, H, { fit: 'cover' }).toBuffer()
  const velo = Buffer.from(`<svg width="${W}" height="${H}"><defs><linearGradient id="g"><stop offset=".38" stop-color="${CARBON}"/><stop offset=".52" stop-color="${CARBON}" stop-opacity=".75"/><stop offset=".7" stop-color="${CARBON}" stop-opacity="0"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`)
  await sharp({ create: { width: W, height: H, channels: 3, background: CARBON } }).composite([{ input: foto, left: W - ancho, top: 0 }, { input: velo, left: 0, top: 0 }]).jpeg({ quality: 82, mozjpeg: true }).toFile(destino)
  return pathToFileURL(destino).href
}
async function tapaImg(ruta) {
  const destino = join(temp, 'tapa.jpg')
  const W = 1240, H = 1052
  const foto = await sharp(join(pub, ruta)).resize(W, H, { fit: 'cover', position: 'left top' }).toBuffer()
  const velo = Buffer.from(`<svg width="${W}" height="${H}"><defs><linearGradient id="g" x2="0" y2="1"><stop offset=".72" stop-color="${HUMO}" stop-opacity="0"/><stop offset="1" stop-color="${HUMO}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`)
  await sharp(foto).composite([{ input: velo, left: 0, top: 0 }]).jpeg({ quality: 84, mozjpeg: true }).toFile(destino)
  return pathToFileURL(destino).href
}

const fuente = (familia, paquete, peso) => {
  const f = pathToFileURL(join(raiz, `node_modules/@fontsource/${paquete}/files/${paquete}-latin-${peso}-normal.woff2`)).href
  return `@font-face{font-family:'${familia}';font-weight:${peso};src:url('${f}') format('woff2')}`
}

const ENVASES_TAPA = [
  'feteados-bondiola',
  'arrollados-arrollado-de-pollo',
  'jamones-jamon-cocido-tipo-bavaro',
  'salames-salame-tipo-colonia',
  'linea-ogianco-matambre-arrollado-ogianco',
]

const POR_PAGINA = 6
const paginas = []
for (const c of categorias.slice().sort((a, b) => a.orden - b.orden)) {
  const lista = productos.filter((p) => p.categoria === c.slug)
  for (let i = 0; i < lista.length; i += POR_PAGINA)
    paginas.push({ c, lista: lista.slice(i, i + POR_PAGINA), primera: i === 0, total: lista.length })
}
const PRIMERA_PRODUCTOS = 3
const paginaDe = new Map()
paginas.forEach((p, i) => { if (p.primera) paginaDe.set(p.c.slug, PRIMERA_PRODUCTOS + i) })
const PAG_FOODTRUCK = PRIMERA_PRODUCTOS + paginas.length
const TOTAL = PAG_FOODTRUCK + 1

const pie = (n, oscuro = false) => `
  <footer class="pie ${oscuro ? 'pie-oscuro' : ''}">
    <span>Nuevo Munich · Artesanos del Sabor desde 1972</span>
    <span>Tocá un producto para consultarlo por WhatsApp</span>
    <b>${n}</b>
  </footer>`

async function ficha(p) {
  const link = wa(marca.whatsapp, `¡Hola Nuevo Munich! Quería consultar por ${p.nombre}. ¿Precio y disponibilidad?`)
  return `
    <article class="ficha">
      <a class="foto" href="${esc(link)}"><img src="${await jpg(p.imagenes[0], 620)}" alt=""></a>
      ${p.nuevo ? '<span class="clasico">Nuevo envase</span>' : p.destacado ? '<span class="clasico">★ Clásico</span>' : ''}
      <div class="txt">
        <h3><a href="${esc(link)}">${esc(p.nombre)}</a></h3>
        ${p.presentaciones.length ? `<p class="pres">${p.presentaciones.map((x) => `<span>${esc(x)}</span>`).join('')}</p>` : ''}
        ${p.descripcion ? `<p class="dato">${esc(p.descripcion)}</p>` : ''}
        ${p.ingredientes ? `<p class="dato"><b>Ingredientes</b>${esc(p.ingredientes.replace(/ \*Harina de trigo enriquecida.*$/, ''))}</p>` : ''}
        ${p.alergenos ? `<p class="dato alergeno">${esc(p.alergenos)}</p>` : ''}
        <p class="dato"><b>Sugerencia</b>${esc(p.sugerencias)}</p>
      </div>
    </article>`
}

// Lo que sobra de una grilla se completa con fotos de ambiente, sin dejar huecos.
const ambientes = (c, lista) => lista.filter((p) => p.imagenes.length > 1 && p.slug !== 'especialidades-bondiola').map((p) => p.imagenes.at(-1))
async function relleno(c, todos, usados, span) {
  const opciones = ambientes(c, todos).reverse()
  const foto = opciones.find((f) => !usados.has(f)) || opciones[0]
  usados.add(foto)
  return `<div class="relleno" style="grid-column:span ${span}"><img src="${await jpg(foto, span > 1 ? 1080 : 620)}" alt=""></div>`
}

async function paginaProductos(pag, n) {
  const { c, lista, primera, total } = pag
  const fichas = (await Promise.all(lista.map(ficha))).join('')
  const usados = new Set()
  const todos = productos.filter((p) => p.categoria === c.slug)
  let extra = ''
  const resto = lista.length % 3
  if (resto) extra += await relleno(c, lista, usados, 3 - resto)
  if (lista.length <= 3) extra += await relleno(c, todos, usados, 3)
  const logo = c.slug === 'linea-ogianco' ? `<img class="logo-linea" src="${pathToFileURL(join(temp, 'ogianco.png')).href}" alt="">` : ''
  const cabeza = primera
    ? `<header class="banda" id="cat-${c.slug}">
        <img src="${await bandaImg(c.banner_url)}" alt="">
        <div class="banda-txt">
          ${logo}
          <small>${String(c.orden).padStart(2, '0')} — ${total} productos</small>
          <h2>${esc(c.nombre)}</h2>
          <p>${esc(c.bajada)}</p>
        </div>
      </header>`
    : `<header class="sigue"><small>${String(c.orden).padStart(2, '0')}</small><h2>${esc(c.nombre)}</h2><span>continuación</span></header>`
  return `<section class="pagina clara">${cabeza}<div class="grilla ${primera ? '' : 'grilla-alta'}">${fichas}${extra}</div>${pie(n)}</section>`
}

async function armar() {
  await sharp(join(pub, marca.ogianco)).png().toFile(join(temp, 'ogianco.png'))
  await sharp(join(pub, marca.logo)).png().toFile(join(temp, 'logo.png'))
  const logoPng = pathToFileURL(join(temp, 'logo.png')).href

  // La foto de la tapa muestra salchichas: la franja suma envases del resto de las líneas.
  const envasesTapa = await Promise.all(ENVASES_TAPA.map(async (slug) => {
    const p = productos.find((x) => x.slug === slug)
    if (!p) throw new Error(`Envase de tapa inexistente: ${slug}`)
    const c = categorias.find((x) => x.slug === p.categoria)
    return `<a href="#cat-${c.slug}"><img src="${await jpg(p.imagenes[0], 420, 84)}" alt="${esc(p.nombre)}"><span>${esc(c.nombre)}</span></a>`
  }))

  const tapa = `
    <section class="pagina tapa">
      <img class="tapa-foto" src="${await tapaImg(marca.hero)}" alt="">
      <div class="tapa-envases">${envasesTapa.join('')}</div>
      <div class="tapa-txt">
        <img class="tapa-logo" src="${logoPng}" alt="Nuevo Munich">
        <small>Córdoba · Desde 1972</small>
        <h1>Catálogo<br>de <em>productos</em></h1>
        <p>Fiambres, salchichas y especialidades centroeuropeas. Recetas heredadas, hechas como en Austria.</p>
      </div>
    </section>`

  const tiles = await Promise.all(categorias.map(async (c) => `
    <a class="indice-item" href="#cat-${c.slug}">
      <span class="indice-foto ${c.slug === 'linea-ogianco' ? 'oscura' : ''}"><img src="${await jpg(c.imagen_url, 620, 84)}" alt=""></span>
      <span class="indice-txt"><b>${esc(c.nombre)}</b><i>${productos.filter((p) => p.categoria === c.slug).length} productos</i></span>
      <span class="indice-num">${paginaDe.get(c.slug)}</span>
    </a>`))
  const indice = `
    <section class="pagina clara indice">
      <small class="volanta">Nuestros productos</small>
      <h2>Una empresa <em>familiar</em>, un oficio heredado.</h2>
      <p class="intro">Desde 1972 elaboramos en Córdoba las recetas centroeuropeas que nuestros fundadores, de origen austríaco, trajeron consigo. Con certificación SENASA desde 2008 y proveedores de la Fiesta Nacional de la Cerveza.</p>
      <div class="indice-lista">${tiles.join('')}
        <a class="indice-item" href="#foodtruck">
          <span class="indice-foto"><img src="${await jpg(marca.foodtruck[0], 620)}" alt=""></span>
          <span class="indice-txt"><b>Food Truck</b><i>Para tu evento</i></span>
          <span class="indice-num">${PAG_FOODTRUCK}</span>
        </a>
      </div>
      ${pie(2)}
    </section>`

  const cuerpo = []
  for (let i = 0; i < paginas.length; i++) cuerpo.push(await paginaProductos(paginas[i], PRIMERA_PRODUCTOS + i))

  const foodtruck = `
    <section class="pagina ft" id="foodtruck">
      <img class="ft-foto" src="${await jpg(marca.foodtruck[0], 1280, 82)}" alt="">
      <div class="ft-cuerpo">
        <small class="volanta">Food Truck · Para tu evento</small>
        <h2>Vos ponés el evento.<br><em>Nosotros llevamos el sabor.</em></h2>
        <div class="ft-cols">
          <div><h3>Superpancho Premium</h3><p>Salchicha alemana Nuevo Munich en pan de papa con queso gratinado. Para terminarlo a gusto: mayonesa, mostaza, kétchup, lluvia de papa, chucrut, panceta crispy y salsa criolla.</p></div>
          <div><h3>Picada Nuevo Munich</h3><p>Salame tipo Colonia, bondiola, lomo de cerdo ahumado, entre otras variedades de fiambres, y tres variedades de quesos. Ideal para recepciones y celebraciones.</p></div>
        </div>
        <a class="ft-boton" href="${esc(wa(marca.whatsappFoodTruck, '¡Hola! Quiero consultar por el Food Truck de Nuevo Munich para un evento.'))}">Consultas y reservas · ${telVisible(marca.whatsappFoodTruck)}</a>
      </div>
      <img class="ft-foto2" src="${await jpg(marca.foodtruck[1], 1280, 82)}" alt="">
      ${pie(PAG_FOODTRUCK, true)}
    </section>`

  const contra = `
    <section class="pagina contra">
      <img class="contra-logo" src="${logoPng}" alt="Nuevo Munich">
      <h2>¿Hacemos <em>tu pedido?</em></h2>
      <p class="contra-bajada">Tocá para escribirnos o seguirnos</p>
      <div class="botones">
        <a class="boton verde" href="${esc(wa(marca.whatsappBot, '¡Hola Nuevo Munich! Vengo del catálogo en PDF.'))}"><b>Hacer un pedido por WhatsApp</b><i>Asistente virtual · ${telVisible(marca.whatsappBot)}</i></a>
        <a class="boton" href="${esc(wa(marca.whatsapp, '¡Hola Nuevo Munich! Vengo del catálogo en PDF.'))}"><b>Hablar con ventas</b><i>${telVisible(marca.whatsapp)}</i></a>
        <a class="boton" href="${marca.instagram}"><b>Seguinos en Instagram</b><i>${marca.instagramUsuario}</i></a>
        <a class="boton" href="${SITIO}"><b>Ver el catálogo online</b><i>${SITIO.replace('https://', '')}</i></a>
      </div>
      <p class="contactos"><a href="tel:+543514998803">Tel. ${marca.telefono}</a> · <a href="mailto:${marca.email}">${marca.email}</a> · <a href="${marca.facebook}">Facebook</a></p>
      <p class="firma">Nuevo Munich SRL · Fiambres artesanales · Córdoba, Argentina · Desde 1972</p>
    </section>`

  return `<!doctype html><html lang="es-AR"><head><meta charset="utf-8"><title>Nuevo Munich · Catálogo de productos</title><style>
${fuente('Cormorant Unicase', 'cormorant-unicase', 400)}${fuente('Cormorant Unicase', 'cormorant-unicase', 600)}${fuente('Cormorant Unicase', 'cormorant-unicase', 700)}
${fuente('Inria Sans', 'inria-sans', 300)}${fuente('Inria Sans', 'inria-sans', 400)}${fuente('Inria Sans', 'inria-sans', 700)}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
:root{--humo:#14100d;--carbon:#1d1815;--munich:#c04b54;--deep:#a3202f;--oro:#ffcc00;--oro2:#b8860b;--crema:#f4ebdd;--papel:#faf6ef;--tinta:#2b1910}
html,body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:'Inria Sans',sans-serif;color:var(--tinta)}
a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Cormorant Unicase',serif;font-weight:400}
em{font-style:italic}
.pagina{position:relative;width:210mm;height:297mm;overflow:hidden;break-after:page}
.pagina:last-child{break-after:auto}
.clara{background:var(--papel);display:flex;flex-direction:column}
.volanta{display:block;font-size:8pt;letter-spacing:.35em;text-transform:uppercase;color:var(--oro)}
.clara .volanta{color:var(--munich)}

.tapa{background:var(--humo);color:var(--crema)}
.tapa-foto{position:absolute;top:0;left:0;width:100%;height:178mm;display:block}
.tapa-envases{position:absolute;left:16mm;right:16mm;top:135mm;display:grid;grid-template-columns:repeat(5,1fr);gap:3mm}
.tapa-envases a{display:block;background:#fff;border-radius:2.5mm;overflow:hidden}
.tapa-envases img{display:block;width:100%;height:31mm;object-fit:contain}
.tapa-envases span{display:block;padding:1.3mm 1mm;background:var(--carbon);color:var(--crema);font-size:7pt;letter-spacing:.06em;text-align:center;white-space:nowrap}
.tapa-txt{position:absolute;left:16mm;right:16mm;top:180mm}
.tapa-logo{height:27mm;margin:0 0 7mm -2mm;display:block}
.tapa-txt small{display:block;font-size:9pt;letter-spacing:.38em;text-transform:uppercase;color:var(--oro);margin-bottom:4mm}
.tapa-txt h1{font-size:50pt;line-height:.98;color:var(--crema)}
.tapa-txt h1 em{color:var(--oro)}
.tapa-txt p{margin-top:5mm;max-width:130mm;font-size:11.5pt;font-weight:300;line-height:1.45;color:rgb(244 235 221 / .85)}

.indice{padding:17mm 16mm 0}
.indice h2{font-size:33pt;line-height:1;margin-top:3mm;color:var(--tinta)}
.indice h2 em{color:var(--munich)}
.intro{margin-top:5mm;font-size:10.5pt;line-height:1.5;font-weight:300;max-width:165mm}
.indice-lista{margin-top:7mm;display:grid;grid-template-rows:repeat(8,1fr);flex:1;margin-bottom:17mm;border-top:.3mm solid #e5dac8}
.indice-item{display:flex;align-items:center;gap:6mm;border-bottom:.3mm solid #e5dac8;min-height:0}
.indice-foto{display:block;width:33mm;height:22mm;border-radius:2.5mm;overflow:hidden;background:#fff;flex:none}
.indice-foto.oscura{background:#fff;padding:1mm}
.indice-foto img{width:100%;height:100%;object-fit:cover;display:block}
.indice-foto.oscura img{object-fit:contain}
.indice-txt{flex:1;display:flex;flex-direction:column;gap:.6mm}
.indice-txt b{font-family:'Cormorant Unicase',serif;font-weight:400;font-size:18pt;line-height:1}
.indice-txt i{font-style:normal;font-size:8.5pt;color:#8a7766}
.indice-num{font-family:'Cormorant Unicase',serif;font-size:20pt;color:var(--munich)}

.banda{position:relative;height:60mm;flex:none;background:var(--carbon);color:var(--crema);overflow:hidden}
.banda>img{position:absolute;inset:0;width:100%;height:100%;display:block}
.banda-txt{position:absolute;left:12mm;top:0;bottom:0;width:95mm;display:flex;flex-direction:column;justify-content:center}
.banda-txt small{font-size:7.5pt;letter-spacing:.33em;text-transform:uppercase;color:var(--oro)}
.banda-txt h2{font-size:37pt;line-height:1;margin-top:2mm}
.banda-txt p{margin-top:2mm;font-size:9.5pt;font-weight:300;line-height:1.35;color:rgb(244 235 221 / .85)}
.logo-linea{height:11mm;width:auto;align-self:flex-start;margin-bottom:2mm}
.banda::after,.sigue::after{content:'';position:absolute;left:0;right:0;bottom:0;height:1.6mm;background:linear-gradient(to right,#c8102e 0 50%,#f7a600 50% 100%)}
.sigue{position:relative;flex:none;height:19mm;display:flex;align-items:center;gap:3mm;padding:0 12mm;background:var(--carbon);color:var(--crema)}
.sigue small{font-size:7.5pt;letter-spacing:.3em;color:var(--oro)}
.sigue h2{font-size:18pt;line-height:1}
.sigue span{margin-left:auto;font-size:7.5pt;letter-spacing:.2em;text-transform:uppercase;color:rgb(244 235 221 / .55)}

.grilla{flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,minmax(0,1fr));gap:4mm;padding:5mm 12mm 13mm}
.ficha{position:relative;display:flex;flex-direction:column;min-height:0;background:#fff;border-radius:3mm;overflow:hidden;box-shadow:0 0 0 .25mm #eadfce}
.foto{display:block;flex:1;min-height:0;background:#fff}
.foto img{width:100%;height:100%;object-fit:contain;display:block}
.clasico{position:absolute;top:2mm;left:2mm;background:var(--oro);color:var(--humo);font-size:6.5pt;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:.7mm 2mm;border-radius:5mm}
.txt{flex:none;height:64mm;padding:2.8mm 3.2mm 2.4mm;border-top:.25mm solid #f1e9dc;overflow:hidden}
.grilla-alta .txt{height:64mm}
.txt h3{font-size:13pt;line-height:1.05;color:var(--tinta)}
.pres{margin-top:1.5mm;display:flex;flex-wrap:wrap;gap:.8mm}
.pres span{font-size:6.6pt;line-height:1.1;padding:.6mm 1.5mm;border-radius:5mm;background:#f5ecdc;color:#5a270d;white-space:nowrap}
.dato{margin-top:1.6mm;font-size:7.3pt;line-height:1.27;font-weight:300;color:#3d2a1f}
.dato b{display:block;font-size:5.8pt;font-weight:700;letter-spacing:.17em;text-transform:uppercase;color:var(--munich);margin-bottom:.2mm}
.alergeno{font-weight:700;text-transform:uppercase;color:#a3202f}
.relleno{border-radius:3mm;overflow:hidden;min-height:0;background:var(--carbon)}
.relleno img{width:100%;height:100%;object-fit:cover;display:block}

.pie{position:absolute;left:12mm;right:12mm;bottom:4.5mm;display:flex;align-items:center;gap:5mm;font-size:6.8pt;color:#8a7766}
.pie span:nth-child(2){margin-left:auto}
.pie b{font-family:'Cormorant Unicase',serif;font-weight:600;font-size:12pt;color:var(--munich)}
.pie-oscuro{color:rgb(244 235 221 / .6)}
.pie-oscuro b{color:var(--oro)}

.ft{background:linear-gradient(150deg,var(--deep),var(--munich) 60%,#5a270d);color:var(--crema)}
.ft-foto{position:absolute;top:0;left:0;width:100%;height:112mm;object-fit:cover}
.ft-cuerpo{position:absolute;left:14mm;right:14mm;top:119mm}
.ft-cuerpo h2{font-size:28pt;line-height:1;margin-top:2.5mm}
.ft-cuerpo h2 em{color:var(--oro)}
.ft-cols{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:5mm}
.ft-cols div{background:rgb(20 10 5 / .28);border-radius:3mm;padding:3.5mm 4mm}
.ft-cols h3{font-size:15pt;line-height:1}
.ft-cols p{margin-top:1.5mm;font-size:8.6pt;line-height:1.38;font-weight:300}
.ft-boton{display:inline-block;margin-top:5mm;background:var(--crema);color:var(--humo);font-size:8.2pt;font-weight:700;letter-spacing:.11em;text-transform:uppercase;padding:2.8mm 6mm;border-radius:8mm}
.ft-foto2{position:absolute;left:14mm;right:14mm;bottom:12mm;width:182mm;height:74mm;object-fit:cover;object-position:center 40%;border-radius:3mm}

.contra{background:var(--humo);color:var(--crema);padding:24mm 18mm;display:flex;flex-direction:column;align-items:center;text-align:center}
.contra-logo{height:34mm}
.contra h2{font-size:45pt;line-height:1;margin-top:9mm}
.contra h2 em{color:var(--oro)}
.contra-bajada{margin-top:4mm;font-size:12pt;font-weight:300;color:rgb(244 235 221 / .8)}
.botones{display:flex;flex-direction:column;gap:5mm;width:100%;margin-top:11mm}
.boton{display:flex;flex-direction:column;align-items:center;justify-content:center;height:27mm;border-radius:14mm;border:.4mm solid var(--oro);color:var(--crema)}
.boton b{font-family:'Cormorant Unicase',serif;font-weight:600;font-size:19pt;line-height:1.1}
.boton i{font-style:normal;font-size:10pt;margin-top:1mm;color:rgb(244 235 221 / .75)}
.boton.verde{background:#25D366;border-color:#25D366;color:var(--humo)}
.boton.verde i{color:rgb(20 16 13 / .8)}
.contactos{margin-top:11mm;font-size:10.5pt;color:rgb(244 235 221 / .8)}
.firma{margin-top:auto;font-size:8pt;color:rgb(244 235 221 / .5)}
</style></head><body>${tapa}${indice}${cuerpo.join('')}${foodtruck}${contra}</body></html>`
}

const html = await armar()
const archivoHtml = join(temp, 'catalogo.html')
writeFileSync(archivoHtml, html)

const nav = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--allow-file-access-from-files'] })
const pag = await nav.newPage()
await pag.goto(pathToFileURL(archivoHtml).href, { waitUntil: 'networkidle0', timeout: 120000 })
await pag.evaluate(() => document.fonts.ready)

// Si un texto no entra en su ficha o una imagen falla, el catálogo no se publica.
const fallas = await pag.evaluate(() => [
  ...[...document.querySelectorAll('.txt')].filter((t) => t.scrollHeight > t.clientHeight + 1).map((t) => `Texto cortado: ${t.querySelector('h3').textContent}`),
  ...[...document.images].filter((i) => !i.naturalWidth).map((i) => `Imagen rota: ${i.src}`),
  ...[...document.querySelectorAll('.pagina')].filter((p) => p.scrollHeight > p.clientHeight + 1).map((_, i) => `Página desbordada: ${i + 1}`),
  ...[...document.querySelectorAll('.foto')].filter((f) => f.clientHeight < 90).map((f) => `Foto muy chica: ${f.parentElement.querySelector('h3').textContent}`),
])
if (fallas.length) {
  await nav.close()
  throw new Error('El catálogo tiene problemas:\n' + fallas.join('\n'))
}

const salida = join(pub, 'catalogo-nuevo-munich.pdf')
await pag.pdf({ path: salida, preferCSSPageSize: true, printBackground: true, tagged: true, outline: false })

// Tapa para mostrar en la web
await pag.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 })
const tapa = await pag.$('.tapa')
const png = await tapa.screenshot({ type: 'png' })
await sharp(png).resize({ width: 520 }).webp({ quality: 82 }).toFile(join(pub, 'img/marca/catalogo-tapa.webp'))
await nav.close()

const mb = statSync(salida).size / 1048576
writeFileSync(join(raiz, 'src/data/catalogo-pdf.json'), JSON.stringify({ paginas: TOTAL, tamanoMB: Number(mb.toFixed(1)) }, null, 2) + '\n')
console.log(`Listo: ${TOTAL} páginas, ${mb.toFixed(1)} MB → public/catalogo-nuevo-munich.pdf`)
