import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { BookOpen, ArrowRight, Zap } from "lucide-react";
import { motion } from "motion/react";
import { PageLayout } from "../components/PageLayout";
import { JuegoCard } from "../components/JuegoCard";
import { JUEGOS, CANTIDAD_JUEGO_RAPIDO, juegoAleatorio, type TipoJuego } from "../data/juegosAssets";
import { getCategoriasPublic, type CategoriaAPI } from "../lib/api";
import { playClick } from "../lib/sounds";
import { obtenerStats } from "../lib/session";

export default function Inicio() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<CategoriaAPI[]>([]);
  const [stats, setStats] = useState({
    palabrasVistas: 0,
    palabrasAcertadas: 0,
    juegosCompletados: 0,
    rachaActual: 0,
    mejorRacha: 0,
  });

  useEffect(() => {
    getCategoriasPublic().then(setCategorias).catch(() => {});
    obtenerStats().then(setStats).catch(() => {});
  }, []);

  const juegoRapido = () => {
    playClick();
    if (categorias.length === 0) return;
    const cat = categorias[Math.floor(Math.random() * categorias.length)];
    const juego = juegoAleatorio();
    navigate(`/juegos/${juego.tipo}`, {
      state: { categoriaId: cat.id, cantidad: CANTIDAD_JUEGO_RAPIDO },
    });
  };

  const irJuego = (tipo: TipoJuego) => {
    playClick();
    navigate("/juegos", { state: { tipoJuego: tipo } });
  };

  return (
    <PageLayout mainClassName="pt-2 sm:pt-4">
      <div className="text-center mb-8 sm:mb-10">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-block text-7xl sm:text-8xl mb-3"
          aria-hidden="true"
        >
          <motion.span
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🤟
          </motion.span>
        </motion.div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-dark)] mb-3 leading-tight px-2">
          ¡Aprende lengua de señas mientras juegas!
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-md mx-auto px-2">
          Elige un juego, explora el diccionario y diviértete aprendiendo señas.
        </p>
      </div>

      <div className="text-center mb-8 sm:mb-10">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={juegoRapido}
          disabled={categorias.length === 0}
          aria-label="Juego rápido — modo sorpresa"
          className={`touch-target-inline rounded-full px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-bold shadow-lg transition-all gap-3 border-none ${
            categorias.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] text-white hover:shadow-xl cursor-pointer"
          }`}
        >
          <Zap className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
          ¡Juego Rápido!
        </motion.button>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          🎲 Modo sorpresa — sin elegir nada
        </p>
      </div>

      {(stats.palabrasVistas > 0 || stats.juegosCompletados > 0) && (
        <motion.section
          aria-label="Tu progreso de hoy"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[28px] border-2 border-[var(--beige-border)] p-4 sm:p-5 mb-8 shadow-md max-w-sm mx-auto"
        >
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-center flex-wrap">
            <div>
              <span className="text-xl font-extrabold text-[var(--green-primary)]">{stats.palabrasVistas}</span>
              <span className="text-xs text-[var(--text-muted)] ml-1">vistas</span>
            </div>
            <div className="w-px h-6 bg-[var(--beige-border)]" aria-hidden="true" />
            <div>
              <span className="text-xl font-extrabold text-[var(--yellow-accent)]">{stats.juegosCompletados}</span>
              <span className="text-xs text-[var(--text-muted)] ml-1">juegos</span>
            </div>
            <div className="w-px h-6 bg-[var(--beige-border)]" aria-hidden="true" />
            <div>
              <span aria-hidden="true">🔥</span>
              <span className="text-xl font-extrabold text-[var(--text-dark)] ml-1">{stats.mejorRacha}</span>
            </div>
          </div>
        </motion.section>
      )}

      <div className="flex items-center gap-3 mb-6 max-w-xs mx-auto" aria-hidden="true">
        <div className="flex-1 h-px bg-[var(--beige-border)]" />
        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
          Elige un juego
        </span>
        <div className="flex-1 h-px bg-[var(--beige-border)]" />
      </div>

      <section aria-label="Tipos de juego" className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto mb-8">
        {JUEGOS.map((juego, i) => (
          <JuegoCard key={juego.tipo} juego={juego} index={i} onClick={() => irJuego(juego.tipo)} />
        ))}
      </section>

      <div className="text-center">
        <Link
          to="/diccionario"
          className="touch-target-inline inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-4 rounded-full border-2 border-[var(--beige-border)] bg-white hover:border-[var(--green-primary)] hover:shadow-md transition-all no-underline text-[var(--text-dark)] font-bold text-sm sm:text-base group"
        >
          <BookOpen className="w-5 h-5" aria-hidden="true" />
          <span>Explorar Diccionario</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </Link>
      </div>
    </PageLayout>
  );
}
