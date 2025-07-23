# Voice Processor

This directory contains the voice processing functionality for the Kiro-Style Pine Script Agent.

## Components

- **processor.ts** - Main voice processor class that handles speech recognition and synthesis
- **vocabulary/** - Trading-specific vocabulary and terminology
- **recognition/** - Speech recognition configuration and optimization
- **synthesis/** - Text-to-speech generation and audio processing

## Usage

```typescript
import { VoiceProcessor } from './processor';

const processor = new VoiceProcessor();

// Speech recognition
processor.startListening();
const text = await processor.stopListening();

// Speech synthesis
const audioBuffer = await processor.generateVoiceResponse('Your strategy has been created successfully.');
```

## Trading Vocabulary

The voice processor is optimized for trading terminology, including:

- Technical indicators (RSI, MACD, Bollinger Bands, etc.)
- Timeframes (1m, 5m, 15m, 1h, 4h, 1d, etc.)
- Order types (market, limit, stop, etc.)
- Risk management terms (stop loss, take profit, position sizing, etc.)
- Common trading phrases and jargon

## Features

- **Hands-free Operation** - Complete strategy creation via voice
- **Audio Feedback** - Confirmations, clarifications, status updates
- **Multi-modal** - Seamless switching between voice and text
- **Noise Cancellation** - Optimized for various environments
- **Accessibility** - WCAG 2.1 AA compliant voice interface