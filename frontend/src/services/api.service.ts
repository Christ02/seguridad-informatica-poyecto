/**
 * API Service
 * Cliente HTTP seguro con axios
 * Incluye retry logic, timeouts, interceptors de seguridad
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { securityConfig } from '@config/security.config';
import { hashSHA256 } from '@utils/crypto';
import Cookies from 'js-cookie';

// ============= API Client Configuration =============

class APIService {
  private client: AxiosInstance;
  private csrfToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: securityConfig.api.baseURL,
      timeout: securityConfig.api.timeout,
      withCredentials: true, // Para enviar cookies (httpOnly)
      headers: {
        'Content-Type': 'application/json',
        ...securityConfig.headers,
      },
    });

    this.setupInterceptors();
  }

  // ============= Interceptors =============

  private setupInterceptors(): void {
    // Request Interceptor: Agregar tokens y headers de seguridad
    this.client.interceptors.request.use(
      async (config) => {
        // Agregar CSRF token
        const csrfToken = this.getCSRFToken();
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }

        // Agregar timestamp para prevenir replay attacks
        config.headers['X-Request-Time'] = Date.now().toString();

        // Agregar request ID para tracking
        config.headers['X-Request-ID'] = crypto.randomUUID();

        // Agregar hash del body para integridad
        if (config.data) {
          const bodyHash = await hashSHA256(JSON.stringify(config.data));
          config.headers['X-Body-Hash'] = bodyHash;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor: Manejar errores y refresh tokens
    this.client.interceptors.response.use(
      (response) => {
        // Guardar CSRF token si viene en la respuesta
        const newCsrfToken = response.headers['x-csrf-token'];
        if (newCsrfToken) {
          this.setCSRFToken(newCsrfToken);
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Si es 401 (no autorizado), intentar refresh del token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            return this.client(originalRequest);
          } catch (refreshError) {
            // Si falla el refresh, logout
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        // Si es 403 (CSRF inválido), obtener nuevo token
        if (error.response?.status === 403) {
          const errorMessage = error.response.data as { message?: string };
          if (errorMessage.message?.includes('CSRF')) {
            await this.fetchCSRFToken();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ============= CSRF Protection =============

  private getCSRFToken(): string | null {
    if (!this.csrfToken) {
      this.csrfToken = Cookies.get('csrf-token') || null;
    }
    return this.csrfToken;
  }

  private setCSRFToken(token: string): void {
    this.csrfToken = token;
    Cookies.set('csrf-token', token, {
      sameSite: 'strict',
      secure: import.meta.env.PROD,
    });
  }

  private async fetchCSRFToken(): Promise<void> {
    try {
      const response = await this.client.get('/auth/csrf-token');
      const token = response.data.csrfToken;
      this.setCSRFToken(token);
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  }

  // ============= Token Management =============

  private async refreshToken(): Promise<void> {
    try {
      await this.client.post('/auth/refresh');
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  private handleAuthError(): void {
    // Limpiar tokens y redirigir a login
    Cookies.remove('csrf-token');
    this.csrfToken = null;
    window.location.href = '/login';
  }

  // ============= HTTP Methods =============

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // ============= Retry Logic =============

  async requestWithRetry<T>(
    fn: () => Promise<AxiosResponse<T>>,
    retries: number = securityConfig.api.maxRetries
  ): Promise<T> {
    try {
      const response = await fn();
      return response.data;
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error as AxiosError)) {
        await this.delay(securityConfig.api.retryDelay);
        return this.requestWithRetry(fn, retries - 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: AxiosError): boolean {
    if (!error.response) return true; // Network error
    const status = error.response.status;
    return status >= 500 || status === 429; // Server error o rate limit
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============= Abort Controller =============

  createCancellableRequest<T>(
    requestFn: (signal: AbortSignal) => Promise<AxiosResponse<T>>
  ): {
    promise: Promise<T>;
    cancel: () => void;
  } {
    const controller = new AbortController();

    const promise = requestFn(controller.signal).then((response) => response.data);

    return {
      promise,
      cancel: () => controller.abort(),
    };
  }
}

// Singleton instance
export const apiService = new APIService();

// ============= API Response Wrapper =============

export async function safeApiCall<T>(
  apiCall: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorMessage =
      (axiosError.response?.data as { message?: string })?.message ||
      axiosError.message ||
      'An error occurred';

    console.error('API Error:', errorMessage);

    return { data: null, error: errorMessage };
  }
}

