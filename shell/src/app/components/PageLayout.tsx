import type { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { Breadcrumbs } from "./Breadcrumbs";
import { SkipLink } from "./SkipLink";
import { SiteFooter } from "./SiteFooter";
import type { BreadcrumbItem } from "../lib/navigation";

type MaxWidth = "3xl" | "4xl" | "6xl";

const MAX_WIDTH: Record<MaxWidth, string> = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
};

type PageLayoutProps = {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  /** Título visible de la página (único h1 — WCAG 2.4.6) */
  title?: string;
  description?: string;
  maxWidth?: MaxWidth;
  showNav?: boolean;
  footer?: ReactNode | null;
  mainClassName?: string;
  headerExtra?: ReactNode;
};

export function PageLayout({
  children,
  breadcrumbs = [],
  title,
  description,
  maxWidth = "4xl",
  showNav = true,
  footer,
  mainClassName = "",
  headerExtra,
}: PageLayoutProps) {
  return (
    <div className="app-page flex flex-col">
      <SkipLink />
      {showNav && <TopBar />}

      <div className={`w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6 ${MAX_WIDTH[maxWidth]}`}>
        {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

        {(title || headerExtra) && (
          <header className="mb-6 sm:mb-8">
            {title && (
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text-dark)] leading-tight mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl">
                {description}
              </p>
            )}
            {headerExtra}
          </header>
        )}
      </div>

      <main
        id="contenido-principal"
        tabIndex={-1}
        className={`flex-1 w-full mx-auto px-4 sm:px-6 pb-24 md:pb-10 ${MAX_WIDTH[maxWidth]} focus:outline-none ${mainClassName}`}
      >
        {children}
      </main>

      {footer !== null && (
        <footer className="py-4 text-center pb-24 md:pb-6 px-4">
          {footer ?? <SiteFooter />}
        </footer>
      )}

      {showNav && <BottomNav />}
    </div>
  );
}
