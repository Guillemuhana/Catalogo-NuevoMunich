// Utilidades compartidas por las funciones de /api (los archivos con "_" no se publican como endpoint).
import crypto from 'node:crypto'
import nodemailer from 'nodemailer'

// Variables de entorno en Vercel:
//   GMAIL_USER          cuenta Gmail que envía (ej. pedidosnuevomunich@gmail.com)
//   GMAIL_APP_PASSWORD  contraseña de aplicación de esa cuenta (16 letras)
//   PEDIDOS_EMAIL       (opcional) copia de cada pedido confirmado, ej. ventas@nuevomunich.com.ar
//   CODIGO_SECRET       (opcional) clave para firmar los códigos; si falta se usa la de Gmail
export const configurado = () => !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) || process.env.MAIL_PRUEBA === '1'
const secreto = () => process.env.CODIGO_SECRET || process.env.GMAIL_APP_PASSWORD || 'prueba'

export const VALIDEZ_MIN = 10
export const emailValido = (e = '') => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim())
export const limpiar = (v, max = 200) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max)
export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const firmar = (texto) => crypto.createHmac('sha256', secreto()).update(texto).digest('base64url')
const hashCodigo = (email, codigo) => firmar(`codigo:${email.toLowerCase()}:${codigo}`)

// Token sin estado: guarda el email, el hash del código, el vencimiento y los intentos permitidos.
export function crearToken(email, codigo) {
  const datos = Buffer.from(JSON.stringify({ e: email.toLowerCase(), h: hashCodigo(email, codigo), x: Date.now() + VALIDEZ_MIN * 60e3 })).toString('base64url')
  return `${datos}.${firmar(datos)}`
}

export function verificarToken(token = '', email = '', codigo = '') {
  const [datos, firma] = String(token).split('.')
  if (!datos || !firma) return 'invalido'
  const esperada = firmar(datos)
  if (firma.length !== esperada.length || !crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada))) return 'invalido'
  let t
  try { t = JSON.parse(Buffer.from(datos, 'base64url').toString()) } catch { return 'invalido' }
  if (t.e !== email.toLowerCase()) return 'invalido'
  if (Date.now() > t.x) return 'vencido'
  const h = hashCodigo(email, String(codigo).trim())
  if (h.length !== t.h.length || !crypto.timingSafeEqual(Buffer.from(h), Buffer.from(t.h))) return 'incorrecto'
  return 'ok'
}

export const nuevoCodigo = () => String(crypto.randomInt(0, 1e6)).padStart(6, '0')

export function numeroPedido() {
  const d = new Date(Date.now() - 3 * 3600e3) // hora de Córdoba
  const f = d.toISOString().slice(2, 10).replace(/-/g, '')
  return `NM-${f}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`
}

let transporte
export function mailer() {
  if (process.env.MAIL_PRUEBA === '1') return nodemailer.createTransport({ jsonTransport: true })
  transporte ||= nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  })
  return transporte
}
export const remitente = () => `"Nuevo Munich" <${process.env.GMAIL_USER || 'pedidos@nuevomunich.com.ar'}>`

// Límite simple por IP dentro de la misma instancia (frena ráfagas de bots).
const visitas = new Map()
export function demasiados(req, max = 5, ventanaMs = 10 * 60e3) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim()
  const ahora = Date.now()
  const lista = (visitas.get(ip) || []).filter((t) => ahora - t < ventanaMs)
  lista.push(ahora)
  visitas.set(ip, lista)
  return lista.length > max
}

export async function leerCuerpo(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') { try { return JSON.parse(req.body) } catch { return {} } }
  let raw = ''
  for await (const c of req) raw += c
  try { return JSON.parse(raw || '{}') } catch { return {} }
}

export function responder(res, status, datos) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(datos))
}

// Plantilla de mail con los colores de la marca.
export function plantilla({ titulo, cuerpo }) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f4ebdd;font-family:Arial,Helvetica,sans-serif;color:#14100d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4ebdd;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;overflow:hidden">
<tr><td style="background:#14100d;padding:22px 28px">
  <span style="display:inline-block;background:#c04b54;color:#fff;font-weight:bold;font-size:20px;padding:6px 14px;border-radius:8px;font-family:Georgia,serif">Nuevo Munich</span>
  <div style="height:3px;margin-top:16px;background:linear-gradient(90deg,#c8102e,#f7a600,#ffcc00)"></div>
</td></tr>
<tr><td style="padding:28px">
  <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:24px;font-weight:normal">${titulo}</h1>
  ${cuerpo}
</td></tr>
<tr><td style="padding:18px 28px;background:#faf6ef;font-size:12px;color:#7a6d60">Nuevo Munich SRL · Fiambres artesanales desde 1972 · Córdoba, Argentina</td></tr>
</table></td></tr></table></body></html>`
}
