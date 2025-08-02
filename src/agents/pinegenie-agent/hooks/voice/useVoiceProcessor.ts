/**
 * Voice Processor Hook
 * 
 * React hook for using the voice processor in components.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceProcessor } from '../../core/voice-processor/processor';
import type { 
  SpeechRecognitionResult, 
  VoiceProcessorOptions,
  VoiceSynthesisOptions 
} from '../../types/voice';

interface UseVoiceProcessorReturn {
  isListening: boolean;
  isSupported: boolean;
  lastResult: SpeechRecognitionResult | null;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<string>;
  speak: (text: string, options?: VoiceSynthesisOptions) => Promise<void>;
  processAudio: (audio: AudioBuffer) => Promise<string>;
  clearError: () => void;
  processor: VoiceProcessor | null;
}

/**
 * Hook for voice processing functionality
 */
export function useVoiceProcessor(options?: VoiceProcessorOptions): UseVoiceProcessorReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastResult, setLastResult] = useState<SpeechRecognitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const processorRef = useRef<VoiceProcessor | null>(null);

  // Initialize voice processor
  useEffect(() => {
    try {
      processorRef.current = new VoiceProcessor(options);
      
      // Set up result handler
      processorRef.current.onRecognitionResult = (result: SpeechRecognitionResult) => {
        setLastResult(result);
        if (result.isFinal) {
          setIsListening(false);
        }
      };

      // Check if speech recognition is supported
      setIsSupported(
        !!(window.SpeechRecognition || window.webkitSpeechRecognition)
      );

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize voice processor');
      setIsSupported(false);
    }

    // Cleanup on unmount
    return () => {
      if (processorRef.current) {
        processorRef.current.dispose();
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!processorRef.current) {
      setError('Voice processor not initialized');
      return;
    }

    try {
      setError(null);
      await processorRef.current.startListening();
      setIsListening(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start listening');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async (): Promise<string> => {
    if (!processorRef.current) {
      setError('Voice processor not initialized');
      return '';
    }

    try {
      setError(null);
      const result = await processorRef.current.stopListening();
      setIsListening(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop listening');
      setIsListening(false);
      return '';
    }
  }, []);

  const speak = useCallback(async (text: string, options?: VoiceSynthesisOptions) => {
    if (!processorRef.current) {
      setError('Voice processor not initialized');
      return;
    }

    try {
      setError(null);
      await processorRef.current.generateVoiceResponse(text, options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate speech');
    }
  }, []);

  const processAudio = useCallback(async (audio: AudioBuffer): Promise<string> => {
    if (!processorRef.current) {
      setError('Voice processor not initialized');
      return '';
    }

    try {
      setError(null);
      return await processorRef.current.processVoiceInput(audio);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process audio');
      return '';
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isListening,
    isSupported,
    lastResult,
    error,
    startListening,
    stopListening,
    speak,
    processAudio,
    clearError,
    processor: processorRef.current
  };
}