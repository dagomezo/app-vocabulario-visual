/** IDs y sexo de avatares — sincronizado con shell/src/avatares.js */

const SEXO_AVATAR = {
  avatar1: 'ambos', avatar2: 'ambos', avatar3: 'ambos', avatar4: 'ambos', avatar5: 'ambos',
  avatar6: 'ambos', avatar7: 'ambos', avatar8: 'ambos', avatar9: 'ambos',
  hero1: 'masculino', hero2: 'masculino', hero3: 'masculino', hero4: 'masculino',
  hero5: 'masculino', hero6: 'femenino', hero7: 'masculino', hero8: 'femenino', hero9: 'masculino',
}

const AVATAR_IDS = Object.keys(SEXO_AVATAR)

const SEXOS_VALIDOS = ['masculino', 'femenino']

function avatarValidoParaSexo(avatarId, sexo) {
  const tipo = SEXO_AVATAR[avatarId]
  if (!tipo || !SEXOS_VALIDOS.includes(sexo)) return false
  return tipo === 'ambos' || tipo === sexo
}

function avataresInicialesPorSexo(sexo) {
  if (sexo === 'femenino') return ['avatar1', 'hero6']
  return ['avatar1', 'hero1', 'hero2']
}

function avatarPorDefecto(sexo) {
  return avataresInicialesPorSexo(sexo)[0]
}

module.exports = {
  AVATAR_IDS,
  SEXO_AVATAR,
  SEXOS_VALIDOS,
  avatarValidoParaSexo,
  avataresInicialesPorSexo,
  avatarPorDefecto,
}
