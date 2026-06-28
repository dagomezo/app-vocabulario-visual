import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import { GamePageShell } from "../components/GamePageShell";
import { buildBreadcrumbs } from "../lib/navigation";
import { Progress } from "../components/ui/progress";
import { Skeleton } from "../components/ui/skeleton";
import { getPalabrasPublic, type PalabraAPI } from "../lib/api";
import { playCorrect, playIncorrect } from "../lib/sounds";
import { registrarPalabraVista, registrarJuegoCompletado } from "../lib/session";
import confetti from "canvas-confetti";

interface OptionItem {
  id: string;
  label: string;
  videoUrl: string;
  imagen: string;
  isCorrect: boolean;
}

function OpcionSeña({
  option,
  index,
  selectedOption,
  isCorrect,
  onSelect,
}: {
  option: OptionItem;
  index: number;
  selectedOption: number | null;
  isCorrect: boolean | null;
  onSelect: (index: number) => void;
}) {
  const [mediaReady, setMediaReady] = useState(false);
  const locked = selectedOption !== null;
  const isSelected = selectedOption === index;
  const showAsCorrect = locked && option.isCorrect;
  const showAsWrong = locked && isSelected && !option.isCorrect;

  let cardClass =
    "bg-white border-[var(--beige-border)] hover:border-[var(--green-primary)] hover:shadow-md active:scale-[0.98]";
  if (isSelected && isCorrect) cardClass = "bg-green-100 border-green-500 shadow-lg";
  else if (showAsWrong) cardClass = "bg-red-100 border-red-500 shadow-lg";
  else if (showAsCorrect) cardClass = "bg-green-100 border-green-500 shadow-lg ring-2 ring-green-400";
  else if (locked) cardClass = "bg-white border-[var(--beige-border)] opacity-80";

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onSelect(index)}
      disabled={locked}
      aria-label={`Opción de seña ${index + 1}${showAsCorrect ? " — correcta" : ""}`}
      className={`rounded-[24px] sm:rounded-[28px] border-2 p-2 sm:p-3 flex flex-col items-center transition-all touch-target w-full cursor-pointer disabled:cursor-default ${cardClass}`}
    >
      <div className="w-full aspect-square max-w-[180px] mx-auto rounded-[16px] sm:rounded-[20px] overflow-hidden bg-[var(--cream)] relative">
        {!mediaReady && <Skeleton className="absolute inset-0 rounded-none" />}
        {option.videoUrl ? (
          <video
            src={option.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => setMediaReady(true)}
            className={`w-full h-full object-cover ${mediaReady ? "" : "opacity-0"}`}
          >
            Tu navegador no soporta video.
          </video>
        ) : (
          <img
            src={option.imagen}
            alt=""
            onLoad={() => setMediaReady(true)}
            className={`w-full h-full object-cover ${mediaReady ? "" : "opacity-0"}`}
          />
        )}
      </div>

      {locked && (
        <div className="mt-2 min-h-[24px] flex items-center justify-center" aria-hidden="true">
          {showAsCorrect || (isSelected && isCorrect) ? (
            <Check className="w-6 h-6 text-green-600" />
          ) : showAsWrong ? (
            <X className="w-6 h-6 text-red-600" />
          ) : null}
        </div>
      )}
    </motion.button>
  );
}

export default function JuegoFlashcards() {
  const location = useLocation();
  const navigate = useNavigate();
  const { categoriaId, cantidad } = location.state || { categoriaId: undefined, cantidad: 10 };

  useEffect(() => {
    if (!categoriaId) {
      navigate("/juegos", { state: { tipoJuego: "flashcards" }, replace: true });
    }
  }, [categoriaId, navigate]);

  const [palabras, setPalabras] = useState<PalabraAPI[]>([]);
  const [allPalabras, setAllPalabras] = useState<PalabraAPI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [loading, setLoading] = useState(true);

  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = 0; i < a.length - 1; i++) {
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

  const currentPalabra = palabras[currentIndex];
  const progress = palabras.length > 0 ? ((currentIndex + 1) / palabras.length) * 100 : 0;

  const options = useMemo(() => {
    if (!currentPalabra) return [];
    const otherWords = allPalabras.filter((p) => p.id !== currentPalabra.id);
    const randomWords = shuffle(otherWords).slice(0, 3);
    return shuffle([
      {
        id: currentPalabra.id,
        label: currentPalabra.palabra,
        videoUrl: currentPalabra.videoUrl,
        imagen: currentPalabra.imagen,
        isCorrect: true,
      },
      ...randomWords.map((w) => ({
        id: w.id,
        label: w.palabra,
        videoUrl: w.videoUrl,
        imagen: w.imagen,
        isCorrect: false,
      })),
    ]) as OptionItem[];
  }, [currentIndex, currentPalabra?.id, allPalabras]);

  const handleSelect = (index: number) => {
    if (selectedOption !== null) return;

    setSelectedOption(index);
    const correct = options[index].isCorrect;
    setIsCorrect(correct);

    if (correct) {
      playCorrect();
      registrarPalabraVista(true, currentPalabra?.id, "flashcards");
      setCorrectAnswers((prev) => prev + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => handleNext(), 1000);
    } else {
      playIncorrect();
      registrarPalabraVista(false, currentPalabra?.id, "flashcards");
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= palabras.length) {
      registrarJuegoCompletado("flashcards", categoriaId, palabras.length, correctAnswers);
      navigate("/juegos/fin", {
        state: {
          totalPalabras: palabras.length,
          correctas: correctAnswers,
        },
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    }
  };

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center">
        <p className="text-xl text-[var(--text-muted)]" role="status">
          Cargando palabras…
        </p>
      </div>
    );
  }

  if (!currentPalabra) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-[var(--text-muted)] mb-4">No hay palabras en esta categoría</p>
          <Link to="/juegos" state={{ tipoJuego: "flashcards" }} className="text-[var(--green-primary)] font-bold">
            Volver
          </Link>
        </div>
      </div>
    );
  }

  return (
    <GamePageShell
      breadcrumbs={buildBreadcrumbs("/juegos/flashcards")}
      backTo="/juegos"
      backState={{ tipoJuego: "flashcards" }}
      backLabel="Volver a configurar"
      statusLabel={`Palabra ${currentIndex + 1} de ${palabras.length}`}
      progress={<Progress value={progress} className="h-3" />}
    >
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 mb-6 sm:mb-8 text-center shadow-lg">
              <div className="bg-white rounded-[20px] overflow-hidden mb-4 inline-block">
                <img
                  src={currentPalabra.imagen}
                  alt={currentPalabra.palabra}
                  className="w-36 h-36 sm:w-48 sm:h-48 object-cover"
                  loading="lazy"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {currentPalabra.palabra.toUpperCase()}
              </h2>
              <p className="text-white/95 text-base sm:text-lg font-semibold">
                Toca la seña correcta 👇
              </p>
            </div>

            <div
              className="grid grid-cols-2 gap-3 sm:gap-4 mb-6"
              role="group"
              aria-label="Opciones de seña"
            >
              {options.map((option, index) => (
                <OpcionSeña
                  key={option.id}
                  option={option}
                  index={index}
                  selectedOption={selectedOption}
                  isCorrect={isCorrect}
                  onSelect={handleSelect}
                />
              ))}
            </div>

            {selectedOption !== null && !isCorrect && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[24px] border-2 border-[var(--beige-border)] p-5 sm:p-6 shadow-lg"
                role="status"
              >
                <p className="text-center text-[var(--text-dark)] mb-4 text-base sm:text-lg">
                  La seña correcta está marcada en verde 💚
                </p>
                <button
                  type="button"
                  onClick={() => handleNext()}
                  className="touch-target w-full bg-[var(--green-primary)] hover:bg-[var(--green-dark)] text-white rounded-[20px] py-4 text-lg font-bold transition-all active:scale-[0.98] border-none cursor-pointer"
                >
                  Siguiente →
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </GamePageShell>
  );
}
