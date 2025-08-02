/**
 * Voice Controls Component
 * 
 * UI component for voice input controls with speech-to-text functionality.
 */

import React, { useState, useEffect } from 'react';
import { useVoiceProcessor } from '../../hooks/voice/useVoiceProcessor';
import type { VoiceProcessorOptions } from '../../types/voice';

interface VoiceControlsProps {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  options?: VoiceProcessorOptions;
  className?: string;
  disabled?: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  onTranscript,
  onError,
  options,
  className = '',
  disabled = false
}) => {
  const {
    isListening,
    isSupported,
    lastResult,
    error,
    startListening,
    stopListening,
    speak,
    clearError
  } = useVoiceProcessor(options);

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  // Handle recognition results
  useEffect(() => {
    if (lastResult) {
      if (lastResult.isFinal) {
        setTranscript(prev => prev + lastResult.text + ' ');
        setInterimTranscript('');
        onTranscript?.(lastResult.text);
      } else {
        setInterimTranscript(lastResult.text);
      }
    }
  }, [lastResult, onTranscript]);

  // Handle errors
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  const handleStartListening = async () => {
    clearError();
    setTranscript('');
    setInterimTranscript('');
    await startListening();
  };

  const handleStopListening = async () => {
    const finalText = await stopListening();
    if (finalText) {
      onTranscript?.(finalText);
    }
  };

  const handleClear = () => {
    setTranscript('');
    setInterimTranscript('');
    clearError();
  };

  const handleTestSpeak = async () => {
    await speak('Voice recognition is working correctly. You can now speak your trading commands.');
  };

  if (!isSupported) {
    return (
      <div className={`voice-controls voice-controls--unsupported ${className}`}>
        <div className="voice-controls__error">
          <span className="voice-controls__error-icon">⚠️</span>
          <p>Speech recognition is not supported in this browser.</p>
          <p className="voice-controls__error-help">
            Please use Chrome, Edge, or Safari for voice functionality.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`voice-controls ${className}`}>
      {/* Voice Status Indicator */}
      <div className="voice-controls__status">
        <div className={`voice-controls__indicator ${isListening ? 'voice-controls__indicator--active' : ''}`}>
          <div className="voice-controls__indicator-dot"></div>
          <span className="voice-controls__status-text">
            {isListening ? 'Listening...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="voice-controls__buttons">
        <button
          className={`voice-controls__button voice-controls__button--primary ${
            isListening ? 'voice-controls__button--stop' : 'voice-controls__button--start'
          }`}
          onClick={isListening ? handleStopListening : handleStartListening}
          disabled={disabled}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? (
            <>
              <span className="voice-controls__button-icon">⏹️</span>
              Stop
            </>
          ) : (
            <>
              <span className="voice-controls__button-icon">🎤</span>
              Start
            </>
          )}
        </button>

        <button
          className="voice-controls__button voice-controls__button--secondary"
          onClick={handleTestSpeak}
          disabled={disabled || isListening}
          aria-label="Test speech synthesis"
        >
          <span className="voice-controls__button-icon">🔊</span>
          Test
        </button>

        <button
          className="voice-controls__button voice-controls__button--secondary"
          onClick={handleClear}
          disabled={disabled || isListening}
          aria-label="Clear transcript"
        >
          <span className="voice-controls__button-icon">🗑️</span>
          Clear
        </button>
      </div>

      {/* Transcript Display */}
      <div className="voice-controls__transcript">
        <div className="voice-controls__transcript-label">Transcript:</div>
        <div className="voice-controls__transcript-content">
          <span className="voice-controls__transcript-final">{transcript}</span>
          <span className="voice-controls__transcript-interim">{interimTranscript}</span>
          {!transcript && !interimTranscript && (
            <span className="voice-controls__transcript-placeholder">
              Speak your trading commands here...
            </span>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="voice-controls__error">
          <span className="voice-controls__error-icon">❌</span>
          <span className="voice-controls__error-text">{error}</span>
          <button
            className="voice-controls__error-dismiss"
            onClick={clearError}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Recognition Quality Indicator */}
      {lastResult && (
        <div className="voice-controls__quality">
          <div className="voice-controls__quality-label">Recognition Quality:</div>
          <div className="voice-controls__quality-bar">
            <div 
              className="voice-controls__quality-fill"
              style={{ width: `${(lastResult.confidence || 0) * 100}%` }}
            ></div>
          </div>
          <span className="voice-controls__quality-text">
            {Math.round((lastResult.confidence || 0) * 100)}%
          </span>
        </div>
      )}

      {/* Trading Vocabulary Hints */}
      <div className="voice-controls__hints">
        <div className="voice-controls__hints-label">Try saying:</div>
        <div className="voice-controls__hints-list">
          <span className="voice-controls__hint">"Create a RSI strategy"</span>
          <span className="voice-controls__hint">"Add moving average"</span>
          <span className="voice-controls__hint">"Set stop loss to 2%"</span>
          <span className="voice-controls__hint">"Generate code"</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceControls;