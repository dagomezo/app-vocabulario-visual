import type { LucideIcon } from "lucide-react";
import { Home, Users, Folder, BarChart3, Layers, FileText, ExternalLink } from "lucide-react";

export type AdminNavItem = {
  path: string;
  icon: LucideIcon;
  label: string;
  /** Coincidencia exacta (ej. /admin) vs prefijo (ej. /admin/flashcards) */
  exact?: boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { path: "/admin", icon: Home, label: "Inicio", exact: true },
  { path: "/admin/alumnos", icon: Users, label: "Alumnos" },
  { path: "/admin/categorias", icon: Folder, label: "Categorías" },
  { path: "/admin/niveles", icon: Layers, label: "Niveles" },
  { path: "/admin/flashcards", icon: FileText, label: "Flashcards" },
  { path: "/admin/analytics", icon: BarChart3, label: "Analíticas" },
];

export const ADMIN_SITE_LINK = {
  path: "/",
  icon: ExternalLink,
  label: "Volver al sitio",
} as const;

export function isAdminNavActive(pathname: string, item: AdminNavItem): boolean {
  if (item.exact) return pathname === item.path;
  if (item.path === "/admin/flashcards") {
    return pathname.startsWith("/admin/flashcards");
  }
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}
