const mongoose = require('mongoose');

const ESTADOS = {
  0: 'desconectado',
  1: 'conectado',
  2: 'conectando',
  3: 'desconectando',
};

function getDbStatus() {
  return ESTADOS[mongoose.connection.readyState] || 'desconocido';
}

function requireDb(req, res, next) {
  if (mongoose.connection.readyState === 1) return next();

  return res.status(503).json({
    error: 'Base de datos no disponible. MongoDB no está conectado.',
    detalle: 'Verifica que MongoDB esté en ejecución y que MONGODB_URI en el archivo .env sea correcta.',
    database: { status: getDbStatus(), connected: false },
  });
}

module.exports = { requireDb, getDbStatus };
