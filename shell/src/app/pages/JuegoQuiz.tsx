import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import { GamePageShell } from "../components/GamePageShell";
import { buildBreadcrumbs } from "../lib/navigation";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { getPalabrasPublic, type PalabraAPI } from "../lib/api";
import { playCorrect, playIncorrect } from "../lib/sounds";
import { registrarPalabraVista, registrarJuegoCompletado } from "../lib/session";

export default function JuegoQuiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { categoriaId, cantidad } = location.state || { categoriaId: undefined, cantidad: 10 };

  useEffect(() => {
    if (!categoriaId) {
      navigate("/juegos", { state: { tipoJuego: "quiz" }, replace: true });
    }
  }, [categoriaId, navigate]);
  
  const [palabras, setPalabras] = useState<PalabraAPI[]>([]);
  const [allPalabras, setAllPalabras] = useState<PalabraAPI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  useEffect(() => {
    if (!categoriaId) return;
    const loadWords = async () => {
      try {
        const res = await getPalabrasPublic({ categoriaId, limit: 50 });
        const words = shuffle(res.data.slice(0, Math.min(cantidad, res.data.length)));
        setPalabras(words);

        const allRes = await getPalabrasPublic({ categoriaId, limit: 200 });
        setAllPalabras(allRes.data);
      } catch (e) {
        console.error("Error loading words", e);
      } finally {
        setLoading(false);
      }
    };
    loadWords();
  }, [categoriaId, cantidad]);

  useEffect(() => {
    setVideoLoaded(false);
  }, [currentIndex]);
  
  const currentPalabra = palabras[currentIndex];
  const progress = palabras.length > 0 ? ((currentIndex + 1) / palabras.length) * 100 : 0;
  
  const options = useMemo(() => {
    if (!currentPalabra) return [];
    const otherWords = allPalabras.filter((p) => p.id !== currentPalabra.id);
    const randomWords = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);
    return [currentPalabra, ...randomWords].sort(() => Math.random() - 0.5);
  }, [currentIndex, currentPalabra?.id, allPalabras]);
  const correctIndex = options.findIndex((opt) => opt.id === currentPalabra?.id);
  
  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(index);
    
    if (index === correctIndex) {
      setCorrectAnswers((prev) => prev + 1);
      playCorrect();
      registrarPalabraVista(true, currentPalabra?.id, "quiz");
    } else {
      playIncorrect();
      registrarPalabraVista(false, currentPalabra?.id, "quiz");
    }
  };
  
  const handleNext = () => {
    if (currentIndex + 1 >= palabras.length) {
      registrarJuegoCompletado("quiz", categoriaId, palabras.length, correctAnswers);
      navigate("/juegos/fin", {
        state: {
          totalPalabras: palabras.length,
          correctas: correctAnswers,
        },
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    }
  };
  
  if (loading) {
    return (
      <div className="app-page flex items-center justify-center">
        <p className="text-xl text-[var(--text-dark)] opacity-60">Cargando palabras...</p>
      </div>
    );
  }

  if (!currentPalabra) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-[var(--text-dark)] opacity-60 mb-4">No hay palabras en esta categoría</p>
          <Link to="/juegos" state={{ tipoJuego: "quiz" }} className="text-[var(--green-primary)] font-bold">Volver</Link>
        </div>
      </div>
    );
  }
  
  return (
    <GamePageShell
      breadcrumbs={buildBreadcrumbs("/juegos/quiz")}
      backTo="/juegos"
      backState={{ tipoJuego: "quiz" }}
      backLabel="Volver a configurar"
      statusLabel={`Palabra ${currentIndex + 1} de ${palabras.length}`}
      progress={<Progress value={progress} className="h-3" />}
    >
      <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Video Panel (calidad original) */}
              <div className="bg-white rounded-[28px] border-2 border-[var(--beige-border)] overflow-hidden mb-8 shadow-lg">
                <div className="aspect-video relative bg-[var(--cream)]">
                  {!videoLoaded && (
                    <Skeleton className="absolute inset-0 rounded-none" />
                  )}
                  {currentPalabra.videoUrl ? (
                    <video
                      src={currentPalabra.videoUrl}
                      className={`w-full h-full object-cover ${!videoLoaded ? "opacity-0 absolute" : ""}`}
                      autoPlay
                      muted
                      loop
                      playsInline
                      onLoadedData={() => setVideoLoaded(true)}
                    >
                      Tu navegador no soporta video.
                    </video>
                  ) : (
                    <img
                      src={currentPalabra.imagen}
                      alt={currentPalabra.palabra}
                      className="w-full h-full object-cover"
                      onLoad={() => setVideoLoaded(true)}
                    />
                  )}
                </div>
                <div className="p-6 text-center">
                  <h2 className="text-2xl font-bold text-[var(--text-dark)]">
                    ¿Qué palabra es?
                  </h2>
                </div>
              </div>
              
              {/* Options */}
              <div className="space-y-3 mb-6">
                {options.map((option, index) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleOptionClick(index)}
                    disabled={selectedOption !== null}
                    className={`w-full p-6 rounded-[28px] border-2 transition-all text-left font-bold text-lg ${
                      selectedOption === index
                        ? index === correctIndex
                          ? "bg-green-100 border-green-500 shadow-lg"
                          : "bg-red-100 border-red-500 shadow-lg"
                        : selectedOption !== null && index === correctIndex
                        ? "bg-green-100 border-green-500 shadow-lg"
                        : "bg-white border-[var(--beige-border)] hover:border-[var(--green-primary)] hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-dark)]">{option.palabra}</span>
                      {selectedOption !== null && index === correctIndex && (
                        <Check className="w-6 h-6 text-green-600" />
                      )}
                      {selectedOption === index && index !== correctIndex && (
                        <X className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
              
              {/* Next Button */}
              {selectedOption !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={handleNext}
                    className="w-full bg-[var(--green-primary)] hover:bg-[#27865f] text-white rounded-[20px] py-6 text-lg font-bold"
                  >
                    Siguiente →
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
    </GamePageShell>
  );
}
