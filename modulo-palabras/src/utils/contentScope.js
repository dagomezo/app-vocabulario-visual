const Flashcard = require('../models/Flashcard');

function isAlumno(user) {
  return user?.rol === 'alumno';
}

function getProfesorId(user) {
  if (!isAlumno(user)) return null;
  return user.profesor_id || null;
}

async function getScopedFlashcardFilter(user, base = {}) {
  const filtro = { ...base, deletedAt: null };
  const profesorId = getProfesorId(user);
  if (profesorId) {
    filtro.creado_por = profesorId;
  }
  return filtro;
}

async function getScopedCategoriaIds(user) {
  const profesorId = getProfesorId(user);
  if (!profesorId) return null;
  return Flashcard.distinct('categoria_id', { creado_por: profesorId, deletedAt: null });
}

async function getScopedNivelIds(user) {
  const profesorId = getProfesorId(user);
  if (!profesorId) return null;
  return Flashcard.distinct('nivel_id', { creado_por: profesorId, deletedAt: null });
}

function canAccessFlashcard(user, flashcard) {
  if (!isAlumno(user)) return true;
  if (!flashcard || flashcard.deletedAt) return false;
  const profesorId = getProfesorId(user);
  if (!profesorId) return false;
  return flashcard.creado_por?.toString() === profesorId.toString();
}

module.exports = {
  isAlumno,
  getProfesorId,
  getScopedFlashcardFilter,
  getScopedCategoriaIds,
  getScopedNivelIds,
  canAccessFlashcard,
};
