# Señas App — Vocabulario visual

App educativa de lengua de señas con juegos interactivos (flashcards, quiz, memoria, unir) y panel de administración para profesores.

## Estructura

| Carpeta | Descripción |
|---------|-------------|
| `modulo-palabras/` | Backend Express + MongoDB (API REST) |
| `shell/` | Frontend React + Vite + Tailwind (app pública y admin) |

## Requisitos

- Node.js 18+
- MongoDB Atlas (o MongoDB local)
- Cuenta Cloudinary (opcional, para subir imágenes y señas)

## Desarrollo local

### 1. Backend

```bash
cd modulo-palabras
cp .env.example .env   # configurar MONGODB_URI, JWT_SECRET, Cloudinary
npm install
npm run dev
```

API en **http://localhost:3001/api**

### 2. Frontend

```bash
cd shell
cp .env.example .env   # VITE_API_URL=http://localhost:3001/api
npm install
npm run dev
```

App en **http://localhost:5173/**

## Rutas principales

- `/` — Inicio (juegos)
- `/diccionario` — Diccionario con filtros
- `/admin-login` — Acceso profesores
- `/admin` — Panel de administración

## Producción

```bash
cd shell && npm run build    # genera shell/dist/
cd modulo-palabras && npm start
```

Sirve `shell/dist` como estático o despliega frontend y backend por separado (p. ej. Render + Vercel).

## Licencia

Proyecto académico — PUCE / Vinculación 2026.
