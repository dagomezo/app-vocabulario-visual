function evaluarCompletitudFlashcard(fc) {
  const tieneImagen = Boolean(fc?.imagen_url?.toString?.().trim());
  const tieneSena = Boolean(fc?.video_url?.toString?.().trim());
  return {
    completa: tieneImagen && tieneSena,
    tieneImagen,
    tieneSena,
    listaParaJuegos: tieneImagen && tieneSena,
  };
}

function flashcardTieneMediosCompletos(fc) {
  if (!fc) return false;
  const imagen = (fc.imagen_url || '').toString().trim();
  const sena = (fc.video_url || '').toString().trim();
  return Boolean(imagen && sena);
}

function mergeFiltroMediosCompletos(filtro = {}) {
  return {
    ...filtro,
    imagen_url: { $nin: [null, ''] },
    video_url: { $nin: [null, ''] },
  };
}

module.exports = {
  evaluarCompletitudFlashcard,
  flashcardTieneMediosCompletos,
  mergeFiltroMediosCompletos,
};
