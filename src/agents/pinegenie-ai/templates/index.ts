/**
 * Template Integration Module
 * 
 * This module handles integration with existing templates and
 * generation of custom templates.
 */

// Main template integrator (to be implemented in task 9)
export { TemplateIntegrator } from './template-integrator';

// Template components (to be implemented in task 9)
export { CustomGenerator } from './custom-generator';
export { TemplateCustomizer } from './template-customizer';
export { SuggestionEngine } from './suggestion-engine';

// Types
export type {
  AITemplate,
  TemplateCustomization,
  AISuggestion
} from '../types/template-types';