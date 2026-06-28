const Progreso = require('../models/Progreso');
const Flashcard = require('../models/Flashcard');
const Nivel = require('../models/Nivel');
const {
  getScopedFlashcardFilter,
  getScopedNivelIds,
  canAccessFlashcard,
} = require('./contentScope');
const { contarPalabrasAprendidas, obtenerResumenGamificacion } = require('./gamificacionAlumno');
const {
  evaluarCompletitudFlashcard,
  flashcardTieneMediosCompletos,
  mergeFiltroMediosCompletos,
} = require('./flashcardMedios');
const Usuario = require('../models/Usuario');

async function obtenerLimitesSesion(nivel_id, nivelIds) {
  const defaults = { max_repasos: 20, max_nuevas: 5 };

  if (nivel_id) {
    const nivel = await Nivel.findById(nivel_id);
    if (!nivel || nivel.deletedAt) return defaults;
    return {
      max_repasos: nivel.config?.max_repasos_diarios ?? defaults.max_repasos,
      max_nuevas: nivel.config?.max_tarjetas_nuevas ?? defaults.max_nuevas,
    };
  }

  if (nivelIds.length === 1) {
    const nivel = await Nivel.findById(nivelIds[0]);
    if (nivel && !nivel.deletedAt) {
      return {
        max_repasos: nivel.config?.max_repasos_diarios ?? defaults.max_repasos,
        max_nuevas: nivel.config?.max_tarjetas_nuevas ?? defaults.max_nuevas,
      };
    }
  }

  return defaults;
}

async function contarPendientesHoy(user, opciones = {}) {
  const usuario_id = user.sub;
  const scopedNivelIds = await getScopedNivelIds(user);
  let nivelIds = scopedNivelIds || [];

  if (opciones.nivel_id) {
    nivelIds = [opciones.nivel_id];
  } else if (opciones.categoria_id) {
    const niveles = await Nivel.find({ categoria_id: opciones.categoria_id, deletedAt: null });
    let ids = niveles.map(n => n._id);
    if (scopedNivelIds) {
      const allowed = new Set(scopedNivelIds.map(id => id.toString()));
      ids = ids.filter(id => allowed.has(id.toString()));
    }
    nivelIds = ids;
  }

  if (nivelIds.length === 0) {
    return { repasos: 0, nuevas: 0, porRepasar: 0, misionCompleta: true };
  }

  const { max_repasos, max_nuevas } = await obtenerLimitesSesion(opciones.nivel_id, nivelIds);

  const repasosDocs = await Progreso.find({
    usuario_id,
    proximo_repaso: { $lte: new Date() },
  }).limit(max_repasos * 2).populate('flashcard_id');

  const repasos = repasosDocs.filter(r =>
    r.flashcard_id &&
    !r.flashcard_id.deletedAt &&
    flashcardTieneMediosCompletos(r.flashcard_id) &&
    canAccessFlashcard(user, r.flashcard_id) &&
    nivelIds.some(id => id.toString() === r.flashcard_id.nivel_id?.toString())
  ).slice(0, max_repasos).length;

  const idsConProgreso = await Progreso.distinct('flashcard_id', { usuario_id });
  const nuevasFilter = mergeFiltroMediosCompletos(await getScopedFlashcardFilter(user, {
    nivel_id: { $in: nivelIds },
    _id: { $nin: idsConProgreso },
  }));
  const nuevasDisponibles = await Flashcard.countDocuments(nuevasFilter);
  const nuevas = Math.min(nuevasDisponibles, max_nuevas);
  const porRepasar = repasos + nuevas;

  return {
    repasos,
    nuevas,
    porRepasar,
    misionCompleta: porRepasar === 0,
  };
}

async function obtenerResumenInicioAlumno(user) {
  const flashcardFilter = mergeFiltroMediosCompletos(await getScopedFlashcardFilter(user));
  const [totalPalabras, aprendidas, pendientes, usuario] = await Promise.all([
    Flashcard.countDocuments(flashcardFilter),
    contarPalabrasAprendidas(user),
    contarPendientesHoy(user),
    Usuario.findById(user.sub),
  ]);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  const gamificacion = await obtenerResumenGamificacion(usuario, user);
  const porcentaje = totalPalabras > 0
    ? Math.round((aprendidas / totalPalabras) * 100)
    : 0;

  return {
    totalPalabras,
    aprendidas,
    sinEmpezar: Math.max(0, totalPalabras - aprendidas),
    porRepasar: pendientes.porRepasar,
    repasosHoy: pendientes.repasos,
    nuevasHoy: pendientes.nuevas,
    misionCompleta: pendientes.misionCompleta,
    porcentaje,
    ...gamificacion,
  };
}

async function resumenCalidadFlashcards(profesorId) {
  const filtro = { deletedAt: null };
  const [total, conImagen, conSena, completas] = await Promise.all([
    Flashcard.countDocuments(filtro),
    Flashcard.countDocuments({ ...filtro, imagen_url: { $nin: [null, ''] } }),
    Flashcard.countDocuments({ ...filtro, video_url: { $nin: [null, ''] } }),
    Flashcard.countDocuments({
      ...filtro,
      imagen_url: { $nin: [null, ''] },
      video_url: { $nin: [null, ''] },
    }),
  ]);

  const incompletas = await Flashcard.find({
    ...filtro,
    $or: [
      { imagen_url: { $in: [null, ''] } },
      { video_url: { $in: [null, ''] } },
    ],
  })
    .select('palabra imagen_url video_url categoria_id nivel_id')
    .populate('categoria_id', 'nombre icono')
    .populate('nivel_id', 'nombre')
    .sort({ palabra: 1 })
    .limit(12)
    .lean();

  return {
    total,
    conImagen,
    conSena,
    completas,
    sinImagen: total - conImagen,
    sinSena: total - conSena,
    incompletas,
  };
}

module.exports = {
  obtenerLimitesSesion,
  contarPendientesHoy,
  obtenerResumenInicioAlumno,
  resumenCalidadFlashcards,
};
