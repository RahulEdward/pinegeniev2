/**
* Pine Script Export Generator - Convert Visual Strategy to Pine Script Code
* 
* This file contains:
* - Complete Pine Script code generation from visual strategy
* - Support for all node types (indicators, conditions, actions)
* - Proper Pine Script syntax and structure
* - Strategy logic generation from node connections
* - Parameter mapping and validation
* - Professional Pine Script output with comments
*/

import { CustomNode, CustomEdge } from './canvas-config';

// Pine Script template constants
const PINE_SCRIPT_VERSION = '5';
const STRATEGY_TITLE = 'PineGenie Strategy';

// Indicator functions are now handled by the enhanced generator

// Indicator functions are now handled by the enhanced generator

// Condition operators are now handled by the enhanced generator



// Import the enhanced generator
import { generateEnhancedPineScript, validatePineScriptStrategy } from './enhanced-pinescript-generator';

export const generatePineScript = (
 nodes: CustomNode[],
 edges: CustomEdge[]
): string => {
 try {
   // Use the enhanced zero-error generator
   const result = generateEnhancedPineScript(nodes, edges);
   
   if (result.success) {
     console.log('✅ Pine Script generated successfully');
     if (result.warnings.length > 0) {
       console.warn('⚠️ Warnings:', result.warnings);
     }
     return result.code;
   } else {
     console.error('❌ Pine Script generation failed:', result.errors);
     return result.code; // Returns error script with detailed error information
   }
 } catch (error) {
   console.error('💥 Critical error generating Pine Script:', error);
   return generateErrorScript(error instanceof Error ? error.message : 'Unknown error');
 }
};







// Removed unused function generateIndicatorCode

// Removed unused function generateStrategyLogic

// Condition code generation is now handled by the enhanced generator

// Action code generation is now handled by the enhanced generator

// Risk management is now handled by the enhanced generator

// Removed unused function generatePlotsSection

// Removed unused utility functions buildDependencyGraph and topologicalSort

// Utility functions are now handled by the enhanced generator

// Utility functions are now handled by the enhanced generator

const generateErrorScript = (error: string): string => {
 return `//@version=${PINE_SCRIPT_VERSION}
// ERROR: ${error}
// Please check your strategy configuration and try again.

strategy("Error - ${STRATEGY_TITLE}", overlay=true)
plot(close, "Price", color=color.blue)
`;
};

// Export additional utility functions
export const validateStrategy = (nodes: CustomNode[], edges: CustomEdge[]): string[] => {
 const errors: string[] = [];
 
 // Check for required nodes
 const hasDataSource = nodes.some(node => node.type === 'data-source' || node.type === 'input');
 if (!hasDataSource) {
   errors.push('Strategy must have at least one data source or input node');
 }
 
 // Check for disconnected nodes
 const connectedNodes = new Set<string>();
 edges.forEach(edge => {
   connectedNodes.add(edge.source);
   connectedNodes.add(edge.target);
 });
 
 const disconnectedNodes = nodes.filter(node => !connectedNodes.has(node.id) && nodes.length > 1);
 if (disconnectedNodes.length > 0) {
   errors.push(`Disconnected nodes found: ${disconnectedNodes.map(n => n.data.label).join(', ')}`);
 }
 
 return errors;
};

export const generatePineScriptPreview = (nodes: CustomNode[], edges: CustomEdge[]): string => {
 const errors = validateStrategy(nodes, edges);
 if (errors.length > 0) {
   return `// Strategy Validation Errors:\n// ${errors.join('\n// ')}\n\n` + generatePineScript(nodes, edges);
 }
 
 return generatePineScript(nodes, edges);
};

// Enhanced validation using the new zero-error system
export const validateStrategyEnhanced = (nodes: CustomNode[], edges: CustomEdge[]) => {
  return validatePineScriptStrategy(nodes, edges);
};

// Real-time validation for live feedback
export const validateStrategyRealtime = (nodes: CustomNode[], edges: CustomEdge[]) => {
  const validation = validatePineScriptStrategy(nodes, edges);
  
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings,
    summary: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      indicatorCount: nodes.filter(n => n.type === 'indicator').length,
      conditionCount: nodes.filter(n => n.type === 'condition').length,
      actionCount: nodes.filter(n => n.type === 'action').length,
      hasDataSource: nodes.some(n => n.type === 'data-source' || n.type === 'input'),
      hasActions: nodes.some(n => n.type === 'action'),
      hasConditions: nodes.some(n => n.type === 'condition')
    }
  };
};