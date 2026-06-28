import { motion, type HTMLMotionProps } from "motion/react";
import type { JuegoInfo } from "../data/juegosAssets";

type JuegoCardProps = {
  juego: JuegoInfo;
  onClick: () => void;
  disabled?: boolean;
  variant?: "grid" | "list";
  index?: number;
};

export function JuegoCard({
  juego,
  onClick,
  disabled = false,
  variant = "grid",
  index = 0,
}: JuegoCardProps) {
  const motionProps: HTMLMotionProps<"button"> = disabled
    ? {}
    : {
        whileHover: { scale: 1.02, y: -2 },
        whileTap: { scale: 0.98 },
      };

  if (variant === "list") {
    return (
      <motion.button
        type="button"
        {...motionProps}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        onClick={onClick}
        disabled={disabled}
        aria-label={`Jugar ${juego.nombre}`}
        className={`w-full bg-white border-2 rounded-[20px] overflow-hidden transition-all text-left flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-4 min-h-[120px] ${
          disabled
            ? "border-[var(--beige-border)] opacity-50 cursor-not-allowed"
            : "border-[var(--beige-border)] hover:border-[var(--green-primary)] hover:shadow-md cursor-pointer"
        }`}
      >
        <div className="relative w-full sm:w-36 md:w-40 h-32 sm:h-28 shrink-0 bg-[var(--cream)] overflow-hidden">
          <img
            src={juego.imagen}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </div>
        <div className="p-4 sm:p-5 sm:pr-6 flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-[var(--text-dark)] mb-1">{juego.nombre}</h3>
          <p className="text-sm text-[var(--text-muted)]">{juego.desc}</p>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      {...motionProps}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Ir a ${juego.nombre}`}
      className={`bg-white rounded-[24px] border-2 border-[var(--beige-border)] overflow-hidden hover:shadow-lg hover:border-[var(--green-primary)] transition-all text-center cursor-pointer touch-target flex flex-col ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div className="relative w-full aspect-[4/3] bg-[var(--cream)] overflow-hidden">
        <img
          src={juego.imagen}
          alt={juego.imagenAlt}
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
      </div>
      <div className="p-3 sm:p-4">
        <h2 className="font-extrabold text-[var(--text-dark)] text-sm sm:text-base mb-0.5">{juego.nombre}</h2>
        <p className="text-xs text-[var(--text-muted)] leading-snug">{juego.desc}</p>
      </div>
    </motion.button>
  );
}
