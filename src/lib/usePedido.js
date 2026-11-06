import { useEffect, useState } from 'react'
import { marca } from '../data/seed'

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

export function linkWhatsApp(texto) {
  return `https://wa.me/${marca.whatsapp}?text=${encodeURIComponent(texto)}`
}

export function mensajePedido(items) {
  const lineas = items.map((i) => `• ${i.cantidad} × ${i.nombre}${i.presentacion ? ` (${i.presentacion})` : ''}`)
  return `¡Hola Nuevo Munich! 👋 Quiero hacer este pedido desde el catálogo:\n\n${lineas.join('\n')}\n\n¿Me confirman disponibilidad y precio? Gracias.`
}
