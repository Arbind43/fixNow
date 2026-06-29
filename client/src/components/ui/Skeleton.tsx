interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseStyle = 'bg-[var(--bg-tertiary)] animate-skeleton';

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseStyle} rounded-[var(--radius-md)] h-4`}
            style={{
              width: i === lines - 1 ? '70%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  const variantStyles = {
    rectangular: `rounded-[var(--radius-lg)]`,
    circular: 'rounded-full',
    text: `rounded-[var(--radius-md)] h-4`,
  };

  return (
    <div
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
        height: height ? (typeof height === 'number' ? `${height}px` : height) : variant === 'text' ? '1rem' : '100%',
      }}
    />
  );
}

/* ---------- Pre-built Skeleton Layouts ---------- */

export function CardSkeleton() {
  return (
    <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-xl)] border border-[var(--border-primary)] p-6 space-y-4">
      <Skeleton variant="rectangular" height={160} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" lines={2} />
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="25%" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] border border-[var(--border-primary)]">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="30%" />
          </div>
          <Skeleton variant="rectangular" width={80} height={36} />
        </div>
      ))}
    </div>
  );
}
