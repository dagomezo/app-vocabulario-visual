import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../components/AdminLayout";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { TrendingUp, Users, BookOpen, Clock } from "lucide-react";
import { getAdminStats, checkAuth, type AdminStats } from "../lib/api";

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().catch(() => navigate("/admin-login"));
    getAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const statCards = [
    { label: "Sesiones Totales", value: stats?.totalAlumnos || 0, icon: Users, bg: "bg-[var(--green-primary)]", iconClass: "text-white" },
    { label: "Activas (7 días)", value: stats?.alumnosActivos || 0, icon: BookOpen, bg: "bg-[var(--yellow-accent)]", iconClass: "text-[var(--text-dark)]" },
    { label: "Sesiones Hoy", value: stats?.sesionesHoy || 0, icon: Clock, bg: "bg-[var(--green-primary)]", iconClass: "text-white" },
    { label: "Palabras Practicadas", value: stats?.palabrasTotales || 0, icon: TrendingUp, bg: "bg-[var(--yellow-accent)]", iconClass: "text-[var(--text-dark)]" },
  ];

  return (
    <AdminLayout mobileTitle="Analíticas">
      <div className="max-w-6xl mx-auto">
        <AdminPageHeader title="Analíticas" description="Visualiza el progreso y estadísticas" />

        {loading ? (
          <p className="text-center text-[var(--text-muted)]">Cargando…</p>
        ) : (
          <>
            <div className="admin-stat-grid mb-6 sm:mb-8">
              {statCards.map(({ label, value, icon: Icon, bg, iconClass }) => (
                <div key={label} className="bg-white rounded-[20px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-4 sm:p-6 shadow-lg">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 ${bg} rounded-full flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconClass}`} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] m-0">{label}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-[var(--text-dark)] m-0">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <section className="bg-white rounded-[20px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-4 sm:p-6 shadow-lg min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-dark)] mb-4 m-0">Actividad Semanal</h2>
                <div className="min-h-[12rem] sm:min-h-[16rem] bg-[var(--cream)] rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 overflow-y-auto">
                  {stats?.actividadSemanal && stats.actividadSemanal.length > 0 ? (
                    <ul className="space-y-2 list-none m-0 p-0">
                      {stats.actividadSemanal.map((d: { _id: string; total: number }) => (
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
                  {stats?.distribucionCalif && stats.distribucionCalif.length > 0 ? (
                    <ul className="space-y-2 list-none m-0 p-0">
                      {stats.distribucionCalif.map((d: { _id: string; total: number }) => (
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

            <section className="bg-white rounded-[20px] sm:rounded-[28px] border-2 border-[var(--beige-border)] p-4 sm:p-6 shadow-lg">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-dark)] mb-4 m-0">Calidad del Vocabulario</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-[var(--cream)] rounded-[16px] text-center">
                  <p className="text-xl sm:text-2xl font-bold text-[var(--green-primary)] m-0">{stats?.calidadFlashcards?.total || 0}</p>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] m-0 mt-1">Total palabras</p>
                </div>
                <div className="p-3 sm:p-4 bg-[var(--cream)] rounded-[16px] text-center">
                  <p className="text-xl sm:text-2xl font-bold text-[var(--green-primary)] m-0">{stats?.calidadFlashcards?.completas || 0}</p>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] m-0 mt-1">Completas</p>
                </div>
                <div className="p-3 sm:p-4 bg-[var(--cream)] rounded-[16px] text-center">
                  <p className="text-xl sm:text-2xl font-bold text-amber-600 m-0">{stats?.calidadFlashcards?.sinImagen || 0}</p>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] m-0 mt-1">Sin imagen</p>
                </div>
                <div className="p-3 sm:p-4 bg-[var(--cream)] rounded-[16px] text-center">
                  <p className="text-xl sm:text-2xl font-bold text-red-600 m-0">{stats?.calidadFlashcards?.sinSena || 0}</p>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] m-0 mt-1">Sin seña</p>
                </div>
              </div>
              {stats?.calidadFlashcards?.incompletas?.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="font-semibold text-sm text-[var(--text-dark)] m-0">Palabras incompletas:</p>
                  <ul className="space-y-2 list-none m-0 p-0">
                    {stats.calidadFlashcards.incompletas.map((fc: { _id: string; palabra: string; categoria_id?: { nombre: string }; nivel_id?: { nombre: string } }) => (
                      <li key={fc._id} className="flex flex-col sm:flex-row sm:justify-between gap-1 p-2 sm:p-3 bg-[var(--cream)] rounded-[12px] text-sm text-[var(--text-dark)]">
                        <span className="font-semibold">{fc.palabra}</span>
                        <span className="text-[var(--text-muted)]">{fc.categoria_id?.nombre} · {fc.nivel_id?.nombre}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
