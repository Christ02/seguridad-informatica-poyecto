/**
 * Input Sanitization Utilities
 * Utilidades para sanitizar inputs y prevenir XSS
 */

import DOMPurify from 'dompurify';

/**
 * Sanitiza HTML para prevenir XSS
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitiza texto plano removiendo caracteres peligrosos
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim();
}

/**
 * Sanitiza email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Escapa caracteres especiales para SQL (aunque usamos parametrized queries)
 */
export function escapeSQLString(str: string): string {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case '\0':
        return '\\0';
      case '\x08':
        return '\\b';
      case '\x09':
        return '\\t';
      case '\x1a':
        return '\\z';
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + char;
      default:
        return char;
    }
  });
}

/**
 * Sanitiza URL para prevenir open redirects
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Solo permitir URLs relativas o del mismo origen
    if (parsed.origin !== window.location.origin && !url.startsWith('/')) {
      return '/';
    }
    
    // Prevenir javascript: y data: URLs
    if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
      return '/';
    }
    
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return '/';
  }
}

/**
 * Sanitiza filename para evitar path traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Solo caracteres seguros
    .replace(/\.\.+/g, '.') // Prevenir ..
    .substring(0, 255); // Límite de longitud
}

/**
 * Sanitiza input numérico
 */
export function sanitizeNumber(value: string): number | null {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

/**
 * Sanitiza JSON para prevenir injection
 */
export function sanitizeJSON(json: string): string {
  try {
    // Parse y stringify para normalizar
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed);
  } catch {
    return '{}';
  }
}

/**
 * Valida y sanitiza UUID
 */
export function sanitizeUUID(uuid: string): string | null {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid) ? uuid.toLowerCase() : null;
}

/**
 * Sanitiza input de búsqueda
 */
export function sanitizeSearchInput(input: string): string {
  return input
    .replace(/[<>'"]/g, '') // Remover caracteres HTML
    .replace(/[;()]/g, '') // Remover caracteres SQL
    .replace(/\\/g, '') // Remover backslashes
    .trim()
    .substring(0, 100); // Límite de longitud
}

/**
 * Configura DOMPurify con hooks adicionales
 */
export function initDOMPurify(): void {
  // Hook para agregar logging de intentos de XSS
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.allowedTags && !data.allowedTags[data.tagName as keyof typeof data.allowedTags]) {
      console.warn('XSS attempt detected:', {
        tagName: data.tagName,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Hook para atributos
  DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    // Prevenir data attributes maliciosos
    if (data.attrName && data.attrName.startsWith('on')) {
      console.warn('Malicious attribute detected:', {
        attribute: data.attrName,
        timestamp: new Date().toISOString(),
      });
    }
  });
}

// Inicializar DOMPurify al cargar el módulo
initDOMPurify();

