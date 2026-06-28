import { lazy } from "react";
import { createBrowserRouter } from "react-router";

const Inicio = lazy(() => import("./pages/Inicio"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Diccionario = lazy(() => import("./pages/Diccionario"));
const DetallePalabra = lazy(() => import("./pages/DetallePalabra"));
const JuegosHub = lazy(() => import("./pages/JuegosHub"));
const JuegoFlashcards = lazy(() => import("./pages/JuegoFlashcards"));
const JuegoQuiz = lazy(() => import("./pages/JuegoQuiz"));
const JuegoMemoria = lazy(() => import("./pages/JuegoMemoria"));
const JuegoUnir = lazy(() => import("./pages/JuegoUnir"));
const FinSesion = lazy(() => import("./pages/FinSesion"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminCategorias = lazy(() => import("./pages/AdminCategorias"));
const AdminNiveles = lazy(() => import("./pages/AdminNiveles"));
const AdminFlashcards = lazy(() => import("./pages/AdminFlashcards"));
const AdminAlumnos = lazy(() => import("./pages/AdminAlumnos"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminFlashcardForm = lazy(() => import("./pages/AdminFlashcardForm"));

export const router = createBrowserRouter([
  { path: "/", element: <Inicio /> },
  { path: "/admin-login", element: <AdminLogin /> },
  { path: "/diccionario", element: <Diccionario /> },
  { path: "/diccionario/:id", element: <DetallePalabra /> },
  { path: "/juegos", element: <JuegosHub /> },
  { path: "/juegos/flashcards", element: <JuegoFlashcards /> },
  { path: "/juegos/quiz", element: <JuegoQuiz /> },
  { path: "/juegos/memoria", element: <JuegoMemoria /> },
  { path: "/juegos/unir", element: <JuegoUnir /> },
  { path: "/juegos/fin", element: <FinSesion /> },
  { path: "/admin", element: <AdminPanel /> },
  { path: "/admin/categorias", element: <AdminCategorias /> },
  { path: "/admin/niveles", element: <AdminNiveles /> },
  { path: "/admin/flashcards", element: <AdminFlashcards /> },
  { path: "/admin/flashcards/nueva", element: <AdminFlashcardForm /> },
  { path: "/admin/flashcards/:id/editar", element: <AdminFlashcardForm /> },
  { path: "/admin/alumnos", element: <AdminAlumnos /> },
  { path: "/admin/analytics", element: <AdminAnalytics /> },
]);
