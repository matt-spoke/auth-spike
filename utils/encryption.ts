// utils/encryption.ts
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

// Get key from environment variable - must be 32 bytes for AES-256
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encrypt(text: string): string {
  // Generate random IV (initialization vector)
  const iv = randomBytes(IV_LENGTH);
  
  // Create cipher
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  // Encrypt the text
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Combine IV, encrypted data, and auth tag
  // Format: iv:encrypted:authTag
  return Buffer.concat([iv, encrypted, authTag])
    .toString('base64url');
}

export function decrypt(encrypted: string): string {
  try {
    // Convert from base64url to buffer
    const data = Buffer.from(encrypted, 'base64url');
    
    // Extract IV, ciphertext, and auth tag
    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(data.length - AUTH_TAG_LENGTH);
    const ciphertext = data.subarray(IV_LENGTH, data.length - AUTH_TAG_LENGTH);
    
    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    // Handle decryption failures securely
    throw new Error(`Decryption failed with error: ${(error as Error).message}`);
  }
}
