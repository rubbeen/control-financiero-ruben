export default function Skeleton({ className = 'h-20 w-full', label = 'Cargando' }: { className?: string; label?: string }) {
  return <div className={`skeleton ${className}`} role="status" aria-label={label} />;
}
