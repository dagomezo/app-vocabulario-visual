const Flashcard = require('../models/Flashcard');
const Progreso = require('../models/Progreso');
const { getScopedFlashcardFilter } = require('./contentScope');
const { mergeFiltroMediosCompletos } = require('./flashcardMedios');
const {
  calcularAvataresDesbloqueados,
  construirResumenGamificacion,
} = require('../config/avatarUnlocks');

async function contarPalabrasAprendidas(user) {
  const progresoFilter = { usuario_id: user.sub, repeticiones: { $gt: 0 } };
  const flashcardFilter = mergeFiltroMediosCompletos(await getScopedFlashcardFilter(user));
  const flashcardIds = await Flashcard.find(flashcardFilter).distinct('_id');
  progresoFilter.flashcard_id = { $in: flashcardIds };
  return Progreso.countDocuments(progresoFilter);
}

async function obtenerResumenGamificacion(usuario, userJwt) {
  const palabrasAprendidas = await contarPalabrasAprendidas(userJwt);
  return construirResumenGamificacion(usuario, palabrasAprendidas);
}

function avataresAntes(statsAntes, statsDespues, sexo = 'masculino') {
  const antes = new Set(avataresPorProgreso(statsAntes, sexo));
  const despues = avataresPorProgreso(statsDespues, sexo);
  return despues.filter(id => !antes.has(id));
}

module.exports = {
  contarPalabrasAprendidas,
  obtenerResumenGamificacion,
  avataresAntes,
};
