const { isProduction } = require('./env');

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

/**
 * En producción (API y frontend en dominios distintos, p. ej. Render)
 * las cookies deben usar SameSite=None + Secure para enviarse en peticiones cross-origin.
 */
function getAuthCookieOptions() {
  const prod = isProduction();
  const sameSite = process.env.COOKIE_SAMESITE || (prod ? 'none' : 'lax');
  const secure = sameSite === 'none' || prod;

  return {
    httpOnly: true,
    sameSite,
    secure,
    maxAge: EIGHT_HOURS_MS,
    path: '/',
  };
}

module.exports = { getAuthCookieOptions };
