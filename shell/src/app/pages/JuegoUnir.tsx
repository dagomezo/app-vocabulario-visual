import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { Check } from "lucide-react";
import { GamePageShell } from "../components/GamePageShell";
import { buildBreadcrumbs } from "../lib/navigation";
import { cantidadEfectiva } from "../data/juegosAssets";
import { motion } from "motion/react";
import { getPalabrasPublic, type PalabraAPI } from "../lib/api";
import { playCorrect, playIncorrect } from "../lib/sounds";
import { registrarJuegoCompletado } from "../lib/session";

interface Connection {
  palabraId: string;
  videoId: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SeñaPreview({ video }: { video: PalabraAPI }) {
  if (video.videoUrl) {
    return (
      <video
        src={video.videoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
      >
        Tu navegador no soporta video.
      </video>
    );
  }
  return <img src={video.imagen} alt="" className="w-full h-full object-cover" />;
}

export default function JuegoUnir() {
  const location = useLocation();
  const navigate = useNavigate();
  const { categoriaId, cantidad = 5 } = location.state || { categoriaId: undefined, cantidad: 5 };

  const [palabras, setPalabras] = useState<PalabraAPI[]>([]);
  const [videos, setVideos] = useState<PalabraAPI[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [selectedPalabra, setSelectedPalabra] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [attemptResult, setAttemptResult] = useState<"correct" | "incorrect" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoriaId) {
      navigate("/juegos", { state: { tipoJuego: "unir" }, replace: true });
    }
  }, [categoriaId, navigate]);

  useEffect(() => {
    if (!categoriaId) return;

    const loadWords = async () => {
      try {
        const res = await getPalabrasPublic({ categoriaId, limit: 50 });
        const total = cantidadEfectiva("unir", cantidad, res.data.length);
        const selected = shuffle(res.data).slice(0, total);
        setPalabras(selected);
        setVideos(shuffle([...selected]));
      } catch (e) {
        console.error("Error loading words", e);
      } finally {
        setLoading(false);
      }
    };
    loadWords();
  }, [categoriaId, cantidad]);

  const handleSeñaClick = (videoId: string) => {
    if (isVideoConnected(videoId)) return;
    if (connectingId) return;
    setActiveVideo(videoId);
    setSelectedPalabra(null);
    setAttemptResult(null);
  };

  const handlePalabraClick = (palabraId: string) => {
    if (!activeVideo) return;
    if (isConnected(palabraId)) return;
    if (connectingId) return;

    setSelectedPalabra(palabraId);
    const isMatch = palabraId === activeVideo;

    if (isMatch) {
      setAttemptResult("correct");
      playCorrect();
      setConnectingId(activeVideo);

      setTimeout(() => {
        const nuevas = [...connections, { palabraId, videoId: activeVideo }];
        setConnections(nuevas);
        setActiveVideo(null);
        setSelectedPalabra(null);
        setConnectingId(null);
        setAttemptResult(null);

        if (nuevas.length === palabras.length) {
          setTimeout(() => {
            registrarJuegoCompletado("unir", categoriaId, palabras.length, palabras.length);
            navigate("/juegos/fin", {
              state: { totalPalabras: palabras.length, correctas: palabras.length },
            });
          }, 500);
        }
      }, 400);
    } else {
      setAttemptResult("incorrect");
      playIncorrect();
      setTimeout(() => {
        setSelectedPalabra(null);
        setAttemptResult(null);
      }, 600);
    }
  };

  const isConnected = (palabraId: string) => connections.some((c) => c.palabraId === palabraId);
  const isVideoConnected = (videoId: string) => connections.some((c) => c.videoId === videoId);

  const puedeElegirPalabra = activeVideo !== null && connectingId === null;

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center">
        <p className="text-xl text-[var(--text-muted)]" role="status">
          Cargando…
        </p>
      </div>
    );
  }

  if (palabras.length < 2) {
    return (
      <GamePageShell
        breadcrumbs={buildBreadcrumbs("/juegos/unir")}
        backTo="/juegos"
        backState={{ tipoJuego: "unir" }}
        backLabel="Volver a configurar"
        statusLabel="Juego de unir"
      >
        <div className="text-center max-w-md mx-auto bg-white rounded-[24px] border-2 border-[var(--beige-border)] p-8">
          <p className="text-lg text-[var(--text-muted)] mb-4">
            Necesitas al menos 2 palabras en esta categoría para jugar Unir.
          </p>
          <Link to="/juegos" state={{ tipoJuego: "unir" }} className="text-[var(--green-primary)] font-bold">
            Volver a configurar
          </Link>
        </div>
      </GamePageShell>
    );
  }

  return (
    <GamePageShell
      breadcrumbs={buildBreadcrumbs("/juegos/unir")}
      backTo="/juegos"
      backState={{ tipoJuego: "unir" }}
      backLabel="Volver a configurar"
      statusLabel="Juego de unir"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-dark)] text-center mb-2">
          Une cada palabra con su seña
        </h1>
        <p className="text-center text-[var(--text-muted)] mb-6 sm:mb-8 text-sm sm:text-base">
          1️⃣ Toca una seña &nbsp;→&nbsp; 2️⃣ Toca la palabra que corresponde
        </p>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-3">
            <h2 className="font-bold text-[var(--text-dark)] text-center mb-2 text-lg">📖 Palabras</h2>
            {palabras.map((palabra) => {
              const connected = isConnected(palabra.id);
              const wasWrong = selectedPalabra === palabra.id && attemptResult === "incorrect";
              const isHighlighted = selectedPalabra === palabra.id && attemptResult === "correct";

              return (
                <motion.button
                  key={palabra.id}
                  type="button"
                  layout
                  onClick={() => handlePalabraClick(palabra.id)}
                  disabled={!puedeElegirPalabra || connected}
                  whileTap={puedeElegirPalabra && !connected ? { scale: 0.98 } : {}}
                  className={`w-full rounded-[20px] border-2 transition-all overflow-hidden touch-target ${
                    connected
                      ? "bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed"
                      : wasWrong
                        ? "bg-red-100 border-red-500"
                        : isHighlighted
                          ? "bg-green-100 border-green-500"
                          : selectedPalabra === palabra.id
                            ? "bg-[var(--yellow-accent)]/30 border-[var(--green-primary)] shadow-md"
                            : puedeElegirPalabra
                              ? "bg-white border-[var(--beige-border)] hover:border-[var(--green-primary)] hover:shadow-md cursor-pointer"
                              : "bg-white border-[var(--beige-border)] opacity-70 cursor-default"
                  }`}
                >
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[16px] overflow-hidden bg-[var(--cream)] shrink-0">
                      <img
                        src={palabra.imagen}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      {connected ? (
                        <div className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-600 shrink-0" aria-hidden="true" />
                          <span className="text-base font-bold text-[var(--text-dark)] line-through opacity-50 truncate">
                            {palabra.palabra}
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className="text-base sm:text-lg font-bold text-[var(--text-dark)] truncate">
                            {palabra.palabra}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {!activeVideo
                              ? "Primero elige una seña →"
                              : wasWrong
                                ? "❌ Prueba otra palabra"
                                : "Toca si es la correcta"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="space-y-3">
            <h2 className="font-bold text-[var(--text-dark)] text-center mb-2 text-lg">🤟 Señas</h2>
            {videos.map((video) => {
              const connected = isVideoConnected(video.id);
              const isActive = activeVideo === video.id;
              const isConnecting = connectingId === video.id;

              return (
                <motion.button
                  key={video.id}
                  type="button"
                  layout
                  onClick={() => handleSeñaClick(video.id)}
                  disabled={connected || !!connectingId}
                  whileTap={!connected && !connectingId ? { scale: 0.98 } : {}}
                  aria-pressed={isActive}
                  aria-label={`Seña ${connected ? "conectada" : isActive ? "seleccionada" : "disponible"}`}
                  className={`w-full rounded-[20px] border-2 transition-all overflow-hidden touch-target ${
                    connected
                      ? "bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed"
                      : isConnecting
                        ? "bg-green-100 border-green-500 shadow-lg"
                        : isActive
                          ? "bg-white border-[var(--green-primary)] ring-2 ring-[var(--green-primary)]/40 shadow-lg"
                          : "bg-white border-[var(--beige-border)] hover:border-[var(--green-primary)] hover:shadow-md cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[16px] overflow-hidden bg-[var(--cream)] shrink-0">
                      {connected ? (
                        <img src={video.imagen} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <SeñaPreview video={video} />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      {connected ? (
                        <div className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-600" aria-hidden="true" />
                          <span className="text-sm font-bold text-[var(--text-muted)]">¡Conectado!</span>
                        </div>
                      ) : isActive ? (
                        <p className="text-sm font-bold text-[var(--green-primary)]">
                          ✅ Ahora elige la palabra
                        </p>
                      ) : (
                        <p className="text-sm text-[var(--text-muted)]">Toca para seleccionar esta seña</p>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <p className="mt-8 text-center text-base font-semibold text-[var(--text-dark)]" aria-live="polite">
          Conectados: {connections.length} de {palabras.length}
        </p>
      </div>
    </GamePageShell>
  );
}
