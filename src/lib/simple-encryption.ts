// Simple Encryption for Development
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'dev-key-32-chars-long-for-local-dev';
const IV_LENGTH = 16;

// Ensure key is exactly 32 bytes
const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);

export function encryptApiKey(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Fallback for development
  }
}

export function decryptApiKey(encryptedText: string): string {
  try {
    if (!encryptedText.includes(':')) {
      return encryptedText; // Not encrypted, return as-is
    }
    
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher(ALGORITHM, key);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Fallback for development
  }
}

export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return '*'.repeat(apiKey.length);
  }
  
  const start = apiKey.substring(0, 4);
  const end = apiKey.substring(apiKey.length - 4);
  const middle = '*'.repeat(Math.max(0, apiKey.length - 8));
  
  return `${start}${middle}${end}`;
}