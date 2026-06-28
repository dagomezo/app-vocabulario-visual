const {
  avataresInicialesPorSexo,
  avatarValidoParaSexo,
} = require('./avatares');
const { getPrecioAvatar } = require('./monedas');

/**
 * Reglas de desbloqueo.
 * sexo: solo aplica a reglas de héroes; animales son para todos.
 */
const REGLAS_DESBLOQUEO = [
  { avatar_id: 'avatar2', tipo: 'palabras', valor: 3, etiqueta: 'Aprende 3 palabras' },
  { avatar_id: 'hero3', sexo: 'masculino', tipo: 'sesiones', valor: 1, etiqueta: 'Completa 1 juego' },
  { avatar_id: 'avatar3', tipo: 'palabras', valor: 5, etiqueta: 'Aprende 5 palabras' },
  { avatar_id: 'hero4', sexo: 'masculino', tipo: 'racha', valor: 2, etiqueta: 'Racha de 2 días' },
  { avatar_id: 'hero8', sexo: 'femenino', tipo: 'racha', valor: 2, etiqueta: 'Racha de 2 días' },
  { avatar_id: 'avatar4', tipo: 'palabras', valor: 10, etiqueta: 'Aprende 10 palabras' },
  { avatar_id: 'hero5', sexo: 'masculino', tipo: 'racha', valor: 3, etiqueta: 'Racha de 3 días' },
  { avatar_id: 'avatar5', tipo: 'palabras', valor: 15, etiqueta: 'Aprende 15 palabras' },
  { avatar_id: 'hero5', sexo: 'masculino', tipo: 'palabras', valor: 20, etiqueta: 'Aprende 20 palabras' },
  { avatar_id: 'avatar6', tipo: 'racha', valor: 5, etiqueta: 'Racha de 5 días' },
  { avatar_id: 'hero7', sexo: 'masculino', tipo: 'palabras', valor: 30, etiqueta: 'Aprende 30 palabras' },
  { avatar_id: 'avatar7', tipo: 'palabras', valor: 40, etiqueta: 'Aprende 40 palabras' },
  { avatar_id: 'avatar8', tipo: 'palabras', valor: 50, etiqueta: 'Aprende 50 palabras' },
  { avatar_id: 'hero9', sexo: 'masculino', tipo: 'palabras', valor: 60, etiqueta: 'Aprende 60 palabras' },
  { avatar_id: 'avatar9', tipo: 'racha', valor: 10, etiqueta: 'Racha de 10 días' },
];

function reglaAplicaParaSexo(regla, sexo) {
  if (regla.sexo && regla.sexo !== sexo) return false
  return avatarValidoParaSexo(regla.avatar_id, sexo)
}

function getAvataresIniciales(sexo = 'masculino') {
  return avataresInicialesPorSexo(sexo)
}

function cumpleRegla(regla, stats) {
  const { palabrasAprendidas, rachaActual, sesionesCompletadas } = stats
  switch (regla.tipo) {
    case 'palabras':
      return palabrasAprendidas >= regla.valor
    case 'racha':
      return rachaActual >= regla.valor
    case 'sesiones':
      return sesionesCompletadas >= regla.valor
    default:
      return false
  }
}

function avataresPorProgreso(stats, sexo = 'masculino') {
  const desbloqueados = new Set(getAvataresIniciales(sexo));
  for (const regla of REGLAS_DESBLOQUEO) {
    if (!reglaAplicaParaSexo(regla, sexo)) continue;
    if (cumpleRegla(regla, stats)) {
      desbloqueados.add(regla.avatar_id);
    }
  }
  return [...desbloqueados].filter(id => avatarValidoParaSexo(id, sexo));
}

function todosAvataresDisponibles(stats, sexo, avataresExtra = []) {
  const porProgreso = avataresPorProgreso(stats, sexo);
  const extras = (avataresExtra || []).filter(id => avatarValidoParaSexo(id, sexo));
  return [...new Set([...porProgreso, ...extras])];
}

function calcularAvataresDesbloqueados(stats, sexo = 'masculino', avataresExtra = []) {
  return todosAvataresDisponibles(stats, sexo, avataresExtra);
}

function obtenerReglaAvatar(avatarId, sexo = 'masculino') {
  return REGLAS_DESBLOQUEO.find(r => r.avatar_id === avatarId && reglaAplicaParaSexo(r, sexo)) || null
}

function fechaHoyISO() {
  return new Date().toISOString().slice(0, 10)
}

function fechaAyerISO() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function actualizarRacha(usuario) {
  const hoy = fechaHoyISO()
  const ultima = usuario.ultima_sesion_fecha
    ? new Date(usuario.ultima_sesion_fecha).toISOString().slice(0, 10)
    : null

  let rachaActual = usuario.racha_actual || 0
  let incrementada = false

  if (ultima === hoy) {
    // Ya contó hoy
  } else if (ultima === fechaAyerISO()) {
    rachaActual += 1
    incrementada = true
  } else {
    rachaActual = 1
    incrementada = true
  }

  const rachaMaxima = Math.max(usuario.racha_maxima || 0, rachaActual)

  return {
    racha_actual: rachaActual,
    racha_maxima: rachaMaxima,
    ultima_sesion_fecha: new Date(hoy),
    racha_incrementada: incrementada,
  }
}

function construirResumenGamificacion(usuario, palabrasAprendidas) {
  const sexo = usuario.sexo || 'masculino';
  const avataresExtra = usuario.avatares_extra || [];
  const stats = {
    palabrasAprendidas,
    rachaActual: usuario.racha_actual || 0,
    sesionesCompletadas: usuario.sesiones_completadas || 0,
  };

  const desbloqueados = calcularAvataresDesbloqueados(stats, sexo, avataresExtra);
  const proximos = REGLAS_DESBLOQUEO
    .filter(r => reglaAplicaParaSexo(r, sexo) && !desbloqueados.includes(r.avatar_id))
    .slice(0, 3)
    .map(r => ({
      avatar_id: r.avatar_id,
      etiqueta: r.etiqueta,
      tipo: r.tipo,
      valor: r.valor,
      precio_monedas: getPrecioAvatar(r.avatar_id),
      progreso: stats.palabrasAprendidas,
      racha: stats.rachaActual,
      sesiones: stats.sesionesCompletadas,
    }));

  const reglasAplicables = REGLAS_DESBLOQUEO.filter(r => reglaAplicaParaSexo(r, sexo));

  return {
    racha_actual: stats.rachaActual,
    racha_maxima: usuario.racha_maxima || 0,
    palabras_aprendidas: palabrasAprendidas,
    sesiones_completadas: stats.sesionesCompletadas,
    retos_camino: usuario.retos_camino || 0,
    monedas: usuario.monedas || 0,
    sexo,
    avatares_desbloqueados: desbloqueados,
    avatares_totales: getAvataresIniciales(sexo).length + reglasAplicables.length,
    proximos_desbloqueos: proximos,
    avatares_iniciales: getAvataresIniciales(sexo),
  };
}

module.exports = {
  REGLAS_DESBLOQUEO,
  getAvataresIniciales,
  avataresPorProgreso,
  calcularAvataresDesbloqueados,
  obtenerReglaAvatar,
  actualizarRacha,
  construirResumenGamificacion,
  cumpleRegla,
  reglaAplicaParaSexo,
}
