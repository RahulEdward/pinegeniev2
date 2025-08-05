/**
 * Pine Genie Signature Manager
 * 
 * Core service responsible for signature generation and injection.
 * Handles template variable resolution, signature positioning, and code injection.
 */

import {
  SignatureManager as ISignatureManager,
  GenerationContext,
  SignaturePosition,
  SignatureType
} from '../../types/signature';
import { ConfigurationService } from './ConfigurationService';

export class SignatureManager implements ISignatureManager {
  private configurationService: ConfigurationService;

  constructor() {
    this.configurationService = new ConfigurationService();
  }

  /**
   * Generates a signature string based on the provided context
   * 
   * @param context - Generation context containing metadata for signature creation
   * @returns Promise resolving to the generated signature string
   */
  async generateSignature(context: GenerationContext): Promise<string> {
    try {
      // Get the appropriate template for this context type
      const template = await this.configurationService.getSignatureTemplate(
        context.type as SignatureType
      );

      if (!template.enabled) {
        return ''; // Return empty signature if template is disabled
      }

      // Resolve variables in the template
      const resolvedSignature = this.resolveVariables(template.template, context);

      return resolvedSignature;
    } catch (error) {
      console.error('Error generating signature:', error);
      
      // Return a minimal fallback signature
      return this.getFallbackSignature(context);
    }
  }

  /**
   * Injects a signature into Pine Script code at the specified position
   * 
   * @param code - The original Pine Script code
   * @param signature - The signature to inject
   * @param position - Where to position the signature
   * @returns The code with signature injected
   */
  injectSignature(code: string, signature: string, position: SignaturePosition): string {
    if (!signature.trim()) {
      return code; // Return original code if signature is empty
    }

    const lines = code.split('\n');
    const signatureLines = signature.split('\n');

    switch (position) {
      case SignaturePosition.TOP:
        return this.injectAtTop(lines, signatureLines);
      
      case SignaturePosition.BOTTOM:
        return this.injectAtBottom(lines, signatureLines);
      
      case SignaturePosition.AFTER_VERSION:
        return this.injectAfterVersion(lines, signatureLines);
      
      default:
        // Default to top if position is unknown
        return this.injectAtTop(lines, signatureLines);
    }
  }

  /**
   * Resolves template variables with actual values from the context
   * 
   * @param template - The template string with variables
   * @param context - The generation context containing variable values
   * @returns The template with variables resolved
   */
  resolveVariables(template: string, context: GenerationContext): string {
    let resolved = template;

    // Define variable resolvers
    const variableResolvers: Record<string, (context: GenerationContext) => string> = {
      templateName: (ctx) => ctx.templateId || 'Unknown Template',
      strategyName: (ctx) => ctx.strategyName || 'Generated Strategy',
      timestamp: (ctx) => ctx.timestamp.toISOString(),
      version: (ctx) => ctx.version || '1.0',
      nodeCount: (ctx) => ctx.metadata?.nodeCount?.toString() || '0',
      userId: (ctx) => ctx.userId || 'Anonymous',
      generationType: (ctx) => ctx.type || 'unknown'
    };

    // Replace variables in the template
    for (const [variable, resolver] of Object.entries(variableResolvers)) {
      const pattern = new RegExp(`{{${variable}}}`, 'g');
      try {
        const value = resolver(context);
        resolved = resolved.replace(pattern, value);
      } catch (error) {
        console.warn(`Failed to resolve variable ${variable}:`, error);
        // Leave the variable placeholder if resolution fails
      }
    }

    // Handle any remaining unresolved variables by removing them
    resolved = resolved.replace(/{{[^}]+}}/g, '[Variable Not Available]');

    return resolved;
  }

  /**
   * Injects signature at the top of the code
   */
  private injectAtTop(codeLines: string[], signatureLines: string[]): string {
    return [...signatureLines, '', ...codeLines].join('\n');
  }

  /**
   * Injects signature at the bottom of the code
   */
  private injectAtBottom(codeLines: string[], signatureLines: string[]): string {
    return [...codeLines, '', ...signatureLines].join('\n');
  }

  /**
   * Injects signature after the //@version declaration
   */
  private injectAfterVersion(codeLines: string[], signatureLines: string[]): string {
    const versionIndex = codeLines.findIndex(line => 
      line.trim().startsWith('//@version') || line.trim().startsWith('// @version')
    );

    if (versionIndex === -1) {
      // If no version declaration found, inject at top
      return this.injectAtTop(codeLines, signatureLines);
    }

    // Insert signature after version line
    const beforeVersion = codeLines.slice(0, versionIndex + 1);
    const afterVersion = codeLines.slice(versionIndex + 1);

    return [...beforeVersion, '', ...signatureLines, '', ...afterVersion].join('\n');
  }

  /**
   * Generates a minimal fallback signature when template processing fails
   */
  private getFallbackSignature(context: GenerationContext): string {
    const timestamp = context.timestamp.toISOString();
    return `// Generated by Pine Genie - https://pinegenie.com\n// ${timestamp}`;
  }
}