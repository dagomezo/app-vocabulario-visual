import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../components/AdminLayout";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { getAdminCategorias, createAdminCategoria, updateAdminCategoria, deleteAdminCategoria, checkAuth } from "../lib/api";

const EMOJIS = [
  "🐕", "🐈", "🐘", "🦁", "🐒", "🐢", "🐬", "🐦",
  "🍎", "🍕", "🍔", "🥗", "🍩", "🍦", "🍉", "🍇",
  "🌳", "🌺", "🌻", "🌈", "🌊", "⛰️", "🔥", "⭐",
  "🏠", "🚗", "✈️", "⚽", "🎵", "📚", "🎨", "🎮",
  "💡", "🎯", "❤️", "🌟", "😄", "👍", "👋", "🎉",
];

interface CategoriaItem {
  _id: string;
  id: string;
  nombre: string;
  icono: string;
}

export default function AdminCategorias() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [nombre, setNombre] = useState("");
  const [icono, setIcono] = useState("");
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editIcono, setEditIcono] = useState("");

  useEffect(() => {
    checkAuth().catch(() => navigate("/admin-login"));
    loadCategorias();
  }, [navigate]);

  const loadCategorias = async () => {
    try {
      const data = await getAdminCategorias();
      setCategorias(
        data.map((c: { _id: string; id?: string; nombre: string; icono?: string }) => ({
          _id: c._id,
          id: c._id?.toString() || c.id || c._id,
          nombre: c.nombre,
          icono: c.icono || "📚",
        }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!nombre || !icono) return;
    try {
      await createAdminCategoria(nombre, icono);
      setNombre("");
      setIcono("");
      setIsAdding(false);
      await loadCategorias();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al guardar");
    }
  };

  const handleEdit = (cat: CategoriaItem) => {
    setEditandoId(cat._id);
    setEditNombre(cat.nombre);
    setEditIcono(cat.icono);
  };

  const handleSaveEdit = async () => {
    if (!editandoId || !editNombre || !editIcono) return;
    try {
      await updateAdminCategoria(editandoId, editNombre, editIcono);
      setEditandoId(null);
      await loadCategorias();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al guardar");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta categoría?")) {
      try {
        await deleteAdminCategoria(id);
        await loadCategorias();
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "Error al eliminar");
      }
    }
  };

  return (
    <AdminLayout mobileTitle="Categorías">
      <div className="max-w-4xl mx-auto">
        <AdminPageHeader
          title="Categorías"
          description="Gestiona las categorías de palabras"
          actions={
            <Button
              onClick={() => setIsAdding(!isAdding)}
              className="touch-target bg-[var(--green-primary)] hover:bg-[#27865f] text-white rounded-[20px] px-5 sm:px-6 py-3"
            >
              <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
              Nueva Categoría
            </Button>
          }
        />

        {isAdding && (
          <div className="bg-white rounded-[20px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-4 sm:p-6 mb-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-dark)] mb-4 m-0">
              Agregar Nueva Categoría
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[var(--text-dark)] mb-2 font-semibold">Nombre</label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Animales"
                  className="rounded-[16px] border-2 border-[var(--beige-border)] min-h-[var(--touch-min)]"
                />
              </div>
              <div>
                <label className="block text-[var(--text-dark)] mb-2 font-semibold">Icono</label>
                <Input
                  value={icono}
                  onChange={(e) => setIcono(e.target.value)}
                  placeholder="Elige uno abajo"
                  className="rounded-[16px] border-2 border-[var(--beige-border)] text-2xl min-h-[var(--touch-min)]"
                />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcono(emoji)}
                      aria-pressed={icono === emoji}
                      className={`touch-target w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-[10px] text-xl transition-all hover:bg-[var(--green-primary)] hover:text-white ${
                        icono === emoji
                          ? "bg-[var(--green-primary)] text-white scale-110 shadow-md"
                          : "bg-[var(--cream)] border border-[var(--beige-border)]"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleAdd} className="touch-target bg-[var(--green-primary)] hover:bg-[#27865f] text-white rounded-[16px]">
                Guardar
              </Button>
              <Button onClick={() => setIsAdding(false)} variant="outline" className="touch-target border-2 border-[var(--beige-border)] rounded-[16px]">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {loading && <p className="text-center text-[var(--text-muted)]">Cargando…</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {categorias.map((categoria) => (
            <article
              key={categoria._id}
              className="bg-white rounded-[20px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-4 sm:p-6 shadow-lg"
            >
              {editandoId === categoria._id ? (
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                  <Input
                    value={editIcono}
                    onChange={(e) => setEditIcono(e.target.value)}
                    className="w-full sm:w-16 rounded-[12px] border-2 border-[var(--beige-border)] text-center text-2xl min-h-[var(--touch-min)]"
                    aria-label="Icono"
                  />
                  <Input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="flex-1 rounded-[12px] border-2 border-[var(--beige-border)] min-h-[var(--touch-min)]"
                    aria-label="Nombre"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} className="touch-target flex-1 sm:flex-none bg-[var(--green-primary)] text-white rounded-[12px] px-4">
                      Guardar
                    </Button>
                    <Button onClick={() => setEditandoId(null)} variant="outline" className="touch-target flex-1 sm:flex-none border-2 border-[var(--beige-border)] rounded-[12px] px-4">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="text-3xl sm:text-4xl shrink-0" aria-hidden="true">
                      {categoria.icono}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--text-dark)] m-0 truncate">
                      {categoria.nombre}
                    </h3>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(categoria)}
                      className="touch-target p-2 rounded-full hover:bg-blue-100 transition-colors"
                      aria-label={`Editar ${categoria.nombre}`}
                    >
                      <Edit3 className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(categoria._id)}
                      className="touch-target p-2 rounded-full hover:bg-red-100 transition-colors"
                      aria-label={`Eliminar ${categoria.nombre}`}
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
