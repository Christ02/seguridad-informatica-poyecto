/**
 * Skeleton Component
 * Componente de skeleton loader para estados de carga
 */

import './Skeleton.css';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'wave',
  className = '',
}: SkeletonProps) {
  const variantClasses = {
    text: 'skeleton-text',
    circular: 'skeleton-circular',
    rectangular: 'skeleton-rectangular',
  };

  const animationClass = animation !== 'none' ? `skeleton-${animation}` : '';

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`skeleton ${variantClasses[variant]} ${animationClass} ${className}`}
      style={style}
    />
  );
}

// Componentes especializados pre-configurados
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton variant="rectangular" width="100%" height={200} />
      <div className="skeleton-card-content">
        <Skeleton variant="text" width="80%" height={24} />
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="90%" height={16} />
        <Skeleton variant="text" width="70%" height={16} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        <Skeleton variant="text" width="20%" height={20} />
        <Skeleton variant="text" width="30%" height={20} />
        <Skeleton variant="text" width="25%" height={20} />
        <Skeleton variant="text" width="15%" height={20} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="skeleton-table-row-content">
            <Skeleton variant="text" width="80%" height={18} />
            <Skeleton variant="text" width="60%" height={14} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="skeleton-profile">
      <Skeleton variant="circular" width={120} height={120} />
      <div className="skeleton-profile-content">
        <Skeleton variant="text" width={200} height={28} />
        <Skeleton variant="text" width={150} height={20} />
        <Skeleton variant="rectangular" width="100%" height={120} />
      </div>
    </div>
  );
}

