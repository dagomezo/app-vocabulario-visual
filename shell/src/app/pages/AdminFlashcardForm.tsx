import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { AdminLayout } from "../components/AdminLayout";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import CloudinaryUpload from "../components/CloudinaryUpload";
import {
  getAdminCategorias,
  getAdminNiveles,
  getAdminFlashcardById,
  createAdminFlashcard,
  updateAdminFlashcard,
  checkAuth,
} from "../lib/api";

export default function AdminFlashcardForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [categorias, setCategorias] = useState<any[]>([]);
  const [todosNiveles, setTodosNiveles] = useState<any[]>([]);
  const [nivelesFiltrados, setNivelesFiltrados] = useState<any[]>([]);
  const [palabra, setPalabra] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [nivelId, setNivelId] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(esEdicion);

  useEffect(() => {
    checkAuth().catch(() => navigate("/admin-login"));
    Promise.all([
      getAdminCategorias(),
      getAdminNiveles(),
    ])
      .then(([cats, nivs]) => {
        setCategorias(cats);
        setTodosNiveles(nivs);
      })
      .catch(() => {});
  }, [navigate]);

  useEffect(() => {
    if (categoriaId) {
      setNivelesFiltrados(
        todosNiveles.filter((n: any) => {
          const catId = n.categoria_id?._id || n.categoria_id;
          return catId?.toString() === categoriaId;
        })
      );
    } else {
      setNivelesFiltrados([]);
    }
  }, [categoriaId, todosNiveles]);

  useEffect(() => {
    if (!esEdicion || !id) return;
    getAdminFlashcardById(id)
      .then((data: any) => {
        setPalabra(data.palabra || "");
        setDescripcion(data.descripcion || "");
        const catId = data.categoria_id?._id || data.categoria_id;
        setCategoriaId(catId?.toString() || "");
        const nivId = data.nivel_id?._id || data.nivel_id;
        setNivelId(nivId?.toString() || "");
        setImagenUrl(data.imagen_url || "");
        setVideoUrl(data.video_url || "");
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id, esEdicion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!videoUrl?.trim()) {
      return setError("Sube o pega la URL de la seña (video o GIF).");
    }
    if (!imagenUrl?.trim()) {
      return setError("Sube o pega la URL de la imagen.");
    }

    setGuardando(true);
    const body = {
      palabra: palabra.trim(),
      descripcion: descripcion.trim(),
      imagen_url: imagenUrl,
      video_url: videoUrl,
      categoria_id: categoriaId,
      nivel_id: nivelId,
    };

    try {
      if (esEdicion) {
        await updateAdminFlashcard(id!, body);
      } else {
        await createAdminFlashcard(body);
      }
      navigate("/admin/flashcards");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <AdminLayout mobileTitle="Flashcard">
        <p className="text-center text-[var(--text-muted)] py-12">Cargando flashcard…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout mobileTitle={esEdicion ? "Editar" : "Nueva"}>
      <div className="max-w-2xl mx-auto">
        <AdminPageHeader
          title={esEdicion ? "Editar flashcard" : "Nueva flashcard"}
          description={
            esEdicion ? "Actualiza los datos de la palabra" : "Agrega una nueva palabra con su seña"
          }
        />

          {/* Checklist */}
          <div className="bg-white rounded-[20px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-4 sm:p-6 mb-6 shadow-lg">
            <h2 className="font-bold text-[var(--text-dark)] mb-3">Requisitos para los juegos:</h2>
            <ul className="space-y-2">
              <li className={`flex items-center gap-2 ${imagenUrl ? "text-green-600" : "text-[var(--text-dark)] opacity-60"}`}>
                <span>{imagenUrl ? "✅" : "⬜"}</span>
                <span>Imagen — tarjetas, quiz y diccionario</span>
              </li>
              <li className={`flex items-center gap-2 ${videoUrl ? "text-green-600" : "text-[var(--text-dark)] opacity-60"}`}>
                <span>{videoUrl ? "✅" : "⬜"}</span>
                <span>Seña (video o GIF) — todos los juegos</span>
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-[20px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-4 sm:p-6 lg:p-8 shadow-lg space-y-5 sm:space-y-6">
            {/* Palabra */}
            <div className="space-y-2">
              <Label htmlFor="palabra" className="font-semibold text-[var(--text-dark)]">Palabra</Label>
              <Input
                id="palabra"
                value={palabra}
                onChange={(e) => setPalabra(e.target.value)}
                placeholder="Ej: Familia"
                required
                className="rounded-[16px] border-2 border-[var(--beige-border)]"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion" className="font-semibold text-[var(--text-dark)]">Descripción</Label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el significado y contexto de uso"
                rows={3}
                className="w-full rounded-[16px] border-2 border-[var(--beige-border)] px-4 py-3 bg-white text-[var(--text-dark)] resize-y"
              />
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="categoria" className="font-semibold text-[var(--text-dark)]">Categoría</Label>
              <select
                id="categoria"
                value={categoriaId}
                onChange={(e) => {
                  setCategoriaId(e.target.value);
                  setNivelId("");
                }}
                required
                className="w-full rounded-[16px] border-2 border-[var(--beige-border)] px-4 py-3 bg-white text-[var(--text-dark)]"
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icono || "📚"} {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Nivel */}
            <div className="space-y-2">
              <Label htmlFor="nivel" className="font-semibold text-[var(--text-dark)]">Nivel</Label>
              <select
                id="nivel"
                value={nivelId}
                onChange={(e) => setNivelId(e.target.value)}
                required
                className="w-full rounded-[16px] border-2 border-[var(--beige-border)] px-4 py-3 bg-white text-[var(--text-dark)]"
              >
                <option value="">
                  {categoriaId ? "Seleccionar nivel" : "Primero elige una categoría"}
                </option>
                {nivelesFiltrados.map((n: any) => (
                  <option key={n._id} value={n._id}>{n.nombre}</option>
                ))}
              </select>
              {!categoriaId && (
                <p className="text-sm text-[var(--text-dark)] opacity-60">
                  Selecciona una categoría para ver sus niveles disponibles
                </p>
              )}
            </div>

            {/* Imagen */}
            <div className="space-y-2">
              <Label className="font-semibold text-[var(--text-dark)]">
                Imagen <span className="text-red-500">*</span>
              </Label>
              <CloudinaryUpload tipo="image" onUpload={setImagenUrl} currentUrl={imagenUrl} />
              <details className="mt-2">
                <summary className="text-sm text-[var(--text-dark)] opacity-60 cursor-pointer">
                  O ingresar URL manualmente
                </summary>
                <Input
                  value={imagenUrl}
                  onChange={(e) => setImagenUrl(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="mt-2 rounded-[16px] border-2 border-[var(--beige-border)]"
                />
              </details>
            </div>

            {/* Video/Seña */}
            <div className="space-y-2">
              <Label className="font-semibold text-[var(--text-dark)]">
                Seña — video o GIF <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-[var(--text-dark)] opacity-60">
                GIF ideal para mostrar el movimiento de la seña. Video MP4 también funciona.
              </p>
              <CloudinaryUpload tipo="sign" onUpload={setVideoUrl} currentUrl={videoUrl} />
              <details className="mt-2">
                <summary className="text-sm text-[var(--text-dark)] opacity-60 cursor-pointer">
                  O ingresar URL manualmente (GIF, MP4 o enlace)
                </summary>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://ejemplo.com/sena.gif"
                  className="mt-2 rounded-[16px] border-2 border-[var(--beige-border)]"
                />
              </details>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 rounded-[16px] px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
              <Button
                type="submit"
                disabled={guardando}
                className="touch-target bg-[var(--green-primary)] hover:bg-[#27865f] text-white rounded-[16px] px-8"
              >
                {guardando
                  ? "Guardando..."
                  : esEdicion
                  ? "Guardar cambios"
                  : "Crear flashcard"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/flashcards")}
                className="touch-target border-2 border-[var(--beige-border)] rounded-[16px]"
              >
                Cancelar
              </Button>
            </div>
          </form>
      </div>
    </AdminLayout>
  );
}
