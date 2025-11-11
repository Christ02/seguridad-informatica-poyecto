/**
 * Input Validation Utilities
 * Utilidades para validar inputs del usuario
 */

import { z } from 'zod';

// ============= Validation Schemas =============

/**
 * Schema de validación para email
 */
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(5, 'Email muy corto')
  .max(255, 'Email muy largo')
  .toLowerCase()
  .trim();

/**
 * Schema de validación para contraseña
 * Requisitos:
 * - Mínimo 12 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 * - Al menos un carácter especial
 */
export const passwordSchema = z
  .string()
  .min(12, 'La contraseña debe tener al menos 12 caracteres')
  .max(128, 'La contraseña es muy larga')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial');

/**
 * Schema de validación para código MFA (TOTP)
 */
export const mfaCodeSchema = z
  .string()
  .length(6, 'El código debe tener 6 dígitos')
  .regex(/^\d{6}$/, 'El código debe contener solo números');

/**
 * Schema de validación para UUID
 */
export const uuidSchema = z
  .string()
  .uuid('UUID inválido');

/**
 * Schema de validación para login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
  mfaCode: mfaCodeSchema.optional(),
});

/**
 * Schema de validación para registro
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// ============= Validation Functions =============

/**
 * Valida un email
 */
export function validateEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida una contraseña
 */
export function validatePassword(password: string): boolean {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene mensajes de error de validación
 */
export function getValidationErrors(
  schema: z.ZodSchema,
  data: unknown
): Record<string, string> {
  try {
    schema.parse(data);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.reduce(
        (acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        },
        {} as Record<string, string>
      );
    }
    return { general: 'Error de validación' };
  }
}

/**
 * Valida fuerza de contraseña (score 0-4)
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Feedback
  if (password.length < 12) feedback.push('Usa al menos 12 caracteres');
  if (!/[A-Z]/.test(password)) feedback.push('Agrega mayúsculas');
  if (!/[a-z]/.test(password)) feedback.push('Agrega minúsculas');
  if (!/[0-9]/.test(password)) feedback.push('Agrega números');
  if (!/[^A-Za-z0-9]/.test(password)) feedback.push('Agrega símbolos especiales');

  // Penalizar patrones comunes
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^admin/i,
    /^qwerty/i,
    /(.)\1{3,}/, // Caracteres repetidos
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push('Evita patrones comunes');
  }

  return {
    score: Math.min(4, score),
    feedback,
  };
}

/**
 * Valida formato de fecha
 */
export function validateDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Valida rango de fecha
 */
export function validateDateRange(start: string, end: string): boolean {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return validateDate(start) && validateDate(end) && startDate < endDate;
}

/**
 * Valida número de teléfono (formato internacional)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
}

/**
 * Valida URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida hash (SHA-256)
 */
export function validateHash(hash: string): boolean {
  const hashRegex = /^[a-f0-9]{64}$/i;
  return hashRegex.test(hash);
}

