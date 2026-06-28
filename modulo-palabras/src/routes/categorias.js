const express = require('express');
const Categoria = require('../models/Categoria');
const Nivel = require('../models/Nivel');
const Flashcard = require('../models/Flashcard');
const { authMiddleware, requireProfesor, validateObjectId } = require('../middleware/auth');
const { isAlumno, getScopedCategoriaIds } = require('../utils/contentScope');

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const filtro = { deletedAt: null };

    if (isAlumno(req.user)) {
      const catIds = await getScopedCategoriaIds(req.user);
      if (!catIds || catIds.length === 0) return res.json([]);
      filtro._id = { $in: catIds };
    }

    const categorias = await Categoria.find(filtro);
    res.json(categorias);
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, requireProfesor, async (req, res, next) => {
  try {
    const nombre = (req.body.nombre || '').trim();
    const icono = (req.body.icono || '').trim();
    const descripcion = (req.body.descripcion || '').trim();

    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });

    const categoria = await Categoria.create({ nombre, icono, descripcion });
    res.status(201).json(categoria);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authMiddleware, requireProfesor, validateObjectId, async (req, res, next) => {
  try {
    const nombre = (req.body.nombre || '').trim();
    const icono = (req.body.icono || '').trim();
    const descripcion = (req.body.descripcion || '').trim();

    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });

    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      { nombre, icono, descripcion },
      { new: true }
    );

    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });

    res.json(categoria);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, requireProfesor, validateObjectId, async (req, res, next) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });

    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });

    const ahora = new Date();
    await Nivel.updateMany({ categoria_id: req.params.id, deletedAt: null }, { deletedAt: ahora });
    await Flashcard.updateMany({ categoria_id: req.params.id, deletedAt: null }, { deletedAt: ahora });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
