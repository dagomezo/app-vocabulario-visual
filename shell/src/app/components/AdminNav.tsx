import { Link, useLocation } from "react-router";
import { ADMIN_NAV, ADMIN_SITE_LINK, isAdminNavActive } from "../lib/adminNav";

type AdminNavProps = {
  onNavigate?: () => void;
  compact?: boolean;
};

export function AdminNav({ onNavigate, compact = false }: AdminNavProps) {
  const { pathname } = useLocation();

  return (
    <nav className="flex flex-col flex-1" aria-label="Administración">
      <ul className={`list-none m-0 p-0 flex flex-col ${compact ? "gap-1" : "gap-1.5"}`}>
        {ADMIN_NAV.map((item) => {
          const active = isAdminNavActive(pathname, item);
          const Icon = item.icon;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-[16px] transition-all no-underline touch-target ${
                  compact ? "px-3 py-2.5 text-sm" : "px-4 py-3"
                } ${
                  active
                    ? "bg-white text-[var(--green-primary)] shadow-lg font-bold"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Icon className={compact ? "w-5 h-5 shrink-0" : "w-5 h-5 shrink-0"} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className={`mt-auto pt-4 border-t border-white/20 ${compact ? "pt-3" : ""}`}>
        <Link
          to={ADMIN_SITE_LINK.path}
          onClick={onNavigate}
          className={`flex items-center gap-3 rounded-[16px] text-white hover:bg-white/10 transition-all no-underline touch-target ${
            compact ? "px-3 py-2.5 text-sm" : "px-4 py-3"
          }`}
        >
          <ADMIN_SITE_LINK.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>{ADMIN_SITE_LINK.label}</span>
        </Link>
      </div>
    </nav>
  );
}

export function AdminBrand() {
  return (
    <div className="mb-6 lg:mb-8 pt-1">
      <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white m-0">
        <span aria-hidden="true">🤟</span>
        <span>Señas App</span>
      </h1>
      <p className="text-sm opacity-75 mt-1 text-white m-0">Panel de Administración</p>
    </div>
  );
}
