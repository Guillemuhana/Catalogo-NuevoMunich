import { useEffect, useState } from 'react'
import { categorias, marca } from '../data/seed'

const KEY = 'nm-pedido-v2'
const leer = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

export function usePedido() {
  const [items, setItems] = useState(leer)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* sin storage */ }
  }, [items])

  const id = (slug, pres) => `${slug}::${pres || ''}`

  const agregar = (producto, presentacion, cantidad = 1) =>
    setItems((prev) => {
      const k = id(producto.slug, presentacion)
      const ex = prev.find((i) => i.id === k)
      if (ex) return prev.map((i) => (i.id === k ? { ...i, cantidad: i.cantidad + cantidad } : i))
      return [...prev, { id: k, slug: producto.slug, nombre: producto.nombre, categoria: producto.categoria, imagen_url: producto.imagen_url, presentacion, cantidad }]
    })

  const cambiar = (k, delta) =>
    setItems((prev) => prev.flatMap((i) => (i.id !== k ? [i] : i.cantidad + delta <= 0 ? [] : [{ ...i, cantidad: i.cantidad + delta }])))

  const vaciar = () => setItems([])
  const total = items.reduce((a, i) => a + i.cantidad, 0)

  return { items, agregar, cambiar, vaciar, total }
}

// Por defecto va a ventas; el pedido armado y el chat van al asistente virtual.
export function linkWhatsApp(texto, numero = marca.whatsapp) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}

// Mensaje del pedido, agrupado por categoría en el orden del catálogo.
export function mensajePedido(items, { numero = '', nombre = '', email = '', telefono = '', tipo = '', razonSocial = '', cuit = '', entrega = 'Retiro en local', direccion = '', localidad = '', horario = '', comentario = '' } = {}) {
  const grupos = categorias
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .map((c) => ({ titulo: c.nombre, lista: items.filter((i) => i.categoria === c.slug) }))
  const otros = items.filter((i) => !categorias.some((c) => c.slug === i.categoria))
  if (otros.length) grupos.push({ titulo: 'Otros', lista: otros })

  const detalle = grupos
    .filter((g) => g.lista.length)
    .map((g) => `*${g.titulo.toUpperCase()}*\n${g.lista.map((i) => `• ${i.cantidad} × ${i.nombre}${i.presentacion ? ` (${i.presentacion})` : ''}`).join('\n')}`)
    .join('\n\n')

  const unidades = items.reduce((a, i) => a + i.cantidad, 0)
  const t = (v) => String(v || '').trim()
  const lineas = [
    numero ? `🛒 *NUEVO PEDIDO ${numero}*` : '🛒 *NUEVO PEDIDO · CATÁLOGO WEB*',
    numero ? '✅ Email verificado' : false,
    '',
    t(nombre) ? `👤 *Cliente:* ${t(nombre)}` : false,
    tipo === 'Comercio' && t(razonSocial) ? `🏪 *Comercio:* ${t(razonSocial)}${t(cuit) ? ` · CUIT ${t(cuit)}` : ''}` : false,
    t(telefono) ? `📱 *WhatsApp:* ${t(telefono)}` : false,
    t(email) ? `✉️ *Email:* ${t(email)}` : false,
    `📦 *Entrega:* ${entrega}`,
    entrega === 'Delivery' && t(direccion) ? `📍 *Dirección:* ${[t(direccion), t(localidad)].filter(Boolean).join(', ')}` : false,
    t(horario) ? `🕒 *Horario preferido:* ${t(horario)}` : false,
    '',
    detalle,
    '',
    `🧾 *Total:* ${unidades} ${unidades === 1 ? 'unidad' : 'unidades'} en ${items.length} ${items.length === 1 ? 'producto' : 'productos'}`,
    t(comentario) ? `📝 *Comentarios:* ${t(comentario)}` : false,
    '',
    '¿Me confirman disponibilidad y precio? Gracias.',
  ]
  return lineas.filter((l) => l !== false && l !== undefined).join('\n').replace(/\n{3,}/g, '\n\n')
}
