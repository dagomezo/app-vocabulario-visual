import imgFlashcards from "../../assets/imagenes/juegos/flashcards.png";
import imgQuiz from "../../assets/imagenes/juegos/quiz.png";
import imgMemoria from "../../assets/imagenes/juegos/memoria.png";
import imgUnir from "../../assets/imagenes/juegos/unir.avif";

export type TipoJuego = "flashcards" | "quiz" | "memoria" | "unir";

export type JuegoInfo = {
  tipo: TipoJuego;
  nombre: string;
  desc: string;
  imagen: string;
  imagenAlt: string;
};

export const JUEGOS: JuegoInfo[] = [
  {
    tipo: "flashcards",
    nombre: "Flashcards",
    desc: "¿Reconoces la seña? Elige la correcta",
    imagen: imgFlashcards,
    imagenAlt: "Ilustración de flashcards con una seña en pantalla",
  },
  {
    tipo: "quiz",
    nombre: "Quiz",
    desc: "Adivina la palabra correcta",
    imagen: imgQuiz,
    imagenAlt: "Ilustración de quiz con niño y signo de interrogación",
  },
  {
    tipo: "memoria",
    nombre: "Memoria",
    desc: "Encuentra todos los pares",
    imagen: imgMemoria,
    imagenAlt: "Ilustración de juego de memoria con tarjetas y cerebro",
  },
  {
    tipo: "unir",
    nombre: "Unir",
    desc: "Conecta cada palabra con su seña",
    imagen: imgUnir,
    imagenAlt: "Ilustración del juego Unir: conectar palabras con señas",
  },
];

export function getJuegoByTipo(tipo: TipoJuego): JuegoInfo {
  return JUEGOS.find((j) => j.tipo === tipo)!;
}

/** Opciones de cantidad según el juego (IHC: menos opciones en juegos de emparejar). */
export const CANTIDAD_POR_JUEGO: Record<TipoJuego, number[]> = {
  flashcards: [10, 20, 50],
  quiz: [10, 20, 50],
  memoria: [6, 8, 10],
  unir: [5, 8, 10],
};

export function cantidadDefault(tipo: TipoJuego): number {
  return CANTIDAD_POR_JUEGO[tipo][0];
}

export function cantidadEfectiva(tipo: TipoJuego, cantidad: number, disponibles: number): number {
  const max = CANTIDAD_POR_JUEGO[tipo][CANTIDAD_POR_JUEGO[tipo].length - 1];
  return Math.min(cantidad, max, disponibles);
}

/** Cantidad fija para el botón «Juego rápido» (juego y categoría aleatorios). */
export const CANTIDAD_JUEGO_RAPIDO = 10;

export function juegoAleatorio(): JuegoInfo {
  return JUEGOS[Math.floor(Math.random() * JUEGOS.length)];
}

export function stateConfigJuego(tipo: TipoJuego) {
  return { tipoJuego: tipo };
}
