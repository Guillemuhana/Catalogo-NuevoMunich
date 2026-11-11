import { marca } from '../data/seed'

// Datos de la propuesta para negocios gastronómicos (sección y panel del menú).
export const zonas = ['Mendoza', 'San Juan', 'Córdoba', 'Patagonia']
export const ventajas = ['Amplia variedad de productos', 'Calidad garantizada', 'Atención personalizada', 'Respaldo de una marca con trayectoria']
export const telVisible = (n) => `${n.slice(-10, -7)}-${n.slice(-7, -4)} ${n.slice(-4)}`
export const waNegocios = `https://wa.me/${marca.whatsappComercial}?text=${encodeURIComponent('¡Hola Nuevo Munich! Tengo un negocio y quiero sumar sus productos.')}`
