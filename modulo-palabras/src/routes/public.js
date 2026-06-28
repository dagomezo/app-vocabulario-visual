const express = require('express');
const Categoria = require('../models/Categoria');
const Nivel = require('../models/Nivel');
const Flashcard = require('../models/Flashcard');

const router = express.Router();

router.get('/categorias', async (req, res, next) => {
  try {
    const categorias = await Categoria.find({ deletedAt: null }).sort({ nombre: 1 });
    const result = categorias.map(c => ({
      _id: c._id,
      id: c._id.toString(),
      nombre: c.nombre,
      icono: c.icono || '📚'
    }));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/niveles', async (req, res, next) => {
  try {
    const filtro = { deletedAt: null };
    if (req.query.categoria_id) filtro.categoria_id = req.query.categoria_id;
    const niveles = await Nivel.find(filtro).sort({ orden: 1 });
    const result = niveles.map(n => ({
      _id: n._id,
      id: n._id.toString(),
      nombre: n.nombre,
      color: n.color || '#2f9f7b',
      orden: n.orden,
      categoriaId: n.categoria_id?.toString() || '',
      categoria_id: n.categoria_id?.toString() || '',
    }));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/palabras', async (req, res, next) => {
  try {
    const filtro = { deletedAt: null, imagen_url: { $ne: null }, video_url: { $ne: null } };
    if (req.query.categoria_id) filtro.categoria_id = req.query.categoria_id;
    if (req.query.nivel_id) filtro.nivel_id = req.query.nivel_id;
    if (req.query.busqueda) {
      filtro.palabra = { $regex: req.query.busqueda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const [palabras, total] = await Promise.all([
      Flashcard.find(filtro)
        .populate('categoria_id', 'nombre icono')
        .populate('nivel_id', 'nombre')
        .sort({ palabra: 1 })
        .skip(skip)
        .limit(limit),
      Flashcard.countDocuments(filtro)
    ]);

    const result = palabras.map(p => ({
      _id: p._id,
      id: p._id.toString(),
      palabra: p.palabra,
      categoriaId: p.categoria_id?._id?.toString() || p.categoria_id?.toString(),
      categoriaNombre: p.categoria_id?.nombre || '',
      categoriaIcono: p.categoria_id?.icono || '',
      nivelId: p.nivel_id?._id?.toString() || p.nivel_id?.toString(),
      nivelNombre: p.nivel_id?.nombre || '',
      imagen: p.imagen_url,
      videoUrl: p.video_url,
      descripcion: p.descripcion
    }));

    res.json({ data: result, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

router.get('/palabras/:id', async (req, res, next) => {
  try {
    const { mongoose } = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const palabra = await Flashcard.findById(req.params.id)
      .populate('categoria_id', 'nombre icono')
      .populate('nivel_id', 'nombre');
    if (!palabra || palabra.deletedAt) {
      return res.status(404).json({ error: 'Palabra no encontrada' });
    }
    res.json({
      _id: palabra._id,
      id: palabra._id.toString(),
      palabra: palabra.palabra,
      categoriaId: palabra.categoria_id?._id?.toString() || palabra.categoria_id?.toString(),
      categoriaNombre: palabra.categoria_id?.nombre || '',
      categoriaIcono: palabra.categoria_id?.icono || '',
      nivelId: palabra.nivel_id?._id?.toString() || palabra.nivel_id?.toString(),
      nivelNombre: palabra.nivel_id?.nombre || '',
      imagen: palabra.imagen_url,
      videoUrl: palabra.video_url,
      descripcion: palabra.descripcion
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
