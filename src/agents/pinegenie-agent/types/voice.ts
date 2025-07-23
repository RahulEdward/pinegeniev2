/**
 * Voice Types
 * 
 * Type definitions for voice processing functionality.
 */

/**
 * Trading vocabulary interface
 */
export interface TradingVocabulary {
  /**
   * Technical indicators
   */
  indicators: string[];
  
  /**
   * Timeframes
   */
  timeframes: string[];
  
  /**
   * Order types
   */
  orderTypes: string[];
  
  /**
   * Risk management terms
   */
  riskTerms: string[];
  
  /**
   * Common trading phrases
   */
  commonPhrases: Map<string, string>;
}

/**
 * Speech recognition result interface
 */
export interface SpeechRecognitionResult {
  /**
   * The recognized text
   */
  text: string;
  
  /**
   * The confidence score
   */
  confidence: number;
  
  /**
   * Alternative interpretations
   */
  alternatives: {
    /**
     * The alternative text
     */
    text: string;
    
    /**
     * The confidence score
     */
    confidence: number;
  }[];
  
  /**
   * Whether the recognition is final
   */
  isFinal: boolean;
}

/**
 * Voice command interface
 */
export interface VoiceCommand {
  /**
   * The command name
   */
  name: string;
  
  /**
   * The command phrases
   */
  phrases: string[];
  
  /**
   * The command handler
   */
  handler: (params: any) => Promise<void>;
  
  /**
   * The command parameters
   */
  parameters?: {
    /**
     * The parameter name
     */
    name: string;
    
    /**
     * The parameter type
     */
    type: 'string' | 'number' | 'boolean';
    
    /**
     * Whether the parameter is required
     */
    required: boolean;
  }[];
}

/**
 * Voice processor options interface
 */
export interface VoiceProcessorOptions {
  /**
   * The language to use
   */
  language?: string;
  
  /**
   * Whether to use continuous recognition
   */
  continuous?: boolean;
  
  /**
   * Whether to return interim results
   */
  interimResults?: boolean;
  
  /**
   * The maximum alternatives to return
   */
  maxAlternatives?: number;
}

/**
 * Voice synthesis options interface
 */
export interface VoiceSynthesisOptions {
  /**
   * The voice to use
   */
  voice?: string;
  
  /**
   * The pitch to use
   */
  pitch?: number;
  
  /**
   * The rate to use
   */
  rate?: number;
  
  /**
   * The volume to use
   */
  volume?: number;
}