/**
 * Voice Processor Tests
 * 
 * Comprehensive tests for the voice processing functionality.
 */

import { VoiceProcessor } from '../processor';
import type { VoiceProcessorOptions } from '../../../types/voice';

// Mock Web Speech API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  maxAlternatives: 1,
  onstart: null,
  onend: null,
  onerror: null,
  onresult: null,
  onnomatch: null,
  onspeechstart: null,
  onspeechend: null,
  onsoundstart: null,
  onsoundend: null,
  onaudiostart: null,
  onaudioend: null
};

const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => []),
  pending: false,
  speaking: false,
  paused: false
};

// Mock AudioContext
const mockAudioContext = {
  createMediaStreamSource: jest.fn(),
  createBiquadFilter: jest.fn(() => ({
    type: 'highpass',
    frequency: { setValueAtTime: jest.fn() },
    connect: jest.fn()
  })),
  createDynamicsCompressor: jest.fn(() => ({
    threshold: { setValueAtTime: jest.fn() },
    knee: { setValueAtTime: jest.fn() },
    ratio: { setValueAtTime: jest.fn() },
    attack: { setValueAtTime: jest.fn() },
    release: { setValueAtTime: jest.fn() },
    connect: jest.fn()
  })),
  resume: jest.fn(),
  close: jest.fn(),
  state: 'running',
  currentTime: 0
};

const mockOfflineAudioContext = {
  createBufferSource: jest.fn(() => ({
    buffer: null,
    connect: jest.fn(),
    start: jest.fn()
  })),
  createDynamicsCompressor: jest.fn(() => ({
    threshold: { setValueAtTime: jest.fn() },
    ratio: { setValueAtTime: jest.fn() },
    connect: jest.fn()
  })),
  createBiquadFilter: jest.fn(() => ({
    type: 'peaking',
    frequency: { setValueAtTime: jest.fn() },
    Q: { setValueAtTime: jest.fn() },
    gain: { setValueAtTime: jest.fn() },
    connect: jest.fn()
  })),
  startRendering: jest.fn(() => Promise.resolve(new AudioBuffer({
    length: 1,
    numberOfChannels: 1,
    sampleRate: 44100
  }))),
  destination: {},
  currentTime: 0
};

// Mock getUserMedia
const mockGetUserMedia = jest.fn(() => Promise.resolve({
  getTracks: () => [{ stop: jest.fn() }]
}));

// Setup global mocks
beforeAll(() => {
  global.SpeechRecognition = jest.fn(() => mockSpeechRecognition);
  global.webkitSpeechRecognition = jest.fn(() => mockSpeechRecognition);
  global.speechSynthesis = mockSpeechSynthesis;
  global.AudioContext = jest.fn(() => mockAudioContext);
  global.webkitAudioContext = jest.fn(() => mockAudioContext);
  global.OfflineAudioContext = jest.fn(() => mockOfflineAudioContext);
  
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: mockGetUserMedia },
    writable: true
  });
});

describe('VoiceProcessor', () => {
  let processor: VoiceProcessor;
  
  beforeEach(() => {
    jest.clearAllMocks();
    processor = new VoiceProcessor();
  });

  afterEach(() => {
    processor.dispose();
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      expect(processor).toBeInstanceOf(VoiceProcessor);
      expect(processor.listening).toBe(false);
      expect(processor.vocabulary).toBeDefined();
    });

    it('should initialize with custom options', () => {
      const options: VoiceProcessorOptions = {
        language: 'en-GB',
        continuous: false,
        interimResults: false,
        maxAlternatives: 5
      };
      
      const customProcessor = new VoiceProcessor(options);
      expect(customProcessor).toBeInstanceOf(VoiceProcessor);
      customProcessor.dispose();
    });

    it('should configure trading vocabulary', () => {
      const vocabulary = processor.vocabulary;
      
      expect(vocabulary.indicators).toContain('RSI');
      expect(vocabulary.indicators).toContain('MACD');
      expect(vocabulary.indicators).toContain('Bollinger Bands');
      expect(vocabulary.timeframes).toContain('1 minute');
      expect(vocabulary.timeframes).toContain('1 hour');
      expect(vocabulary.orderTypes).toContain('market');
      expect(vocabulary.orderTypes).toContain('limit');
      expect(vocabulary.riskTerms).toContain('stop loss');
      expect(vocabulary.riskTerms).toContain('take profit');
    });
  });

  describe('Speech Recognition', () => {
    it('should start listening successfully', async () => {
      await processor.startListening();
      
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });
      expect(mockSpeechRecognition.start).toHaveBeenCalled();
      expect(processor.listening).toBe(true);
    });

    it('should stop listening successfully', async () => {
      await processor.startListening();
      const result = await processor.stopListening();
      
      expect(mockSpeechRecognition.stop).toHaveBeenCalled();
      expect(processor.listening).toBe(false);
      expect(typeof result).toBe('string');
    });

    it('should handle recognition errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Simulate error during start
      mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));
      
      await expect(processor.startListening()).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should not start listening if already listening', async () => {
      await processor.startListening();
      const startCallCount = mockSpeechRecognition.start.mock.calls.length;
      
      await processor.startListening(); // Second call
      
      expect(mockSpeechRecognition.start.mock.calls.length).toBe(startCallCount);
    });
  });

  describe('Audio Processing', () => {
    it('should process voice input successfully', async () => {
      const mockAudioBuffer = new AudioBuffer({
        length: 1024,
        numberOfChannels: 1,
        sampleRate: 44100
      });

      const result = await processor.processVoiceInput(mockAudioBuffer);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should enhance audio quality', async () => {
      const mockAudioBuffer = new AudioBuffer({
        length: 1024,
        numberOfChannels: 1,
        sampleRate: 44100
      });

      // This tests the internal audio enhancement
      const result = await processor.processVoiceInput(mockAudioBuffer);
      
      expect(mockOfflineAudioContext.createDynamicsCompressor).toHaveBeenCalled();
      expect(mockOfflineAudioContext.createBiquadFilter).toHaveBeenCalled();
      expect(mockOfflineAudioContext.startRendering).toHaveBeenCalled();
    });
  });

  describe('Speech Synthesis', () => {
    it('should generate voice response successfully', async () => {
      const text = 'Your strategy has been created successfully';
      
      const result = await processor.generateVoiceResponse(text);
      
      expect(result).toBeInstanceOf(AudioBuffer);
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });

    it('should use custom voice options', async () => {
      const text = 'Test message';
      const options = {
        pitch: 1.2,
        rate: 0.8,
        volume: 0.9
      };
      
      await processor.generateVoiceResponse(text, options);
      
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });

    it('should get available voices', () => {
      const mockVoices = [
        { name: 'Voice 1', lang: 'en-US' },
        { name: 'Voice 2', lang: 'en-GB' }
      ];
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);
      
      const voices = processor.getAvailableVoices();
      
      expect(voices).toEqual(mockVoices);
    });
  });

  describe('Trading Terminology Optimization', () => {
    it('should optimize common trading terms', () => {
      // Access private method through type assertion for testing
      const optimizeMethod = (processor as any).optimizeForTradingTerminology;
      
      expect(optimizeMethod('our side')).toContain('RSI');
      expect(optimizeMethod('mac d')).toContain('MACD');
      expect(optimizeMethod('stop lost')).toContain('stop loss');
      expect(optimizeMethod('by order')).toContain('buy order');
      expect(optimizeMethod('one minute')).toContain('1 minute');
      expect(optimizeMethod('five minutes')).toContain('5 minutes');
    });

    it('should handle common phrases', () => {
      const optimizeMethod = (processor as any).optimizeForTradingTerminology;
      
      expect(optimizeMethod('create a strategy')).toContain('create a strategy');
      expect(optimizeMethod('generate code')).toContain('generate code');
      expect(optimizeMethod('add indicator')).toContain('add indicator');
    });
  });

  describe('Vocabulary Management', () => {
    it('should update vocabulary', () => {
      const newVocabulary = {
        indicators: ['Custom Indicator'],
        timeframes: ['2 minutes']
      };
      
      processor.updateVocabulary(newVocabulary);
      
      const vocabulary = processor.vocabulary;
      expect(vocabulary.indicators).toContain('Custom Indicator');
      expect(vocabulary.timeframes).toContain('2 minutes');
    });
  });

  describe('Fallback Handling', () => {
    it('should handle unsupported browsers gracefully', () => {
      // Temporarily remove speech recognition support
      const originalSpeechRecognition = global.SpeechRecognition;
      const originalWebkitSpeechRecognition = global.webkitSpeechRecognition;
      
      delete (global as any).SpeechRecognition;
      delete (global as any).webkitSpeechRecognition;
      
      const fallbackProcessor = new VoiceProcessor();
      expect(fallbackProcessor).toBeInstanceOf(VoiceProcessor);
      
      // Restore
      global.SpeechRecognition = originalSpeechRecognition;
      global.webkitSpeechRecognition = originalWebkitSpeechRecognition;
      
      fallbackProcessor.dispose();
    });

    it('should attempt fallback on network errors', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Simulate network error
      const errorEvent = { error: 'network' };
      const handleErrorMethod = (processor as any).handleRecognitionError;
      
      handleErrorMethod('network');
      
      expect(consoleSpy).toHaveBeenCalledWith('Network error, attempting fallback');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Resource Management', () => {
    it('should dispose resources properly', () => {
      processor.dispose();
      
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should stop media stream on disposal', async () => {
      const mockTrack = { stop: jest.fn() };
      mockGetUserMedia.mockResolvedValueOnce({
        getTracks: () => [mockTrack]
      });
      
      await processor.startListening();
      processor.dispose();
      
      expect(mockTrack.stop).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle microphone permission denied', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const handleErrorMethod = (processor as any).handleRecognitionError;
      
      handleErrorMethod('not-allowed');
      
      expect(consoleSpy).toHaveBeenCalledWith('Microphone access denied');
      
      consoleSpy.mockRestore();
    });

    it('should handle no speech detected', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const handleErrorMethod = (processor as any).handleRecognitionError;
      
      handleErrorMethod('no-speech');
      
      expect(consoleSpy).toHaveBeenCalledWith('No speech detected');
      
      consoleSpy.mockRestore();
    });
  });
});