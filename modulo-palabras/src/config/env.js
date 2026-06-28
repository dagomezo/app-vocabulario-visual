const DEFAULT_PORT = 3001;
const DEFAULT_FRONTEND = 'http://localhost:5173';

function parseOrigins(value) {
  return (value || DEFAULT_FRONTEND)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    console.error(`✗ Variables de entorno requeridas: ${missing.join(', ')}`);
    if (isProduction) process.exit(1);
  }

  if (isProduction && (process.env.JWT_SECRET?.length ?? 0) < 32) {
    console.warn('⚠ JWT_SECRET es corto; usa al menos 32 caracteres en producción.');
  }

  if (isProduction && !process.env.FRONTEND_URL?.trim()) {
    console.warn('⚠ FRONTEND_URL no está definida; CORS usará solo localhost.');
  }
}

function getPort() {
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  return Number.isFinite(port) && port > 0 ? port : DEFAULT_PORT;
}

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

module.exports = {
  DEFAULT_PORT,
  DEFAULT_FRONTEND,
  parseOrigins,
  validateEnv,
  getPort,
  isProduction,
};
