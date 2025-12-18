/**
 * Secure encryption utilities for Yoda Wallet
 * Uses WebCrypto API for strong encryption (AES-GCM)
 */

// Derive a key from user password using PBKDF2
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive actual encryption key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data with password
 */
export async function encrypt(plaintext: string, password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive key from password
    const key = await deriveKey(password, salt);
    
    // Encrypt data
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    
    // Combine salt + IV + encrypted data
    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    // Return as base64
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data with password
 */
export async function decrypt(ciphertext: string, password: string): Promise<string> {
  try {
    // Decode from base64
    const data = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    
    // Extract salt, IV, and encrypted data
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const encrypted = data.slice(28);
    
    // Derive key from password
    const key = await deriveKey(password, salt);
    
    // Decrypt data
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );
    
    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - incorrect password?');
  }
}

/**
 * Hash password for verification (not for encryption!)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

/**
 * Generate a random encryption password (for local storage)
 * User should never see this - it's derived from their actual password
 */
export function generateRandomPassword(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isStrong: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (password.length < 12) {
    issues.push('Password must be at least 12 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain lowercase letters');
  }
  
  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain uppercase letters');
  }
  
  if (!/[0-9]/.test(password)) {
    issues.push('Password must contain numbers');
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    issues.push('Password must contain special characters');
  }
  
  return {
    isStrong: issues.length === 0,
    issues
  };
}

