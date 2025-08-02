# Voice Processor

This directory contains the comprehensive speech-to-text system for the Kiro-Style Pine Script Agent, implementing Web Speech API with cloud service fallbacks, trading terminology optimization, noise cancellation, and real-time processing.

## Components

- **processor.ts** - Main voice processor class with full speech recognition and synthesis
- **__tests__/** - Comprehensive test suite for voice functionality

## Features Implemented

### 1. Web Speech API Integration
- Native browser speech recognition using SpeechRecognition API
- Automatic fallback to webkitSpeechRecognition for Safari/older browsers
- Cloud speech service fallback for unsupported browsers
- Real-time speech processing with low latency

### 2. Trading Terminology Optimization
- Comprehensive trading vocabulary (200+ terms)
- Automatic correction of common misrecognitions
- Context-aware phrase optimization
- Support for technical indicators, timeframes, order types, and risk terms

### 3. Audio Quality Enhancement
- Noise cancellation using Web Audio API
- Echo cancellation and automatic gain control
- High-pass filtering to remove low-frequency noise
- Dynamic compression for consistent audio levels
- EQ filtering to enhance speech frequencies

### 4. Real-time Processing
- Continuous speech recognition
- Interim results for immediate feedback
- Low-latency audio processing pipeline
- Efficient resource management

## Usage

### Basic Usage

```typescript
import { VoiceProcessor } from './processor';

const processor = new VoiceProcessor({
  language: 'en-US',
  continuous: true,
  interimResults: true,
  maxAlternatives: 3
});

// Set up result handler
processor.onRecognitionResult = (result) => {
  console.log('Recognized:', result.text);
  console.log('Confidence:', result.confidence);
  console.log('Is Final:', result.isFinal);
};

// Start listening
await processor.startListening();

// Stop listening
const finalText = await processor.stopListening();

// Generate speech response
await processor.generateVoiceResponse('Strategy created successfully');

// Clean up
processor.dispose();
```

### React Hook Usage

```typescript
import { useVoiceProcessor } from '../../hooks/voice/useVoiceProcessor';

function MyComponent() {
  const {
    isListening,
    isSupported,
    lastResult,
    error,
    startListening,
    stopListening,
    speak
  } = useVoiceProcessor();

  const handleStart = async () => {
    await startListening();
  };

  const handleStop = async () => {
    const text = await stopListening();
    console.log('Final text:', text);
  };

  return (
    <div>
      <button onClick={handleStart} disabled={isListening}>
        Start Listening
      </button>
      <button onClick={handleStop} disabled={!isListening}>
        Stop Listening
      </button>
      {lastResult && <p>Recognized: {lastResult.text}</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Voice Controls Component

```typescript
import VoiceControls from '../components/voice/VoiceControls';

function ChatInterface() {
  const handleTranscript = (text: string) => {
    // Handle recognized speech
    console.log('User said:', text);
  };

  const handleError = (error: string) => {
    // Handle voice errors
    console.error('Voice error:', error);
  };

  return (
    <VoiceControls
      onTranscript={handleTranscript}
      onError={handleError}
      options={{
        language: 'en-US',
        continuous: true,
        interimResults: true
      }}
    />
  );
}
```

## Trading Vocabulary

The voice processor includes extensive trading terminology optimization:

### Technical Indicators
- RSI, MACD, Bollinger Bands, Moving Averages (SMA, EMA, WMA)
- Stochastic, ATR, Ichimoku Cloud, Fibonacci
- Volume indicators (OBV, Money Flow Index, Chaikin Money Flow)
- Momentum indicators (ROC, TRIX, Aroon, Parabolic SAR)

### Timeframes
- Minute: 1m, 5m, 15m, 30m
- Hourly: 1h, 4h
- Daily: 1d, daily
- Weekly: 1w, weekly
- Monthly: 1M, monthly

### Order Types
- Market orders, Limit orders, Stop orders
- Stop-limit orders, Trailing stops
- OCO (One Cancels Other), Bracket orders

### Risk Management
- Stop loss, Take profit, Position sizing
- Risk-reward ratios, Maximum drawdown
- Money management, Portfolio risk

### Common Corrections
- "our side" → "RSI"
- "mac d" → "MACD"
- "stop lost" → "stop loss"
- "by order" → "buy order"
- "one minute" → "1 minute"

## Audio Processing Pipeline

### 1. Audio Input
```
Microphone → getUserMedia → MediaStream
```

### 2. Noise Reduction
```
MediaStream → AudioContext → High-pass Filter → Compressor → Enhanced Audio
```

### 3. Speech Recognition
```
Enhanced Audio → SpeechRecognition API → Raw Transcript
```

### 4. Terminology Optimization
```
Raw Transcript → Trading Vocabulary → Optimized Text
```

### 5. Result Processing
```
Optimized Text → Confidence Score → Final Result
```

## Error Handling

### Network Errors
- Automatic fallback to cloud speech services
- Graceful degradation for offline scenarios
- User notification of connectivity issues

### Permission Errors
- Clear messaging for microphone access denial
- Instructions for enabling permissions
- Alternative text input options

### Recognition Errors
- Retry mechanisms for temporary failures
- Quality indicators for low-confidence results
- Fallback to text input when needed

## Browser Compatibility

### Supported Browsers
- Chrome 25+ (full support)
- Edge 79+ (full support)
- Safari 14.1+ (webkit prefix)
- Firefox (limited support)

### Fallback Strategy
- Detect browser capabilities
- Use appropriate API prefixes
- Cloud service integration for unsupported browsers
- Graceful degradation to text-only mode

## Performance Optimization

### Memory Management
- Efficient audio buffer handling
- Automatic resource cleanup
- Context disposal on component unmount

### Processing Efficiency
- Streaming audio processing
- Optimized vocabulary matching
- Minimal DOM manipulation

### Battery Optimization
- Suspend audio context when not in use
- Efficient microphone access management
- Background processing optimization

## Testing

### Unit Tests
```bash
npm test -- voice-processor
```

### Integration Tests
```bash
npm test -- voice-integration
```

### Manual Testing
- Use the voice demo page at `/test-pages/voice-demo.tsx`
- Test with various microphones and environments
- Verify trading terminology recognition

## Configuration Options

```typescript
interface VoiceProcessorOptions {
  language?: string;           // Default: 'en-US'
  continuous?: boolean;        // Default: true
  interimResults?: boolean;    // Default: true
  maxAlternatives?: number;    // Default: 3
}
```

## Security Considerations

### Privacy
- No audio data stored permanently
- Local processing when possible
- Clear user consent for microphone access

### Data Protection
- Encrypted transmission for cloud fallbacks
- No personal information in voice logs
- GDPR compliant data handling

## Accessibility

### WCAG 2.1 AA Compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Alternative text input methods

### Inclusive Design
- Multiple language support
- Accent tolerance
- Clear error messaging
- Fallback options for all users

## Future Enhancements

### Planned Features
- Custom wake word detection
- Voice command shortcuts
- Multi-language trading terms
- Advanced noise reduction algorithms

### Integration Opportunities
- Real-time strategy execution
- Voice-controlled backtesting
- Hands-free chart analysis
- Audio market alerts

## Troubleshooting

### Common Issues
1. **Microphone not working**: Check browser permissions
2. **Poor recognition**: Ensure quiet environment, speak clearly
3. **Browser not supported**: Use Chrome or Edge for best results
4. **Network errors**: Check internet connection for cloud fallback

### Debug Mode
```typescript
const processor = new VoiceProcessor({ debug: true });
```

This enables detailed logging for troubleshooting recognition issues.