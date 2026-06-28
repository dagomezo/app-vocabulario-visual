const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.message}`);

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'ID inválido' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'El recurso ya existe' });
  }

  if (
    err.message?.includes('buffering timed out') ||
    err.name === 'MongooseError' && err.message?.includes('buffering')
  ) {
    return res.status(503).json({
      error: 'Base de datos no conectada.',
      detalle: 'El servidor no pudo conectar con MongoDB. Revisa MONGODB_URI en .env y que la base de datos esté accesible.',
    });
  }

  if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError') {
    return res.status(503).json({
      error: 'No se pudo conectar a MongoDB.',
      detalle: process.env.NODE_ENV === 'production'
        ? 'Error de red con la base de datos.'
        : err.message,
    });
  }

  const mensaje = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message;

  res.status(err.status || 500).json({ error: mensaje });
};

module.exports = errorHandler;
