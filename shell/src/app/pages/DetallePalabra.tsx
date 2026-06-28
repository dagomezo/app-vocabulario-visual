import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { PageLayout } from "../components/PageLayout";
import { buildBreadcrumbs } from "../lib/navigation";
import { getPalabraByIdPublic, type PalabraAPI } from "../lib/api";

export default function DetallePalabra() {
  const { id } = useParams<{ id: string }>();
  const [palabra, setPalabra] = useState<PalabraAPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPalabraByIdPublic(id)
      .then(setPalabra)
      .catch(() => setPalabra(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageLayout breadcrumbs={buildBreadcrumbs("/diccionario")} maxWidth="3xl" mainClassName="pt-8">
        <p className="text-center text-lg text-[var(--text-muted)]" role="status">
          Cargando…
        </p>
      </PageLayout>
    );
  }

  if (!palabra) {
    return (
      <PageLayout breadcrumbs={buildBreadcrumbs("/diccionario")} maxWidth="3xl" mainClassName="pt-8">
        <div className="text-center bg-white rounded-[28px] border-2 border-[var(--beige-border)] p-8">
          <h1 className="text-2xl font-bold text-[var(--text-dark)] mb-4">Palabra no encontrada</h1>
          <Link
            to="/diccionario"
            className="touch-target-inline inline-flex items-center text-[var(--green-primary)] font-bold no-underline hover:underline"
          >
            Volver al diccionario
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      breadcrumbs={buildBreadcrumbs(`/diccionario/${palabra.id}`, palabra.palabra)}
      title={palabra.palabra}
      description={`${palabra.categoriaNombre} · ${palabra.nivelNombre}`}
      maxWidth="3xl"
      mainClassName="pt-0 space-y-6"
    >
      <article className="bg-white rounded-[24px] sm:rounded-[28px] border-2 border-[var(--beige-border)] overflow-hidden shadow-lg">
        <div className="aspect-video overflow-hidden">
          <img
            src={palabra.imagen}
            alt={`Imagen de referencia para la seña ${palabra.palabra}`}
            className="w-full h-full object-cover"
          />
        </div>
      </article>

      <section
        aria-labelledby="titulo-video"
        className="bg-white rounded-[24px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-5 sm:p-6 shadow-lg"
      >
        <h2 id="titulo-video" className="text-lg sm:text-xl font-bold text-[var(--text-dark)] mb-4">
          Video de la seña
        </h2>
        <div className="aspect-video bg-[var(--cream)] rounded-[20px] overflow-hidden">
          {palabra.videoUrl ? (
            <video
              src={palabra.videoUrl}
              controls
              className="w-full h-full object-cover"
              playsInline
              aria-label={`Video de la seña ${palabra.palabra}`}
            >
              Tu navegador no puede reproducir el video.
            </video>
          ) : (
            <p className="flex items-center justify-center h-full text-[var(--text-muted)] p-4 text-center">
              Video no disponible por ahora
            </p>
          )}
        </div>
      </section>

      <section
        aria-labelledby="titulo-descripcion"
        className="bg-white rounded-[24px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-5 sm:p-6 shadow-lg"
      >
        <h2 id="titulo-descripcion" className="text-lg sm:text-xl font-bold text-[var(--text-dark)] mb-4">
          ¿Cómo se hace?
        </h2>
        <p className="text-[var(--text-dark)] text-base sm:text-lg leading-relaxed">
          {palabra.descripcion}
        </p>
      </section>
    </PageLayout>
  );
}
