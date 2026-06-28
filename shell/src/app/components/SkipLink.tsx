type SkipLinkProps = {
  href?: string;
  label?: string;
};

export function SkipLink({
  href = "#contenido-principal",
  label = "Saltar al contenido principal",
}: SkipLinkProps) {
  return (
    <a href={href} className="skip-link">
      {label}
    </a>
  );
}
