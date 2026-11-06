// Datos transcriptos de las etiquetas de los envases (fotos del sitio de Nuevo Munich).
// Un valor null significa que en la foto no se lee con seguridad: se muestra "—", nunca se estima.
// Productos sin `tabla`: la etiqueta no se puede leer completa y hay que cargarla desde la ficha oficial.

const fila = (nombre, valor, vd = null, sub = false) => ({ nombre, valor, vd, sub })

const tabla = (porcion, [kcal, kj, vdE], [carb, vdC], [prot, vdP], [gt, vdGt], [gs, vdGs], trans, [fib, vdF], [sod, vdS]) => ({
  porcion,
  filas: [
    fila('Valor energético', `${kcal} kcal = ${kj} kJ`, vdE),
    fila('Carbohidratos', carb, vdC),
    fila('Azúcares totales', '0 g', null, true),
    fila('Azúcares añadidos', '0 g', null, true),
    fila('Proteínas', prot, vdP),
    fila('Grasas totales', gt, vdGt),
    fila('Grasas saturadas', gs, vdGs, true),
    fila('Grasas trans', trans, null, true),
    fila('Fibra alimentaria', fib, vdF),
    fila('Sodio', sod, vdS),
  ],
})

const GT = 'Grasas totales'
const GS = 'Grasas saturadas'
const SO = 'Sodio'
const CA = 'Calorías'

const JAMON_COCIDO = tabla('40 g (2 fetas)', [98, 412, 5], ['0 g', null], ['10 g', 13], ['6,4 g', 12], ['2,4 g', 11], '0', ['0', 0], ['440 mg', 18])
const JAMON_ING = 'Carne de pernil de cerdo, agua, sal, pimienta negra, azúcar. Regulador de acidez: INS 325.'
const BAVARO = tabla('40 g (2 fetas)', [48, 202, 2], ['1 g', null], ['10 g', 13], ['0 g', null], ['0 g', null], '0', ['0', 0], ['304 mg', 12])
const BAVARO_ING = 'Carne de pernil de cerdo, agua, sal. Conservantes: INS 251, INS 250.'
const POLLO = tabla('100 g (2 fetas)', [124, 521, 6], ['6,9 g', 2], ['16 g', 21], ['3,6 g', 7], ['1,3 g', 6], '0', ['0', 0], ['834 mg', 35])
const POLLO_ING = 'Carne de pollo, huevo, agua, zanahoria, sal, ají molido, orégano. Estabilizantes: INS 452i, INS 452ii. Conservantes: INS 251, INS 250.'
const MATAMBRE_ING = 'Matambre vacuno, huevo, agua, zanahoria, sal, ají molido, orégano. Estabilizantes: INS 452i, INS 452ii. Conservantes: INS 251, INS 250.'
const CRIOLLO = tabla('40 g (2 fetas)', [107, 447, 5], ['4,1 g', 1], ['4,9 g', 7], ['7,9 g', 14], ['3,1 g', 14], '0 g', ['0 g', 0], ['546 mg', 23])
const CRIOLLO_ING = 'Carne de cabezas de cerdo, carne y tendones vacunos, agua, sal, harina de trigo*, ají molido, orégano. Estabilizantes: INS 452i, INS 452ii. Conservantes: INS 251, INS 250. *Harina de trigo enriquecida según ley 25630.'
const LOMO = tabla('40 g (4 fetas)', [74, 309, 4], ['0 g', 0], ['11 g', 15], ['3,5 g', 6], ['1,2 g', 5], '0', ['0,6', 2], ['154 mg', 6])
const LOMO_HUEVO = 'Lomo de cerdo, huevo, agua, sal. Conservantes: INS 251, INS 250.'
const BONDIOLA = tabla('40 g (6 fetas)', [185, 774, 9], ['2,8 g', 1], ['6,8 g', 9], ['16 g', 29], ['7,8 g', 35], '0 g', ['0 g', 0], ['720 mg', 30])
const BONDIOLA_ING = 'Carne de cerdo, azúcar, sal, coriandro. Antioxidante: isoascorbato de sodio. Conservantes: nitrato y nitrito de sodio.'
const PANCETA = tabla('10 g (1 rebanada)', [24, 100, 1], ['0 g', 0], ['1,8 g', 2], [null, 4], ['1,1 g', 5], '0', ['0', 0], ['110 mg', 5])
const PANCETA_ING = 'Panceta, agua, sal, aditivos. Conservantes: INS 250, INS 251.'
const VIENA_T = (porcion) => tabla(porcion, [82, 343, 4], ['3,4 g', 1], ['3,6 g', 5], ['6 g', 11], ['2,2 g', 10], '0', ['0', 0], ['328 mg', 14])
const VIENA_ING = 'Carne de cerdo, carne vacuna, tocino, agua, sal, harina de trigo*, almidón de trigo, azúcar, pimienta blanca, coriandro, pimentón, nuez moscada. Estabilizantes: INS 452i, INS 452ii, saborizante de humo. Conservantes: INS 250, INS 251. *Harina de trigo enriquecida según ley 25630.'
const HUNGARA_ING = 'Carne de cerdo, carne vacuna, tocino, sal, azúcar, pimienta blanca, pimentón, coriandro, ajo, nuez moscada. Estabilizantes: INS 452i, INS 452ii. Conservantes: INS 251, INS 250.'
const TRIGO = 'Contiene trigo.'

export const etiquetas = {
  // Feteados
  'feteados-bondiola': { tabla: BONDIOLA, ingredientes: BONDIOLA_ING, sellos: [GT, GS, SO, CA] },
  'feteados-arrollado-de-pollo': { tabla: POLLO, ingredientes: POLLO_ING, sellos: [SO] },
  'feteados-panceta-cocida-ahumada-salada': { tabla: PANCETA, ingredientes: PANCETA_ING, sellos: [GT, GS, SO] },
  'feteados-lomo-horneado-y-ahumado-a-las-finas-hierbas': { tabla: LOMO, ingredientes: LOMO_HUEVO, sellos: [GT, GS] },
  'feteados-lomo-de-cerdo-cocido': { tabla: LOMO, ingredientes: LOMO_HUEVO, sellos: [GT, GS] },
  'feteados-jamon-tipo-bavaro-cocido': { tabla: BAVARO, ingredientes: BAVARO_ING, sellos: [SO] },
  'feteados-jamon-cocido': { tabla: JAMON_COCIDO, ingredientes: JAMON_ING, sellos: [GT, GS, SO] },
  'feteados-jamon-tipo-asado': { tabla: JAMON_COCIDO, ingredientes: JAMON_ING, sellos: [GT, GS, SO] },
  'feteados-arrollado-criollo': { tabla: CRIOLLO, ingredientes: CRIOLLO_ING, alergenos: TRIGO, sellos: [GT, GS, SO] },

  // Jamones
  'jamones-jamon-cocido-con-cuero': { tabla: JAMON_COCIDO, ingredientes: JAMON_ING, sellos: [GT, GS, SO] },
  'jamones-jamon-tipo-asado': { ingredientes: JAMON_ING },
  'jamones-jamon-cocido-tipo-bavaro': { tabla: BAVARO, ingredientes: BAVARO_ING, sellos: [SO] },
  'jamones-lomo-de-cerdo-horneado-y-ahumado': { tabla: LOMO, ingredientes: 'Lomo de cerdo, agua, sal. Conservantes: INS 251, INS 250.', sellos: [GT, GS] },

  // Arrollados
  'arrollados-arrollado-de-pollo': { tabla: POLLO, ingredientes: POLLO_ING, sellos: [SO] },
  'arrollados-arrollado-criollo': { tabla: CRIOLLO, ingredientes: CRIOLLO_ING, alergenos: TRIGO, sellos: [GT, GS, SO] },
  'arrollados-matambre-arrollado': {
    tabla: tabla('40 g (2 fetas)', [68, 286, 3], ['3 g', 1], ['6,4 g', 9], ['3,4 g', 6], ['1,3 g', 6], '0', ['0', 0], ['496 mg', 21]),
    ingredientes: MATAMBRE_ING,
    sellos: [GT, GS, SO],
  },

  // Línea Ogianco
  'linea-ogianco-arrollado-de-pollo-ogianco': { tabla: POLLO, ingredientes: POLLO_ING },
  'linea-ogianco-matambre-arrollado-ogianco': {
    tabla: tabla('40 g (2 fetas)', [68, 286, null], ['3 g', null], ['6,4 g', 9], ['3,4 g', 6], ['1,3 g', null], '0', ['0', 0], ['496 mg', 21]),
    ingredientes: MATAMBRE_ING,
  },
  'linea-ogianco-salchicha-tipo-viena-ogianco-10-cm': { tabla: VIENA_T('37,5 g (1/3 de salchichas)'), ingredientes: VIENA_ING, alergenos: TRIGO, sellos: [SO] },

  // Salchichas
  // Frankfurt: el envase nuevo cambió la etiqueta y en la foto no se lee entera. No se usan los datos del envase anterior.
  'salchichas-salchicha-tipo-frankfurt': { ingredientes: '', alergenos: 'Libre de gluten. Contiene derivados de soja.', pendienteTexto: 'Estamos actualizando la tabla y los ingredientes con los datos del envase nuevo.' },
  'salchichas-salchicha-tipo-hungara-copetin': {
    tabla: tabla('50 g (1 unidad)', [99, 414, 5], ['2 g', null], ['8 g', 11], ['6,5 g', 12], ['2,8 g', 13], '0 g', ['0 g', 0], ['655 mg', 27]),
    ingredientes: HUNGARA_ING,
    sellos: [GT, GS, SO],
  },
  'salchichas-salchicha-tipo-viena-copetin': { tabla: VIENA_T(null), ingredientes: VIENA_ING, alergenos: 'Contiene derivados de trigo.', sellos: [GT, GS, SO] },
  'salchichas-salchicha-tipo-knackwurst': {
    tabla: tabla('40 g (1 unidad)', [81, 340, 4], ['4 g', 1], ['5 g', 6], ['5,2 g', 9], ['3,6 g', 16], '0', ['0', 0], ['480 mg', 20]),
  },
  'salchichas-salchicha-tipo-hungara': {
    tabla: tabla('50 g (1 unidad)', [99, 414, 5], ['2 g', 1], ['8 g', 11], ['6,5 g', 12], ['2,8 g', 13], '0', ['0', 0], [null, 20]),
    ingredientes: HUNGARA_ING,
  },
  'salchichas-salchicha-tipo-weisswurst': {
    tabla: tabla('40 g (2 fetas)', [75, 315, 4], ['3,5 g', 1], ['4,4 g', 6], ['4,8 g', 9], ['2,2 g', 10], '0', ['0', 0], ['234 mg', 10]),
  },
  'salchichas-salchicha-tipo-viena': { tabla: VIENA_T('50 g (1 unidad)'), ingredientes: VIENA_ING, alergenos: TRIGO },

  // Especialidades
  'especialidades-bondiola': { tabla: BONDIOLA, ingredientes: BONDIOLA_ING },
  'especialidades-cracovia': {
    tabla: tabla('40 g (2 fetas)', [64, 269, 3], ['1 g', 0], ['8 g', 11], ['3,1 g', 6], ['1,4 g', 6], '0', ['0', 0], ['680 mg', 28]),
    ingredientes: 'Carne de cerdo, carne vacuna, sal, nuez moscada, pimentón, azúcar, coriandro. Estabilizantes: INS 452i, INS 452ii. Saborizante de humo. Conservantes: INS 251, INS 250.',
    sellos: [GT, GS, SO],
  },
  'especialidades-kassler': {
    tabla: tabla('100 g (1 feta)', [181, 760, 9], ['0 g', 0], ['27 g', 36], ['8 g', 14], ['3,3 g', 15], '0', ['0', 0], ['382 mg', 16]),
    ingredientes: 'Lomo de cerdo, agua, sal. Conservantes: INS 251, INS 250.',
    alergenos: 'Contiene derivados de trigo.',
    sellos: [GT, GS],
  },
  'especialidades-leberkase': {
    ingredientes: 'Carne de cerdo, tocino, carne vacuna, hígado, agua, sal, azúcar, pimienta blanca, coriandro, pimentón, nuez moscada. Estabilizantes: INS 452i, INS 452ii. Saborizante de humo. Conservantes: INS 251, INS 250.',
    sellos: [GT, GS, SO],
  },
  'especialidades-leberwurst': {
    tabla: tabla('40 g (1/3 unidad)', [98, 410, 5], ['7 g', 2], ['5,7 g', 8], ['5,3 g', 10], ['2 g', 9], '0 g', ['0 g', 0], ['403 mg', 17]),
  },
  'especialidades-panceta-horneada-y-ahumada': { tabla: PANCETA, ingredientes: PANCETA_ING, sellos: [GT, GS, SO] },
  'especialidades-salchichon-ahumado': {
    ingredientes: 'Carne de cerdo, carne vacuna, tocino, agua, sal, azúcar, pimienta blanca, coriandro, pimentón, nuez moscada. Estabilizantes: INS 452i, INS 452ii. Saborizante de humo. Conservantes: INS 251, INS 250.',
  },
}
