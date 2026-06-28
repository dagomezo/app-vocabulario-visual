import { PuceLogo } from "./PuceLogo";

export function SiteFooter() {
  return (
    <div className="flex flex-row items-center justify-between gap-4 max-w-6xl mx-auto w-full px-2">
      <a
        href="https://www.puce.edu.ec"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 hover:opacity-90 transition-opacity"
        aria-label="PUCE — sitio web oficial"
      >
        <PuceLogo className="h-7 sm:h-8 w-auto max-w-[88px] sm:max-w-[110px]" />
      </a>
      <p className="text-xs sm:text-sm text-[var(--text-muted)] m-0 text-right">
        🤟 <span className="font-bold text-[var(--text-dark)]">Señas App</span>
        <span className="hidden sm:inline"> · Aprende lengua de señas jugando</span>
      </p>
    </div>
  );
}
