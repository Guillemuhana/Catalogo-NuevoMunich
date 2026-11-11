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
const HUMO = '#14100d'
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

// Un envase por categoría: si se agrega una categoría sin envase, el script se detiene.
const ENVASES_TAPA = {
  feteados: 'feteados-bondiola',
  jamones: 'jamones-jamon-cocido-tipo-bavaro',
  arrollados: 'arrollados-arrollado-de-pollo',
  salames: 'salames-salame-tipo-colonia',
  'linea-ogianco': 'linea-ogianco-matambre-arrollado-ogianco',
  salchichas: 'salchichas-salchicha-tipo-viena',
  especialidades: 'especialidades-kassler',
}

// Colores de la banda de cada categoría, como en el catálogo impreso.
const ESTILO = {
  feteados: { color: '#b8434a' },
  jamones: { color: '#7a4a1f' },
  arrollados: { color: '#5b6847' },
  salames: { color: '#9e2f1b' },
  'linea-ogianco': { color: '#1c1511', acento: '#d9b44a', oscura: true },
  salchichas: { color: '#b56f88', acento: '#9c2f5f' },
  especialidades: { color: '#3a2e28', acento: '#d9b44a', oscura: true },
}

const ordenadas = categorias.slice().sort((a, b) => a.orden - b.orden)
const PAG_HISTORIA = 2
const PAG_INDICE = 3
const PRIMERA_PRODUCTO = 4
const lista = ordenadas.flatMap((c) => productos.filter((p) => p.categoria === c.slug).map((p, i) => ({ p, c, primera: i === 0 })))
const paginaDe = new Map(lista.map((x, i) => [x.p.slug, PRIMERA_PRODUCTO + i]))
const PAG_FOODTRUCK = PRIMERA_PRODUCTO + lista.length
const TOTAL = PAG_FOODTRUCK + 1

const pie = (n, oscuro = false) => `
  <footer class="pie ${oscuro ? 'pie-oscuro' : ''}">
    <span>Nuevo Munich · Artesanos del Sabor desde 1972</span>
    <span>Tocá un producto para ir a su página</span>
    <b>${n}</b>
  </footer>`

const madera = () => jpg('img/marca/madera.webp', 1240, 74)

// Nombre en dos partes: la principal va en letra manuscrita, el resto como bajada.
function partirNombre(nombre) {
  const m = nombre.match(/^(.*?)\s+((?:Ahumad[oa]|Horneado|Cocid[oa]|Ogianco|a las|con|\(|Picado|Copet).*)$/i)
  if (m && m[1].length >= 4 && !/\s(y|e|de|a)$/i.test(m[1])) return [m[1], m[2]]
  return [nombre, '']
}

async function paginaProducto({ p, c, primera }, n) {
  const e = ESTILO[c.slug] || { color: '#b8434a' }
  const acento = e.acento || e.color
  const link = wa(marca.whatsapp, `¡Hola Nuevo Munich! Quería consultar por ${p.nombre}. ¿Precio y disponibilidad?`)
  const [titulo, bajada] = partirNombre(p.nombre)
  const tam = titulo.length <= 14 ? 46 : titulo.length <= 22 ? 38 : 31
  const envase = p.imagenes[0]
  const ambiente = p.imagenes.length > 1 ? p.imagenes.at(-1) : p.imagenes[0]
  const sellos = (p.sellos || []).map((x) => `<span class="sello"><i>Exceso en</i>${esc(x)}</span>`).join('')
  const ing = (p.ingredientes || '').replace(/ \*Harina de trigo enriquecida.*$/, '')
  const insignia = p.nuevo ? 'Nuevo envase' : p.destacado ? '★ Clásico' : /pepperoni/i.test(p.nombre) ? 'Nuevo' : ''
  return `
    <section class="pagina prod" ${primera ? `id="cat-${c.slug}"` : ''}>
      <img class="fondo" src="${await madera()}" alt="">
      <div class="card ${e.oscura ? 'oscura' : ''}">
        <div class="p-foto"><img src="${await jpg(ambiente, 1000, 72)}" alt="">
          <a class="volver" href="#indice">${esc(c.nombre)} · índice</a>
          ${insignia ? `<span class="insignia">${insignia}</span>` : ''}
        </div>
        <svg class="banda" viewBox="0 0 192 40" preserveAspectRatio="none"><polygon points="0,0 192,0 192,7 0,40" fill="${e.color}"/><polygon points="112,19 192,5.2 192,12" fill="#5a4030"/><line x1="0" y1="40" x2="192" y2="5.2" stroke="#fff" stroke-width=".6"/></svg>
        <div class="nombre"><h2 style="font-size:${tam}pt">${esc(titulo)}</h2>${bajada ? `<span>${esc(bajada)}</span>` : ''}</div>
        <div class="p-cuerpo">
          <div class="col izq">
            <p class="p-cat">${esc(c.nombre)}</p>
            <h3 style="color:${acento}">Presentación</h3>
            <ul class="pres">${p.presentaciones.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
            ${ing ? `<h4>Ingredientes</h4><p class="ing">${esc(ing)}</p>` : ''}
            ${p.alergenos ? `<p class="alergeno">${esc(p.alergenos)}</p>` : ''}
            ${sellos ? `<div class="sellos">${sellos}</div>` : ''}
          </div>
          <div class="col der">
            ${p.sugerencias ? `<div class="sug"><h4>Sugerencias</h4><p>${esc(p.sugerencias)}</p></div>` : ''}
            <a class="envase" href="${esc(link)}"><img src="${await jpg(envase, 560, 80)}" alt=""></a>
            <a class="wa" href="${esc(link)}">Consultar por WhatsApp</a>
          </div>
        </div>
        <footer class="p-pie">
          <a href="${marca.instagram}">Ig: ${marca.instagramUsuario}</a>
          <img src="${pathToFileURL(join(temp, 'logo.png')).href}" alt="Nuevo Munich">
          <a href="${SITIO}">${SITIO.replace('https://', '')}</a>
          <b style="color:${acento}">${n}</b>
        </footer>
      </div>
    </section>`
}

async function armar() {
  await sharp(join(pub, marca.ogianco)).png().toFile(join(temp, 'ogianco.png'))
  await sharp(join(pub, marca.logo)).png().toFile(join(temp, 'logo.png'))
  const logoPng = pathToFileURL(join(temp, 'logo.png')).href

  // La franja de la tapa muestra un envase de cada categoría.
  const envasesTapa = await Promise.all(categorias.slice().sort((a, b) => a.orden - b.orden).map(async (c) => {
    const p = productos.find((x) => x.slug === ENVASES_TAPA[c.slug])
    if (!p) throw new Error(`Falta el envase de tapa de la categoría: ${c.slug}`)
    return `<a href="#cat-${c.slug}"><img src="${await jpg(p.imagenes[0], 420, 84)}" alt="${esc(p.nombre)}"><span>${esc(c.nombre)}</span></a>`
  }))

  const tapa = `
    <section class="pagina tapa">
      <img class="tapa-foto" src="${await tapaImg(marca.hero)}" alt="">
      <div class="tapa-envases">${envasesTapa.join('')}</div>
      <div class="tapa-txt">
        <img class="tapa-logo" src="${logoPng}" alt="Nuevo Munich">
        <small>Córdoba · Desde 1972</small>
        <h1>Nuestros<br><em>Productos</em></h1>
        <p>Fiambres, salchichas y especialidades centroeuropeas. Recetas heredadas, hechas como en Austria.</p>
      </div>
    </section>`

  const historia = `
    <section class="pagina historia">
      <img class="fondo" src="${await madera()}" alt="">
      <div class="h-mapa"><img src="${await jpg('img/marca/mapa.webp', 1240, 70)}" alt=""></div>
      <div class="h-panel">
        <img class="h-logo" src="${logoPng}" alt="Nuevo Munich">
        <h2>Desde Austria<br><em>a toda Argentina</em></h2>
        <p>La migración potenció a nuestro país con una mixtura que nos hace únicos, y así lo podemos ver en nuestro nacimiento.</p>
        <p><b>Fue en 1972 cuando los primeros dueños, de origen austríaco, trajeron sus recetas heredadas de generaciones y generaciones de sabores centroeuropeos.</b></p>
        <p>Nació Nuevo Munich para que aquellos sabores formen parte de estas latitudes.</p>
        <p><b>En 2008 conseguimos la certificación del Servicio Nacional de Sanidad y Calidad Agroalimentaria (SENASA), que garantiza nuestros productos.</b></p>
        <p>Desde entonces sostenemos el crecimiento con una evolución constante, poniendo el foco en el servicio, los clientes, los colaboradores y los proveedores.</p>
        <div class="h-datos"><span><b>1972</b>Fundación</span><span><b>2008</b>Certificación SENASA</span><span><b>${productos.length}</b>Productos</span></div>
      </div>
      ${pie(PAG_HISTORIA, true)}
    </section>`

  const bloques = await Promise.all(ordenadas.map(async (c) => {
    const items = lista.filter((x) => x.c.slug === c.slug)
    return `
      <div class="i-bloque">
        <a class="i-cat" href="#cat-${c.slug}" style="--c:${(ESTILO[c.slug] || {}).color}">
          <span class="i-foto"><img src="${await jpg(c.imagen_url, 300, 80)}" alt=""></span><b>${esc(c.nombre)}</b><i>${paginaDe.get(items[0].p.slug)}</i>
        </a>
        ${items.map(({ p }) => `<a class="i-prod" href="#p-${p.slug}"><span>${esc(p.nombre)}</span><i>${paginaDe.get(p.slug)}</i></a>`).join('')}
      </div>`
  }))
  const indice = `
    <section class="pagina clara indice" id="indice">
      <small class="volanta">Nuestros productos</small>
      <h2>Una empresa <em>familiar</em>, un oficio heredado.</h2>
      <p class="intro">Tocá cualquier producto para ir directo a su página. En cada una encontrás la presentación, los ingredientes, una sugerencia y un botón para consultarlo por WhatsApp.</p>
      <div class="i-lista">${bloques.join('')}
        <div class="i-bloque"><a class="i-cat" href="#foodtruck" style="--c:#a3202f"><span class="i-foto"><img src="${await jpg(marca.foodtruck[0], 300, 80)}" alt=""></span><b>Food Truck</b><i>${PAG_FOODTRUCK}</i></a></div>
      </div>
      ${pie(PAG_INDICE)}
    </section>`

  const cuerpo = []
  for (let i = 0; i < lista.length; i++) cuerpo.push((await paginaProducto(lista[i], PRIMERA_PRODUCTO + i)).replace('<div class="card', `<span id="p-${lista[i].p.slug}"></span><div class="card`))

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
${fuente('Great Vibes', 'great-vibes', 400)}${fuente('Inria Sans', 'inria-sans', 300)}${fuente('Inria Sans', 'inria-sans', 400)}${fuente('Inria Sans', 'inria-sans', 700)}
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
.tapa-envases{position:absolute;left:12mm;right:12mm;top:137mm;display:grid;grid-template-columns:repeat(7,1fr);gap:2mm}
.tapa-envases a{display:block;background:#fff;border-radius:2.5mm;overflow:hidden}
.tapa-envases img{display:block;width:100%;height:27mm;object-fit:contain}
.tapa-envases span{display:block;padding:1.3mm .5mm;background:var(--carbon);color:var(--crema);font-size:6.8pt;letter-spacing:.02em;text-align:center;white-space:nowrap}
.tapa-txt{position:absolute;left:16mm;right:16mm;top:180mm}
.tapa-logo{height:27mm;margin:0 0 7mm -2mm;display:block}
.tapa-txt small{display:block;font-size:9pt;letter-spacing:.38em;text-transform:uppercase;color:var(--oro);margin-bottom:4mm}
.tapa-txt h1{font-size:50pt;line-height:.98;color:var(--crema)}
.tapa-txt h1 em{color:var(--oro)}
.tapa-txt p{margin-top:5mm;max-width:130mm;font-size:11.5pt;font-weight:300;line-height:1.45;color:rgb(244 235 221 / .85)}

.tapa-txt h1 em{font-family:'Great Vibes',cursive;font-style:normal;font-size:64pt;line-height:.9;color:var(--oro)}
.fondo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}

.historia{background:var(--humo);color:var(--tinta)}
.h-mapa{position:absolute;inset:12mm 12mm 16mm;border-radius:7mm;overflow:hidden;background:#d8c9a5}
.h-mapa img{width:100%;height:100%;object-fit:cover;opacity:.55;filter:sepia(.6)}
.h-panel{position:absolute;left:46mm;right:46mm;top:12mm;bottom:16mm;background:#fff;padding:14mm 10mm 0;text-align:center;box-shadow:0 0 12mm rgb(0 0 0 / .25)}
.h-logo{height:19mm;display:block;margin:0 auto 6mm}
.h-panel h2{font-family:'Inria Sans',sans-serif;font-weight:700;font-size:21pt;line-height:1.1}
.h-panel h2 em{font-family:'Great Vibes',cursive;font-style:normal;font-weight:400;font-size:31pt;color:var(--munich)}
.h-panel p{margin-top:4.5mm;font-size:11pt;line-height:1.42;font-weight:300}
.h-panel p b{font-weight:700}
.h-datos{display:flex;justify-content:center;gap:6mm;margin-top:9mm;padding-top:6mm;border-top:.3mm solid #e5dac8}
.h-datos span{display:flex;flex-direction:column;font-size:7pt;letter-spacing:.12em;text-transform:uppercase;color:#8a7766}
.h-datos b{font-family:'Cormorant Unicase',serif;font-size:22pt;letter-spacing:0;color:var(--munich);line-height:1}

.indice{padding:15mm 14mm 0}
.indice h2{font-size:30pt;line-height:1;margin-top:3mm;color:var(--tinta)}
.indice h2 em{color:var(--munich)}
.intro{margin-top:4mm;font-size:10pt;line-height:1.45;font-weight:300;max-width:170mm}
.i-lista{margin-top:6mm;columns:2;column-gap:9mm}
.i-bloque{break-inside:avoid;margin-bottom:4.5mm}
.i-cat{display:flex;align-items:center;gap:3mm;padding-bottom:1.5mm;border-bottom:.6mm solid var(--c)}
.i-foto{width:15mm;height:10mm;border-radius:1.5mm;overflow:hidden;flex:none;background:#fff}
.i-foto img{width:100%;height:100%;object-fit:cover;display:block}
.i-cat b{flex:1;font-family:'Cormorant Unicase',serif;font-weight:600;font-size:14pt;line-height:1}
.i-cat i,.i-prod i{font-style:normal;font-family:'Cormorant Unicase',serif;font-weight:600;color:var(--munich)}
.i-cat i{font-size:13pt}
.i-prod{display:flex;align-items:baseline;gap:2mm;padding:1mm 0 .6mm 2mm;font-size:8.6pt;line-height:1.2;border-bottom:.2mm dotted #d6c8b2}
.i-prod span{flex:1}
.i-prod i{font-size:10pt}

.prod{background:var(--humo)}
.card{position:absolute;inset:9mm;border-radius:7mm;overflow:hidden;background:#fff;display:flex;flex-direction:column;box-shadow:0 0 10mm rgb(0 0 0 / .45)}
.card.oscura{background:#17110d;color:var(--crema)}
.p-foto{position:relative;height:136mm;flex:none;background:#2a1d14}
.p-foto>img{width:100%;height:100%;object-fit:cover;display:block}
.volver{position:absolute;top:5mm;left:5mm;background:rgb(20 16 13 / .72);color:var(--crema);font-size:7pt;letter-spacing:.14em;text-transform:uppercase;padding:1.4mm 3.5mm;border-radius:5mm}
.insignia{position:absolute;top:5mm;right:5mm;background:var(--oro);color:var(--humo);font-size:7.5pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:1.4mm 3.5mm;border-radius:5mm}
.banda{position:absolute;left:0;top:132mm;width:192mm;height:40mm;display:block}
.nombre{position:absolute;left:8mm;top:131mm;max-width:132mm;color:#fff}
.nombre h2{font-family:'Great Vibes',cursive;font-weight:400;line-height:1;white-space:nowrap}
.nombre span{display:block;margin-top:-.5mm;padding-left:1mm;font-size:9.5pt;font-weight:700;letter-spacing:.06em;color:rgb(255 255 255 / .9)}
.p-cuerpo{flex:1;min-height:0;display:grid;grid-template-columns:1fr 64mm;gap:8mm;padding:0 9mm 4mm}
.col{min-height:0;overflow:hidden}
.izq{padding-top:31mm;text-align:center}
.der{padding-top:11mm;display:flex;flex-direction:column;gap:4mm}
.p-cat{font-size:12pt;font-weight:700;font-style:italic;letter-spacing:.02em;text-transform:uppercase;color:#8d8d8d;padding-bottom:2mm;border-bottom:.35mm solid currentColor;margin:0 4mm}
.oscura .p-cat{color:#bdb3a6}
.izq h3{font-family:'Inria Sans',sans-serif;font-style:italic;font-weight:700;font-size:21pt;line-height:1;margin-top:3.5mm}
.pres{list-style:none;margin:1.5mm 4mm 0;padding-bottom:3mm;border-bottom:.35mm solid #8d8d8d;font-size:11.5pt;line-height:1.38;font-weight:300}
.izq h4{text-align:left;margin-top:4mm}
h4{font-family:'Inria Sans',sans-serif;font-weight:700;font-style:italic;font-size:11pt}
.ing{text-align:left;margin-top:.8mm;font-size:10.5pt;line-height:1.36;font-weight:300}
.alergeno{text-align:left;margin-top:2mm;font-size:8.5pt;font-weight:700;text-transform:uppercase;color:#c8102e}
.sellos{display:flex;gap:1.5mm;margin-top:2.5mm}
.sello{width:15mm;height:15mm;background:#111;color:#fff;clip-path:polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-size:5pt;font-weight:700;line-height:1.05;text-transform:uppercase;padding:1mm}
.oscura .sello{background:#fff;color:#111}
.sello i{font-style:normal;font-size:4.2pt;font-weight:400}
.sug{border:.35mm solid currentColor;border-radius:5mm;padding:3mm 4mm 3.5mm}
.sug p{margin-top:1mm;font-size:10pt;line-height:1.36;font-weight:300}
.envase{display:block;height:46mm;border-radius:5mm;overflow:hidden;background:#fff;flex:none}
.envase img{width:100%;height:100%;object-fit:cover;display:block}
.wa{display:block;text-align:center;background:#25D366;color:#0f2a19;font-size:8.5pt;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:2.6mm 0;border-radius:6mm}
.p-pie{flex:none;height:15mm;display:grid;grid-template-columns:1fr auto 1fr 9mm;align-items:center;gap:4mm;padding:0 6mm 0 9mm;background:#ececec;color:#6b6b6b;font-size:8.5pt}
.p-pie a:first-child{font-style:italic}
.p-pie a:nth-child(3){text-align:right}
.p-pie img{height:10mm;display:block}
.p-pie b{font-family:'Cormorant Unicase',serif;font-weight:700;font-size:13pt;text-align:right}
.oscura .p-pie{background:#0d0907;color:#b3a898}

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
</style></head><body>${tapa}${historia}${indice}${cuerpo.join('')}${foodtruck}${contra}</body></html>`
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
  ...[...document.querySelectorAll('.col')].filter((t) => t.scrollHeight > t.clientHeight + 1).map((t) => `Texto cortado: ${t.closest('.card').querySelector('.nombre').textContent.trim()}`),
  ...[...document.querySelectorAll('.nombre')].filter((t) => t.scrollWidth > t.clientWidth + 1).map((t) => `Nombre muy largo: ${t.textContent.trim()}`),
  ...[...document.images].filter((i) => !i.naturalWidth).map((i) => `Imagen rota: ${i.src}`),
  ...[...document.querySelectorAll('.pagina')].filter((p) => p.scrollHeight > p.clientHeight + 1).map((_, i) => `Página desbordada: ${i + 1}`),
  ...[...document.querySelectorAll('.i-lista')].filter((l) => l.getBoundingClientRect().bottom > l.closest('.pagina').getBoundingClientRect().bottom - 50).map(() => 'El índice no entra en la página'),
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
