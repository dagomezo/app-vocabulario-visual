const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

export interface CategoriaAPI {
  _id: string;
  id: string;
  nombre: string;
  icono: string;
}

export interface NivelAPI {
  _id: string;
  id: string;
  nombre: string;
  color: string;
  orden: number;
  categoriaId?: string;
  categoria_id?: string;
}

export interface PalabraAPI {
  _id: string;
  id: string;
  palabra: string;
  categoriaId: string;
  categoriaNombre: string;
  categoriaIcono: string;
  nivelId: string;
  nivelNombre: string;
  imagen: string;
  videoUrl: string;
  descripcion: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface SessionStats {
  palabrasVistas: number;
  palabrasAcertadas: number;
  juegosCompletados: number;
  rachaActual: number;
  mejorRacha: number;
}

export interface AdminStats {
  totalAlumnos: number;
  alumnosActivos: number;
  sesionesHoy: number;
  palabrasTotales: number;
  rankingRetos: Array<{
    nombre: string;
    avatar_id: string;
    retos_camino: number;
    racha_actual: number;
    sesiones_completadas: number;
  }>;
  calidadFlashcards: {
    total: number;
    conImagen: number;
    conSena: number;
    completas: number;
    sinImagen: number;
    sinSena: number;
    incompletas: any[];
  };
  palabrasDificiles: any[];
  progresoSemanal: any[];
  distribucionCalif: any[];
  actividadSemanal: any[];
}

// ===== PUBLIC ENDPOINTS =====

export async function getCategoriasPublic(): Promise<CategoriaAPI[]> {
  return fetchJSON(`${API}/public/categorias`);
}

export async function getNivelesPublic(categoriaId?: string): Promise<NivelAPI[]> {
  const query = categoriaId ? `?categoria_id=${categoriaId}` : "";
  return fetchJSON(`${API}/public/niveles${query}`);
}

export async function getPalabrasPublic(params?: {
  categoriaId?: string;
  nivelId?: string;
  busqueda?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<PalabraAPI>> {
  const query = new URLSearchParams();
  if (params?.categoriaId) query.set("categoria_id", params.categoriaId);
  if (params?.nivelId) query.set("nivel_id", params.nivelId);
  if (params?.busqueda) query.set("busqueda", params.busqueda);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  return fetchJSON(`${API}/public/palabras?${query}`);
}

export async function getPalabraByIdPublic(id: string): Promise<PalabraAPI> {
  return fetchJSON(`${API}/public/palabras/${id}`);
}

// ===== SESIONES (anonymous progress) =====

export async function crearSesion(sessionId: string, deviceId: string, nombreAlumno?: string, avatar?: string) {
  return fetchJSON(`${API}/sesiones`, {
    method: "POST",
    body: JSON.stringify({ sessionId, deviceId, nombreAlumno, avatar }),
  });
}

export async function registrarPalabraSesion(sessionId: string, palabraId: string, acertada: boolean, juegoTipo: string) {
  return fetchJSON(`${API}/sesiones/palabra`, {
    method: "POST",
    body: JSON.stringify({ sessionId, palabraId, acertada, juegoTipo }),
  });
}

export async function registrarJuegoSesion(sessionId: string, tipo: string, categoriaId: string, total: number, correctas: number) {
  return fetchJSON(`${API}/sesiones/juego`, {
    method: "POST",
    body: JSON.stringify({ sessionId, tipo, categoriaId, total, correctas }),
  });
}

export async function obtenerStatsSesion(sessionId: string): Promise<SessionStats> {
  return fetchJSON(`${API}/sesiones/${sessionId}`);
}

// ===== AUTH (admin) =====

export async function loginAdmin(nombre: string, pin: string) {
  return fetchJSON(`${API}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ nombre, pin }),
  });
}

export async function checkAuth() {
  return fetchJSON(`${API}/auth/me`);
}

export async function logoutAdmin() {
  return fetchJSON(`${API}/auth/logout`, { method: "POST" });
}

// ===== ADMIN CRUD =====

export async function getAdminCategorias() {
  return fetchJSON(`${API}/categorias`);
}

export async function createAdminCategoria(nombre: string, icono: string) {
  return fetchJSON(`${API}/categorias`, {
    method: "POST",
    body: JSON.stringify({ nombre, icono }),
  });
}

export async function updateAdminCategoria(id: string, nombre: string, icono: string) {
  return fetchJSON(`${API}/categorias/${id}`, {
    method: "PUT",
    body: JSON.stringify({ nombre, icono }),
  });
}

export async function deleteAdminCategoria(id: string) {
  return fetchJSON(`${API}/categorias/${id}`, { method: "DELETE" });
}

export async function getAdminNiveles(categoriaId?: string) {
  const query = categoriaId ? `?categoria_id=${categoriaId}` : "";
  return fetchJSON(`${API}/niveles${query}`);
}

export async function createAdminNivel(nombre: string, categoriaId: string) {
  return fetchJSON(`${API}/niveles`, {
    method: "POST",
    body: JSON.stringify({ nombre, categoria_id: categoriaId }),
  });
}

export async function updateAdminNivel(id: string, data: { nombre?: string; orden?: number }) {
  return fetchJSON(`${API}/niveles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAdminNivel(id: string) {
  return fetchJSON(`${API}/niveles/${id}`, { method: "DELETE" });
}

export async function getAdminFlashcards(params?: { page?: number; limit?: number; categoria_id?: string; nivel_id?: string; palabra?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.categoria_id) query.set("categoria_id", params.categoria_id);
  if (params?.nivel_id) query.set("nivel_id", params.nivel_id);
  if (params?.palabra) query.set("palabra", params.palabra);
  return fetchJSON(`${API}/flashcards?${query}`);
}

export async function getAdminFlashcardById(id: string) {
  return fetchJSON(`${API}/flashcards/${id}`);
}

export async function createAdminFlashcard(data: { palabra: string; descripcion?: string; imagen_url?: string; video_url?: string; categoria_id: string; nivel_id: string }) {
  return fetchJSON(`${API}/flashcards`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdminFlashcard(id: string, data: { palabra: string; descripcion?: string; imagen_url?: string; video_url?: string; categoria_id: string; nivel_id: string }) {
  return fetchJSON(`${API}/flashcards/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAdminFlashcard(id: string) {
  return fetchJSON(`${API}/flashcards/${id}`, { method: "DELETE" });
}

export async function getAdminAlumnos(page = 1, limit = 50) {
  return fetchJSON(`${API}/alumnos?page=${page}&limit=${limit}`);
}

export async function createAdminAlumno(nombre: string, sexo: string, avatarId?: string) {
  return fetchJSON(`${API}/alumnos`, {
    method: "POST",
    body: JSON.stringify({ nombre, sexo, avatar_id: avatarId }),
  });
}

export async function deleteAdminAlumno(id: string) {
  return fetchJSON(`${API}/alumnos/${id}`, { method: "DELETE" });
}

export async function getAdminStats(): Promise<AdminStats> {
  return fetchJSON(`${API}/progreso/analiticas`);
}

// ===== CLOUDINARY UPLOAD =====

export async function getUploadStatus() {
  return fetchJSON(`${API}/upload/status`);
}

export async function getUploadSignature(folder = 'senasapp') {
  return fetchJSON(`${API}/upload/signature`, {
    method: "POST",
    body: JSON.stringify({ folder }),
  });
}
