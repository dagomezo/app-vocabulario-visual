import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { AdminLayout } from "../components/AdminLayout";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import Pagination from "../components/Pagination";
import { Plus, Trash2, Search, Edit3 } from "lucide-react";
import { getAdminFlashcards, deleteAdminFlashcard, checkAuth } from "../lib/api";

interface FlashcardItem {
  _id: string;
  palabra: string;
  imagen_url: string;
  categoria_id?: { _id: string; nombre: string; icono: string };
  nivel_id?: { _id: string; nombre: string };
}

export default function AdminFlashcards() {
  const navigate = useNavigate();
  const [palabras, setPalabras] = useState<FlashcardItem[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    checkAuth().catch(() => navigate("/admin-login"));
    loadPalabras();
  }, [navigate, page]);

  const loadPalabras = async () => {
    try {
      const res = await getAdminFlashcards({ page, limit, palabra: busqueda || undefined });
      setPalabras(res.data || []);
      setTotalPages(res.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    if (!loading) loadPalabras();
  }, [busqueda]);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta palabra?")) {
      try {
        await deleteAdminFlashcard(id);
        await loadPalabras();
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "Error al eliminar");
      }
    }
  };

  return (
    <AdminLayout mobileTitle="Flashcards">
      <div className="max-w-6xl mx-auto">
        <AdminPageHeader
          title="Flashcards"
          description="Gestiona las palabras y sus señas"
          actions={
            <Link to="/admin/flashcards/nueva">
              <Button className="touch-target bg-[var(--green-primary)] hover:bg-[#27865f] text-white rounded-[20px] px-5 sm:px-6 py-3 w-full sm:w-auto">
                <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
                Nueva Palabra
              </Button>
            </Link>
          }
        />

        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Buscar palabra…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-12 rounded-[20px] border-2 border-[var(--beige-border)] bg-white py-5 sm:py-6 min-h-[var(--touch-min)]"
              aria-label="Buscar palabra"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center text-[var(--text-muted)]">Cargando…</p>
        ) : palabras.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-12 text-lg">No se encontraron palabras</p>
        ) : (
          <>
            {/* Tarjetas — móvil */}
            <ul className="md:hidden space-y-3 list-none m-0 p-0">
              {palabras.map((palabra) => (
                <li
                  key={palabra._id}
                  className="bg-white rounded-[20px] border-2 border-[var(--beige-border)] p-4 shadow-md"
                >
                  <div className="flex gap-3">
                    {palabra.imagen_url ? (
                      <img
                        src={palabra.imagen_url}
                        alt=""
                        className="w-16 h-16 object-cover rounded-[12px] shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-[12px] bg-[var(--cream)] flex items-center justify-center text-2xl shrink-0" aria-hidden="true">
                        📷
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[var(--text-dark)] m-0 truncate">{palabra.palabra}</p>
                      <p className="text-sm text-[var(--text-muted)] m-0 mt-1 truncate">
                        {palabra.categoria_id?.nombre || "—"}
                      </p>
                      {palabra.nivel_id?.nombre && (
                        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[var(--green-primary)] text-white text-xs font-semibold">
                          {palabra.nivel_id.nombre}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Link
                        to={`/admin/flashcards/${palabra._id}/editar`}
                        className="touch-target p-2 rounded-full hover:bg-blue-100 transition-colors flex items-center justify-center"
                        aria-label={`Editar ${palabra.palabra}`}
                      >
                        <Edit3 className="w-5 h-5 text-blue-600" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(palabra._id)}
                        className="touch-target p-2 rounded-full hover:bg-red-100 transition-colors"
                        aria-label={`Eliminar ${palabra.palabra}`}
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Tabla — tablet / escritorio */}
            <div className="hidden md:block bg-white rounded-[28px] border-2 border-[var(--beige-border)] overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-[var(--cream)]">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left font-bold text-[var(--text-dark)]">Imagen</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left font-bold text-[var(--text-dark)]">Palabra</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left font-bold text-[var(--text-dark)]">Categoría</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left font-bold text-[var(--text-dark)]">Nivel</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left font-bold text-[var(--text-dark)]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {palabras.map((palabra) => (
                      <tr key={palabra._id} className="border-t border-[var(--beige-border)] hover:bg-[var(--cream)] transition-colors">
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          {palabra.imagen_url ? (
                            <img src={palabra.imagen_url} alt="" className="w-14 h-14 lg:w-16 lg:h-16 object-cover rounded-[12px]" />
                          ) : (
                            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[12px] bg-[var(--cream)] flex items-center justify-center text-2xl">📷</div>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 font-semibold text-[var(--text-dark)]">{palabra.palabra}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-[var(--text-muted)]">{palabra.categoria_id?.nombre || ""}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="px-3 py-1 rounded-full bg-[var(--green-primary)] text-white text-sm font-semibold">
                            {palabra.nivel_id?.nombre || ""}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex gap-2">
                            <Link
                              to={`/admin/flashcards/${palabra._id}/editar`}
                              className="touch-target p-2 rounded-full hover:bg-blue-100 transition-colors inline-flex"
                              aria-label={`Editar ${palabra.palabra}`}
                            >
                              <Edit3 className="w-5 h-5 text-blue-600" />
                            </Link>
                            <button type="button" onClick={() => handleDelete(palabra._id)} className="touch-target p-2 rounded-full hover:bg-red-100 transition-colors" aria-label={`Eliminar ${palabra.palabra}`}>
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
