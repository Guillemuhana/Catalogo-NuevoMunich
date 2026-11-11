import { marca } from '../data/seed'

// Datos de la propuesta para negocios gastronómicos (sección y panel del menú).
export const zonas = ['Mendoza', 'San Juan', 'Córdoba', 'Patagonia']
export const ventajas = ['Amplia variedad de productos', 'Calidad garantizada', 'Atención personalizada', 'Respaldo de una marca con trayectoria']
// Lleva al chatbot de WhatsApp con el mensaje ya escrito.
export const waNegocios = `https://wa.me/${marca.whatsappBot}?text=${encodeURIComponent('¡Hola Nuevo Munich! Tengo un negocio gastronómico y quiero sumarme a la familia Nuevo Munich. ¿Me pasan información para ser cliente?')}`
