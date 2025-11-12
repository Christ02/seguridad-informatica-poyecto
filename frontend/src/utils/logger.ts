/**
 * Logger Utility
 * Sistema de logging estructurado que reemplaza console.log
 * Solo activo en desarrollo, silencioso en producción
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  stack?: string;
}

class Logger {
  private isDevelopment: boolean;
  private logHistory: LogMessage[] = [];
  private maxHistorySize = 100;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const logMessage: LogMessage = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context ? { context } : {}),
    };

    // Guardar en historial (útil para debugging)
    this.logHistory.push(logMessage);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Solo loguear en desarrollo
    if (!this.isDevelopment) {
      // En producción, solo loguear errores críticos
      if (level === 'error') {
        this.sendToMonitoring(logMessage);
      }
      return;
    }

    // Formato colorido para desarrollo
    const styles = {
      info: 'color: #3b82f6; font-weight: bold',
      warn: 'color: #f59e0b; font-weight: bold',
      error: 'color: #ef4444; font-weight: bold',
      debug: 'color: #8b5cf6; font-weight: bold',
      success: 'color: #10b981; font-weight: bold',
    };

    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🔍',
      success: '✅',
    };

    console.log(
      `%c${emoji[level]} [${level.toUpperCase()}] ${message}`,
      styles[level],
      context || ''
    );
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };
    this.log('error', message, errorContext);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  success(message: string, context?: Record<string, unknown>): void {
    this.log('success', message, context);
  }

  // Métodos específicos para casos comunes
  apiCall(method: string, url: string, status?: number): void {
    this.debug(`API ${method} ${url}`, { status });
  }

  apiError(method: string, url: string, error: unknown): void {
    this.error(`API ${method} ${url} failed`, error);
  }

  userAction(action: string, details?: Record<string, unknown>): void {
    this.info(`User action: ${action}`, details);
  }

  securityEvent(event: string, details?: Record<string, unknown>): void {
    this.warn(`Security event: ${event}`, details);
  }

  // Obtener historial de logs (útil para debugging)
  getHistory(): LogMessage[] {
    return [...this.logHistory];
  }

  // Limpiar historial
  clearHistory(): void {
    this.logHistory = [];
  }

  // En producción, enviar errores a servicio de monitoreo
  private sendToMonitoring(log: LogMessage): void {
    // TODO: Implementar integración con Sentry, LogRocket, etc.
    // Por ahora solo guardamos en localStorage para análisis posterior
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(log);
      // Mantener solo los últimos 50 errores
      if (errors.length > 50) {
        errors.shift();
      }
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch {
      // Silenciar errores de localStorage
    }
  }
}

// Exportar instancia singleton
export const logger = new Logger();

// Función helper para loguear errores de API
export function logApiError(
  operation: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  logger.error(`API Error: ${operation}`, error, context);
}

// Función helper para loguear acciones de usuario
export function logUserAction(action: string, details?: Record<string, unknown>): void {
  logger.userAction(action, details);
}

// Función helper para eventos de seguridad
export function logSecurityEvent(event: string, details?: Record<string, unknown>): void {
  logger.securityEvent(event, details);
}

