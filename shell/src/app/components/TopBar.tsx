import { Link, useLocation } from "react-router";
import { KeyRound, Home, BookOpen } from "lucide-react";
import { NAV_PRINCIPAL, isNavActive } from "../lib/navigation";
import { PuceLogo } from "./PuceLogo";

const ICONS = {
  home: Home,
  book: BookOpen,
} as const;

export function TopBar() {
  const { pathname } = useLocation();

  return (
    <header
      role="banner"
      className="bg-white/95 backdrop-blur-sm border-b-2 border-[var(--beige-border)] px-4 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-30"
    >
      <div className="max-w-6xl mx-auto w-full grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-x-3 sm:gap-x-4 min-h-[var(--touch-min)]">
        {/* Izquierda — logo PUCE */}
        <div className="flex items-center justify-start self-center h-full min-w-0">
          <a
            href="https://www.puce.edu.ec"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center shrink-0 rounded-xl hover:opacity-90 transition-opacity h-[var(--touch-min)]"
            aria-label="PUCE — sitio web oficial (abre en nueva pestaña)"
          >
            <PuceLogo className="h-8 sm:h-9 w-auto max-w-[96px] sm:max-w-[110px]" />
          </a>
        </div>

        {/* Centro — navegación (centrada en la barra completa) */}
        <nav
          aria-label="Secciones principales"
          className="hidden md:flex items-center justify-center gap-2 justify-self-center self-center h-full"
        >
          {NAV_PRINCIPAL.map(({ href, label, icon }) => {
            const Icon = ICONS[icon];
            const active = isNavActive(pathname, href);
            return (
              <Link
                key={href}
                to={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-2xl font-bold text-sm no-underline transition-colors ${
                  active
                    ? "bg-[var(--green-primary)] text-white shadow-md"
                    : "text-[var(--text-dark)] hover:bg-[var(--cream)] border-2 border-transparent hover:border-[var(--beige-border)]"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span className="leading-none">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Derecha — título app + profesor */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 self-center h-full min-w-0 col-start-2 md:col-start-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 no-underline rounded-2xl px-1 sm:px-2 h-[var(--touch-min)]"
            aria-label="Señas App — Ir al inicio"
          >
            <span className="text-xl sm:text-2xl leading-none flex items-center" aria-hidden="true">
              🤟
            </span>
            <span className="font-extrabold text-base sm:text-lg text-[var(--text-dark)] whitespace-nowrap leading-none">
              Señas App
            </span>
          </Link>

          <Link
            to="/admin-login"
            className="inline-flex items-center justify-center gap-2 h-10 px-3 sm:px-4 rounded-2xl border-2 border-[var(--beige-border)] hover:border-[var(--green-primary)] hover:bg-white transition-all no-underline text-[var(--text-dark)] text-sm font-bold shrink-0"
            aria-label="Acceso para profesores"
          >
            <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline leading-none">Profesor</span>
            <span className="sm:hidden text-base leading-none" aria-hidden="true">
              👨‍🏫
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
