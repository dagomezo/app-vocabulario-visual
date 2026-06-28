// Mock data for the application

export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
}

export interface Nivel {
  id: string;
  nombre: string;
  color: string;
}

export interface Palabra {
  id: string;
  palabra: string;
  categoriaId: string;
  nivelId: string;
  imagen: string;
  videoUrl: string;
  descripcion: string;
}

export const categorias: Categoria[] = [
  { id: "1", nombre: "Saludos", icono: "👋" },
  { id: "2", nombre: "Familia", icono: "👨‍👩‍👧‍👦" },
  { id: "3", nombre: "Animales", icono: "🐕" },
  { id: "4", nombre: "Colores", icono: "🎨" },
  { id: "5", nombre: "Números", icono: "🔢" },
  { id: "6", nombre: "Comida", icono: "🍎" },
];

export const niveles: Nivel[] = [
  { id: "1", nombre: "Básico", color: "#2f9f7b" },
  { id: "2", nombre: "Intermedio", color: "#f7c948" },
  { id: "3", nombre: "Avanzado", color: "#d4183d" },
];

export const palabras: Palabra[] = [
  {
    id: "1",
    palabra: "Perro",
    categoriaId: "3",
    nivelId: "1",
    imagen: "https://images.unsplash.com/photo-1560807707-8cc77767d783",
    videoUrl: "https://example.com/videos/perro.mp4",
    descripcion: "Señal que se hace con la mano derecha, simulando las orejas del perro.",
  },
  {
    id: "2",
    palabra: "Gato",
    categoriaId: "3",
    nivelId: "1",
    imagen: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
    videoUrl: "https://example.com/videos/gato.mp4",
    descripcion: "Señal que simula los bigotes del gato con los dedos.",
  },
  {
    id: "3",
    palabra: "Casa",
    categoriaId: "3",
    nivelId: "1",
    imagen: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
    videoUrl: "https://example.com/videos/casa.mp4",
    descripcion: "Señal que forma el techo de una casa con las manos.",
  },
  {
    id: "4",
    palabra: "Hola",
    categoriaId: "1",
    nivelId: "1",
    imagen: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca",
    videoUrl: "https://example.com/videos/hola.mp4",
    descripcion: "Señal de saludo con la mano abierta y movimiento lateral.",
  },
  {
    id: "5",
    palabra: "Mamá",
    categoriaId: "2",
    nivelId: "1",
    imagen: "https://images.unsplash.com/photo-1609220136736-443140cffec6",
    videoUrl: "https://example.com/videos/mama.mp4",
    descripcion: "Señal que toca la barbilla con el pulgar extendido.",
  },
  {
    id: "6",
    palabra: "Papá",
    categoriaId: "2",
    nivelId: "1",
    imagen: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed",
    videoUrl: "https://example.com/videos/papa.mp4",
    descripcion: "Señal que toca la frente con el pulgar extendido.",
  },
  {
    id: "7",
    palabra: "Rojo",
    categoriaId: "4",
    nivelId: "1",
    imagen: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da",
    videoUrl: "https://example.com/videos/rojo.mp4",
    descripcion: "Señal que toca los labios con el dedo índice.",
  },
  {
    id: "8",
    palabra: "Azul",
    categoriaId: "4",
    nivelId: "1",
    imagen: "https://images.unsplash.com/photo-1535083783855-76ae62b2914e",
    videoUrl: "https://example.com/videos/azul.mp4",
    descripcion: "Señal con movimiento ondulatorio de la mano.",
  },
  {
    id: "9",
    palabra: "Uno",
    categoriaId: "5",
    nivelId: "1",
    imagen: "https://images.unsplash.com/photo-1614849963640-9cc74b2a826f",
    videoUrl: "https://example.com/videos/uno.mp4",
    descripcion: "Señal con el dedo índice extendido.",
  },
  {
    id: "10",
    palabra: "Manzana",
    categoriaId: "6",
    nivelId: "1",
    imagen: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6",
    videoUrl: "https://example.com/videos/manzana.mp4",
    descripcion: "Señal que simula morder una manzana.",
  },
  {
    id: "11",
    palabra: "Agua",
    categoriaId: "6",
    nivelId: "1",
    imagen: "https://images.unsplash.com/photo-1559827260-dc66d52bef19",
    videoUrl: "https://example.com/videos/agua.mp4",
    descripcion: "Señal que simula beber agua.",
  },
  {
    id: "12",
    palabra: "Gracias",
    categoriaId: "1",
    nivelId: "1",
    imagen: "https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad",
    videoUrl: "https://example.com/videos/gracias.mp4",
    descripcion: "Señal que lleva la mano desde la boca hacia adelante.",
  },
];

export function getPalabrasByCategoria(categoriaId: string): Palabra[] {
  return palabras.filter((p) => p.categoriaId === categoriaId);
}

export function getPalabrasByNivel(nivelId: string): Palabra[] {
  return palabras.filter((p) => p.nivelId === nivelId);
}

export function getPalabraById(id: string): Palabra | undefined {
  return palabras.find((p) => p.id === id);
}

export function getCategoriaNombre(id: string): string {
  return categorias.find((c) => c.id === id)?.nombre || "";
}

export function getNivelNombre(id: string): string {
  return niveles.find((n) => n.id === id)?.nombre || "";
}
