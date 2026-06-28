const express = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { authMiddleware, requireProfesor, validateObjectId, validateAvatarId } = require('../middleware/auth');
const { avatarValidoParaSexo, avatarPorDefecto, SEXOS_VALIDOS } = require('../config/avatares');

const router = express.Router();

const PINES_INVALIDOS = ['1234', '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999'];

function generarPin() {
  let pin;
  do {
    pin = Math.floor(1000 + Math.random() * 9000).toString();
  } while (PINES_INVALIDOS.includes(pin));
  return pin;
}

router.get('/', authMiddleware, requireProfesor, async (req, res, next) => {
  try {
    const filtro = {
      rol: 'alumno',
      deletedAt: null
    };

    if (req.user.rol === 'profesor') {
      filtro.profesor_id = req.user.sub;
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const [alumnos, total] = await Promise.all([
      Usuario.find(filtro)
        .select('-pin_hash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Usuario.countDocuments(filtro)
    ]);

    res.json({
      data: alumnos,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, requireProfesor, validateAvatarId, async (req, res, next) => {
  try {
    const nombre = (req.body.nombre || '').trim();
    const sexo = (req.body.sexo || '').trim();
    let avatar_id = req.body.avatar_id || avatarPorDefecto(sexo || 'masculino');

    if (!nombre) return res.status(400).json({ error: 'El nombre del alumno es requerido' });
    if (!SEXOS_VALIDOS.includes(sexo)) {
      return res.status(400).json({ error: 'Selecciona el tipo de personajes (icono superior)' });
    }
    if (!avatarValidoParaSexo(avatar_id, sexo)) {
      return res.status(400).json({
        error: 'El avatar elegido no corresponde al sexo del alumno',
      });
    }

    const pin = generarPin();
    const pin_hash = await bcrypt.hash(pin, 10);

    const alumno = await Usuario.create({
      nombre,
      sexo,
      rol: 'alumno',
      avatar_id,
      pin_hash,
      profesor_id: req.user.sub,
      creado_por: req.user.sub,
    });

    res.status(201).json({ alumno, pin });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/reset-pin', authMiddleware, requireProfesor, validateObjectId, async (req, res, next) => {
  try {
    const pin = generarPin();
    const pin_hash = await bcrypt.hash(pin, 10);

    const alumno = await Usuario.findOneAndUpdate(
      { _id: req.params.id, profesor_id: req.user.sub },
      { pin_hash },
      { new: true }
    );

    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });

    res.json({ pin });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, requireProfesor, validateObjectId, async (req, res, next) => {
  try {
    const alumno = await Usuario.findOneAndUpdate(
      { _id: req.params.id, profesor_id: req.user.sub },
      { deletedAt: new Date() }
    );

    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
