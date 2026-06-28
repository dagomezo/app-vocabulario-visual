import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../components/AdminLayout";
import { AdminPageHeader } from "../components/AdminPageHeader";
import Pagination from "../components/Pagination";
import { Trash2 } from "lucide-react";
import { getAdminAlumnos, deleteAdminAlumno, checkAuth } from "../lib/api";

interface AlumnoItem {
  _id: string;
  nombre: string;
  sesiones_completadas: number;
  racha_actual: number;
  ultima_sesion_fecha: string | null;
}

export default function AdminAlumnos() {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState<AlumnoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    checkAuth().catch(() => navigate("/admin-login"));
    loadAlumnos();
  }, [navigate, page]);

  const loadAlumnos = async () => {
    try {
      const res = await getAdminAlumnos(page, limit);
      setAlumnos(res.data || []);
      setTotalPages(res.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este alumno?")) {
      try {
        await deleteAdminAlumno(id);
        await loadAlumnos();
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "Error al eliminar");
      }
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Nunca";
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Hace minutos";
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${Math.floor(hours / 24)}d`;
  };

  return (
    <AdminLayout mobileTitle="Alumnos">
      <div className="max-w-6xl mx-auto">
        <AdminPageHeader title="Alumnos" description="Gestiona los alumnos registrados" />

        {loading ? (
          <p className="text-center text-[var(--text-muted)]">Cargando…</p>
        ) : alumnos.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-12">No hay alumnos registrados</p>
        ) : (
          <>
            {/* Tarjetas — móvil */}
            <ul className="md:hidden space-y-3 list-none m-0 p-0 mb-4">
              {alumnos.map((alumno) => (
                <li
                  key={alumno._id}
                  className="bg-white rounded-[20px] border-2 border-[var(--beige-border)] p-4 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--text-dark)] m-0 truncate">{alumno.nombre}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-sm text-[var(--text-muted)]">
                        <span>
                          Sesiones:{" "}
                          <strong className="text-[var(--green-primary)]">{alumno.sesiones_completadas || 0}</strong>
                        </span>
                        <span>🔥 {alumno.racha_actual || 0}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] m-0 mt-2">{formatDate(alumno.ultima_sesion_fecha)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(alumno._id)}
                      className="touch-target p-2 rounded-full hover:bg-red-100 transition-colors shrink-0"
                      aria-label={`Eliminar ${alumno.nombre}`}
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Tabla — tablet / escritorio */}
            <div className="hidden md:block bg-white rounded-[28px] border-2 border-[var(--beige-border)] overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead className="bg-[var(--cream)]">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left font-bold text-[var(--text-dark)]">Nombre</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left font-bold text-[var(--text-dark)]">Sesiones</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left font-bold text-[var(--text-dark)]">Racha</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left font-bold text-[var(--text-dark)]">Última actividad</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left font-bold text-[var(--text-dark)]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnos.map((alumno) => (
                      <tr key={alumno._id} className="border-t border-[var(--beige-border)] hover:bg-[var(--cream)] transition-colors">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 font-semibold text-[var(--text-dark)]">{alumno.nombre}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="px-3 py-1 rounded-full bg-[var(--green-primary)] text-white text-sm font-semibold">
                            {alumno.sesiones_completadas || 0}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-[var(--text-dark)]">🔥 {alumno.racha_actual || 0}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-[var(--text-muted)]">{formatDate(alumno.ultima_sesion_fecha)}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <button type="button" onClick={() => handleDelete(alumno._id)} className="touch-target p-2 rounded-full hover:bg-red-100 transition-colors" aria-label={`Eliminar ${alumno.nombre}`}>
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
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
