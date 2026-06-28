import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-dark)] mb-1 sm:mb-2 m-0">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-[var(--text-muted)] m-0">{description}</p>
        )}
      </div>
      {actions && (
        <div className="shrink-0 w-full sm:w-auto [&_button]:w-full sm:[&_button]:w-auto [&_a]:block sm:[&_a]:inline-block">
          {actions}
        </div>
      )}
    </header>
  );
}
