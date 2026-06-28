const express = require('express');
const Actividad = require('../models/Actividad');
const { authMiddleware } = require('../middleware/auth');
const { isAlumno, getProfesorId, getScopedCategoriaIds } = require('../utils/contentScope');

const router = express.Router();

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { tipo, categoria_id } = req.body;

    if (!['practica_libre', 'mision_dia', 'diccionario'].includes(tipo)) {
      return res.status(400).json({ error: 'tipo inválido' });
    }

    if (isAlumno(req.user) && !getProfesorId(req.user)) {
      return res.status(403).json({ error: 'Alumno sin profesor asignado' });
    }

    if (categoria_id && isAlumno(req.user)) {
      const catIds = await getScopedCategoriaIds(req.user);
      const allowed = (catIds || []).map(id => id.toString());
      if (!allowed.includes(categoria_id.toString())) {
        return res.status(403).json({ error: 'Categoría no disponible' });
      }
    }

    const actividad = await Actividad.create({
      usuario_id: req.user.sub,
      profesor_id: req.user.profesor_id || req.user.sub,
      tipo,
      categoria_id: categoria_id || undefined,
    });

    res.status(201).json(actividad);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
