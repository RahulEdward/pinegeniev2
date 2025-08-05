/**
 * Pine Genie Signature Service - Main Service Class
 * 
 * This is the main entry point for the signature system. It provides a high-level
 * interface for adding signatures to generated Pine Script code, managing user
 * preferences, and validating signatures.
 */

import { 
  SignatureService as ISignatureService,
  GenerationContext,
  SignatureTemplate,
  SignaturePreferences,
  ValidationResult,
  SignatureType,
  SignaturePosition
} from '../../types/signature';
import { SignatureManager } from './SignatureManager';
import { ConfigurationService } from './ConfigurationService';
import { SignatureErrorHandler } from './SignatureErrorHandler';

export class SignatureService implements ISignatureService {
  private signatureManager: SignatureManager;
  private configurationService: ConfigurationService;

  constructor() {
    this.signatureManager = new SignatureManager();
    this.configurationService = new ConfigurationService();
  }

  /**
   * Adds a signature to the provided Pine Script code based on the generation context
   * 
   * @param code - The Pine Script code to add signature to
   * @param context - Context information about how the code was generated
   * @returns Promise resolving to the code with signature added
   */
  async addSignature(code: string, context: GenerationContext): Promise<string> {
    try {
      // Check if signatures are enabled for this user
      if (context.userId) {
        const userPreferences = await this.configurationService.getUserPreferences(context.userId);
        if (!userPreferences.enabled) {
          return code; // Return original code if signatures are disabled
        }
      }

      // Generate the signature based on context
      const signature = await this.signatureManager.generateSignature(context);
      
      // Get the template to determine position
      const template = await this.getSignatureTemplate(context.type as SignatureType);
      
      // Inject the signature into the code
      const enhancedCode = this.signatureManager.injectSignature(
        code, 
        signature, 
        template.position
      );

      return enhancedCode;
    } catch (error) {
      console.error('Error adding signature:', error);
      
      // Use error handler to provide fallback
      return SignatureErrorHandler.handle(
        error as any,
        { originalCode: code, context }
      );
    }
  }

  /**
   * Retrieves a signature template by type
   * 
   * @param type - The type of signature template to retrieve
   * @returns Promise resolving to the signature template
   */
  async getSignatureTemplate(type: SignatureType): Promise<SignatureTemplate> {
    return this.configurationService.getSignatureTemplate(type);
  }

  /**
   * Updates user signature preferences
   * 
   * @param userId - The ID of the user
   * @param preferences - The new signature preferences
   */
  async updateUserPreferences(userId: string, preferences: SignaturePreferences): Promise<void> {
    // TODO: Implement database persistence in later tasks
    // For now, this is a placeholder that will be implemented in task 3
    console.log(`Updating preferences for user ${userId}:`, preferences);
  }

  /**
   * Validates a signature string for Pine Script compatibility
   * 
   * @param signature - The signature string to validate
   * @returns Validation result with errors, warnings, and suggestions
   */
  validateSignature(signature: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Basic validation rules for Pine Script comments
    const lines = signature.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line is a valid Pine Script comment
      if (line.trim() && !line.trim().startsWith('//')) {
        result.isValid = false;
        result.errors.push(`Line ${i + 1}: All signature lines must be comments starting with //`);
      }
      
      // Check line length (Pine Script has limits)
      if (line.length > 500) {
        result.warnings.push(`Line ${i + 1}: Line is very long (${line.length} chars), consider shortening`);
      }
      
      // Check for potentially problematic characters
      if (line.includes('\t')) {
        result.suggestions.push(`Line ${i + 1}: Consider using spaces instead of tabs for consistency`);
      }
    }

    // Check total signature length
    if (signature.length > 2000) {
      result.warnings.push('Signature is quite long, consider using a more concise format');
    }

    // Check if signature is empty
    if (!signature.trim()) {
      result.isValid = false;
      result.errors.push('Signature cannot be empty');
    }

    return result;
  }

  /**
   * Gets the signature manager instance (for advanced usage)
   */
  getSignatureManager(): SignatureManager {
    return this.signatureManager;
  }

  /**
   * Gets the configuration service instance (for advanced usage)
   */
  getConfigurationService(): ConfigurationService {
    return this.configurationService;
  }
}