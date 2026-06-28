import { Link, useLocation } from "react-router";
import { Home, BookOpen } from "lucide-react";
import { NAV_PRINCIPAL, isNavActive } from "../lib/navigation";

const ICONS = {
  home: Home,
  book: BookOpen,
} as const;

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Menú inferior"
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-2 border-[var(--beige-border)] px-2 sm:px-4 py-2 md:hidden z-30 safe-area-bottom"
    >
      <ul className="flex items-center justify-center max-w-lg mx-auto list-none m-0 p-0 gap-2 w-full">
        {NAV_PRINCIPAL.map(({ href, label, icon }) => {
          const Icon = ICONS[icon];
          const active = isNavActive(pathname, href);
          return (
            <li key={href} className="flex-1 flex justify-center max-w-[160px]">
              <Link
                to={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 min-h-[var(--touch-min)] w-full px-3 py-2 rounded-2xl transition-colors no-underline ${
                  active
                    ? "bg-[var(--green-primary)] text-white shadow-md"
                    : "text-[var(--text-dark)] hover:bg-[var(--cream)] active:scale-95"
                }`}
              >
                <Icon className="w-6 h-6 shrink-0" aria-hidden="true" />
                <span className="text-xs sm:text-sm font-bold leading-none text-center">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
