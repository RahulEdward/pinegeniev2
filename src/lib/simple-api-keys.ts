// Simple API Key Storage for Development - SERVER ONLY
import { encryptApiKey, decryptApiKey, maskApiKey } from './simple-encryption';

// Dynamically import fs and path only on server side
let fs: any = null;
let path: any = null;

if (typeof window === 'undefined' && typeof process !== 'undefined') {
  try {
    fs = require('fs');
    path = require('path');
  } catch (error) {
    console.warn('Failed to load fs/path modules:', error);
  }
}

const getApiKeysFile = () => {
  if (!path || typeof process === 'undefined') return null;
  return path.join(process.cwd(), '.api-keys.json');
};

export interface StoredApiKey {
  id: string;
  provider: string;
  keyName: string;
  encryptedKey: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

class SimpleApiKeyManager {
  private static instance: SimpleApiKeyManager;
  private keys: StoredApiKey[] = [];
  private loaded = false;

  private constructor() {}

  static getInstance(): SimpleApiKeyManager {
    if (!SimpleApiKeyManager.instance) {
      SimpleApiKeyManager.instance = new SimpleApiKeyManager();
    }
    return SimpleApiKeyManager.instance;
  }

  private loadKeys(): void {
    if (this.loaded) return;

    try {
      const apiKeysFile = getApiKeysFile();
      if (fs && apiKeysFile && fs.existsSync(apiKeysFile)) {
        const data = fs.readFileSync(apiKeysFile, 'utf8');
        this.keys = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      this.keys = [];
    }
    
    this.loaded = true;
  }

  private saveKeys(): void {
    try {
      const apiKeysFile = getApiKeysFile();
      if (fs && apiKeysFile) {
        fs.writeFileSync(apiKeysFile, JSON.stringify(this.keys, null, 2));
      }
    } catch (error) {
      console.error('Error saving API keys:', error);
    }
  }

  getAllKeys(): Array<Omit<StoredApiKey, 'encryptedKey'> & { maskedKey: string }> {
    this.loadKeys();
    
    return this.keys.map(key => ({
      id: key.id,
      provider: key.provider,
      keyName: key.keyName,
      maskedKey: maskApiKey(decryptApiKey(key.encryptedKey)),
      isActive: key.isActive,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      usageCount: key.usageCount
    }));
  }

  getApiKey(provider: string): string | null {
    this.loadKeys();
    
    const key = this.keys.find(k => k.provider === provider && k.isActive);
    if (!key) return null;
    
    return decryptApiKey(key.encryptedKey);
  }

  setApiKey(provider: string, keyName: string, apiKey: string): StoredApiKey {
    this.loadKeys();
    
    const existingIndex = this.keys.findIndex(k => k.provider === provider);
    const newKey: StoredApiKey = {
      id: existingIndex >= 0 ? this.keys[existingIndex].id : Date.now().toString(),
      provider,
      keyName,
      encryptedKey: encryptApiKey(apiKey),
      isActive: true,
      createdAt: existingIndex >= 0 ? this.keys[existingIndex].createdAt : new Date().toISOString(),
      lastUsed: existingIndex >= 0 ? this.keys[existingIndex].lastUsed : undefined,
      usageCount: existingIndex >= 0 ? this.keys[existingIndex].usageCount : 0
    };

    if (existingIndex >= 0) {
      this.keys[existingIndex] = newKey;
    } else {
      this.keys.push(newKey);
    }

    this.saveKeys();
    return newKey;
  }

  updateKey(id: string, updates: Partial<Pick<StoredApiKey, 'keyName' | 'isActive'>> & { apiKey?: string }): boolean {
    this.loadKeys();
    
    const index = this.keys.findIndex(k => k.id === id);
    if (index === -1) return false;

    if (updates.keyName) {
      this.keys[index].keyName = updates.keyName;
    }
    
    if (updates.isActive !== undefined) {
      this.keys[index].isActive = updates.isActive;
    }
    
    if (updates.apiKey) {
      this.keys[index].encryptedKey = encryptApiKey(updates.apiKey);
    }

    this.saveKeys();
    return true;
  }

  deleteKey(id: string): boolean {
    this.loadKeys();
    
    const index = this.keys.findIndex(k => k.id === id);
    if (index === -1) return false;

    this.keys.splice(index, 1);
    this.saveKeys();
    return true;
  }

  recordUsage(provider: string): void {
    this.loadKeys();
    
    const key = this.keys.find(k => k.provider === provider && k.isActive);
    if (key) {
      key.usageCount++;
      key.lastUsed = new Date().toISOString();
      this.saveKeys();
    }
  }

  getAvailableProviders(): string[] {
    return ['openai', 'anthropic', 'google', 'deepseek', 'ollama'];
  }
}

export const simpleApiKeys = SimpleApiKeyManager.getInstance();