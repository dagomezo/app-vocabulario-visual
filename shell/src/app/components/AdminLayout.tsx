import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { AdminBrand, AdminNav } from "./AdminNav";

type AdminLayoutProps = {
  children: ReactNode;
  /** Título corto en la barra móvil (opcional) */
  mobileTitle?: string;
};

export function AdminLayout({ children, mobileTitle = "Admin" }: AdminLayoutProps) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen app-page">
      {/* Sidebar escritorio / tablet horizontal */}
      <aside
        className="hidden lg:flex w-64 xl:w-72 shrink-0 flex-col bg-gradient-to-b from-[var(--green-primary)] to-[#27865f] text-white p-4 xl:p-5 sticky top-0 h-screen overflow-y-auto"
        aria-label="Menú lateral de administración"
      >
        <AdminBrand />
        <AdminNav />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra superior móvil / tablet vertical */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b-2 border-[var(--beige-border)] px-3 sm:px-4 py-3">
          <div className="flex items-center gap-3 min-h-[var(--touch-min)]">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="touch-target flex items-center justify-center rounded-xl border-2 border-[var(--beige-border)] bg-white text-[var(--text-dark)] shrink-0"
              aria-expanded={drawerOpen}
              aria-controls="admin-drawer"
              aria-label="Abrir menú de administración"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--green-primary)] uppercase tracking-wide m-0">
                Señas App
              </p>
              <p className="text-base sm:text-lg font-bold text-[var(--text-dark)] truncate m-0">
                {mobileTitle}
              </p>
            </div>
          </div>
        </header>

        {/* Drawer móvil */}
        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-40" role="presentation">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Cerrar menú"
              onClick={() => setDrawerOpen(false)}
            />
            <div
              id="admin-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menú de administración"
              className="absolute top-0 left-0 bottom-0 w-[min(100%,20rem)] bg-gradient-to-b from-[var(--green-primary)] to-[#27865f] text-white p-4 flex flex-col shadow-2xl safe-area-bottom"
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <AdminBrand />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="touch-target flex items-center justify-center rounded-xl bg-white/10 text-white shrink-0"
                  aria-label="Cerrar menú"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>
              <AdminNav onNavigate={() => setDrawerOpen(false)} compact />
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 admin-main min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
