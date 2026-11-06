import { createClient } from '@supabase/supabase-js'
import * as seed from '../data/seed'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = url && key ? createClient(url, key) : null

export async function cargarCatalogo() {
  if (!supabase) return { categorias: seed.categorias, productos: seed.productos, origen: 'local' }
  try {
    const [c, p] = await Promise.all([
      supabase.from('categorias').select('*').order('orden'),
      supabase.from('productos').select('*').eq('activo', true).order('orden', { ascending: true }),
    ])
    if (c.error || p.error) throw c.error || p.error
    if (!c.data.length) throw new Error('sin datos')
    return { categorias: c.data, productos: p.data, origen: 'supabase' }
  } catch (e) {
    console.warn('[catalogo] usando datos locales:', e.message)
    return { categorias: seed.categorias, productos: seed.productos, origen: 'local' }
  }
}

export const normalizar = (s = '') =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export function buscar(productos, q) {
  const t = normalizar(q).trim().split(/\s+/).filter(Boolean)
  if (!t.length) return []
  return productos.filter((p) => {
    const h = normalizar(`${p.nombre} ${p.categoria} ${p.descripcion || ''} ${(p.presentaciones || []).join(' ')}`)
    return t.every((w) => h.includes(w))
  })
}
