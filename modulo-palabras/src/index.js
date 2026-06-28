const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
// Evita fallos querySrv ECONNREFUSED con DNS locales que no resuelven registros SRV de Atlas
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const { parseOrigins, validateEnv, getPort } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { requireDb, getDbStatus } = require('./middleware/requireDb');

const authRoutes = require('./routes/auth');
const categoriasRoutes = require('./routes/categorias');
const nivelesRoutes = require('./routes/niveles');
const flashcardsRoutes = require('./routes/flashcards');
const progresoRoutes = require('./routes/progreso');
const alumnosRoutes = require('./routes/alumnos');
const uploadRoutes = require('./routes/upload');
const actividadRoutes = require('./routes/actividad');
const actividadesJuegoRoutes = require('./routes/actividadesJuego');
const publicRoutes = require('./routes/public');
const sesionesRoutes = require('./routes/sesiones');

validateEnv();

const app = express();
const allowedOrigins = parseOrigins(process.env.FRONTEND_URL);
const port = getPort();

// Render y otros reverse proxies
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(cors({
  origin(origin, callback) {
    // Peticiones sin Origin: health checks, curl, server-to-server
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos' },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/login-alumno', authLimiter);

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✓ MongoDB conectado'))
  .catch((err) => {
    console.error('✗ No se pudo conectar a MongoDB:', err.message);
    console.error('  → Las rutas de datos responderán 503 hasta que MongoDB esté disponible.');
    console.error('  → En Render usa MongoDB Atlas y permite acceso desde 0.0.0.0/0.');
  });

app.get('/', (req, res) => {
  res.json({
    service: 'modulo-palabras',
    status: 'running',
    health: '/api/health',
  });
});

// Liveness: siempre 200 si el proceso está arriba (Render health check)
app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: connected ? 'ok' : 'degraded',
    modulo: 'palabras',
    database: {
      connected,
      status: getDbStatus(),
    },
  });
});

// Readiness: 503 si la BD no está lista (monitoreo operativo)
app.get('/api/health/ready', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  if (!connected) {
    return res.status(503).json({
      status: 'not_ready',
      database: { connected: false, status: getDbStatus() },
    });
  }
  res.json({ status: 'ready', database: { connected: true, status: getDbStatus() } });
});

app.use('/api/auth', requireDb, authRoutes);
app.use('/api/categorias', requireDb, categoriasRoutes);
app.use('/api/niveles', requireDb, nivelesRoutes);
app.use('/api/flashcards', requireDb, flashcardsRoutes);
app.use('/api/progreso', requireDb, progresoRoutes);
app.use('/api/alumnos', requireDb, alumnosRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/actividad', requireDb, actividadRoutes);
app.use('/api/actividades-juego', requireDb, actividadesJuegoRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/sesiones', requireDb, sesionesRoutes);

app.use(errorHandler);

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${port}`);
  console.log(`CORS permitido para: ${allowedOrigins.join(', ')}`);
});

function shutdown(signal) {
  console.log(`${signal} recibido. Cerrando servidor...`);
  server.close(() => {
    mongoose.connection.close(false).then(() => process.exit(0));
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
