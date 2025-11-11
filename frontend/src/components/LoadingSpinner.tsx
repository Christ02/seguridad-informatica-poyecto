/**
 * LoadingSpinner Component
 * Spinner de carga reutilizable
 */

import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullScreen?: boolean;
  message?: string;
}

export function LoadingSpinner({
  size = 'medium',
  color = '#2563eb',
  fullScreen = false,
  message,
}: LoadingSpinnerProps) {
  const sizeMap = {
    small: 24,
    medium: 48,
    large: 72,
  };

  const spinnerSize = sizeMap[size];

  const spinner = (
    <div className="loading-spinner-wrapper">
      <svg
        className={`loading-spinner loading-spinner-${size}`}
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 50 50"
      >
        <circle
          className="loading-spinner-track"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
        />
        <circle
          className="loading-spinner-path"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
          style={{ stroke: color }}
        />
      </svg>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="loading-spinner-fullscreen">{spinner}</div>;
  }

  return spinner;
}

