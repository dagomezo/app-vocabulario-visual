const express = require('express');
const Progreso = require('../models/Progreso');
const Flashcard = require('../models/Flashcard');
const Nivel = require('../models/Nivel');
const Usuario = require('../models/Usuario');
const Actividad = require('../models/Actividad');
const { authMiddleware, requireProfesor } = require('../middleware/auth');
const { calcularSM2 } = require('../utils/sm2');
const {
  isAlumno,
  getProfesorId,
  getScopedFlashcardFilter,
  getScopedNivelIds,
  canAccessFlashcard,
} = require('../utils/contentScope');
const { actualizarRacha, calcularAvataresDesbloqueados, avataresPorProgreso } = require('../config/avatarUnlocks');
const { avatarValidoParaSexo } = require('../config/avatares');
const { calcularMonedasParcial, getPrecioAvatar } = require('../config/monedas');
const {
  contarPalabrasAprendidas,
  obtenerResumenGamificacion,
  avataresAntes,
} = require('../utils/gamificacionAlumno');
const {
  obtenerLimitesSesion,
  obtenerResumenInicioAlumno,
  resumenCalidadFlashcards,
} = require('../utils/resumenInicioAlumno');
const {
  flashcardTieneMediosCompletos,
  mergeFiltroMediosCompletos,
} = require('../utils/flashcardMedios');
const { generarCaminoDiccionario } = require('../utils/generarCaminoDiccionario');

const router = express.Router();

function mezclar(cartas) {
  return [...cartas].sort(() => Math.random() - 0.5);
}

router.get('/resumen-inicio', authMiddleware, async (req, res, next) => {
  try {
    if (!isAlumno(req.user)) {
      return res.status(403).json({ error: 'Solo disponible para alumnos' });
    }
    if (!getProfesorId(req.user)) {
      return res.status(403).json({ error: 'Alumno sin profesor asignado' });
    }

    const data = await obtenerResumenInicioAlumno(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/sesion', authMiddleware, async (req, res, next) => {
  try {
    const usuario_id = req.user.sub;
    const { nivel_id, categoria_id, practica_libre } = req.query;
    const profesorId = getProfesorId(req.user);
    const scopedNivelIds = isAlumno(req.user) ? await getScopedNivelIds(req.user) : null;

    if (isAlumno(req.user) && !profesorId) {
      return res.status(403).json({ error: 'Alumno sin profesor asignado' });
    }

    if (practica_libre === 'true') {
      const filter = mergeFiltroMediosCompletos(await getScopedFlashcardFilter(req.user));
      if (categoria_id) {
        const niveles = await Nivel.find({ categoria_id, deletedAt: null });
        let nivelIds = niveles.map(n => n._id);
        if (scopedNivelIds) {
          const allowed = new Set(scopedNivelIds.map(id => id.toString()));
          nivelIds = nivelIds.filter(id => allowed.has(id.toString()));
        }
        filter.nivel_id = { $in: nivelIds };
      } else if (nivel_id) {
        if (scopedNivelIds && !scopedNivelIds.some(id => id.toString() === nivel_id)) {
          return res.json([]);
        }
        filter.nivel_id = nivel_id;
      } else if (scopedNivelIds) {
        filter.nivel_id = { $in: scopedNivelIds };
      }
      const cantidad = Math.min(
        Math.max(parseInt(req.query.cantidad, 10) || 20, 1),
        50,
      );
      const cards = await Flashcard.find(filter).limit(cantidad * 2);
      return res.json(mezclar(cards).slice(0, cantidad).map(c => ({ ...c.toObject(), es_repaso: false })));
    }

    let nivelIds = [];

    if (nivel_id) {
      const nivel = await Nivel.findById(nivel_id);
      if (!nivel || nivel.deletedAt) return res.status(404).json({ error: 'Nivel no encontrado' });
      if (scopedNivelIds && !scopedNivelIds.some(id => id.toString() === nivel_id)) {
        return res.json([]);
      }
      nivelIds = [nivel_id];
    } else if (categoria_id) {
      const niveles = await Nivel.find({ categoria_id, deletedAt: null });
      let ids = niveles.map(n => n._id);
      if (scopedNivelIds) {
        const allowed = new Set(scopedNivelIds.map(id => id.toString()));
        ids = ids.filter(id => allowed.has(id.toString()));
      }
      nivelIds = ids;
    } else if (scopedNivelIds) {
      nivelIds = scopedNivelIds;
    } else {
      const niveles = await Nivel.find({ deletedAt: null });
      nivelIds = niveles.map(n => n._id);
    }

    if (nivelIds.length === 0) {
      return res.json([]);
    }

    const { max_repasos, max_nuevas } = await obtenerLimitesSesion(nivel_id, nivelIds);

    const repasos = await Progreso.find({
      usuario_id,
      proximo_repaso: { $lte: new Date() }
    }).limit(max_repasos * 2).populate('flashcard_id');

    const repasosFiltrados = repasos.filter(r =>
      r.flashcard_id &&
      !r.flashcard_id.deletedAt &&
      flashcardTieneMediosCompletos(r.flashcard_id) &&
      canAccessFlashcard(req.user, r.flashcard_id) &&
      nivelIds.some(id => id.toString() === r.flashcard_id.nivel_id?.toString())
    ).slice(0, max_repasos);

    const idsConProgreso = await Progreso.distinct('flashcard_id', { usuario_id });
    const nuevasFilter = mergeFiltroMediosCompletos(await getScopedFlashcardFilter(req.user, {
      nivel_id: { $in: nivelIds },
      _id: { $nin: idsConProgreso },
    }));
    const nuevas = await Flashcard.find(nuevasFilter).limit(max_nuevas);

    const repasosMapeados = repasosFiltrados.map(r => ({ ...r.flashcard_id.toObject(), es_repaso: true }));
    const nuevasMapeadas = nuevas.map(f => ({ ...f.toObject(), es_repaso: false }));
    let sesion = mezclar([...repasosMapeados, ...nuevasMapeadas]);

    const limiteCantidad = parseInt(req.query.cantidad, 10);
    const cantidadObjetivo = (limiteCantidad >= 1 && limiteCantidad <= 50)
      ? limiteCantidad
      : 10;

    if (limiteCantidad >= 1 && limiteCantidad <= 50) {
      sesion = sesion.slice(0, limiteCantidad);
    }

    // Sin pendientes SM-2 hoy: práctica libre con vocabulario de la clase
    if (sesion.length === 0) {
      const filter = mergeFiltroMediosCompletos(await getScopedFlashcardFilter(req.user));
      if (nivelIds.length) filter.nivel_id = { $in: nivelIds };
      const cards = await Flashcard.find(filter).limit(cantidadObjetivo * 2);
      sesion = mezclar(cards.map(f => ({
        ...f.toObject(),
        es_repaso: false,
        es_practica_extra: true,
      }))).slice(0, cantidadObjetivo);
    } else {
      sesion = sesion.map(c => ({ ...c, es_practica_extra: false }));
    }

    res.json(sesion);
  } catch (err) {
    next(err);
  }
});

router.get('/camino', authMiddleware, async (req, res, next) => {
  try {
    if (!isAlumno(req.user)) {
      return res.status(403).json({ error: 'Solo disponible para alumnos' });
    }
    if (!getProfesorId(req.user)) {
      return res.status(403).json({ error: 'Alumno sin profesor asignado' });
    }

    const data = await generarCaminoDiccionario(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/evaluar', authMiddleware, async (req, res, next) => {
  try {
    const { flashcard_id, calificacion, tipoJuego = 'flashcards' } = req.body;

    if (!flashcard_id) return res.status(400).json({ error: 'flashcard_id es requerido' });
    if (!calificacion || calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ error: 'calificacion debe estar entre 1 y 5' });
    }
    if (!['flashcards', 'memoria', 'unir', 'quiz'].includes(tipoJuego)) {
      return res.status(400).json({ error: 'tipoJuego inválido' });
    }

    const usuario_id = req.user.sub;

    const flashcard = await Flashcard.findById(flashcard_id);
    if (!flashcard || flashcard.deletedAt) {
      return res.status(404).json({ error: 'Flashcard no encontrada' });
    }
    if (!canAccessFlashcard(req.user, flashcard)) {
      return res.status(403).json({ error: 'No tienes acceso a esta palabra' });
    }

    let progreso = await Progreso.findOne({ usuario_id, flashcard_id });

    if (!progreso) {
      progreso = new Progreso({ usuario_id, flashcard_id });
    }

    const resultado = calcularSM2(progreso, calificacion, tipoJuego);
    progreso.intervalo = resultado.intervalo;
    progreso.easiness_factor = resultado.easiness_factor;
    progreso.repeticiones = resultado.repeticiones;
    progreso.proximo_repaso = resultado.proximo_repaso;
    progreso.ultima_respuesta = new Date();
    progreso.ultima_fuente = tipoJuego;

    await progreso.save();
    res.json(progreso);
  } catch (err) {
    next(err);
  }
});

router.get('/analiticas', authMiddleware, requireProfesor, async (req, res, next) => {
  try {
    const Sesion = require('../models/Sesion');
    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 7);

    const [
      totalSesiones,
      sesionesActivas,
      sesionesHoy,
      todasPalabras,
      actividadDiaria,
      juegoDistribucion,
      calidadFlashcards,
    ] = await Promise.all([
      Sesion.countDocuments({}),
      Sesion.countDocuments({ updatedAt: { $gte: hace7dias } }),
      Sesion.countDocuments({
        updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      Sesion.aggregate([
        { $unwind: '$palabras' },
        { $count: 'total' },
      ]),
      Sesion.aggregate([
        { $match: { updatedAt: { $gte: hace7dias } } },
        { $unwind: '$palabras' },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$palabras.timestamp' } },
            total: { $sum: 1 },
          }
        },
        { $sort: { _id: 1 } },
      ]),
      Sesion.aggregate([
        { $match: { updatedAt: { $gte: hace7dias } } },
        { $unwind: '$palabras' },
        {
          $group: {
            _id: '$palabras.juegoTipo',
            total: { $sum: 1 },
          }
        },
      ]),
      Flashcard.countDocuments({ deletedAt: null })
        .then(async (total) => {
          const [conImagen, conSena, completas] = await Promise.all([
            Flashcard.countDocuments({ deletedAt: null, imagen_url: { $nin: [null, ''] } }),
            Flashcard.countDocuments({ deletedAt: null, video_url: { $nin: [null, ''] } }),
            Flashcard.countDocuments({
              deletedAt: null,
              imagen_url: { $nin: [null, ''] },
              video_url: { $nin: [null, ''] },
            }),
          ]);
          const incompletas = await Flashcard.find({
            deletedAt: null,
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
          return { total, conImagen, conSena, completas, sinImagen: total - conImagen, sinSena: total - conSena, incompletas };
        }),
    ]);

    res.json({
      totalAlumnos: totalSesiones,
      alumnosActivos: sesionesActivas,
      sesionesHoy,
      palabrasTotales: todasPalabras[0]?.total || 0,
      calidadFlashcards,
      rankingRetos: [],
      palabrasDificiles: [],
      progresoSemanal: actividadDiaria,
      distribucionCalif: juegoDistribucion,
      actividadSemanal: actividadDiaria,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/gamificacion', authMiddleware, async (req, res, next) => {
  try {
    if (!isAlumno(req.user)) {
      return res.status(403).json({ error: 'Solo para alumnos' });
    }
    if (!getProfesorId(req.user)) {
      return res.status(403).json({ error: 'Alumno sin profesor asignado' });
    }

    const usuario = await Usuario.findById(req.user.sub);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const resumen = await obtenerResumenGamificacion(usuario, req.user);
    res.json(resumen);
  } catch (err) {
    next(err);
  }
});

router.post('/completar-sesion', authMiddleware, async (req, res, next) => {
  try {
    if (!isAlumno(req.user)) {
      return res.status(403).json({ error: 'Solo para alumnos' });
    }

    const practicaLibre = Boolean(req.body.practica_libre);
    const usuario = await Usuario.findById(req.user.sub);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const palabrasAntes = await contarPalabrasAprendidas(req.user);
    const statsAntes = {
      palabrasAprendidas: palabrasAntes,
      rachaActual: usuario.racha_actual || 0,
      sesionesCompletadas: usuario.sesiones_completadas || 0,
    };

    let rachaIncrementada = false;

    if (!practicaLibre) {
      const racha = actualizarRacha(usuario);
      usuario.racha_actual = racha.racha_actual;
      usuario.racha_maxima = racha.racha_maxima;
      usuario.ultima_sesion_fecha = racha.ultima_sesion_fecha;
      rachaIncrementada = racha.racha_incrementada;
      usuario.sesiones_completadas = (usuario.sesiones_completadas || 0) + 1;

      const caminoOrden = parseInt(req.body.camino, 10);
      if (caminoOrden >= 1 && caminoOrden <= 10) {
        usuario.retos_camino = (usuario.retos_camino || 0) + 1;
      }

      await usuario.save();
    }

    const palabrasDespues = practicaLibre
      ? palabrasAntes
      : await contarPalabrasAprendidas(req.user);

    const statsDespues = {
      palabrasAprendidas: palabrasDespues,
      rachaActual: usuario.racha_actual || 0,
      sesionesCompletadas: usuario.sesiones_completadas || 0,
    };

    const nuevosAvatares = avataresAntes(statsAntes, statsDespues, usuario.sexo || 'masculino');
    const gamificacion = await obtenerResumenGamificacion(usuario, req.user);

    res.json({
      ...gamificacion,
      nuevos_avatares: nuevosAvatares,
      racha_incrementada: rachaIncrementada,
      palabras_nuevas_en_sesion: palabrasDespues - palabrasAntes,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/desafio-avatar', authMiddleware, async (req, res, next) => {
  try {
    if (!isAlumno(req.user)) {
      return res.status(403).json({ error: 'Solo para alumnos' });
    }

    const avatar_id = (req.body.avatar_id || '').trim();
    const completado = Boolean(req.body.completado);
    const progreso = Math.min(1, Math.max(0, Number(req.body.progreso) || 0));

    if (!avatar_id) {
      return res.status(400).json({ error: 'avatar_id requerido' });
    }

    const usuario = await Usuario.findById(req.user.sub);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const sexo = usuario.sexo || 'masculino';
    if (!avatarValidoParaSexo(avatar_id, sexo)) {
      return res.status(400).json({ error: 'Avatar no disponible' });
    }

    const palabrasAprendidas = await contarPalabrasAprendidas(req.user);
    const stats = {
      palabrasAprendidas,
      rachaActual: usuario.racha_actual || 0,
      sesionesCompletadas: usuario.sesiones_completadas || 0,
    };
    const yaDesbloqueado = calcularAvataresDesbloqueados(
      stats,
      sexo,
      usuario.avatares_extra || [],
    ).includes(avatar_id);

    if (yaDesbloqueado) {
      const resumen = await obtenerResumenGamificacion(usuario, req.user);
      return res.json({
        ...resumen,
        desafio_completado: false,
        monedas_ganadas: 0,
        avatar_desbloqueado: null,
        mensaje: 'Ese avatar ya está desbloqueado',
      });
    }

    let monedasGanadas = 0;
    let avatarDesbloqueado = null;

    if (completado) {
      if (!usuario.avatares_extra.includes(avatar_id)) {
        usuario.avatares_extra.push(avatar_id);
      }
      monedasGanadas = calcularMonedasParcial(1);
      avatarDesbloqueado = avatar_id;
    } else if (progreso > 0) {
      monedasGanadas = calcularMonedasParcial(progreso);
    }

    if (monedasGanadas > 0) {
      usuario.monedas = (usuario.monedas || 0) + monedasGanadas;
    }

    await usuario.save();

    const resumen = await obtenerResumenGamificacion(usuario, req.user);
    res.json({
      ...resumen,
      desafio_completado: completado,
      monedas_ganadas: monedasGanadas,
      avatar_desbloqueado: avatarDesbloqueado,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/comprar-avatar', authMiddleware, async (req, res, next) => {
  try {
    if (!isAlumno(req.user)) {
      return res.status(403).json({ error: 'Solo para alumnos' });
    }

    const avatar_id = (req.body.avatar_id || '').trim();
    if (!avatar_id) {
      return res.status(400).json({ error: 'avatar_id requerido' });
    }

    const usuario = await Usuario.findById(req.user.sub);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const sexo = usuario.sexo || 'masculino';
    if (!avatarValidoParaSexo(avatar_id, sexo)) {
      return res.status(400).json({ error: 'Avatar no disponible' });
    }

    const palabrasAprendidas = await contarPalabrasAprendidas(req.user);
    const stats = {
      palabrasAprendidas,
      rachaActual: usuario.racha_actual || 0,
      sesionesCompletadas: usuario.sesiones_completadas || 0,
    };
    const desbloqueados = calcularAvataresDesbloqueados(
      stats,
      sexo,
      usuario.avatares_extra || [],
    );

    if (desbloqueados.includes(avatar_id)) {
      return res.status(400).json({ error: 'Ese avatar ya está desbloqueado' });
    }

    const precio = getPrecioAvatar(avatar_id);
    const monedas = usuario.monedas || 0;
    if (monedas < precio) {
      return res.status(400).json({
        error: `Necesitas ${precio} monedas. Tienes ${monedas}.`,
        monedas,
        precio,
      });
    }

    usuario.monedas = monedas - precio;
    if (!usuario.avatares_extra.includes(avatar_id)) {
      usuario.avatares_extra.push(avatar_id);
    }
    await usuario.save();

    const resumen = await obtenerResumenGamificacion(usuario, req.user);
    res.json({
      ...resumen,
      avatar_comprado: avatar_id,
      precio_pagado: precio,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/palabras-aprendidas', authMiddleware, async (req, res, next) => {
  try {
    if (isAlumno(req.user) && !getProfesorId(req.user)) {
      return res.status(403).json({ error: 'Alumno sin profesor asignado' });
    }

    const progresoFilter = { usuario_id: req.user.sub, repeticiones: { $gt: 0 } };

    if (isAlumno(req.user)) {
      const flashcardFilter = await getScopedFlashcardFilter(req.user);
      const flashcardIds = await Flashcard.find(flashcardFilter).distinct('_id');
      progresoFilter.flashcard_id = { $in: flashcardIds };
    }

    const total = await Progreso.countDocuments(progresoFilter);
    res.json({ total });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
