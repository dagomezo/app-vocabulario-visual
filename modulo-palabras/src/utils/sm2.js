const PESO = { flashcards: 1.0, memoria: 0.7, unir: 0.8, quiz: 1.0 };

function calcularSM2(progreso, calificacion, tipoJuego = 'flashcards') {
  const scoreAjustado = Math.round(calificacion * (PESO[tipoJuego] || 1.0));

  let { intervalo, easiness_factor, repeticiones } = progreso;

  if (scoreAjustado < 3) {
    intervalo = 1;
    repeticiones = 0;
  } else {
    if (repeticiones === 0) intervalo = 1;
    else if (repeticiones === 1) intervalo = 6;
    else intervalo = Math.round(intervalo * easiness_factor);

    easiness_factor = Math.max(
      1.3,
      easiness_factor + 0.1 - (5 - scoreAjustado) * (0.08 + (5 - scoreAjustado) * 0.02)
    );
    repeticiones += 1;
  }

  const proximo_repaso = new Date();
  proximo_repaso.setDate(proximo_repaso.getDate() + intervalo);

  return { intervalo, easiness_factor, repeticiones, proximo_repaso };
}

module.exports = { calcularSM2, PESO };
