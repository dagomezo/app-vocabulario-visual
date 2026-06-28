const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const requireProfesor = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  if (req.user.rol !== 'profesor' && req.user.rol !== 'superadmin') {
    return res.status(403).json({ error: 'Solo profesores pueden realizar esta acción' });
  }
  next();
};

const validateObjectId = (req, res, next) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  next();
};

const { AVATAR_IDS } = require('../config/avatares');

const AVATARES_VALIDOS = AVATAR_IDS;

const validateAvatarId = (req, res, next) => {
  const { avatar_id } = req.body;
  if (avatar_id && !AVATARES_VALIDOS.includes(avatar_id)) {
    return res.status(400).json({ error: 'Avatar inválido' });
  }
  next();
};

module.exports = { authMiddleware, requireProfesor, validateObjectId, validateAvatarId, AVATARES_VALIDOS };