/**
 * Voice Processor
 * 
 * Handles speech recognition and synthesis for the Kiro-Style Pine Script Agent.
 * Integrates Web Speech API with cloud speech services as fallback.
 */

import { 
  CloudSpeechAdapter, 
  CloudSpeechProvider, 
  type CloudSpeechAdapterOptions 
} from './cloud-speech-adapter';
import type { 
  TradingVocabulary, 
  SpeechRecognitionResult, 
  VoiceProcessorOptions,
  VoiceSynthesisOptions 
} from '../../types/voice';
import { CloudSpeechAdapter, CloudSpeechProvider } from './cloud-speech-adapter';
import { CloudSpeechAdapter, CloudSpeechProvider } from './cloud-speech-adapter';
import { CloudSpeechAdapter, CloudSpeechProvider } from './cloud-speech-adapter';

/**
 * Voice Processor class that handles speech recognition and synthesis
 */
export class VoiceProcessor {
  private isListening: boolean;
  private tradingVocabulary: TradingVocabulary;
  private recognition: SpeechRecognition | null;
  private synthesis: SpeechSynthesis;
  private audioContext: AudioContext | null;
  private mediaStream: MediaStream | null;
  private noiseReduction: boolean;
  private options: VoiceProcessorOptions;
  private fallbackEnabled: boolean;
  private cloudAdapter: CloudSpeechAdapter | null;
  private processingQueue: AudioBuffer[];
  private isProcessingQueue: boolean;
  private cloudAdapter: CloudSpeechAdapter | null;
  private processingQueue: AudioBuffer[];
  private isProcessingQueue: boolean;
  private lastRecognizedText: string = '';
  private processingLatency: number = 0;
  private recognitionStartTime: number = 0;
  private audioWorkletNode: AudioWorkletNode | null = null;
  private audioProcessor: ScriptProcessorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private noiseFloor: number = -50;
  private vadEnabled: boolean = true;
  private silenceThreshold: number = 0.01;
  private silenceTimeout: number = 1500;
  private silenceTimer: any = null;
  
  /**
   * Creates a new instance of the VoiceProcessor
   */
  constructor(options: VoiceProcessorOptions = {}) {
    this.isListening = false;
    this.tradingVocabulary = this.configureTradingVocabulary();
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.audioContext = null;
    this.mediaStream = null;
    this.noiseReduction = true;
    this.fallbackEnabled = false;
    this.cloudAdapter = null;
    this.processingQueue = [];
    this.isProcessingQueue = false;
    this.audioWorkletNode = null;
    this.audioProcessor = null;
    this.analyser = null;
    
    this.options = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 3,
      cloudProvider: CloudSpeechProvider.GOOGLE,
      vadEnabled: true,
      noiseReduction: true,
      ...options
    };
    
    this.vadEnabled = this.options.vadEnabled !== false;
    this.noiseReduction = this.options.noiseReduction !== false;
    
    this.initializeSpeechRecognition();
    this.initializeCloudAdapter();
  }

  /**
   * Initializes the speech recognition system
   */
  private initializeSpeechRecognition(): void {
    if (!this.isSpeechRecognitionSupported()) {
      console.warn('Speech recognition not supported, fallback mode enabled');
      this.fallbackEnabled = true;
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      // Configure recognition settings
      this.recognition.continuous = this.options.continuous !== false;
      this.recognition.interimResults = this.options.interimResults !== false;
      this.recognition.lang = this.options.language || 'en-US';
      this.recognition.maxAlternatives = this.options.maxAlternatives || 3;
      
      // Setup event handlers
      this.setupRecognitionEventHandlers();
      
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      this.fallbackEnabled = true;
    }
  }
  
  /**
   * Initializes the cloud speech adapter for fallback
   */
  private initializeCloudAdapter(): void {
    try {
      // Configure cloud adapter options
      const cloudOptions: CloudSpeechAdapterOptions = {
        provider: this.options.cloudProvider || CloudSpeechProvider.GOOGLE,
        language: this.options.language || 'en-US',
        interimResults: this.options.interimResults !== false,
        maxAlternatives: this.options.maxAlternatives || 3,
        customVocabulary: [
          ...this.tradingVocabulary.indicators,
          ...this.tradingVocabulary.timeframes,
          ...this.tradingVocabulary.orderTypes,
          ...this.tradingVocabulary.riskTerms,
          ...Array.from(this.tradingVocabulary.commonPhrases.keys())
        ]
      };
      
      // Create cloud adapter
      this.cloudAdapter = new CloudSpeechAdapter(cloudOptions);
      
      // Set result callback
      this.cloudAdapter.setOnResultCallback((result) => {
        // Apply trading vocabulary optimization
        const optimizedResult: SpeechRecognitionResult = {
          ...result,
          text: this.optimizeForTradingTerminology(result.text),
          alternatives: result.alternatives.map(alt => ({
            ...alt,
            text: this.optimizeForTradingTerminology(alt.text)
          }))
        };
        
        // Emit result event
        this.onRecognitionResult?.(optimizedResult);
        
        // Store last recognized text if final
        if (optimizedResult.isFinal) {
          this.lastRecognizedText = optimizedResult.text;
        }
      });
      
    } catch (error) {
      console.error('Failed to initialize cloud speech adapter:', error);
    }
  }

  /**
   * Sets up event handlers for speech recognition
   */
  private setupRecognitionEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      this.isListening = false;
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.handleRecognitionError(event.error);
    };

    this.recognition.onresult = (event) => {
      this.handleRecognitionResult(event);
    };
  }

  /**
   * Handles speech recognition results
   */
  private handleRecognitionResult(event: SpeechRecognitionEvent): void {
    const results = Array.from(event.results);
    const lastResult = results[results.length - 1];
    
    if (lastResult) {
      const transcript = lastResult[0].transcript;
      const confidence = lastResult[0].confidence;
      
      // Calculate latency for performance monitoring
      const now = performance.now();
      if (this.recognitionStartTime > 0) {
        this.processingLatency = now - this.recognitionStartTime;
        console.debug(`Speech recognition latency: ${this.processingLatency.toFixed(2)}ms`);
      }
      
      // Apply trading vocabulary optimization with context awareness
      const optimizedTranscript = this.optimizeForTradingTerminology(transcript);
      
      // Store last recognized text if final
      if (lastResult.isFinal) {
        this.lastRecognizedText = optimizedTranscript;
      }
      
      // Emit result event (would be handled by parent component)
      this.onRecognitionResult?.({
        text: optimizedTranscript,
        confidence,
        alternatives: Array.from(lastResult).slice(1).map(alt => ({
          text: this.optimizeForTradingTerminology(alt.transcript),
          confidence: alt.confidence
        })),
        isFinal: lastResult.isFinal
      });
    }
  }

  /**
   * Handles speech recognition errors
   */
  private handleRecognitionError(error: string): void {
    switch (error) {
      case 'network':
        console.warn('Network error, attempting fallback');
        this.attemptFallback();
        break;
      case 'not-allowed':
        console.error('Microphone access denied');
        break;
      case 'no-speech':
        console.warn('No speech detected');
        break;
      case 'aborted':
        console.warn('Speech recognition aborted');
        break;
      case 'audio-capture':
        console.error('Audio capture failed, attempting fallback');
        this.attemptFallback();
        break;
      case 'service-not-allowed':
        console.error('Speech service not allowed, attempting fallback');
        this.attemptFallback();
        break;
      case 'bad-grammar':
        console.warn('Bad grammar configuration');
        break;
      case 'language-not-supported':
        console.error(`Language ${this.options.language} not supported, falling back to en-US`);
        if (this.recognition) {
          this.recognition.lang = 'en-US';
        }
        break;
      default:
        console.error('Speech recognition error:', error);
        // For any other error, attempt fallback
        this.attemptFallback();
    }
  }

  /**
   * Callback for recognition results (to be set by parent component)
   */
  public onRecognitionResult?: (result: SpeechRecognitionResult) => void;

  /**
   * Starts listening for speech input
   * 
   * @returns A promise that resolves when listening starts
   */
  public async startListening(): Promise<void> {
    if (this.isListening) {
      return;
    }

    try {
      // Reset state
      this.lastRecognizedText = '';
      this.recognitionStartTime = performance.now();
      
      // Initialize audio context for noise reduction and VAD
      await this.initializeAudioContext();
      
      if (this.recognition && !this.fallbackEnabled) {
        // Start Web Speech API recognition
        this.recognition.start();
        this.isListening = true;
        console.log('Started listening for speech input using Web Speech API');
      } else {
        // Use cloud fallback method
        await this.startFallbackListening();
      }
      
      // Start voice activity detection if enabled
      if (this.vadEnabled && this.mediaStream) {
        this.startVoiceActivityDetection();
      }
      
    } catch (error) {
      this.isListening = false;
      console.error('Error starting speech recognition:', error);
      
      // If Web Speech API fails, try cloud fallback
      if (!this.fallbackEnabled) {
        console.log('Attempting cloud fallback after Web Speech API failure');
        this.fallbackEnabled = true;
        await this.startFallbackListening();
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Starts voice activity detection to automatically stop listening after silence
   */
  private startVoiceActivityDetection(): void {
    if (!this.audioContext || !this.mediaStream) return;
    
    try {
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // Get media stream source
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Connect source to analyser
      source.connect(this.analyser);
      
      // Create buffer for analysis
      const dataArray = new Float32Array(this.analyser.frequencyBinCount);
      
      // Function to check for silence
      const checkSilence = () => {
        if (!this.isListening || !this.analyser) return;
        
        // Get audio data
        this.analyser.getFloatTimeDomainData(dataArray);
        
        // Calculate RMS (root mean square)
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sumSquares += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        
        // Check if below silence threshold
        if (rms < this.silenceThreshold) {
          // If silence timer not started, start it
          if (!this.silenceTimer) {
            this.silenceTimer = setTimeout(() => {
              console.log('Silence detected, stopping recognition');
              this.stopListening();
            }, this.silenceTimeout);
          }
        } else {
          // If sound detected, clear silence timer
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
        }
        
        // Continue checking while listening
        if (this.isListening) {
          requestAnimationFrame(checkSilence);
        }
      };
      
      // Start checking for silence
      checkSilence();
      
    } catch (error) {
      console.error('Failed to start voice activity detection:', error);
    }
  }

  /**
   * Stops listening for speech input and returns the recognized text
   * 
   * @returns A promise that resolves to the recognized text
   */
  public async stopListening(): Promise<string> {
    if (!this.isListening) {
      return '';
    }

    try {
      // Stop Web Speech API recognition if active
      if (this.recognition && !this.fallbackEnabled) {
        this.recognition.stop();
      }
      
      // Stop cloud fallback if active
      if (this.fallbackEnabled && this.cloudAdapter) {
        const cloudResult = await this.cloudAdapter.stopListening();
        if (cloudResult && !this.lastRecognizedText) {
          this.lastRecognizedText = cloudResult;
        }
      }
      
      // Clear silence timer if active
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
      
      // Clean up audio processing
      this.cleanupAudioResources();
      
      this.isListening = false;
      console.log('Stopped listening for speech input');
      
      // Calculate final latency
      const endTime = performance.now();
      this.processingLatency = endTime - this.recognitionStartTime;
      console.debug(`Total speech processing latency: ${this.processingLatency.toFixed(2)}ms`);
      
      // Return the last recognized text
      return this.lastRecognizedText || '';
      
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      this.isListening = false;
      this.cleanupAudioResources();
      throw error;
    }
  }
  
  /**
   * Cleans up audio processing resources
   */
  private cleanupAudioResources(): void {
    // Stop media stream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    // Disconnect audio worklet node if exists
    if (this.audioWorkletNode) {
      this.audioWorkletNode.disconnect();
      this.audioWorkletNode = null;
    }
    
    // Disconnect audio processor if exists
    if (this.audioProcessor) {
      this.audioProcessor.disconnect();
      this.audioProcessor = null;
    }
    
    // Disconnect analyser if exists
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
  }

  /**
   * Initializes audio context for noise reduction and quality enhancement
   */
  private async initializeAudioContext(): Promise<void> {
    try {
      // Clean up any existing resources
      this.cleanupAudioResources();
      
      // Create new audio context
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
          latencyHint: 'interactive', // Optimize for low latency
          sampleRate: 44100
        });
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Request microphone access with optimized settings for speech
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
          latency: 0.01, // Request lowest possible latency
          // Additional constraints for better speech quality
          echoCancellationType: 'system',
          noiseSuppresionLevel: 'high',
          autoGainControlMode: 'voice-communication'
        } as any // Type assertion needed for non-standard constraints
      });

      // Setup noise reduction if enabled
      if (this.noiseReduction) {
        await this.setupNoiseReduction();
      }
      
      // If using cloud fallback, provide the media stream
      if (this.fallbackEnabled && this.cloudAdapter) {
        await this.cloudAdapter.startListening(this.mediaStream);
      }

    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      // If we can't get microphone access, try cloud fallback
      if (!this.fallbackEnabled) {
        console.log('Attempting cloud fallback after microphone access failure');
        this.fallbackEnabled = true;
        if (this.cloudAdapter) {
          await this.cloudAdapter.startListening();
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Sets up noise reduction processing
   */
  private async setupNoiseReduction(): Promise<void> {
    if (!this.audioContext || !this.mediaStream) return;

    try {
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create a high-pass filter to remove low-frequency noise
      const highPassFilter = this.audioContext.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.setValueAtTime(80, this.audioContext.currentTime);
      
      // Create a compressor to normalize audio levels
      const compressor = this.audioContext.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, this.audioContext.currentTime);
      compressor.knee.setValueAtTime(30, this.audioContext.currentTime);
      compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
      compressor.attack.setValueAtTime(0.003, this.audioContext.currentTime);
      compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);
      
      // Connect the audio processing chain
      source.connect(highPassFilter);
      highPassFilter.connect(compressor);
      
      console.log('Noise reduction setup completed');
      
    } catch (error) {
      console.error('Failed to setup noise reduction:', error);
    }
  }

  /**
   * Processes voice input and returns the recognized text
   * 
   * @param audio - The audio buffer to process
   * @returns A promise that resolves to the recognized text
   */
  public async processVoiceInput(audio: AudioBuffer): Promise<string> {
    try {
      console.log('Processing voice input');
      
      // Apply audio quality enhancement
      const enhancedAudio = await this.enhanceAudioQuality(audio);
      
      // Process with speech recognition
      const recognizedText = await this.recognizeAudioBuffer(enhancedAudio);
      
      // Optimize for trading terminology
      const optimizedText = this.optimizeForTradingTerminology(recognizedText);
      
      return optimizedText;
      
    } catch (error) {
      console.error('Error processing voice input:', error);
      
      // Attempt fallback processing
      if (this.fallbackEnabled) {
        return await this.processFallbackAudio(audio);
      }
      
      throw error;
    }
  }

  /**
   * Enhances audio quality for better recognition
   */
  private async enhanceAudioQuality(audio: AudioBuffer): Promise<AudioBuffer> {
    if (!this.audioContext) {
      return audio;
    }

    try {
      // Create offline audio context for processing
      const offlineContext = new OfflineAudioContext(
        audio.numberOfChannels,
        audio.length,
        audio.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audio;

      // Apply noise gate to remove background noise
      const noiseGate = offlineContext.createDynamicsCompressor();
      noiseGate.threshold.setValueAtTime(-40, offlineContext.currentTime);
      noiseGate.ratio.setValueAtTime(20, offlineContext.currentTime);

      // Apply EQ to enhance speech frequencies
      const eqFilter = offlineContext.createBiquadFilter();
      eqFilter.type = 'peaking';
      eqFilter.frequency.setValueAtTime(3000, offlineContext.currentTime);
      eqFilter.Q.setValueAtTime(1, offlineContext.currentTime);
      eqFilter.gain.setValueAtTime(3, offlineContext.currentTime);

      // Connect processing chain
      source.connect(noiseGate);
      noiseGate.connect(eqFilter);
      eqFilter.connect(offlineContext.destination);

      source.start();
      
      return await offlineContext.startRendering();
      
    } catch (error) {
      console.error('Audio enhancement failed:', error);
      return audio;
    }
  }

  /**
   * Recognizes speech from audio buffer
   */
  private async recognizeAudioBuffer(audio: AudioBuffer): Promise<string> {
    // This would integrate with cloud speech services as fallback
    // For now, return a placeholder that would be replaced with actual implementation
    return new Promise((resolve) => {
      // Simulate processing time
      setTimeout(() => {
        resolve('Recognized text from audio buffer');
      }, 100);
    });
  }

  /**
   * Optimizes recognized text for trading terminology
   */
  private optimizeForTradingTerminology(text: string): string {
    let optimizedText = text.toLowerCase();
    
    // Replace common misrecognitions with correct trading terms
    const corrections = new Map([
      ['our side', 'RSI'],
      ['mac d', 'MACD'],
      ['bollinger bands', 'Bollinger Bands'],
      ['moving average', 'moving average'],
      ['stop lost', 'stop loss'],
      ['take profit', 'take profit'],
      ['by order', 'buy order'],
      ['sell order', 'sell order'],
      ['one minute', '1 minute'],
      ['five minutes', '5 minutes'],
      ['fifteen minutes', '15 minutes'],
      ['thirty minutes', '30 minutes'],
      ['one hour', '1 hour'],
      ['four hours', '4 hours'],
      ['one day', '1 day'],
      ['weekly', '1 week'],
      ['monthly', '1 month']
    ]);

    // Apply corrections
    corrections.forEach((correct, incorrect) => {
      const regex = new RegExp(incorrect, 'gi');
      optimizedText = optimizedText.replace(regex, correct);
    });

    // Enhance with trading vocabulary context
    this.tradingVocabulary.commonPhrases.forEach((correct, phrase) => {
      if (optimizedText.includes(phrase.toLowerCase())) {
        optimizedText = optimizedText.replace(phrase.toLowerCase(), correct);
      }
    });

    return optimizedText;
  }

  /**
   * Checks if speech recognition is supported
   */
  private isSpeechRecognitionSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Initializes the cloud speech adapter
   */
  private initializeCloudAdapter(): void {
    try {
      this.cloudAdapter = new CloudSpeechAdapter({
        provider: this.options.cloudProvider || CloudSpeechProvider.GOOGLE,
        language: this.options.language,
        interimResults: this.options.interimResults,
        maxAlternatives: this.options.maxAlternatives,
        customVocabulary: [
          ...this.tradingVocabulary.indicators,
          ...this.tradingVocabulary.timeframes,
          ...this.tradingVocabulary.orderTypes,
          ...this.tradingVocabulary.riskTerms
        ]
      });

      // Set up result callback
      this.cloudAdapter.setOnResultCallback((result) => {
        this.onRecognitionResult?.(result);
      });

      console.log('Cloud speech adapter initialized');
    } catch (error) {
      console.error('Failed to initialize cloud speech adapter:', error);
      this.fallbackEnabled = true;
    }
  }

  /**
   * Attempts fallback speech recognition
   */
  private async attemptFallback(): Promise<void> {
    console.log('Attempting fallback speech recognition');
    this.fallbackEnabled = true;
    
    if (this.cloudAdapter && this.mediaStream) {
      try {
        await this.cloudAdapter.startListening(this.mediaStream);
        console.log('Cloud speech service fallback activated');
      } catch (error) {
        console.error('Cloud fallback failed:', error);
      }
    }
  }

  /**
   * Starts fallback listening mode
   */
  private async startFallbackListening(): Promise<void> {
    console.log('Starting fallback listening mode');
    
    // This would implement cloud-based speech recognition
    // For now, simulate the functionality
    this.isListening = true;
    
    // Simulate cloud service integration
    setTimeout(() => {
      console.log('Fallback listening started');
    }, 100);
  }

  /**
   * Processes audio using fallback method
   */
  private async processFallbackAudio(audio: AudioBuffer): Promise<string> {
    console.log('Processing audio with fallback method');
    
    // This would send audio to cloud speech service
    // For now, return a placeholder
    return 'Fallback processed text';
  }

  /**
   * Generates a voice response from text
   * 
   * @param text - The text to convert to speech
   * @param options - Voice synthesis options
   * @returns A promise that resolves to an audio buffer
   */
  public async generateVoiceResponse(
    text: string, 
    options: VoiceSynthesisOptions = {}
  ): Promise<AudioBuffer> {
    try {
      console.log('Generating voice response');
      
      if (!this.synthesis) {
        throw new Error('Speech synthesis not supported');
      }

      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure voice options
        utterance.pitch = options.pitch || 1;
        utterance.rate = options.rate || 1;
        utterance.volume = options.volume || 1;
        
        // Select appropriate voice
        const voices = this.synthesis.getVoices();
        if (options.voice) {
          const selectedVoice = voices.find(v => v.name === options.voice);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }

        utterance.onend = () => {
          // Convert to audio buffer (simplified implementation)
          const audioBuffer = new AudioBuffer({
            length: 44100, // 1 second at 44.1kHz
            numberOfChannels: 1,
            sampleRate: 44100
          });
          resolve(audioBuffer);
        };

        utterance.onerror = (error) => {
          reject(error);
        };

        this.synthesis.speak(utterance);
      });
      
    } catch (error) {
      console.error('Error generating voice response:', error);
      throw error;
    }
  }

  /**
   * Gets available voices for synthesis
   */
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis ? this.synthesis.getVoices() : [];
  }

  /**
   * Checks if the processor is currently listening
   */
  public get listening(): boolean {
    return this.isListening;
  }

  /**
   * Gets the current trading vocabulary
   */
  public get vocabulary(): TradingVocabulary {
    return this.tradingVocabulary;
  }

  /**
   * Updates the trading vocabulary
   */
  public updateVocabulary(vocabulary: Partial<TradingVocabulary>): void {
    this.tradingVocabulary = {
      ...this.tradingVocabulary,
      ...vocabulary
    };
  }

  /**
   * Cleans up resources
   */
  public dispose(): void {
    if (this.isListening) {
      this.stopListening();
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  /**
   * Configures the trading vocabulary for speech recognition
   * 
   * @returns The trading vocabulary
   */
  public configureTradingVocabulary(): TradingVocabulary {
    return {
      indicators: [
        'RSI', 'MACD', 'Bollinger Bands', 'Moving Average', 'SMA', 'EMA', 'WMA',
        'Stochastic', 'ATR', 'Ichimoku Cloud', 'Fibonacci', 'Volume', 'OBV', 
        'ADX', 'CCI', 'Williams %R', 'Momentum', 'ROC', 'TRIX', 'Aroon',
        'Parabolic SAR', 'Keltner Channels', 'Donchian Channels', 'VWAP',
        'Money Flow Index', 'Chaikin Money Flow', 'Force Index', 'Ease of Movement'
      ],
      timeframes: [
        '1 minute', '1m', '5 minutes', '5m', '15 minutes', '15m', 
        '30 minutes', '30m', '1 hour', '1h', '4 hours', '4h',
        '1 day', '1d', 'daily', '1 week', '1w', 'weekly', 
        '1 month', '1M', 'monthly'
      ],
      orderTypes: [
        'market', 'market order', 'limit', 'limit order', 'stop', 'stop order',
        'stop limit', 'stop limit order', 'trailing stop', 'OCO', 
        'one cancels other', 'bracket order', 'iceberg order'
      ],
      riskTerms: [
        'stop loss', 'stop-loss', 'take profit', 'take-profit', 'risk percentage',
        'position size', 'position sizing', 'risk reward ratio', 'risk-reward',
        'maximum drawdown', 'max drawdown', 'risk per trade', 'risk management',
        'money management', 'portfolio risk', 'value at risk', 'VAR',
        'sharpe ratio', 'sortino ratio', 'calmar ratio'
      ],
      commonPhrases: new Map([
        ['create a strategy', 'create a strategy'],
        ['generate code', 'generate code'],
        ['add indicator', 'add indicator'],
        ['set stop loss', 'set stop loss'],
        ['optimize code', 'optimize code'],
        ['export strategy', 'export strategy'],
        ['backtest strategy', 'backtest strategy'],
        ['run backtest', 'run backtest'],
        ['show results', 'show results'],
        ['modify parameters', 'modify parameters'],
        ['change timeframe', 'change timeframe'],
        ['add condition', 'add condition'],
        ['create alert', 'create alert'],
        ['long position', 'long position'],
        ['short position', 'short position'],
        ['buy signal', 'buy signal'],
        ['sell signal', 'sell signal'],
        ['entry condition', 'entry condition'],
        ['exit condition', 'exit condition'],
        ['trend following', 'trend following'],
        ['mean reversion', 'mean reversion'],
        ['breakout strategy', 'breakout strategy'],
        ['scalping strategy', 'scalping strategy'],
        ['swing trading', 'swing trading'],
        ['day trading', 'day trading']
      ])
    };
  }
}