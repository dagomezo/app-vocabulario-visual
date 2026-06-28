import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { SkipLink } from "./SkipLink";
import type { BreadcrumbItem } from "../lib/navigation";

type GamePageShellProps = {
  breadcrumbs: BreadcrumbItem[];
  backTo?: string;
  backState?: Record<string, unknown>;
  backLabel?: string;
  progress?: ReactNode;
  statusLabel?: string;
  children: ReactNode;
};

/** Layout compacto para juegos: migas + barra de progreso + contenido. */
export function GamePageShell({
  breadcrumbs,
  backTo = "/",
  backState,
  backLabel = "Volver al inicio",
  progress,
  statusLabel,
  children,
}: GamePageShellProps) {
  return (
    <div className="app-page flex flex-col">
      <SkipLink href="#contenido-juego" label="Saltar al juego" />

      <header className="bg-white/95 backdrop-blur-sm border-b-2 border-[var(--beige-border)] sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-3 pb-2">
          <Breadcrumbs items={breadcrumbs} className="mb-2" />
          <div className="flex items-center justify-between gap-3 min-h-[var(--touch-min)]">
            <Link
              to={backTo}
              state={backState}
              className="touch-target-inline flex items-center gap-2 text-[var(--text-dark)] hover:text-[var(--green-primary)] font-bold no-underline rounded-xl px-2 -ml-2"
              aria-label={backLabel}
            >
              <ArrowLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Volver</span>
            </Link>
            {statusLabel && (
              <span
                className="font-bold text-[var(--text-dark)] text-sm sm:text-base tabular-nums"
                aria-live="polite"
                aria-atomic="true"
              >
                {statusLabel}
              </span>
            )}
          </div>
        </div>

        {progress && (
          <div className="px-4 sm:px-6 pb-3 max-w-3xl mx-auto" role="progressbar" aria-label="Progreso del juego">
            {progress}
          </div>
        )}
      </header>

      <main id="contenido-juego" tabIndex={-1} className="flex-1 px-4 sm:px-6 py-6 sm:py-8 focus:outline-none">
        {children}
      </main>
    </div>
  );
}
