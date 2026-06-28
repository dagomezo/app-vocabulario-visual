import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { GamePageShell } from "../components/GamePageShell";
import { buildBreadcrumbs } from "../lib/navigation";
import { cantidadEfectiva } from "../data/juegosAssets";
import { Skeleton } from "../components/ui/skeleton";
import { getPalabrasPublic, type PalabraAPI } from "../lib/api";
import { playCorrect, playIncorrect } from "../lib/sounds";
import { registrarJuegoCompletado } from "../lib/session";

interface Card {
  id: string;
  type: "word" | "sign";
  palabraId: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function JuegoMemoria() {
  const location = useLocation();
  const navigate = useNavigate();
  const { categoriaId, cantidad = 6 } = location.state || { categoriaId: undefined, cantidad: 6 };

  useEffect(() => {
    if (!categoriaId) {
      navigate("/juegos", { state: { tipoJuego: "memoria" }, replace: true });
    }
  }, [categoriaId, navigate]);
  
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [intentos, setIntentos] = useState(0);
  const [paresEncontrados, setParesEncontrados] = useState(0);
  const [loading, setLoading] = useState(true);
  const [videosReady, setVideosReady] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (!categoriaId) return;

    const loadWords = async () => {
      const shuffle = <T,>(arr: T[]): T[] => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };

      try {
        const res = await getPalabrasPublic({ categoriaId, limit: 50 });
        const total = cantidadEfectiva("memoria", cantidad, res.data.length);
        const palabras = shuffle(res.data).slice(0, total);
        
        const cardPairs: Card[] = [];
        palabras.forEach((palabra) => {
          cardPairs.push({
            id: `word-${palabra.id}`,
            type: "word",
            palabraId: palabra.id,
            content: palabra.palabra,
            isFlipped: false,
            isMatched: false,
          });
          cardPairs.push({
            id: `sign-${palabra.id}`,
            type: "sign",
            palabraId: palabra.id,
            content: palabra.palabra,
            imageUrl: palabra.imagen,
            videoUrl: palabra.videoUrl,
            isFlipped: false,
            isMatched: false,
          });
        });
        
        setCards(cardPairs.sort(() => Math.random() - 0.5));
      } catch (e) {
        console.error("Error loading words", e);
      } finally {
        setLoading(false);
      }
    };
    loadWords();
  }, [categoriaId, cantidad]);
  
  const handleCardClick = (index: number) => {
    if (
      flippedCards.length >= 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) {
      return;
    }
    
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);
    
    if (newFlipped.length === 2) {
      setIntentos((prev) => prev + 1);
      
      const [first, second] = newFlipped;
      const firstCard = cards[first];
      const secondCard = cards[second];
      
      if (firstCard.palabraId === secondCard.palabraId) {
        playCorrect();
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[first].isMatched = true;
          updatedCards[second].isMatched = true;
          setCards(updatedCards);
          setFlippedCards([]);
          setParesEncontrados((prev) => prev + 1);
          
          if (paresEncontrados + 1 === cards.length / 2) {
            setTimeout(() => {
              registrarJuegoCompletado("memoria", categoriaId, cards.length / 2, cards.length / 2);
              navigate("/juegos/fin", {
                state: {
                  totalPalabras: cards.length / 2,
                  correctas: cards.length / 2,
                  intentos,
                },
              });
            }, 1200);
          }
        }, 2500);
      } else {
        playIncorrect();
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[first].isFlipped = false;
          updatedCards[second].isFlipped = false;
          const newReady = { ...videosReady };
          delete newReady[updatedCards[first].id];
          delete newReady[updatedCards[second].id];
          setVideosReady(newReady);
          setCards(updatedCards);
          setFlippedCards([]);
        }, 2500);
      }
    }
  };
  
  const totalPares = cards.length / 2;

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center">
        <p className="text-xl text-[var(--text-dark)] opacity-60">Cargando...</p>
      </div>
    );
  }
  
  return (
    <GamePageShell
      breadcrumbs={buildBreadcrumbs("/juegos/memoria")}
      backTo="/juegos"
      backState={{ tipoJuego: "memoria" }}
      backLabel="Volver a configurar"
      statusLabel="Juego de memoria"
    >
      <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-[var(--text-dark)] text-center mb-6">
            🧠 Encuentra los pares
          </h1>
          
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-sm text-[var(--text-dark)] opacity-60 mb-1">
                Intentos
              </p>
              <p className="text-3xl font-bold text-[var(--text-dark)]">
                {intentos}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[var(--text-dark)] opacity-60 mb-1">
                Pares
              </p>
              <p className="text-3xl font-bold text-[var(--green-primary)]">
                {paresEncontrados}/{totalPares}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto">
            {cards.map((card, index) => {
              const isRevealed = card.isFlipped || card.isMatched;
              const isVideoCard = card.type === "sign" && !!card.videoUrl;
              const videoLoaded = !!videosReady[card.id];
              
              return (
                <motion.button
                  key={card.id}
                  layout
                  onClick={() => handleCardClick(index)}
                  disabled={isRevealed}
                  whileHover={!isRevealed ? { scale: 1.05 } : {}}
                  whileTap={!isRevealed ? { scale: 0.95 } : {}}
                  className={`aspect-square rounded-[20px] border-2 transition-all overflow-hidden relative ${
                    card.isMatched
                      ? "bg-green-100 border-green-500 shadow-md"
                      : card.isFlipped
                      ? "bg-white border-[var(--green-primary)] shadow-md"
                      : "bg-gradient-to-br from-[var(--green-primary)] to-[#27865f] border-transparent shadow-md hover:shadow-lg"
                  }`}
                >
                  {/* Hidden face — fades in when card flips back */}
                  <AnimatePresence>
                    {!isRevealed && (
                      <motion.div
                        key="hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span className="text-3xl">🤟</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Revealed content — exits with fade+scale when card flips back */}
                  <AnimatePresence>
                    {isRevealed && (
                      <motion.div
                        key="revealed"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 flex flex-col items-center justify-center p-0.5"
                      >
                        {card.isMatched ? (
                          <div className="flex flex-col items-center justify-center gap-1">
                            <Check className="w-6 h-6 text-green-600" />
                            <span className="font-extrabold text-[var(--text-dark)] text-sm leading-tight text-center px-1">
                              {card.content}
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 w-full flex items-center justify-center min-h-0">
                              {isVideoCard ? (
                                <div className="w-full h-full relative">
                                  {!videoLoaded && (
                                    <Skeleton className="absolute inset-0 rounded-none bg-[var(--cream)]" />
                                  )}
                                  <video
                                    src={card.videoUrl}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    onLoadedData={() => setVideosReady((prev) => ({ ...prev, [card.id]: true }))}
                                    className={`w-full h-full object-cover rounded-[12px] ${!videoLoaded ? "opacity-0" : ""}`}
                                  >
                                    Tu navegador no soporta video.
                                  </video>
                                </div>
                              ) : card.type === "sign" && card.imageUrl ? (
                                <img
                                  src={card.imageUrl}
                                  alt={card.content}
                                  className="w-full h-full object-cover rounded-[12px]"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="font-extrabold text-[var(--text-dark)] text-sm leading-tight block px-1 text-center">
                                  {card.content}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-[var(--text-dark)] opacity-40 mt-0.5 block leading-tight shrink-0">
                              {card.type === "word" ? "📖 palabra" : "🤟 seña"}
                            </span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
    </GamePageShell>
  );
}
