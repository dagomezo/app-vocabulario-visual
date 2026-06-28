const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { authMiddleware, validateObjectId, validateAvatarId } = require('../middleware/auth');
const { getAuthCookieOptions } = require('../config/cookies');
const {
  calcularAvataresDesbloqueados,
  obtenerReglaAvatar,
} = require('../config/avatarUnlocks');
const { avatarValidoParaSexo, avatarPorDefecto, SEXOS_VALIDOS } = require('../config/avatares');
const { contarPalabrasAprendidas } = require('../utils/gamificacionAlumno');

const router = express.Router();

// Listar profesores (público, para login de alumno)
router.get('/profesores', async (req, res, next) => {
  try {
    const profesores = await Usuario.find(
      { rol: { $in: ['profesor', 'superadmin'] }, deletedAt: null },
      'nombre'
    ).sort({ nombre: 1 });
    res.json(profesores);
  } catch (err) {
    next(err);
  }
});

// Listar alumnos de una clase (público, para que el niño elija su nombre)
router.get('/alumnos-login', async (req, res, next) => {
  try {
    const profesor_id = (req.query.profesor_id || '').trim();
    if (!profesor_id) {
      return res.status(400).json({ error: 'profesor_id es requerido' });
    }

    const alumnos = await Usuario.find(
      { profesor_id, rol: 'alumno', deletedAt: null },
      'nombre avatar_id apodo sexo',
    ).sort({ nombre: 1 });

    res.json(alumnos);
  } catch (err) {
    next(err);
  }
});

// Login profesor (email + password en el futuro, por ahora nombre + pin)
router.post('/login', async (req, res, next) => {
  try {
    const nombre = (req.body.nombre || '').trim();
    const pin = (req.body.pin || '').trim();

    if (!nombre || !pin) return res.status(400).json({ error: 'Nombre y PIN son requeridos' });

    const usuario = await Usuario.findOne({ nombre, deletedAt: null });
    if (!usuario) return res.status(401).json({ error: 'Usuario no encontrado' });

    const pinValido = await bcrypt.compare(pin, usuario.pin_hash);
    if (!pinValido) return res.status(401).json({ error: 'PIN incorrecto' });

    const token = jwt.sign(
      {
        sub: usuario._id,
        rol: usuario.rol,
        nombre: usuario.nombre,
        profesor_id: usuario.profesor_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('auth_token', token, getAuthCookieOptions());

    res.json({ ok: true, rol: usuario.rol });
  } catch (err) {
    next(err);
  }
});

// Login visual alumno (avatar + pin)
router.post('/login-alumno', async (req, res, next) => {
  try {
    const avatar_id = (req.body.avatar_id || '').trim();
    const pin = (req.body.pin || '').trim();
    const profesor_id = (req.body.profesor_id || '').trim();

    if (!avatar_id || !pin || !profesor_id) {
      return res.status(400).json({ error: 'avatar_id, pin y profesor_id son requeridos' });
    }
    if (pin.length !== 4) return res.status(400).json({ error: 'El PIN debe tener 4 dígitos' });

    const alumno = await Usuario.findOne({
      avatar_id,
      profesor_id,
      rol: 'alumno',
      deletedAt: null
    });
    if (!alumno) return res.status(401).json({ error: 'Alumno no encontrado' });

    const pinValido = await bcrypt.compare(pin, alumno.pin_hash);
    if (!pinValido) return res.status(401).json({ error: 'PIN incorrecto' });

    const token = jwt.sign(
      {
        sub: alumno._id,
        rol: alumno.rol,
        nombre: alumno.nombre,
        profesor_id: alumno.profesor_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('auth_token', token, getAuthCookieOptions());

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Me — hidrata el estado del usuario en React
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.user.sub).select('-pin_hash');
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (usuario.rol === 'alumno') {
      const sexo = usuario.sexo || 'masculino';
      const palabrasAprendidas = await contarPalabrasAprendidas(req.user);
      const stats = {
        palabrasAprendidas,
        rachaActual: usuario.racha_actual || 0,
        sesionesCompletadas: usuario.sesiones_completadas || 0,
      };
      return res.json({
        _id: usuario._id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        sexo,
        avatar_id: usuario.avatar_id,
        apodo: usuario.apodo || '',
        racha_actual: usuario.racha_actual || 0,
        racha_maxima: usuario.racha_maxima || 0,
        sesiones_completadas: usuario.sesiones_completadas || 0,
        monedas: usuario.monedas || 0,
        avatares_desbloqueados: calcularAvataresDesbloqueados(stats, sexo, usuario.avatares_extra || []),
      });
    }

    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

// Perfil alumno — cambiar avatar/apodo con PIN (adulto ayuda)
router.patch('/perfil', authMiddleware, validateAvatarId, async (req, res, next) => {
  try {
    if (req.user.rol !== 'alumno') {
      return res.status(403).json({ error: 'Solo alumnos pueden actualizar su perfil' });
    }

    const pin = (req.body.pin || '').trim();
    const avatar_id = req.body.avatar_id?.trim();
    const apodoRaw = req.body.apodo;

    if (!pin || pin.length !== 4) {
      return res.status(400).json({ error: 'El PIN de 4 dígitos es requerido' });
    }

    const alumno = await Usuario.findById(req.user.sub);
    if (!alumno) return res.status(404).json({ error: 'Usuario no encontrado' });

    const pinValido = await bcrypt.compare(pin, alumno.pin_hash);
    if (!pinValido) return res.status(401).json({ error: 'PIN incorrecto' });

    const updates = {};

    if (avatar_id && avatar_id !== alumno.avatar_id) {
      const sexo = alumno.sexo || 'masculino';
      if (!avatarValidoParaSexo(avatar_id, sexo)) {
        return res.status(400).json({
          error: 'Ese avatar no está disponible para este alumno',
        });
      }

      const palabrasAprendidas = await contarPalabrasAprendidas(req.user);
      const stats = {
        palabrasAprendidas,
        rachaActual: alumno.racha_actual || 0,
        sesionesCompletadas: alumno.sesiones_completadas || 0,
      };
      const desbloqueados = calcularAvataresDesbloqueados(stats, sexo, alumno.avatares_extra || []);
      if (!desbloqueados.includes(avatar_id)) {
        const regla = obtenerReglaAvatar(avatar_id, sexo);
        return res.status(403).json({
          error: regla
            ? `Avatar bloqueado. ${regla.etiqueta} para desbloquearlo.`
            : 'Ese avatar aún no está desbloqueado',
        });
      }

      const ocupado = await Usuario.findOne({
        avatar_id,
        profesor_id: alumno.profesor_id,
        rol: 'alumno',
        deletedAt: null,
        _id: { $ne: alumno._id },
      });
      if (ocupado) {
        return res.status(409).json({ error: 'Ese avatar ya lo usa otro compañero de tu clase' });
      }
      updates.avatar_id = avatar_id;
    }

    if (apodoRaw !== undefined) {
      const apodo = (apodoRaw || '').trim().toLowerCase();
      if (apodo && !/^[a-z0-9_áéíóúñ]{2,20}$/.test(apodo)) {
        return res.status(400).json({
          error: 'Apodo inválido: usa 2-20 letras, números o guión bajo',
        });
      }
      updates.apodo = apodo;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No hay cambios para guardar' });
    }

    const actualizado = await Usuario.findByIdAndUpdate(
      alumno._id,
      { $set: updates },
      { new: true },
    ).select('-pin_hash');

    res.json({
      _id: actualizado._id,
      nombre: actualizado.nombre,
      rol: actualizado.rol,
      sexo: actualizado.sexo || 'masculino',
      avatar_id: actualizado.avatar_id,
      apodo: actualizado.apodo || '',
      racha_actual: actualizado.racha_actual || 0,
      racha_maxima: actualizado.racha_maxima || 0,
      sesiones_completadas: actualizado.sesiones_completadas || 0,
      monedas: actualizado.monedas || 0,
      avatares_desbloqueados: calcularAvataresDesbloqueados({
        palabrasAprendidas: await contarPalabrasAprendidas(req.user),
        rachaActual: actualizado.racha_actual || 0,
        sesionesCompletadas: actualizado.sesiones_completadas || 0,
      }, actualizado.sexo || 'masculino', actualizado.avatares_extra || []),
    });
  } catch (err) {
    next(err);
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', getAuthCookieOptions());
  res.json({ ok: true });
});

module.exports = router;
