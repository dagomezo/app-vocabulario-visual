const express = require('express');
const Nivel = require('../models/Nivel');
const Categoria = require('../models/Categoria');
const { authMiddleware, requireProfesor, validateObjectId } = require('../middleware/auth');
const { isAlumno, getScopedNivelIds } = require('../utils/contentScope');

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const filtro = { deletedAt: null };
    if (req.query.categoria_id) filtro.categoria_id = req.query.categoria_id;

    if (isAlumno(req.user)) {
      const nivelIds = await getScopedNivelIds(req.user);
      if (!nivelIds || nivelIds.length === 0) return res.json([]);
      filtro._id = { $in: nivelIds };
    }

    const niveles = await Nivel.find(filtro).sort({ orden: 1 });
    res.json(niveles);
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, requireProfesor, async (req, res, next) => {
  try {
    const nombre = (req.body.nombre || '').trim();
    const categoria_id = (req.body.categoria_id || '').trim();
    const config = req.body.config;

    if (!nombre) return res.status(400).json({ error: 'El nombre del nivel es requerido' });
    if (!categoria_id) return res.status(400).json({ error: 'La categoría es requerida' });

    const catExiste = await Categoria.findById(categoria_id);
    if (!catExiste || catExiste.deletedAt) return res.status(400).json({ error: 'Categoría no encontrada' });

    const maxOrden = await Nivel.findOne({ categoria_id, deletedAt: null }).sort({ orden: -1 }).select('orden');
    const orden = (maxOrden?.orden || 0) + 1;

    const nivel = await Nivel.create({ nombre, orden, categoria_id, config });
    res.status(201).json(nivel);
  } catch (err) {
    next(err);
  }
});

router.put('/reordenar/lote', authMiddleware, requireProfesor, async (req, res, next) => {
  try {
    const { orden } = req.body;

    if (!Array.isArray(orden) || orden.length === 0) {
      return res.status(400).json({ error: 'orden debe ser un array no vacío' });
    }

    await Nivel.bulkWrite(
      orden.map(({ id, orden: pos }) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { orden: pos } }
        }
      }))
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authMiddleware, requireProfesor, validateObjectId, async (req, res, next) => {
  try {
    const nombre = (req.body.nombre || '').trim();
    const orden = req.body.orden;
    const config = req.body.config;

    if (!nombre) return res.status(400).json({ error: 'El nombre del nivel es requerido' });

    const nivel = await Nivel.findByIdAndUpdate(
      req.params.id,
      { nombre, orden, config },
      { new: true }
    );

    if (!nivel) return res.status(404).json({ error: 'Nivel no encontrado' });

    res.json(nivel);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, requireProfesor, validateObjectId, async (req, res, next) => {
  try {
    const nivel = await Nivel.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });

    if (!nivel) return res.status(404).json({ error: 'Nivel no encontrado' });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
