/**
 * Cryptography Utilities
 * Utilidades criptográficas usando Web Crypto API
 * Implementa RSA-4096, firmas ciegas y hash seguros
 */

import { securityConfig } from '@config/security.config';

// ============= Key Generation =============

/**
 * Genera un par de claves RSA-4096 para cifrado
 */
export async function generateRSAKeyPair(): Promise<CryptoKeyPair> {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: securityConfig.crypto.algorithm,
        modulusLength: securityConfig.crypto.keySize,
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: securityConfig.crypto.hashAlgorithm,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );

    return keyPair;
  } catch (error) {
    console.error('Error generating RSA key pair:', error);
    throw new Error('Failed to generate encryption keys');
  }
}

/**
 * Exporta clave pública a formato JWK
 */
export async function exportPublicKey(publicKey: CryptoKey): Promise<JsonWebKey> {
  try {
    return await window.crypto.subtle.exportKey('jwk', publicKey);
  } catch (error) {
    console.error('Error exporting public key:', error);
    throw new Error('Failed to export public key');
  }
}

/**
 * Importa clave pública desde formato JWK
 */
export async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  try {
    return await window.crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: securityConfig.crypto.algorithm,
        hash: securityConfig.crypto.hashAlgorithm,
      },
      true,
      ['encrypt']
    );
  } catch (error) {
    console.error('Error importing public key:', error);
    throw new Error('Failed to import public key');
  }
}

// ============= Encryption & Decryption =============

/**
 * Cifra datos con clave pública RSA
 */
export async function encryptWithPublicKey(
  data: string,
  publicKey: CryptoKey
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: securityConfig.crypto.algorithm,
      },
      publicKey,
      encodedData
    );

    return arrayBufferToBase64(encrypted);
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Descifra datos con clave privada RSA
 */
export async function decryptWithPrivateKey(
  encryptedData: string,
  privateKey: CryptoKey
): Promise<string> {
  try {
    const encrypted = base64ToArrayBuffer(encryptedData);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: securityConfig.crypto.algorithm,
      },
      privateKey,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Error decrypting data:', error);
    throw new Error('Failed to decrypt data');
  }
}

// ============= Hashing =============

/**
 * Genera hash SHA-256 de datos
 */
export async function hashSHA256(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encodedData);
    return arrayBufferToHex(hashBuffer);
  } catch (error) {
    console.error('Error hashing data:', error);
    throw new Error('Failed to hash data');
  }
}

/**
 * Genera hash SHA-512 de datos
 */
export async function hashSHA512(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-512', encodedData);
    return arrayBufferToHex(hashBuffer);
  } catch (error) {
    console.error('Error hashing data:', error);
    throw new Error('Failed to hash data');
  }
}

// ============= Digital Signatures =============

/**
 * Firma datos con clave privada
 */
export async function signData(
  data: string,
  privateKey: CryptoKey
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    const signature = await window.crypto.subtle.sign(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      privateKey,
      encodedData
    );

    return arrayBufferToBase64(signature);
  } catch (error) {
    console.error('Error signing data:', error);
    throw new Error('Failed to sign data');
  }
}

/**
 * Verifica firma con clave pública
 */
export async function verifySignature(
  data: string,
  signature: string,
  publicKey: CryptoKey
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const signatureBuffer = base64ToArrayBuffer(signature);

    return await window.crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      publicKey,
      signatureBuffer,
      encodedData
    );
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

// ============= Blind Signatures =============

/**
 * Ciega datos para firmas ciegas (blind signature)
 * Implementación simplificada - En producción usar librería especializada
 */
export async function blindData(data: string): Promise<{
  blindedData: string;
  blindingFactor: string;
}> {
  try {
    // Generar factor de cegado aleatorio
    const blindingFactor = generateRandomBytes(32);
    
    // En una implementación real, aplicaríamos el factor de cegado al dato
    // usando aritmética modular con la clave pública del servidor
    // Por ahora, hasheamos con el factor como demo
    const combinedData = data + arrayBufferToBase64(blindingFactor);
    const blindedData = await hashSHA256(combinedData);

    return {
      blindedData,
      blindingFactor: arrayBufferToBase64(blindingFactor),
    };
  } catch (error) {
    console.error('Error blinding data:', error);
    throw new Error('Failed to blind data');
  }
}

/**
 * Desciega firma ciega
 */
export function unblindSignature(
  blindSignature: string,
  blindingFactor: string
): string {
  // En una implementación real, aplicaríamos la operación inversa
  // del cegado usando el blinding factor
  // Por ahora retornamos la firma como demo
  return blindSignature;
}

// ============= Utility Functions =============

/**
 * Genera bytes aleatorios criptográficamente seguros
 */
export function generateRandomBytes(length: number): ArrayBuffer {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array.buffer;
}

/**
 * Genera string aleatorio seguro
 */
export function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return arrayBufferToBase64(array.buffer).substring(0, length);
}

/**
 * Genera UUID v4
 */
export function generateUUID(): string {
  return window.crypto.randomUUID();
}

/**
 * Convierte ArrayBuffer a Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  return btoa(binary);
}

/**
 * Convierte Base64 a ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convierte ArrayBuffer a Hexadecimal
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convierte Hexadecimal a ArrayBuffer
 */
export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

// ============= Key Storage (SecureStorage) =============

/**
 * Guarda clave en sessionStorage (solo para keys temporales)
 * NUNCA guardar claves privadas en localStorage
 */
export function storeKeyInSession(keyName: string, key: string): void {
  try {
    sessionStorage.setItem(keyName, key);
  } catch (error) {
    console.error('Error storing key in session:', error);
  }
}

/**
 * Recupera clave desde sessionStorage
 */
export function retrieveKeyFromSession(keyName: string): string | null {
  try {
    return sessionStorage.getItem(keyName);
  } catch (error) {
    console.error('Error retrieving key from session:', error);
    return null;
  }
}

/**
 * Elimina clave de sessionStorage
 */
export function removeKeyFromSession(keyName: string): void {
  try {
    sessionStorage.removeItem(keyName);
  } catch (error) {
    console.error('Error removing key from session:', error);
  }
}

/**
 * Limpia todas las claves (memory scrubbing)
 */
export function clearAllKeys(): void {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing keys:', error);
  }
}

