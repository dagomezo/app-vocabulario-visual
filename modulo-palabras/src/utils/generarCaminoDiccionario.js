const Categoria = require('../models/Categoria');
const Nivel = require('../models/Nivel');
const Flashcard = require('../models/Flashcard');
const Progreso = require('../models/Progreso');
const { getScopedFlashcardFilter, getScopedCategoriaIds } = require('./contentScope');
const { mergeFiltroMediosCompletos } = require('./flashcardMedios');

/**
 * 10 juegos del diccionario: tipos variados, dificultad ascendente.
 * cantidad = palabras (flashcards/quiz) o parejas (memoria/unir).
 */
const PLANTILLAS_CAMINO = [
  { tipo: 'flashcards', dificultad: 'facil', cantidad: 5, titulo: 'Primeras señas' },
  { tipo: 'quiz', dificultad: 'facil', cantidad: 5, titulo: 'Adivina la palabra' },
  { tipo: 'flashcards', dificultad: 'facil', cantidad: 6, titulo: 'Repaso con imágenes' },
  { tipo: 'quiz', dificultad: 'medio', cantidad: 7, titulo: 'Quiz del diccionario' },
  { tipo: 'unir', dificultad: 'medio', cantidad: 4, titulo: 'Une palabra y seña' },
  { tipo: 'flashcards', dificultad: 'medio', cantidad: 8, titulo: 'Tarjetas en marcha' },
  { tipo: 'memoria', dificultad: 'medio', cantidad: 4, titulo: 'Memoria de parejas' },
  { tipo: 'quiz', dificultad: 'medio-alto', cantidad: 9, titulo: 'Quiz de repaso' },
  { tipo: 'unir', dificultad: 'medio-alto', cantidad: 5, titulo: 'Conecta más rápido' },
  { tipo: 'memoria', dificultad: 'dificil', cantidad: 6, titulo: 'Memoria experta' },
];

const DIFICULTAD_LABEL = {
  facil: 'Fácil',
  medio: 'Medio',
  'medio-alto': 'Medio-alto',
  dificil: 'Difícil',
};

const OFFSET_NIVEL = {
  facil: 0,
  medio: 1,
  'medio-alto': 2,
  dificil: 3,
};

const MIN_PALABRAS_VISUAL = { memoria: 2, unir: 2 };
const FALLBACK_TIPO = 'flashcards';

function indiceNivelParaDificultad(nivelesOrdenados, nivelBaseIdx, dificultad) {
  if (!nivelesOrdenados.length) return 0;
  const offset = OFFSET_NIVEL[dificultad] ?? 0;
  return Math.min(Math.max(0, nivelBaseIdx + offset), nivelesOrdenados.length - 1);
}

async function calcularNivelBase(usuarioId, nivelesOrdenados, flashcardFilter) {
  if (!nivelesOrdenados.length) return 0;

  for (let i = 0; i < nivelesOrdenados.length; i++) {
    const nivelId = nivelesOrdenados[i]._id;
    const total = await Flashcard.countDocuments({
      ...flashcardFilter,
      nivel_id: nivelId,
    });
    if (total === 0) continue;

    const idsEnNivel = await Flashcard.find({
      ...flashcardFilter,
      nivel_id: nivelId,
    }).select('_id');

    const cardIds = idsEnNivel.map(c => c._id);
    if (cardIds.length === 0) continue;

    const aprendidas = await Progreso.countDocuments({
      usuario_id: usuarioId,
      flashcard_id: { $in: cardIds },
      repeticiones: { $gt: 0 },
    });

    const ratio = aprendidas / cardIds.length;
    if (ratio < 0.7) return i;
  }

  return Math.max(0, nivelesOrdenados.length - 1);
}

async function palabrasEnScope(flashcardFilter, categoriaId, nivelId, nivelesCategoria) {
  if (nivelId) {
    return Flashcard.countDocuments({
      ...flashcardFilter,
      nivel_id: nivelId,
    });
  }

  const nivelIds = (nivelesCategoria || []).map(n => n._id);
  if (nivelIds.length) {
    return Flashcard.countDocuments({
      ...flashcardFilter,
      nivel_id: { $in: nivelIds },
    });
  }

  return 0;
}

function tipoAjustado(plantilla, palabrasDisponibles) {
  const min = MIN_PALABRAS_VISUAL[plantilla.tipo];
  if (!min) return plantilla.tipo;
  if (palabrasDisponibles >= min) return plantilla.tipo;
  return FALLBACK_TIPO;
}

function cantidadAjustada(tipo, cantidad, palabrasDisponibles) {
  if (tipo === 'memoria' || tipo === 'unir') {
    const pares = Math.min(cantidad, 6, palabrasDisponibles);
    return Math.max(2, pares);
  }
  return Math.min(cantidad, 50, Math.max(1, palabrasDisponibles));
}

function descripcionJuego(tipo, cantidad, dificultadLabel) {
  const unidad = (tipo === 'memoria' || tipo === 'unir')
    ? `${cantidad} parejas`
    : `${cantidad} palabras`;
  return `${dificultadLabel} · ${unidad} del diccionario`;
}

async function generarCaminoDiccionario(usuario) {
  const usuarioId = usuario.sub;
  const flashcardFilter = mergeFiltroMediosCompletos(
    await getScopedFlashcardFilter({ rol: 'alumno', profesor_id: usuario.profesor_id }),
  );
  const scopedCatIds = await getScopedCategoriaIds({ rol: 'alumno', profesor_id: usuario.profesor_id });

  const catFilter = { deletedAt: null };
  if (scopedCatIds?.length) {
    catFilter._id = { $in: scopedCatIds };
  }

  const categorias = await Categoria.find(catFilter).sort({ nombre: 1 }).lean();
  if (!categorias.length) {
    return { camino: [], resumen: { totalPalabras: 0, palabrasAprendidas: 0, categorias: 0 } };
  }

  const nivelesPorCategoria = new Map();
  const basesPorCategoria = new Map();

  for (const cat of categorias) {
    const niveles = await Nivel.find({ categoria_id: cat._id, deletedAt: null })
      .sort({ orden: 1 })
      .lean();
    nivelesPorCategoria.set(cat._id.toString(), niveles);
    basesPorCategoria.set(
      cat._id.toString(),
      await calcularNivelBase(usuarioId, niveles, flashcardFilter),
    );
  }

  const totalPalabras = await Flashcard.countDocuments(flashcardFilter);
  const palabrasAprendidas = await Progreso.countDocuments({
    usuario_id: usuarioId,
    repeticiones: { $gt: 0 },
  });

  const camino = [];

  for (let i = 0; i < PLANTILLAS_CAMINO.length; i++) {
    const plantilla = PLANTILLAS_CAMINO[i];
    const cat = categorias[i % categorias.length];
    const catKey = cat._id.toString();
    const niveles = nivelesPorCategoria.get(catKey) || [];
    const nivelBaseIdx = basesPorCategoria.get(catKey) ?? 0;
    const nivelIdx = indiceNivelParaDificultad(niveles, nivelBaseIdx, plantilla.dificultad);
    const nivel = niveles[nivelIdx] || null;

    let palabrasDisponibles = await palabrasEnScope(
      flashcardFilter,
      cat._id,
      nivel?._id,
      niveles,
    );
    if (palabrasDisponibles === 0 && niveles.length > 0) {
      palabrasDisponibles = await palabrasEnScope(
        flashcardFilter,
        cat._id,
        niveles[0]._id,
        niveles,
      );
    }

    const tipo = tipoAjustado(plantilla, palabrasDisponibles);
    const cantidad = cantidadAjustada(tipo, plantilla.cantidad, palabrasDisponibles);
    const dificultadLabel = DIFICULTAD_LABEL[plantilla.dificultad] || 'Medio';
    const sufijoCat = cat.nombre ? ` — ${cat.nombre}` : '';

    camino.push({
      id: `camino-${i + 1}`,
      orden: i + 1,
      tipo,
      nombre: `${plantilla.titulo}${sufijoCat}`,
      descripcion: descripcionJuego(tipo, cantidad, dificultadLabel),
      dificultad: plantilla.dificultad,
      dificultadLabel,
      cantidad,
      categoria_id: cat._id.toString(),
      categoria_nombre: cat.nombre,
      categoria_icono: cat.icono || '📁',
      nivel_id: nivel ? nivel._id.toString() : null,
      nivel_nombre: nivel?.nombre || null,
      cuenta_progreso: true,
    });
  }

  return {
    camino,
    resumen: {
      totalPalabras,
      palabrasAprendidas,
      categorias: categorias.length,
      progresoPct: totalPalabras > 0
        ? Math.round((palabrasAprendidas / totalPalabras) * 100)
        : 0,
    },
  };
}

module.exports = { generarCaminoDiccionario, PLANTILLAS_CAMINO };
