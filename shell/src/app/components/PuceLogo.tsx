import logoPuce from "../../assets/imagenes/logo-puce.png";

type PuceLogoProps = {
  className?: string;
};

export function PuceLogo({ className = "h-8 sm:h-10 w-auto max-w-[120px] sm:max-w-[140px]" }: PuceLogoProps) {
  return (
    <img
      src={logoPuce}
      alt="PUCE — Pontificia Universidad Católica del Ecuador"
      className={`object-contain object-left ${className}`}
      loading="lazy"
    />
  );
}
