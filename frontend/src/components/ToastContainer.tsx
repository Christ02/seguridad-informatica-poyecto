/**
 * ToastContainer Component
 * Contenedor para gestionar múltiples notificaciones toast
 */

import { Toast } from './Toast';
import type { ToastProps } from './Toast';
import './ToastContainer.css';

interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          {...(toast.duration !== undefined && { duration: toast.duration })}
          onClose={onClose}
        />
      ))}
    </div>
  );
}

