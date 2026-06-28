import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "../components/PageLayout";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { buildBreadcrumbs } from "../lib/navigation";
import {
  getPalabrasPublic,
  getCategoriasPublic,
  getNivelesPublic,
  type CategoriaAPI,
  type NivelAPI,
  type PalabraAPI,
} from "../lib/api";

function getNivelColor(nivelId: string): string {
  const colors = ["#2f9f7b", "#c99700", "#b01530", "#3a7bc8", "#7d4eaa"];
  let hash = 0;
  for (let i = 0; i < nivelId.length; i++) hash = (hash * 31 + nivelId.charCodeAt(i)) | 0;
  return colors[Math.abs(hash) % colors.length];
}

function idCategoria(cat: CategoriaAPI): string {
  return cat.id || cat._id?.toString();
}

function idNivel(nivel: NivelAPI): string {
  return nivel.id || nivel._id?.toString();
}

const ITEMS_PER_PAGE = 12;

export default function Diccionario() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [nivelFilter, setNivelFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [categorias, setCategorias] = useState<CategoriaAPI[]>([]);
  const [niveles, setNiveles] = useState<NivelAPI[]>([]);
  const [palabras, setPalabras] = useState<PalabraAPI[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoriasLoading, setCategoriasLoading] = useState(true);
  const [nivelesLoading, setNivelesLoading] = useState(false);
  const [filtrosError, setFiltrosError] = useState<string | null>(null);

  useEffect(() => {
    setCategoriasLoading(true);
    setFiltrosError(null);
    getCategoriasPublic()
      .then((data) => {
        setCategorias(data);
        if (data.length === 0) {
          setFiltrosError("No hay categorías disponibles en este momento.");
        }
      })
      .catch(() => {
        setCategorias([]);
        setFiltrosError("No se pudieron cargar las categorías. Verifica que el backend esté activo.");
      })
      .finally(() => setCategoriasLoading(false));
  }, []);

  useEffect(() => {
    if (categoriaFilter === "todos") {
      setNiveles([]);
      setNivelesLoading(false);
      return;
    }

    let cancelled = false;
    setNivelesLoading(true);
    getNivelesPublic(categoriaFilter)
      .then((data) => {
        if (!cancelled) setNiveles(data);
      })
      .catch(() => {
        if (!cancelled) setNiveles([]);
      })
      .finally(() => {
        if (!cancelled) setNivelesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoriaFilter]);

  useEffect(() => {
    setLoading(true);
    getPalabrasPublic({
      categoriaId: categoriaFilter !== "todos" ? categoriaFilter : undefined,
      nivelId: nivelFilter !== "todos" ? nivelFilter : undefined,
      busqueda: busqueda || undefined,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    })
      .then((res) => {
        setPalabras(res.data);
        setTotalPages(res.pages);
      })
      .catch(() => {
        setPalabras([]);
        setTotalPages(0);
      })
      .finally(() => setLoading(false));
  }, [busqueda, categoriaFilter, nivelFilter, currentPage]);

  const categoriaSeleccionada = categorias.find((c) => idCategoria(c) === categoriaFilter);

  return (
    <PageLayout
      breadcrumbs={buildBreadcrumbs("/diccionario")}
      title="Diccionario"
      description="Busca palabras, mira las señas y aprende a tu ritmo."
      maxWidth="6xl"
      mainClassName="pt-0"
    >
      <section aria-label="Buscar y filtrar palabras" className="mb-6 sm:mb-8">
        <label htmlFor="buscar-palabra" className="sr-only">
          Buscar palabra
        </label>
        <div className="relative mb-4">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id="buscar-palabra"
            type="search"
            placeholder="Buscar palabra…"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-12 rounded-[20px] border-2 border-[var(--beige-border)] bg-white py-5 sm:py-6 text-base min-h-[var(--touch-min)]"
          />
        </div>

        {filtrosError && (
          <div className="mb-4 rounded-[16px] bg-red-50 border-2 border-red-200 px-4 py-3 text-sm text-red-800" role="alert">
            {filtrosError}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="filtro-categoria" className="block text-sm font-bold text-[var(--text-dark)] mb-2">
              Categoría
            </label>
            <Select
              value={categoriaFilter}
              onValueChange={(value) => {
                setCategoriaFilter(value);
                setNivelFilter("todos");
                setCurrentPage(1);
              }}
              disabled={categoriasLoading || categorias.length === 0}
            >
              <SelectTrigger
                id="filtro-categoria"
                className="rounded-[20px] border-2 border-[var(--beige-border)] bg-white py-5 min-h-[var(--touch-min)] w-full"
              >
                <SelectValue
                  placeholder={categoriasLoading ? "Cargando categorías…" : "Todas las categorías"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las categorías</SelectItem>
                {categorias.map((cat) => {
                  const catId = idCategoria(cat);
                  return (
                    <SelectItem key={catId} value={catId}>
                      {cat.icono} {cat.nombre}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="filtro-nivel" className="block text-sm font-bold text-[var(--text-dark)] mb-2">
              Nivel
              {categoriaSeleccionada && (
                <span className="font-normal text-[var(--text-muted)] ml-1">
                  ({categoriaSeleccionada.icono} {categoriaSeleccionada.nombre})
                </span>
              )}
            </label>
            <Select
              value={nivelFilter}
              onValueChange={(value) => {
                setNivelFilter(value);
                setCurrentPage(1);
              }}
              disabled={categoriaFilter === "todos" || nivelesLoading}
            >
              <SelectTrigger
                id="filtro-nivel"
                className="rounded-[20px] border-2 border-[var(--beige-border)] bg-white py-5 min-h-[var(--touch-min)] w-full"
              >
                <SelectValue
                  placeholder={
                    categoriaFilter === "todos"
                      ? "Elige una categoría primero"
                      : nivelesLoading
                        ? "Cargando niveles…"
                        : niveles.length === 0
                          ? "Sin niveles en esta categoría"
                          : "Todos los niveles"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los niveles</SelectItem>
                {niveles.map((nivel) => {
                  const nId = idNivel(nivel);
                  return (
                    <SelectItem key={nId} value={nId}>
                      {nivel.nombre}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {loading ? (
        <p className="text-center py-12 text-lg text-[var(--text-muted)]" role="status">
          Cargando palabras…
        </p>
      ) : palabras.length === 0 ? (
        <p className="text-center py-12 text-lg text-[var(--text-muted)]" role="status">
          No se encontraron palabras. Prueba con otra búsqueda o cambia los filtros.
        </p>
      ) : (
        <>
          <ul
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 list-none m-0 p-0"
            aria-label="Lista de palabras"
          >
            {palabras.map((palabra) => (
              <li key={palabra.id}>
                <Link
                  to={`/diccionario/${palabra.id}`}
                  className="block bg-white rounded-[24px] sm:rounded-[28px] border-2 border-[var(--beige-border)] overflow-hidden hover:shadow-lg hover:border-[var(--green-primary)] transition-all hover:-translate-y-0.5 no-underline group h-full"
                >
                  <div className="aspect-square overflow-hidden bg-[var(--cream)]">
                    {palabra.imagen ? (
                      <img
                        src={palabra.imagen}
                        alt={`Seña de ${palabra.palabra}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl" aria-hidden="true">
                        🤟
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 text-center">
                    <h2 className="font-bold text-[var(--text-dark)] mb-1 text-sm sm:text-base">
                      {palabra.palabra}
                    </h2>
                    {palabra.nivelNombre && (
                      <span
                        className="inline-block px-2.5 py-1 rounded-full text-white text-xs font-bold"
                        style={{ backgroundColor: getNivelColor(palabra.nivelId) }}
                      >
                        {palabra.nivelNombre}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav aria-label="Paginación del diccionario" className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
                className="touch-target p-2 rounded-full bg-white border-2 border-[var(--beige-border)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--green-primary)] hover:text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
              </button>

              <span className="text-[var(--text-dark)] font-bold text-sm sm:text-base" aria-live="polite">
                Página {currentPage} de {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Página siguiente"
                className="touch-target p-2 rounded-full bg-white border-2 border-[var(--beige-border)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--green-primary)] hover:text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" aria-hidden="true" />
              </button>
            </nav>
          )}
        </>
      )}
    </PageLayout>
  );
}
