const express = require('express');
const Flashcard = require('../models/Flashcard');
const Categoria = require('../models/Categoria');
const Nivel = require('../models/Nivel');
const { authMiddleware, requireProfesor, validateObjectId } = require('../middleware/auth');
const mongoose = require('mongoose');
const { getScopedFlashcardFilter, canAccessFlashcard, isAlumno } = require('../utils/contentScope');
const { mergeFiltroMediosCompletos } = require('../utils/flashcardMedios');

function applyQueryFilters(filtro, query) {
  if (query.categoria_id) {
    if (!mongoose.Types.ObjectId.isValid(query.categoria_id)) {
      return false;
    }
    filtro.categoria_id = query.categoria_id;
  }
  if (query.nivel_id) {
    if (!mongoose.Types.ObjectId.isValid(query.nivel_id)) {
      return false;
    }
    filtro.nivel_id = query.nivel_id;
  }
  if (query.palabra) {
    const escapado = query.palabra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filtro.palabra = { $regex: escapado, $options: 'i' };
  }
  if (query.incompletas === 'true' || query.incompletas === '1') {
    filtro.$or = [
      { imagen_url: { $in: [null, ''] } },
      { video_url: { $in: [null, ''] } },
    ];
  }
  return true;
}

function validarMediosFlashcard(imagen_url, video_url) {
  if (!video_url) {
    return 'La seña (video o GIF) es obligatoria para que los juegos del alumno funcionen';
  }
  if (!imagen_url) {
    return 'La imagen es obligatoria para tarjetas, quiz y diccionario';
  }
  return null;
}

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    let filtro = await getScopedFlashcardFilter(req.user);
    if (isAlumno(req.user)) {
      filtro = mergeFiltroMediosCompletos(filtro);
    }
    if (!applyQueryFilters(filtro, req.query)) {
      return res.json({ data: [], total: 0, page: 1, pages: 0 });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const [flashcards, total] = await Promise.all([
      Flashcard.find(filtro)
        .populate('categoria_id', 'nombre icono')
        .populate('nivel_id', 'nombre')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Flashcard.countDocuments(filtro)
    ]);

    res.json({
      data: flashcards,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authMiddleware, validateObjectId, async (req, res, next) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id)
      .populate('categoria_id', 'nombre icono')
      .populate('nivel_id', 'nombre');
    if (!flashcard || flashcard.deletedAt) {
      return res.status(404).json({ error: 'Flashcard no encontrada' });
    }
    if (!canAccessFlashcard(req.user, flashcard)) {
      return res.status(403).json({ error: 'No tienes acceso a esta palabra' });
    }
    res.json(flashcard);
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, requireProfesor, async (req, res, next) => {
  try {
    const palabra = (req.body.palabra || '').trim();
    const descripcion = (req.body.descripcion || '').trim();
    const imagen_url = (req.body.imagen_url || '').trim();
    const video_url = (req.body.video_url || '').trim();
    const categoria_id = (req.body.categoria_id || '').trim();
    const nivel_id = (req.body.nivel_id || '').trim();

    if (!palabra) return res.status(400).json({ error: 'La palabra es requerida' });
    if (!categoria_id) return res.status(400).json({ error: 'La categoría es requerida' });
    if (!nivel_id) return res.status(400).json({ error: 'El nivel es requerido' });

    const catExiste = await Categoria.findById(categoria_id);
    if (!catExiste || catExiste.deletedAt) return res.status(400).json({ error: 'Categoría no encontrada' });

    const nivExiste = await Nivel.findById(nivel_id);
    if (!nivExiste || nivExiste.deletedAt) return res.status(400).json({ error: 'Nivel no encontrado' });

    const duplicada = await Flashcard.findOne({
      palabra: { $regex: `^${palabra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      categoria_id,
      nivel_id,
      deletedAt: null
    });
    if (duplicada) return res.status(409).json({ error: 'Ya existe una flashcard con esa palabra en esta categoría y nivel' });

    const errorMedios = validarMediosFlashcard(imagen_url, video_url);
    if (errorMedios) return res.status(400).json({ error: errorMedios });

    const flashcard = await Flashcard.create({
      palabra, descripcion, imagen_url, video_url,
      categoria_id, nivel_id,
      creado_por: req.user.sub
    });
    res.status(201).json(flashcard);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authMiddleware, requireProfesor, validateObjectId, async (req, res, next) => {
  try {
    const palabra = (req.body.palabra || '').trim();
    const descripcion = (req.body.descripcion || '').trim();
    const imagen_url = (req.body.imagen_url || '').trim();
    const video_url = (req.body.video_url || '').trim();
    const categoria_id = (req.body.categoria_id || '').trim();
    const nivel_id = (req.body.nivel_id || '').trim();

    if (!palabra) return res.status(400).json({ error: 'La palabra es requerida' });

    if (categoria_id) {
      const catExiste = await Categoria.findById(categoria_id);
      if (!catExiste || catExiste.deletedAt) return res.status(400).json({ error: 'Categoría no encontrada' });
    }
    if (nivel_id) {
      const nivExiste = await Nivel.findById(nivel_id);
      if (!nivExiste || nivExiste.deletedAt) return res.status(400).json({ error: 'Nivel no encontrado' });
    }

    if (palabra && categoria_id && nivel_id) {
      const duplicada = await Flashcard.findOne({
        _id: { $ne: req.params.id },
        palabra: { $regex: `^${palabra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
        categoria_id,
        nivel_id,
        deletedAt: null
      });
      if (duplicada) return res.status(409).json({ error: 'Ya existe otra flashcard con esa palabra en esta categoría y nivel' });
    }

    const errorMedios = validarMediosFlashcard(imagen_url, video_url);
    if (errorMedios) return res.status(400).json({ error: errorMedios });

    const flashcard = await Flashcard.findByIdAndUpdate(
      req.params.id,
      { palabra, descripcion, imagen_url, video_url, categoria_id, nivel_id },
      { new: true }
    );

    if (!flashcard) return res.status(404).json({ error: 'Flashcard no encontrada' });

    res.json(flashcard);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, requireProfesor, validateObjectId, async (req, res, next) => {
  try {
    const flashcard = await Flashcard.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });

    if (!flashcard) return res.status(404).json({ error: 'Flashcard no encontrada' });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
