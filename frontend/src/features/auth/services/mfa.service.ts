/**
 * MFA Service
 * Servicio para autenticación multi-factor (TOTP y WebAuthn)
 */

import { apiService } from '@services/api.service';
import type { MFASetup } from '@types/index';

// ============= TOTP (Time-based One-Time Password) =============

/**
 * Inicia el setup de MFA con TOTP
 */
export async function setupTOTP(): Promise<MFASetup> {
  return await apiService.post<MFASetup>('/auth/mfa/totp/setup');
}

/**
 * Verifica y activa TOTP
 */
export async function verifyTOTP(code: string): Promise<{ success: boolean }> {
  return await apiService.post<{ success: boolean }>('/auth/mfa/totp/verify', { code });
}

/**
 * Desactiva TOTP
 */
export async function disableTOTP(password: string): Promise<{ success: boolean }> {
  return await apiService.post<{ success: boolean }>('/auth/mfa/totp/disable', { password });
}

/**
 * Valida código TOTP durante login
 */
export async function validateTOTPLogin(code: string): Promise<{ success: boolean; tokens?: any }> {
  return await apiService.post('/auth/mfa/totp/validate', { code });
}

// ============= WebAuthn / FIDO2 =============

/**
 * Inicia el registro de WebAuthn
 */
export async function startWebAuthnRegistration(): Promise<PublicKeyCredentialCreationOptions> {
  const options = await apiService.post<PublicKeyCredentialCreationOptions>(
    '/auth/webauthn/register/start'
  );
  
  // Convertir Base64 a ArrayBuffer donde sea necesario
  return preparePublicKeyOptions(options);
}

/**
 * Completa el registro de WebAuthn
 */
export async function finishWebAuthnRegistration(
  credential: PublicKeyCredential
): Promise<{ success: boolean }> {
  const credentialJSON = credentialToJSON(credential);
  return await apiService.post('/auth/webauthn/register/finish', { credential: credentialJSON });
}

/**
 * Inicia autenticación con WebAuthn
 */
export async function startWebAuthnAuthentication(): Promise<PublicKeyCredentialRequestOptions> {
  const options = await apiService.post<PublicKeyCredentialRequestOptions>(
    '/auth/webauthn/authenticate/start'
  );
  
  return preparePublicKeyRequestOptions(options);
}

/**
 * Completa autenticación con WebAuthn
 */
export async function finishWebAuthnAuthentication(
  credential: PublicKeyCredential
): Promise<{ success: boolean; tokens?: any }> {
  const credentialJSON = credentialToJSON(credential);
  return await apiService.post('/auth/webauthn/authenticate/finish', {
    credential: credentialJSON,
  });
}

/**
 * Elimina una credencial WebAuthn
 */
export async function removeWebAuthnCredential(
  credentialId: string
): Promise<{ success: boolean }> {
  return await apiService.delete(`/auth/webauthn/credentials/${credentialId}`);
}

// ============= Helper Functions =============

/**
 * Prepara opciones de PublicKey para creación de credencial
 */
function preparePublicKeyOptions(
  options: PublicKeyCredentialCreationOptions
): PublicKeyCredentialCreationOptions {
  // Convertir challenge de Base64 a ArrayBuffer
  if (typeof options.challenge === 'string') {
    options.challenge = base64ToArrayBuffer(options.challenge);
  }

  // Convertir user.id si es string
  if (options.user && typeof options.user.id === 'string') {
    options.user.id = base64ToArrayBuffer(options.user.id);
  }

  return options;
}

/**
 * Prepara opciones de PublicKey para request
 */
function preparePublicKeyRequestOptions(
  options: PublicKeyCredentialRequestOptions
): PublicKeyCredentialRequestOptions {
  // Convertir challenge
  if (typeof options.challenge === 'string') {
    options.challenge = base64ToArrayBuffer(options.challenge);
  }

  // Convertir allowCredentials IDs
  if (options.allowCredentials) {
    options.allowCredentials = options.allowCredentials.map((cred) => ({
      ...cred,
      id: typeof cred.id === 'string' ? base64ToArrayBuffer(cred.id as string) : cred.id,
    }));
  }

  return options;
}

/**
 * Convierte credencial a JSON serializable
 */
function credentialToJSON(credential: PublicKeyCredential): Record<string, unknown> {
  const response = credential.response as AuthenticatorAttestationResponse;

  return {
    id: credential.id,
    type: credential.type,
    rawId: arrayBufferToBase64(credential.rawId),
    response: {
      clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
      attestationObject: response.attestationObject
        ? arrayBufferToBase64(response.attestationObject)
        : undefined,
      authenticatorData: (response as AuthenticatorAssertionResponse).authenticatorData
        ? arrayBufferToBase64((response as AuthenticatorAssertionResponse).authenticatorData)
        : undefined,
      signature: (response as AuthenticatorAssertionResponse).signature
        ? arrayBufferToBase64((response as AuthenticatorAssertionResponse).signature)
        : undefined,
    },
  };
}

/**
 * Convierte Base64 a ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
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
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// ============= Backup Codes =============

/**
 * Genera códigos de respaldo
 */
export async function generateBackupCodes(): Promise<string[]> {
  const response = await apiService.post<{ codes: string[] }>('/auth/mfa/backup-codes');
  return response.codes;
}

/**
 * Valida código de respaldo
 */
export async function validateBackupCode(code: string): Promise<{ success: boolean }> {
  return await apiService.post('/auth/mfa/backup-codes/validate', { code });
}

