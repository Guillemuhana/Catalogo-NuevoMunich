// POST /api/confirmar  { token, codigo, cliente, items }
// Verifica el código, asigna número de pedido y manda el resumen por mail al cliente (y copia a ventas).
import { configurado, demasiados, emailValido, esc, leerCuerpo, limpiar, mailer, numeroPedido, plantilla, remitente, responder, verificarToken } from './_lib.js'

const MENSAJES = {
  invalido: 'El código no corresponde a este email. Pedí uno nuevo.',
  vencido: 'El código venció. Pedí uno nuevo.',
  incorrecto: 'El código no es correcto. Revisalo e intentá de nuevo.',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return responder(res, 405, { error: 'Método no permitido' })
  if (!configurado()) return responder(res, 503, { error: 'sin-configurar' })
  if (demasiados(req, 15)) return responder(res, 429, { error: 'Demasiados intentos. Esperá unos minutos.' })

  const b = await leerCuerpo(req)
  const c = b.cliente || {}
  const email = limpiar(c.email, 120).toLowerCase()
  if (!emailValido(email)) return responder(res, 400, { error: 'El email no parece válido.' })

  const estado = verificarToken(b.token, email, limpiar(b.codigo, 10))
  if (estado !== 'ok') return responder(res, 400, { error: MENSAJES[estado], estado })

  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 80).map((i) => ({
    nombre: limpiar(i.nombre, 120),
    presentacion: limpiar(i.presentacion, 80),
    cantidad: Math.max(1, Math.min(999, parseInt(i.cantidad, 10) || 1)),
  }))
  if (!items.length) return responder(res, 400, { error: 'El pedido está vacío.' })

  const d = {
    nombre: limpiar(c.nombre, 80), telefono: limpiar(c.telefono, 30), tipo: limpiar(c.tipo, 30),
    razonSocial: limpiar(c.razonSocial, 120), cuit: limpiar(c.cuit, 20), entrega: limpiar(c.entrega, 30),
    direccion: limpiar(c.direccion, 160), localidad: limpiar(c.localidad, 80), horario: limpiar(c.horario, 40),
    comentario: limpiar(c.comentario, 500),
  }
  const numero = numeroPedido()
  const unidades = items.reduce((a, i) => a + i.cantidad, 0)

  const fila = (k, v) => (v ? `<tr><td style="padding:4px 12px 4px 0;color:#7a6d60;white-space:nowrap">${k}</td><td style="padding:4px 0">${esc(v)}</td></tr>` : '')
  const datos = [
    fila('Nombre', d.nombre), fila('Email', email), fila('WhatsApp', d.telefono), fila('Cliente', d.tipo),
    fila('Razón social', d.razonSocial), fila('CUIT', d.cuit), fila('Entrega', d.entrega),
    fila('Dirección', [d.direccion, d.localidad].filter(Boolean).join(', ')), fila('Horario', d.horario), fila('Comentarios', d.comentario),
  ].join('')
  const lista = items.map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee4d4;font-weight:bold;width:44px">${i.cantidad} ×</td><td style="padding:8px 0;border-bottom:1px solid #eee4d4">${esc(i.nombre)}${i.presentacion ? `<br><span style="font-size:12px;color:#7a6d60">${esc(i.presentacion)}</span>` : ''}</td></tr>`).join('')
  const cuerpo = `<p style="margin:0 0 6px;font-size:13px;color:#7a6d60">Pedido</p>
<div style="font-size:22px;font-weight:bold;color:#c04b54;margin-bottom:18px">${numero}</div>
<table role="presentation" width="100%" style="font-size:14px;border-collapse:collapse">${lista}</table>
<p style="font-size:13px;color:#7a6d60;margin:10px 0 22px">${unidades} ${unidades === 1 ? 'unidad' : 'unidades'} en ${items.length} ${items.length === 1 ? 'producto' : 'productos'}</p>
<table role="presentation" style="font-size:14px;border-collapse:collapse">${datos}</table>
<p style="margin:22px 0 0;font-size:14px;line-height:1.5">Te vamos a escribir por WhatsApp para confirmar disponibilidad, precio y ${d.entrega === 'Delivery' ? 'la entrega' : 'el retiro'}.</p>`

  try {
    await mailer().sendMail({
      from: remitente(), to: email, replyTo: process.env.PEDIDOS_EMAIL || undefined,
      subject: `Recibimos tu pedido ${numero}`,
      html: plantilla({ titulo: '¡Recibimos tu pedido!', cuerpo }),
    })
    if (process.env.PEDIDOS_EMAIL) {
      await mailer().sendMail({
        from: remitente(), to: process.env.PEDIDOS_EMAIL, replyTo: email,
        subject: `Nuevo pedido ${numero} · ${d.razonSocial || d.nombre}`,
        html: plantilla({ titulo: 'Nuevo pedido desde el catálogo web', cuerpo }),
      })
    }
  } catch (e) {
    // El código ya se validó: el pedido sigue por WhatsApp aunque falle el resumen por mail.
    console.error('[confirmar] no se pudo enviar el resumen', e.message)
  }
  return responder(res, 200, { ok: true, numero })
}
