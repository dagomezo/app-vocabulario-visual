const express = require('express');
const ActividadJuego = require('../models/ActividadJuego');
const Categoria = require('../models/Categoria');
const Nivel = require('../models/Nivel');
const { authMiddleware, requireProfesor, validateObjectId } = require('../middleware/auth');
const { isAlumno, getProfesorId, getScopedCategoriaIds } = require('../utils/contentScope');

const router = express.Router();

const CANTIDADES_VALIDAS = [10, 20, 50];

function normalizarCantidad(valor) {
  const n = parseInt(valor, 10);
  if (CANTIDADES_VALIDAS.includes(n)) return n;
  if (n <= 10) return 10;
  if (n <= 20) return 20;
  return 50;
}

async function validarPayload(body, profesorId) {
  const nombre = (body.nombre || '').trim();
  const descripcion = (body.descripcion || '').trim();
  const tipo = body.tipo;
  const categoria_id = body.categoria_id;
  const nivel_id = body.nivel_id || null;
  const icono = (body.icono || '🎮').trim() || '🎮';
  const cuenta_progreso = Boolean(body.cuenta_progreso);
  const activo = body.activo !== false;
  const cantidad = normalizarCantidad(body.cantidad);

  if (!nombre) return { error: 'El nombre de la actividad es requerido' };
  if (!['flashcards', 'quiz', 'memoria', 'unir'].includes(tipo)) {
    return { error: 'Tipo de juego inválido.' };
  }
  if (!categoria_id) return { error: 'Debes elegir una categoría' };

  const categoria = await Categoria.findOne({ _id: categoria_id, deletedAt: null });
  if (!categoria) return { error: 'Categoría no encontrada' };

  if (nivel_id) {
    const nivel = await Nivel.findOne({ _id: nivel_id, deletedAt: null });
    if (!nivel) return { error: 'Nivel no encontrado' };
    if (nivel.categoria_id.toString() !== categoria_id.toString()) {
      return { error: 'El nivel no pertenece a la categoría seleccionada' };
    }
  }

  return {
    data: {
      profesor_id: profesorId,
      nombre,
      descripcion,
      categoria_id,
      nivel_id: nivel_id || null,
      tipo,
      cuenta_progreso,
      cantidad,
      icono,
      activo,
    },
  };
}

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const filtro = { deletedAt: null };

    if (isAlumno(req.user)) {
      const profesorId = getProfesorId(req.user);
      if (!profesorId) return res.json([]);

      const catIds = await getScopedCategoriaIds(req.user);
      if (!catIds || catIds.length === 0) return res.json([]);

      filtro.profesor_id = profesorId;
      filtro.activo = true;
      filtro.categoria_id = { $in: catIds };
    } else {
      filtro.profesor_id = req.user.sub;
    }

    const actividades = await ActividadJuego.find(filtro)
      .populate('categoria_id', 'nombre icono')
      .populate('nivel_id', 'nombre')
      .sort({ createdAt: -1 });

    res.json(actividades);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authMiddleware, validateObjectId, async (req, res, next) => {
  try {
    const actividad = await ActividadJuego.findOne({ _id: req.params.id, deletedAt: null })
      .populate('categoria_id', 'nombre icono')
      .populate('nivel_id', 'nombre');

    if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada' });

    if (isAlumno(req.user)) {
      const profesorId = getProfesorId(req.user);
      if (!profesorId || actividad.profesor_id.toString() !== profesorId.toString()) {
        return res.status(403).json({ error: 'No tienes acceso a esta actividad' });
      }
      if (!actividad.activo) return res.status(404).json({ error: 'Actividad no disponible' });

      const catIds = await getScopedCategoriaIds(req.user);
      const catId = actividad.categoria_id?._id?.toString() || actividad.categoria_id?.toString();
      if (!catIds?.some(id => id.toString() === catId)) {
        return res.status(403).json({ error: 'No tienes acceso a esta actividad' });
      }
    } else if (actividad.profesor_id.toString() !== req.user.sub) {
      return res.status(403).json({ error: 'No tienes acceso a esta actividad' });
    }

    res.json(actividad);
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, requireProfesor, async (req, res, next) => {
  try {
    const resultado = await validarPayload(req.body, req.user.sub);
    if (resultado.error) return res.status(400).json({ error: resultado.error });

    const actividad = await ActividadJuego.create(resultado.data);
    const poblada = await ActividadJuego.findById(actividad._id)
      .populate('categoria_id', 'nombre icono')
      .populate('nivel_id', 'nombre');

    res.status(201).json(poblada);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authMiddleware, requireProfesor, validateObjectId, async (req, res, next) => {
  try {
    const existente = await ActividadJuego.findOne({
      _id: req.params.id,
      profesor_id: req.user.sub,
      deletedAt: null,
    });

    if (!existente) return res.status(404).json({ error: 'Actividad no encontrada' });

    const resultado = await validarPayload(req.body, req.user.sub);
    if (resultado.error) return res.status(400).json({ error: resultado.error });

    const actividad = await ActividadJuego.findByIdAndUpdate(
      req.params.id,
      resultado.data,
      { new: true }
    )
      .populate('categoria_id', 'nombre icono')
      .populate('nivel_id', 'nombre');

    res.json(actividad);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, requireProfesor, validateObjectId, async (req, res, next) => {
  try {
    const actividad = await ActividadJuego.findOneAndUpdate(
      { _id: req.params.id, profesor_id: req.user.sub, deletedAt: null },
      { deletedAt: new Date() }
    );

    if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada' });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
