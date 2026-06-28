const express = require('express');
const Sesion = require('../models/Sesion');
const { validateObjectId } = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { sessionId, deviceId, nombreAlumno, avatar } = req.body;
    if (!sessionId || !deviceId) {
      return res.status(400).json({ error: 'sessionId y deviceId son requeridos' });
    }
    let sesion = await Sesion.findOne({ sessionId });
    if (sesion) {
      if (nombreAlumno !== undefined) sesion.nombreAlumno = nombreAlumno;
      if (avatar !== undefined) sesion.avatar = avatar;
      await sesion.save();
      return res.json(sesion);
    }
    sesion = await Sesion.create({ sessionId, deviceId, nombreAlumno, avatar });
    res.status(201).json(sesion);
  } catch (err) {
    next(err);
  }
});

router.post('/palabra', async (req, res, next) => {
  try {
    const { sessionId, palabraId, acertada, juegoTipo } = req.body;
    if (!sessionId || !palabraId) {
      return res.status(400).json({ error: 'sessionId y palabraId son requeridos' });
    }
    const sesion = await Sesion.findOne({ sessionId });
    if (!sesion) return res.status(404).json({ error: 'Sesión no encontrada' });
    sesion.palabras.push({ palabraId, acertada, juegoTipo, timestamp: new Date() });
    await sesion.save();
    res.json(sesion);
  } catch (err) {
    next(err);
  }
});

router.post('/juego', async (req, res, next) => {
  try {
    const { sessionId, tipo, categoriaId, total, correctas } = req.body;
    if (!sessionId || !tipo || !categoriaId) {
      return res.status(400).json({ error: 'sessionId, tipo y categoriaId son requeridos' });
    }
    const sesion = await Sesion.findOne({ sessionId });
    if (!sesion) return res.status(404).json({ error: 'Sesión no encontrada' });
    sesion.juegosCompletados.push({ tipo, categoriaId, total, correctas, timestamp: new Date() });
    await sesion.save();
    res.json(sesion);
  } catch (err) {
    next(err);
  }
});

router.get('/:sessionId', async (req, res, next) => {
  try {
    const sesion = await Sesion.findOne({ sessionId: req.params.sessionId });
    if (!sesion) {
      return res.json({ palabrasVistas: 0, palabrasAcertadas: 0, juegosCompletados: 0, rachaActual: 0, mejorRacha: 0 });
    }
    const palabrasVistas = sesion.palabras.length;
    const palabrasAcertadas = sesion.palabras.filter(p => p.acertada).length;

    let rachaActual = 0;
    let mejorRacha = 0;
    for (const p of sesion.palabras.sort((a, b) => a.timestamp - b.timestamp)) {
      if (p.acertada) {
        rachaActual++;
        mejorRacha = Math.max(mejorRacha, rachaActual);
      } else {
        rachaActual = 0;
      }
    }

    res.json({
      palabrasVistas,
      palabrasAcertadas,
      juegosCompletados: sesion.juegosCompletados.length,
      rachaActual,
      mejorRacha,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
