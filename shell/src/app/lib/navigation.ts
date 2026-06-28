export type BreadcrumbItem = {
  label: string;
  href?: string;
  current?: boolean;
};

const JUEGO_ETIQUETAS: Record<string, string> = {
  flashcards: "Flashcards",
  quiz: "Quiz",
  memoria: "Memoria",
  unir: "Unir",
  fin: "Resultados",
};

/** Construye migas de pan según la ruta (IHC: orientación espacial clara). */
export function buildBreadcrumbs(pathname: string, pageTitle?: string): BreadcrumbItem[] {
  if (pathname === "/") return [];

  const crumbs: BreadcrumbItem[] = [{ label: "Inicio", href: "/" }];

  if (pathname.startsWith("/diccionario")) {
    crumbs.push({ label: "Diccionario", href: "/diccionario" });
    if (pathname === "/diccionario") {
      crumbs[1] = { label: "Diccionario", current: true };
    } else {
      crumbs.push({ label: pageTitle ?? "Palabra", current: true });
    }
    return crumbs;
  }

  if (pathname.startsWith("/juegos")) {
    const segment = pathname.split("/")[2];
    if (segment && segment !== "fin") {
      crumbs.push({
        label: pageTitle ?? JUEGO_ETIQUETAS[segment] ?? segment,
        current: true,
      });
    } else if (segment === "fin") {
      crumbs.push({ label: "Resultados", current: true });
    }
    return crumbs;
  }

  return crumbs;
}

/** Rutas de juego activas bajo Inicio (sin pestaña «Juegos» en el menú). */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/" || pathname.startsWith("/juegos");
  return pathname.startsWith(href);
}

export const NAV_PRINCIPAL = [
  { href: "/", label: "Inicio", icon: "home" as const },
  { href: "/diccionario", label: "Diccionario", icon: "book" as const },
] as const;
