import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../components/AdminLayout";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Users, BookOpen, BarChart3, TrendingUp } from "lucide-react";
import { getAdminStats, checkAuth, type AdminStats } from "../lib/api";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalAlumnos: 0, alumnosActivos: 0, totalPalabras: 0, sesionesHoy: 0 });
  const [fullStats, setFullStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().catch(() => {
      navigate("/admin-login");
    });

    getAdminStats()
      .catch(() => ({
        totalAlumnos: 0,
        alumnosActivos: 0,
        sesionesHoy: 0,
        calidadFlashcards: { total: 0 },
      }))
      .then((adminStats) => {
        setFullStats(adminStats as AdminStats);
        setStats({
          totalAlumnos: adminStats.totalAlumnos,
          alumnosActivos: adminStats.alumnosActivos,
          totalPalabras: adminStats.calidadFlashcards?.total || 0,
          sesionesHoy: adminStats.sesionesHoy || 0,
        });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const statCards = [
    { label: "Sesiones totales", value: stats.totalAlumnos, icon: Users, bg: "bg-[var(--green-primary)]", iconClass: "text-white" },
    { label: "Palabras", value: stats.totalPalabras, icon: BookOpen, bg: "bg-[var(--yellow-accent)]", iconClass: "text-[var(--text-dark)]" },
    { label: "Sesiones hoy", value: stats.sesionesHoy, icon: BarChart3, bg: "bg-[var(--green-primary)]", iconClass: "text-white" },
    { label: "Activos (7d)", value: stats.alumnosActivos, icon: TrendingUp, bg: "bg-[var(--yellow-accent)]", iconClass: "text-[var(--text-dark)]" },
  ];

  return (
    <AdminLayout mobileTitle="Panel">
      <div className="max-w-6xl mx-auto">
        <AdminPageHeader
          title="Panel de Administración"
          description="Gestiona tu aplicación de lengua de señas"
        />

        <div className="admin-stat-grid mb-6 sm:mb-8">
          {statCards.map(({ label, value, icon: Icon, bg, iconClass }) => (
            <div
              key={label}
              className="bg-white rounded-[20px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-4 sm:p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 ${bg} rounded-full flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconClass}`} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] m-0">{label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[var(--text-dark)] m-0">
                    {loading ? "…" : value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <section className="bg-white rounded-[20px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-4 sm:p-6 shadow-lg min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-dark)] mb-4 m-0">Actividad Semanal</h2>
            <div className="min-h-[12rem] sm:min-h-[16rem] bg-[var(--cream)] rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 overflow-y-auto">
              {fullStats?.actividadSemanal && fullStats.actividadSemanal.length > 0 ? (
                <ul className="space-y-2 list-none m-0 p-0">
                  {fullStats.actividadSemanal.map((d: { _id: string; total: number }) => (
                    <li key={d._id} className="flex justify-between gap-2 text-sm text-[var(--text-dark)]">
                      <span className="truncate">{d._id}</span>
                      <span className="font-bold shrink-0">{d.total} actividades</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[var(--text-muted)] text-center m-0 py-8">Sin datos esta semana</p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-[20px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-4 sm:p-6 shadow-lg min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-dark)] mb-4 m-0">Distribución por Juego</h2>
            <div className="min-h-[12rem] sm:min-h-[16rem] bg-[var(--cream)] rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 overflow-y-auto">
              {fullStats?.distribucionCalif && fullStats.distribucionCalif.length > 0 ? (
                <ul className="space-y-2 list-none m-0 p-0">
                  {fullStats.distribucionCalif.map((d: { _id: string; total: number }) => (
                    <li key={d._id} className="flex justify-between gap-2 text-sm text-[var(--text-dark)]">
                      <span className="truncate">🎮 {d._id}</span>
                      <span className="font-bold shrink-0">{d.total} jugadas</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[var(--text-muted)] text-center m-0 py-8">Sin datos esta semana</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
