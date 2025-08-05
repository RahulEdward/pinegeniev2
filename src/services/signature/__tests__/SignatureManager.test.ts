/**
 * Pine Genie Signature Manager - Unit Tests
 * 
 * Tests for the signature manager to ensure signature generation,
 * variable resolution, and code injection work correctly.
 */

import { SignatureManager } from '../SignatureManager';
import { GenerationContext, SignaturePosition } from '../../../types/signature';

describe('SignatureManager', () => {
  let signatureManager: SignatureManager;

  beforeEach(() => {
    signatureManager = new SignatureManager();
  });

  describe('generateSignature', () => {
    it('should generate signature for template context', async () => {
      const context: GenerationContext = {
        type: 'template',
        templateId: 'test-template',
        strategyName: 'Test Strategy',
        timestamp: new Date('2024-01-01T00:00:00Z'),
        version: '1.0'
      };

      const signature = await signatureManager.generateSignature(context);

      expect(signature).toContain('Pine Genie');
      expect(signature).toContain('Template System');
      expect(signature).toContain('test-template');
      expect(signature).toContain('Test Strategy');
      expect(signature).toContain('2024-01-01T00:00:00.000Z');
    });

    it('should generate signature for builder context', async () => {
      const context: GenerationContext = {
        type: 'builder',
        strategyName: 'Builder Strategy',
        timestamp: new Date('2024-01-01T00:00:00Z'),
        version: '1.0',
        metadata: { nodeCount: 8 }
      };

      const signature = await signatureManager.generateSignature(context);

      expect(signature).toContain('Visual Builder');
      expect(signature).toContain('Builder Strategy');
      expect(signature).toContain('Nodes: 8');
    });
  });

  describe('resolveVariables', () => {
    it('should resolve template variables correctly', () => {
      const template = 'Strategy: {{strategyName}}, Time: {{timestamp}}, Version: {{version}}';
      const context: GenerationContext = {
        type: 'template',
        strategyName: 'My Strategy',
        timestamp: new Date('2024-01-01T12:00:00Z'),
        version: '2.0'
      };

      const result = signatureManager.resolveVariables(template, context);

      expect(result).toBe('Strategy: My Strategy, Time: 2024-01-01T12:00:00.000Z, Version: 2.0');
    });

    it('should handle missing variables gracefully', () => {
      const template = 'Strategy: {{strategyName}}, Unknown: {{unknownVar}}';
      const context: GenerationContext = {
        type: 'template',
        strategyName: 'My Strategy',
        timestamp: new Date(),
        version: '1.0'
      };

      const result = signatureManager.resolveVariables(template, context);

      expect(result).toContain('My Strategy');
      expect(result).toContain('[Variable Not Available]');
    });

    it('should resolve metadata variables', () => {
      const template = 'Nodes: {{nodeCount}}, User: {{userId}}';
      const context: GenerationContext = {
        type: 'builder',
        userId: 'user123',
        timestamp: new Date(),
        version: '1.0',
        metadata: { nodeCount: 5 }
      };

      const result = signatureManager.resolveVariables(template, context);

      expect(result).toBe('Nodes: 5, User: user123');
    });
  });

  describe('injectSignature', () => {
    const testCode = '//@version=6\nstrategy("Test", overlay=true)\nplot(close)';
    const testSignature = '// Pine Genie Signature\n// Generated code';

    it('should inject signature at top', () => {
      const result = signatureManager.injectSignature(testCode, testSignature, SignaturePosition.TOP);

      expect(result.startsWith('// Pine Genie Signature')).toBe(true);
      expect(result).toContain('//@version=6');
      expect(result).toContain('strategy("Test", overlay=true)');
    });

    it('should inject signature at bottom', () => {
      const result = signatureManager.injectSignature(testCode, testSignature, SignaturePosition.BOTTOM);

      expect(result.endsWith('// Generated code')).toBe(true);
      expect(result).toContain('//@version=6');
      expect(result).toContain('strategy("Test", overlay=true)');
    });

    it('should inject signature after version', () => {
      const result = signatureManager.injectSignature(testCode, testSignature, SignaturePosition.AFTER_VERSION);

      const lines = result.split('\n');
      const versionIndex = lines.findIndex(line => line.includes('//@version=6'));
      const signatureIndex = lines.findIndex(line => line.includes('Pine Genie Signature'));

      expect(versionIndex).toBeGreaterThan(-1);
      expect(signatureIndex).toBeGreaterThan(versionIndex);
    });

    it('should handle empty signature', () => {
      const result = signatureManager.injectSignature(testCode, '', SignaturePosition.TOP);

      expect(result).toBe(testCode);
    });

    it('should handle code without version declaration for AFTER_VERSION', () => {
      const codeWithoutVersion = 'strategy("Test", overlay=true)\nplot(close)';
      const result = signatureManager.injectSignature(codeWithoutVersion, testSignature, SignaturePosition.AFTER_VERSION);

      // Should fallback to TOP position
      expect(result.startsWith('// Pine Genie Signature')).toBe(true);
    });
  });
});