import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { PageLayout } from "../components/PageLayout";
import {
  CANTIDAD_POR_JUEGO,
  cantidadDefault,
  getJuegoByTipo,
  type TipoJuego,
} from "../data/juegosAssets";
import { getCategoriasPublic, type CategoriaAPI } from "../lib/api";
import { playClick } from "../lib/sounds";
import { Play } from "lucide-react";

type JuegosLocationState = {
  tipoJuego?: TipoJuego;
};

export default function JuegosHub() {
  const location = useLocation();
  const navigate = useNavigate();
  const tipoPreseleccionado = (location.state as JuegosLocationState | null)?.tipoJuego ?? null;

  useEffect(() => {
    if (!tipoPreseleccionado) {
      navigate("/", { replace: true });
    }
  }, [tipoPreseleccionado, navigate]);

  const juegoActivo = tipoPreseleccionado ? getJuegoByTipo(tipoPreseleccionado) : null;

  const [categorias, setCategorias] = useState<CategoriaAPI[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(() =>
    tipoPreseleccionado ? cantidadDefault(tipoPreseleccionado) : 10
  );
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [errorCategorias, setErrorCategorias] = useState<string | null>(null);
  const [avisoSeleccion, setAvisoSeleccion] = useState(false);

  const cantidadOpciones = useMemo(
    () => (tipoPreseleccionado ? CANTIDAD_POR_JUEGO[tipoPreseleccionado] : [10, 20, 50]),
    [tipoPreseleccionado]
  );

  useEffect(() => {
    if (tipoPreseleccionado) {
      setCantidad(cantidadDefault(tipoPreseleccionado));
    }
  }, [tipoPreseleccionado]);

  useEffect(() => {
    setCargandoCategorias(true);
    setErrorCategorias(null);
    getCategoriasPublic()
      .then((data) => {
        setCategorias(data);
        if (data.length === 0) {
          setErrorCategorias("No hay categorías disponibles en este momento.");
        }
      })
      .catch((err: Error) => {
        setCategorias([]);
        setErrorCategorias(
          err.message.includes("503") || err.message.toLowerCase().includes("base de datos")
            ? "No se pudo conectar con la base de datos. Verifica que el backend esté activo."
            : "No se pudieron cargar las categorías. Intenta recargar la página."
        );
      })
      .finally(() => setCargandoCategorias(false));
  }, []);

  const sinCategorias = !cargandoCategorias && categorias.length === 0;
  const puedeJugar = categorias.length > 0 && categoriaSeleccionada !== null;

  const seleccionarCategoria = (id: string) => {
    setCategoriaSeleccionada(id);
    setAvisoSeleccion(false);
  };

  const iniciarJuego = () => {
    if (!tipoPreseleccionado || !puedeJugar) {
      if (categorias.length > 0) setAvisoSeleccion(true);
      return;
    }
    playClick();
    navigate(`/juegos/${tipoPreseleccionado}`, {
      state: { categoriaId: categoriaSeleccionada, cantidad },
    });
  };

  if (!juegoActivo) return null;

  const breadcrumbs = [
    { label: "Inicio", href: "/" },
    { label: juegoActivo.nombre, current: true },
  ];

  return (
    <PageLayout
      breadcrumbs={breadcrumbs}
      title={juegoActivo.nombre}
      description="Elige la categoría y cuántas palabras quieres practicar."
      mainClassName="pt-0 space-y-6"
    >
      <section
        aria-label="Juego seleccionado"
        className="bg-white rounded-[24px] border-2 border-[var(--green-primary)] p-4 sm:p-5 shadow-md flex items-center gap-4"
      >
        <img
          src={juegoActivo.imagen}
          alt=""
          aria-hidden="true"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-[16px] object-cover shrink-0"
        />
        <div>
          <p className="text-xs font-bold text-[var(--green-primary)] uppercase tracking-wide mb-1">
            Vas a jugar
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-dark)] m-0">
            {juegoActivo.nombre}
          </h2>
          <p className="text-sm text-[var(--text-muted)] m-0 mt-1">{juegoActivo.desc}</p>
        </div>
      </section>

      <section
        aria-labelledby="paso-categoria"
        className={`bg-white rounded-[24px] sm:rounded-[28px] border-2 p-5 sm:p-6 shadow-lg ${
          avisoSeleccion ? "border-amber-500 ring-2 ring-amber-200" : "border-[var(--beige-border)]"
        }`}
      >
        <h2 id="paso-categoria" className="text-lg sm:text-xl font-bold text-[var(--text-dark)] mb-1">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--green-primary)] text-white text-sm mr-2"
            aria-hidden="true"
          >
            1
          </span>
          Selecciona una categoría
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-4 ml-10 sm:ml-0">
          Elige el tema que quieres practicar
        </p>

        {cargandoCategorias && (
          <p className="text-center text-[var(--text-muted)] py-6" role="status">
            Cargando categorías…
          </p>
        )}

        {errorCategorias && (
          <div className="rounded-[16px] bg-red-50 border-2 border-red-200 px-4 py-3 text-sm text-red-800" role="alert">
            {errorCategorias}
          </div>
        )}

        {!cargandoCategorias && categorias.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="group" aria-label="Categorías disponibles">
            {categorias.map((cat) => {
              const selected = categoriaSeleccionada === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => seleccionarCategoria(cat.id)}
                  aria-pressed={selected}
                  className={`min-h-[88px] sm:min-h-[96px] p-3 sm:p-4 rounded-[20px] font-bold transition-all touch-target ${
                    selected
                      ? "bg-[var(--green-primary)] text-white shadow-md ring-2 ring-[var(--green-dark)]"
                      : "bg-white border-2 border-[var(--beige-border)] text-[var(--text-dark)] hover:border-[var(--green-primary)]"
                  }`}
                >
                  <div className="text-2xl sm:text-3xl mb-1" aria-hidden="true">
                    {cat.icono}
                  </div>
                  <div className="text-xs sm:text-sm">{cat.nombre}</div>
                </button>
              );
            })}
          </div>
        )}

        {avisoSeleccion && categorias.length > 0 && (
          <p className="mt-4 text-sm font-bold text-amber-800" role="alert">
            ↑ Primero elige una categoría
          </p>
        )}
      </section>

      <section
        aria-labelledby="paso-cantidad"
        className="bg-white rounded-[24px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-5 sm:p-6 shadow-lg"
      >
        <h2 id="paso-cantidad" className="text-lg sm:text-xl font-bold text-[var(--text-dark)] mb-4">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--green-primary)] text-white text-sm mr-2"
            aria-hidden="true"
          >
            2
          </span>
          ¿Cuántas palabras?
        </h2>
        <div className="flex flex-wrap gap-3 justify-center" role="group" aria-label="Cantidad de palabras">
          {cantidadOpciones.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setCantidad(num)}
              aria-pressed={cantidad === num}
              className={`touch-target min-w-[72px] px-6 py-3 rounded-[20px] font-bold transition-all ${
                cantidad === num
                  ? "bg-[var(--green-primary)] text-white shadow-md"
                  : "bg-white border-2 border-[var(--beige-border)] text-[var(--text-dark)] hover:border-[var(--green-primary)]"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Iniciar juego" className="text-center pb-4">
        <motion.button
          whileHover={puedeJugar ? { scale: 1.03 } : {}}
          whileTap={puedeJugar ? { scale: 0.97 } : {}}
          type="button"
          onClick={iniciarJuego}
          disabled={!puedeJugar}
          className={`touch-target-inline rounded-full px-10 sm:px-14 py-4 sm:py-5 text-lg sm:text-xl font-bold shadow-lg transition-all gap-3 border-none inline-flex items-center ${
            puedeJugar
              ? "bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] text-white hover:shadow-xl cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Play className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
          Empezar {juegoActivo.nombre}
        </motion.button>
        {!puedeJugar && !sinCategorias && (
          <p className="text-sm text-[var(--text-muted)] mt-2">Selecciona una categoría para continuar</p>
        )}
      </section>
    </PageLayout>
  );
}
