import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { Home, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { PageLayout } from "../components/PageLayout";
import { buildBreadcrumbs } from "../lib/navigation";
import { CANTIDAD_JUEGO_RAPIDO, juegoAleatorio } from "../data/juegosAssets";
import { getCategoriasPublic } from "../lib/api";
import { playClick } from "../lib/sounds";
import { obtenerStats } from "../lib/session";

export default function FinSesion() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalPalabras = 10, correctas = 0, intentos } = location.state || {};
  const [stats, setStats] = useState({
    palabrasVistas: 0,
    palabrasAcertadas: 0,
    juegosCompletados: 0,
    rachaActual: 0,
    mejorRacha: 0,
  });
  const [categorias, setCategorias] = useState<{ id: string }[]>([]);

  useEffect(() => {
    obtenerStats().then(setStats).catch(() => {});
    getCategoriasPublic().then(setCategorias).catch(() => {});
  }, []);

  const porcentaje = totalPalabras > 0 ? Math.round((correctas / totalPalabras) * 100) : 0;

  const mensaje =
    porcentaje === 100
      ? "¡Perfecto!"
      : porcentaje >= 70
        ? "¡Muy bien!"
        : porcentaje >= 50
          ? "¡Buen intento!"
          : "¡Sigue practicando!";

  const juegoRapido = () => {
    playClick();
    if (categorias.length === 0) return;
    const cat = categorias[Math.floor(Math.random() * categorias.length)];
    const juego = juegoAleatorio();
    navigate(`/juegos/${juego.tipo}`, {
      state: { categoriaId: cat.id, cantidad: CANTIDAD_JUEGO_RAPIDO },
    });
  };

  return (
    <PageLayout
      breadcrumbs={buildBreadcrumbs("/juegos/fin")}
      showNav
      mainClassName="flex items-center justify-center pt-4"
      maxWidth="3xl"
    >
      <div className="max-w-lg w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="text-center mb-6"
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            className="text-7xl sm:text-8xl"
          >
            {porcentaje === 100 ? "🏆" : porcentaje >= 70 ? "🎉" : porcentaje >= 50 ? "👍" : "💪"}
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-bold text-[var(--text-dark)] text-center mb-6"
        >
          {mensaje}
        </motion.h1>

        <motion.section
          aria-label="Resultados del juego"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[24px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-5 sm:p-6 mb-6 shadow-lg"
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center mb-4">
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">Palabras</p>
              <p className="text-2xl sm:text-3xl font-bold text-[var(--text-dark)]">{totalPalabras}</p>
            </div>
            <div className="border-x-2 border-[var(--beige-border)]">
              <p className="text-sm text-[var(--text-muted)] mb-1">Correctas</p>
              <p className="text-2xl sm:text-3xl font-bold text-[var(--green-primary)]">{correctas}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">Aciertos</p>
              <p className="text-2xl sm:text-3xl font-bold text-[var(--yellow-accent)]">{porcentaje}%</p>
            </div>
          </div>

          {intentos !== undefined && (
            <div className="text-center pt-3 border-t-2 border-[var(--beige-border)]">
              <p className="text-sm text-[var(--text-muted)]">
                Intentos totales:{" "}
                <span className="font-bold text-[var(--text-dark)]">{intentos}</span>
              </p>
            </div>
          )}
        </motion.section>

        {stats.palabrasVistas > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-[24px] border-2 border-[var(--beige-border)] p-4 mb-6 shadow-md"
          >
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-[var(--text-muted)]">
              <span>
                📊 <strong className="text-[var(--text-dark)]">{stats.palabrasVistas}</strong> vistas hoy
              </span>
              <span>
                🔥 Racha: <strong className="text-[var(--text-dark)]">{stats.mejorRacha}</strong>
              </span>
              <span>
                🎮 <strong className="text-[var(--text-dark)]">{stats.juegosCompletados}</strong> juegos
              </span>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <button
            type="button"
            onClick={juegoRapido}
            disabled={categorias.length === 0}
            className={`touch-target w-full rounded-[20px] py-4 sm:py-5 text-lg font-bold shadow-lg transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${
              categorias.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] text-white hover:shadow-xl"
            }`}
          >
            <Zap className="w-5 h-5" aria-hidden="true" />
            Juego Rápido
          </button>

          <Link to="/" className="block">
            <Button
              variant="outline"
              className="touch-target w-full min-h-[var(--touch-min)] border-2 border-[var(--beige-border)] bg-white hover:bg-white text-[var(--text-dark)] rounded-[20px] py-4 text-lg font-bold"
            >
              <Home className="w-5 h-5 mr-2" aria-hidden="true" />
              Ir al inicio
            </Button>
          </Link>
        </motion.div>
      </div>
    </PageLayout>
  );
}
