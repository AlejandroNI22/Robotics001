// Sistema de seguridad robusto y actualizado
import CryptoJS from 'crypto-js';

// Configuración de seguridad
const SECURITY_CONFIG = {
  ENCRYPTION_ALGORITHM: 'AES',
  KEY_SIZE: 256,
  IV_SIZE: 16,
  SALT_SIZE: 16,
  ITERATIONS: 10000,
  HASH_ALGORITHM: 'SHA256',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
};

// Clase principal de seguridad
export class SecurityManager {
  private static instance: SecurityManager;
  private loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Validación de entrada
  static sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Control de intentos de login
  checkLoginAttempts(identifier: string): { allowed: boolean; remainingAttempts: number; lockoutTime?: number } {
    const attempts = this.loginAttempts.get(identifier);
    const now = Date.now();
    
    if (!attempts) {
      return { allowed: true, remainingAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS };
    }
    
    // Verificar si el bloqueo ha expirado
    if (attempts.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      const lockoutExpiry = attempts.lastAttempt + SECURITY_CONFIG.LOCKOUT_DURATION;
      if (now < lockoutExpiry) {
        return {
          allowed: false,
          remainingAttempts: 0,
          lockoutTime: lockoutExpiry
        };
      } else {
        // Reset attempts after lockout
        this.loginAttempts.delete(identifier);
        return { allowed: true, remainingAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS };
      }
    }
    
    return {
      allowed: true,
      remainingAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - attempts.count
    };
  }

  recordLoginAttempt(identifier: string, success: boolean): void {
    if (success) {
      this.loginAttempts.delete(identifier);
      return;
    }
    
    const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    this.loginAttempts.set(identifier, attempts);
  }

  // Limpieza automática de intentos antiguos
  cleanupOldAttempts(): void {
    const now = Date.now();
    const cutoff = now - SECURITY_CONFIG.LOCKOUT_DURATION;
    
    for (const [identifier, attempts] of this.loginAttempts.entries()) {
      if (attempts.lastAttempt < cutoff) {
        this.loginAttempts.delete(identifier);
      }
    }
  }
}

// Funciones de encriptación
export function encrypt(text: string, key: string): string {
  try {
    const salt = CryptoJS.lib.WordArray.random(SECURITY_CONFIG.SALT_SIZE);
    const derivedKey = CryptoJS.PBKDF2(key, salt, {
      keySize: SECURITY_CONFIG.KEY_SIZE / 32,
      iterations: SECURITY_CONFIG.ITERATIONS
    });
    
    const iv = CryptoJS.lib.WordArray.random(SECURITY_CONFIG.IV_SIZE);
    const encrypted = CryptoJS.AES.encrypt(text, derivedKey, { iv });
    
    const result = salt.concat(iv).concat(encrypted.ciphertext);
    return result.toString(CryptoJS.enc.Base64);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Error al encriptar los datos');
  }
}

export function decrypt(encryptedText: string, key: string): string {
  try {
    const encrypted = CryptoJS.enc.Base64.parse(encryptedText);
    
    const salt = CryptoJS.lib.WordArray.create(encrypted.words.slice(0, SECURITY_CONFIG.SALT_SIZE / 4));
    const iv = CryptoJS.lib.WordArray.create(encrypted.words.slice(SECURITY_CONFIG.SALT_SIZE / 4, (SECURITY_CONFIG.SALT_SIZE + SECURITY_CONFIG.IV_SIZE) / 4));
    const ciphertext = CryptoJS.lib.WordArray.create(encrypted.words.slice((SECURITY_CONFIG.SALT_SIZE + SECURITY_CONFIG.IV_SIZE) / 4));
    
    const derivedKey = CryptoJS.PBKDF2(key, salt, {
      keySize: SECURITY_CONFIG.KEY_SIZE / 32,
      iterations: SECURITY_CONFIG.ITERATIONS
    });
    
    const decrypted = CryptoJS.AES.decrypt({ ciphertext }, derivedKey, { iv });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Error al desencriptar los datos');
  }
}

// Funciones de hash
export function generateHash(data: string, salt?: string): string {
  const saltToUse = salt || CryptoJS.lib.WordArray.random(SECURITY_CONFIG.SALT_SIZE).toString();
  const hash = CryptoJS.PBKDF2(data, saltToUse, {
    keySize: SECURITY_CONFIG.KEY_SIZE / 32,
    iterations: SECURITY_CONFIG.ITERATIONS
  });
  
  return `${saltToUse}:${hash.toString()}`;
}

export function validateHash(data: string, hash: string): boolean {
  try {
    const [salt, originalHash] = hash.split(':');
    const newHash = CryptoJS.PBKDF2(data, salt, {
      keySize: SECURITY_CONFIG.KEY_SIZE / 32,
      iterations: SECURITY_CONFIG.ITERATIONS
    });
    
    return newHash.toString() === originalHash;
  } catch (error) {
    console.error('Hash validation error:', error);
    return false;
  }
}

// Generación de tokens seguros
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validación de sesión
export function validateSession(token: string, expiresAt: string): boolean {
  if (!token || !expiresAt) return false;
  
  const expiry = new Date(expiresAt);
  const now = new Date();
  
  return expiry > now;
}

// Limpieza automática de seguridad
export function initSecurityCleanup(): void {
  const security = SecurityManager.getInstance();
  
  // Limpiar intentos de login cada 5 minutos solo si no existe ya
  if (!window.securityCleanupInterval) {
    window.securityCleanupInterval = setInterval(() => {
      security.cleanupOldAttempts();
    }, 5 * 60 * 1000);
  }
}

// Headers de seguridad para requests
export function getSecurityHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
}

// Configuración CSP
export function getCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://images.pexels.com",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
}

// Utilidades de validación
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

// Declarar el tipo para window
declare global {
  interface Window {
    securityCleanupInterval?: NodeJS.Timeout;
  }
}