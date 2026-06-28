import { Link } from "react-router";
import { ChevronRight, Home } from "lucide-react";
import type { BreadcrumbItem } from "../lib/navigation";

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Miga de pan" className={`mb-4 ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 list-none m-0 p-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5 sm:gap-2 min-h-[var(--touch-min)]">
              {index > 0 && (
                <ChevronRight
                  className="w-4 h-4 text-[var(--text-muted)] shrink-0"
                  aria-hidden="true"
                />
              )}

              {item.current || !item.href ? (
                <span
                  className="text-sm sm:text-base font-bold text-[var(--text-dark)] px-2 py-1 rounded-xl bg-white/80 border border-[var(--beige-border)]"
                  aria-current={isLast ? "page" : undefined}
                >
                  {index === 0 && (
                    <Home className="w-4 h-4 inline-block mr-1 -mt-0.5" aria-hidden="true" />
                  )}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="touch-target-inline text-sm sm:text-base font-semibold text-[var(--green-primary)] hover:text-[#27865f] px-2 py-1 rounded-xl hover:bg-white/70 transition-colors no-underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--green-primary)]"
                >
                  {index === 0 ? (
                    <>
                      <Home className="w-4 h-4 inline-block mr-1 -mt-0.5" aria-hidden="true" />
                      {item.label}
                    </>
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
