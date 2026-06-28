/** Economía de moneditas — equilibrada para niños */

const MONEDAS_BONUS_DESAFIO = 4
const MONEDAS_PARCIAL_MAX = 3

/** Cuántas rondas por tipo de juego en un desafío */
const DESAFIO_CANTIDAD_FLASH = 5
const DESAFIO_CANTIDAD_VISUAL = 4

/** Quiz: puede fallar 1 de cada 5 (80 %) y aún ganar el avatar */
const QUIZ_RATIO_EXITO = 0.8

function calcularMonedasParcial(progreso) {
  const p = Math.min(1, Math.max(0, Number(progreso) || 0))
  if (p <= 0) return 0
  if (p >= 1) return MONEDAS_BONUS_DESAFIO
  return Math.max(1, Math.round(p * MONEDAS_PARCIAL_MAX))
}

function getPrecioAvatar(avatarId) {
  if (avatarId.startsWith('avatar')) {
    const n = parseInt(avatarId.replace('avatar', ''), 10)
    if (n <= 4) return 12
    if (n <= 7) return 18
    return 22
  }
  if (avatarId.startsWith('hero')) return 26
  return 18
}

function cantidadDesafioPorModo(modo) {
  if (modo === 'memoria' || modo === 'unir') return DESAFIO_CANTIDAD_VISUAL
  return DESAFIO_CANTIDAD_FLASH
}

function aciertosMinimosQuiz(objetivo) {
  return Math.max(1, Math.ceil(objetivo * QUIZ_RATIO_EXITO))
}

module.exports = {
  MONEDAS_BONUS_DESAFIO,
  MONEDAS_PARCIAL_MAX,
  DESAFIO_CANTIDAD_FLASH,
  DESAFIO_CANTIDAD_VISUAL,
  QUIZ_RATIO_EXITO,
  calcularMonedasParcial,
  getPrecioAvatar,
  cantidadDesafioPorModo,
  aciertosMinimosQuiz,
}
