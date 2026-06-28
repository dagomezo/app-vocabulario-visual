import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../components/AdminLayout";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { getAdminNiveles, getAdminCategorias, createAdminNivel, updateAdminNivel, deleteAdminNivel, checkAuth } from "../lib/api";

interface NivelItem {
  _id: string;
  nombre: string;
  orden: number;
  categoria_id: string;
}

interface CategoriaItem {
  _id: string;
  nombre: string;
  icono: string;
}

export default function AdminNiveles() {
  const navigate = useNavigate();
  const [niveles, setNiveles] = useState<NivelItem[]>([]);
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [nombre, setNombre] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");

  useEffect(() => {
    checkAuth().catch(() => navigate("/admin-login"));
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const cats = await getAdminCategorias();
      setCategorias(cats);
      if (cats.length > 0 && !categoriaId) setCategoriaId(cats[0]._id);
      const nivs = await getAdminNiveles();
      setNiveles(nivs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const nivelesPorCategoria = useMemo(() => {
    const map = new Map<string, NivelItem[]>();
    niveles.forEach((nivel) => {
      const catId = nivel.categoria_id?.toString();
      if (!map.has(catId)) map.set(catId, []);
      map.get(catId)!.push(nivel);
    });
    return map;
  }, [niveles]);

  const handleAdd = async () => {
    if (!nombre || !categoriaId) return;
    try {
      await createAdminNivel(nombre, categoriaId);
      setNombre("");
      setIsAdding(false);
      await loadData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al guardar");
    }
  };

  const handleEdit = (nivel: NivelItem) => {
    setEditandoId(nivel._id);
    setEditNombre(nivel.nombre);
  };

  const handleSaveEdit = async () => {
    if (!editandoId || !editNombre) return;
    try {
      await updateAdminNivel(editandoId, { nombre: editNombre });
      setEditandoId(null);
      await loadData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al guardar");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este nivel?")) {
      try {
        await deleteAdminNivel(id);
        await loadData();
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "Error al eliminar");
      }
    }
  };

  return (
    <AdminLayout mobileTitle="Niveles">
      <div className="max-w-4xl mx-auto">
        <AdminPageHeader
          title="Niveles"
          description="Gestiona los niveles de dificultad por categoría"
          actions={
            <Button
              onClick={() => setIsAdding(!isAdding)}
              className="touch-target bg-[var(--green-primary)] hover:bg-[#27865f] text-white rounded-[20px] px-5 sm:px-6 py-3"
            >
              <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
              Nuevo Nivel
            </Button>
          }
        />

        {isAdding && (
          <div className="bg-white rounded-[20px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-4 sm:p-6 mb-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-dark)] mb-4 m-0">Agregar Nuevo Nivel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[var(--text-dark)] mb-2 font-semibold">Nombre</label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Básico"
                  className="rounded-[16px] border-2 border-[var(--beige-border)] min-h-[var(--touch-min)]"
                />
              </div>
              <div>
                <label className="block text-[var(--text-dark)] mb-2 font-semibold">Categoría</label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="w-full rounded-[16px] border-2 border-[var(--beige-border)] px-4 py-3 bg-white text-[var(--text-dark)] min-h-[var(--touch-min)]"
                >
                  {categorias.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.icono} {c.nombre}
                    </option>
                  ))}
                </select>
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

        <div className="space-y-4 sm:space-y-6">
          {categorias.map((cat) => {
            const nivelesCat = nivelesPorCategoria.get(cat._id) || [];
            if (nivelesCat.length === 0) return null;
            return (
              <section
                key={cat._id}
                className="bg-white rounded-[20px] sm:rounded-[28px] border-2 border-[var(--beige-border)] overflow-hidden shadow-lg"
              >
                <div className="bg-[var(--cream)] px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-[var(--beige-border)]">
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--text-dark)] m-0">
                    {cat.icono} {cat.nombre}
                  </h2>
                </div>
                <ul className="divide-y divide-[var(--beige-border)] list-none m-0 p-0">
                  {nivelesCat
                    .sort((a, b) => a.orden - b.orden)
                    .map((nivel) => (
                      <li key={nivel._id} className="px-4 sm:px-6 py-3 sm:py-4">
                        {editandoId === nivel._id ? (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <Input
                              value={editNombre}
                              onChange={(e) => setEditNombre(e.target.value)}
                              className="flex-1 rounded-[12px] border-2 border-[var(--beige-border)] min-h-[var(--touch-min)]"
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
                              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--green-primary)] text-white font-bold text-sm shrink-0">
                                {nivel.orden}
                              </div>
                              <h3 className="text-base sm:text-lg font-bold text-[var(--text-dark)] m-0 truncate">
                                {nivel.nombre}
                              </h3>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button type="button" onClick={() => handleEdit(nivel)} className="touch-target p-2 rounded-full hover:bg-blue-100 transition-colors" aria-label={`Editar ${nivel.nombre}`}>
                                <Edit3 className="w-5 h-5 text-blue-600" />
                              </button>
                              <button type="button" onClick={() => handleDelete(nivel._id)} className="touch-target p-2 rounded-full hover:bg-red-100 transition-colors" aria-label={`Eliminar ${nivel.nombre}`}>
                                <Trash2 className="w-5 h-5 text-red-600" />
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
