// POST /api/codigo  { email, nombre, web }  → manda un código de 6 dígitos al email
import { configurado, crearToken, demasiados, emailValido, esc, leerCuerpo, limpiar, mailer, nuevoCodigo, plantilla, remitente, responder, VALIDEZ_MIN } from './_lib.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return responder(res, 405, { error: 'Método no permitido' })
  if (!configurado()) return responder(res, 503, { error: 'sin-configurar' })

  const b = await leerCuerpo(req)
  if (b.web) return responder(res, 200, { token: 'x' }) // trampa para bots: el campo oculto vino lleno
  const email = limpiar(b.email, 120).toLowerCase()
  const nombre = limpiar(b.nombre, 80)
  if (!emailValido(email)) return responder(res, 400, { error: 'El email no parece válido.' })
  if (demasiados(req)) return responder(res, 429, { error: 'Pediste muchos códigos seguidos. Esperá unos minutos y probá de nuevo.' })

  const codigo = nuevoCodigo()
  try {
    await mailer().sendMail({
      from: remitente(),
      to: email,
      subject: `${codigo} es tu código para confirmar el pedido`,
      text: `Hola ${nombre || ''}! Tu código para confirmar el pedido en el catálogo de Nuevo Munich es ${codigo}. Vence en ${VALIDEZ_MIN} minutos. Si no lo pediste, ignorá este mail.`,
      html: plantilla({
        titulo: `Hola${nombre ? ` ${esc(nombre.split(' ')[0])}` : ''}, confirmá tu pedido`,
        cuerpo: `<p style="margin:0 0 18px;font-size:15px;line-height:1.5">Ingresá este código en el catálogo para confirmar el pedido:</p>
<div style="font-size:38px;letter-spacing:10px;font-weight:bold;text-align:center;background:#14100d;color:#ffcc00;border-radius:14px;padding:18px 0">${codigo}</div>
<p style="margin:18px 0 0;font-size:13px;color:#7a6d60">Vence en ${VALIDEZ_MIN} minutos. Si no hiciste un pedido, ignorá este mail.</p>`,
      }),
    })
  } catch (e) {
    console.error('[codigo] no se pudo enviar', e.message)
    return responder(res, 502, { error: 'No pudimos enviar el mail. Revisá la dirección o probá de nuevo en un rato.' })
  }
  if (process.env.MAIL_PRUEBA === '1') console.log(`[prueba] código para ${email}: ${codigo}`)
  return responder(res, 200, { token: crearToken(email, codigo), minutos: VALIDEZ_MIN })
}
