import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16;  // 128 bits
  private readonly tagLength = 16; // 128 bits

  constructor() {
    // In production, this should come from environment variables
    // For now, we'll use a default key (NOT recommended for production)
    this.ensureEncryptionKey();
  }

  /**
   * Ensure encryption key exists in environment
   */
  private ensureEncryptionKey(): void {
    if (!process.env.WORKFLOW_ENCRYPTION_KEY) {
      // Generate a random key for development (NOT for production use)
      process.env.WORKFLOW_ENCRYPTION_KEY = crypto.randomBytes(this.keyLength).toString('hex');
      this.logger.warn('⚠️ Using randomly generated encryption key. Set WORKFLOW_ENCRYPTION_KEY environment variable for production use.');
    }
  }

  /**
   * Get encryption key from environment
   */
  private getEncryptionKey(): Buffer {
    const key = process.env.WORKFLOW_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('WORKFLOW_ENCRYPTION_KEY environment variable not set');
    }

    // Ensure key is the correct length
    if (key.length !== this.keyLength * 2) { // * 2 because hex encoding
      throw new Error(`Encryption key must be ${this.keyLength * 2} characters long (hex encoded)`);
    }

    return Buffer.from(key, 'hex');
  }

  /**
   * Encrypt sensitive workflow data
   */
  encrypt(data: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, key);

      // Set the IV
      cipher.setAAD(Buffer.from('workflow-guard')); // Additional authenticated data

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      // Combine IV, tag, and encrypted data
      const result = Buffer.concat([iv, tag, Buffer.from(encrypted, 'hex')]);

      return result.toString('base64');
    } catch (error) {
      this.logger.error('Error encrypting workflow data:', error);
      throw new Error('Failed to encrypt workflow data');
    }
  }

  /**
   * Decrypt sensitive workflow data
   */
  decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();

      // Decode from base64
      const data = Buffer.from(encryptedData, 'base64');

      if (data.length < this.ivLength + this.tagLength) {
        throw new Error('Invalid encrypted data format');
      }

      // Extract IV, tag, and encrypted content
      const iv = data.subarray(0, this.ivLength);
      const tag = data.subarray(this.ivLength, this.ivLength + this.tagLength);
      const encrypted = data.subarray(this.ivLength + this.tagLength);

      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAuthTag(tag);
      decipher.setAAD(Buffer.from('workflow-guard'));

      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error('Error decrypting workflow data:', error);
      throw new Error('Failed to decrypt workflow data');
    }
  }

  /**
   * Encrypt sensitive fields in workflow data
   */
  encryptWorkflowData(workflowData: any): any {
    if (!workflowData || typeof workflowData !== 'object') {
      return workflowData;
    }

    const sensitiveFields = [
      'apiKey',
      'secret',
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'webhookUrl',
      'callbackUrl',
      'databaseUrl',
      'connectionString',
      'authToken',
      'sessionToken',
    ];

    const encryptedData = { ...workflowData };

    // Recursively encrypt sensitive fields
    this.encryptObjectFields(encryptedData, sensitiveFields);

    return encryptedData;
  }

  /**
   * Decrypt sensitive fields in workflow data
   */
  decryptWorkflowData(workflowData: any): any {
    if (!workflowData || typeof workflowData !== 'object') {
      return workflowData;
    }

    const decryptedData = { ...workflowData };

    // Recursively decrypt sensitive fields
    this.decryptObjectFields(decryptedData);

    return decryptedData;
  }

  /**
   * Recursively encrypt sensitive fields in object
   */
  private encryptObjectFields(obj: any, sensitiveFields: string[]): void {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        // Check if this field name indicates sensitive data
        const isSensitiveField = sensitiveFields.some(field =>
          key.toLowerCase().includes(field.toLowerCase())
        );

        if (isSensitiveField && typeof value === 'string') {
          try {
            obj[key] = this.encrypt(value);
          } catch (error) {
            this.logger.warn(`Failed to encrypt field ${key}:`, error);
          }
        } else if (typeof value === 'object' && value !== null) {
          this.encryptObjectFields(value, sensitiveFields);
        }
      }
    }
  }

  /**
   * Recursively decrypt sensitive fields in object
   */
  private decryptObjectFields(obj: any): void {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        // Check if this looks like encrypted data (base64 encoded)
        if (typeof value === 'string' && this.isBase64(value)) {
          try {
            const decrypted = this.decrypt(value);
            // Only replace if decryption was successful and different from original
            if (decrypted !== value) {
              obj[key] = decrypted;
            }
          } catch (error) {
            // Not encrypted data, leave as is
          }
        } else if (typeof value === 'object' && value !== null) {
          this.decryptObjectFields(value);
        }
      }
    }
  }

  /**
   * Check if string is base64 encoded
   */
  private isBase64(str: string): boolean {
    try {
      return Buffer.from(str, 'base64').toString('base64') === str;
    } catch {
      return false;
    }
  }

  /**
   * Generate a new encryption key (for key rotation)
   */
  generateNewKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  /**
   * Hash sensitive data for comparison without exposing it
   */
  hashSensitiveData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Verify if encrypted data can be decrypted (integrity check)
   */
  verifyEncryption(encryptedData: string): boolean {
    try {
      this.decrypt(encryptedData);
      return true;
    } catch {
      return false;
    }
  }
}