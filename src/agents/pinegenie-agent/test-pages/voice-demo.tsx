/**
 * Voice Demo Page
 * 
 * Demo page for testing voice recognition functionality.
 */

import React, { useState } from 'react';
import VoiceControls from '../components/voice/VoiceControls';
import type { VoiceProcessorOptions } from '../types/voice';

const VoiceDemo: React.FC = () => {
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [options, setOptions] = useState<VoiceProcessorOptions>({
    language: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 3
  });

  const handleTranscript = (text: string) => {
    setTranscripts(prev => [...prev, text]);
    console.log('New transcript:', text);
  };

  const handleError = (error: string) => {
    setErrors(prev => [...prev, error]);
    console.error('Voice error:', error);
  };

  const clearTranscripts = () => {
    setTranscripts([]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const updateLanguage = (language: string) => {
    setOptions(prev => ({ ...prev, language }));
  };

  const toggleContinuous = () => {
    setOptions(prev => ({ ...prev, continuous: !prev.continuous }));
  };

  const toggleInterimResults = () => {
    setOptions(prev => ({ ...prev, interimResults: !prev.interimResults }));
  };

  return (
    <div className="voice-demo">
      <div className="voice-demo__container">
        <header className="voice-demo__header">
          <h1 className="voice-demo__title">Voice Recognition Demo</h1>
          <p className="voice-demo__description">
            Test the speech-to-text functionality optimized for trading terminology.
          </p>
        </header>

        <div className="voice-demo__content">
          {/* Voice Controls */}
          <section className="voice-demo__section">
            <h2 className="voice-demo__section-title">Voice Controls</h2>
            <VoiceControls
              onTranscript={handleTranscript}
              onError={handleError}
              options={options}
              className="voice-demo__controls"
            />
          </section>

          {/* Configuration */}
          <section className="voice-demo__section">
            <h2 className="voice-demo__section-title">Configuration</h2>
            <div className="voice-demo__config">
              <div className="voice-demo__config-group">
                <label className="voice-demo__config-label">
                  Language:
                  <select
                    className="voice-demo__config-select"
                    value={options.language}
                    onChange={(e) => updateLanguage(e.target.value)}
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="en-AU">English (AU)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                  </select>
                </label>
              </div>

              <div className="voice-demo__config-group">
                <label className="voice-demo__config-label">
                  <input
                    type="checkbox"
                    checked={options.continuous}
                    onChange={toggleContinuous}
                    className="voice-demo__config-checkbox"
                  />
                  Continuous Recognition
                </label>
              </div>

              <div className="voice-demo__config-group">
                <label className="voice-demo__config-label">
                  <input
                    type="checkbox"
                    checked={options.interimResults}
                    onChange={toggleInterimResults}
                    className="voice-demo__config-checkbox"
                  />
                  Interim Results
                </label>
              </div>

              <div className="voice-demo__config-group">
                <label className="voice-demo__config-label">
                  Max Alternatives:
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={options.maxAlternatives}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      maxAlternatives: parseInt(e.target.value) 
                    }))}
                    className="voice-demo__config-input"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Transcripts */}
          <section className="voice-demo__section">
            <div className="voice-demo__section-header">
              <h2 className="voice-demo__section-title">Transcripts</h2>
              <button
                onClick={clearTranscripts}
                className="voice-demo__clear-button"
                disabled={transcripts.length === 0}
              >
                Clear
              </button>
            </div>
            <div className="voice-demo__transcripts">
              {transcripts.length === 0 ? (
                <p className="voice-demo__empty">No transcripts yet. Start speaking!</p>
              ) : (
                transcripts.map((transcript, index) => (
                  <div key={index} className="voice-demo__transcript">
                    <span className="voice-demo__transcript-index">#{index + 1}</span>
                    <span className="voice-demo__transcript-text">{transcript}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Errors */}
          {errors.length > 0 && (
            <section className="voice-demo__section">
              <div className="voice-demo__section-header">
                <h2 className="voice-demo__section-title">Errors</h2>
                <button
                  onClick={clearErrors}
                  className="voice-demo__clear-button"
                >
                  Clear
                </button>
              </div>
              <div className="voice-demo__errors">
                {errors.map((error, index) => (
                  <div key={index} className="voice-demo__error">
                    <span className="voice-demo__error-index">#{index + 1}</span>
                    <span className="voice-demo__error-text">{error}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trading Commands Examples */}
          <section className="voice-demo__section">
            <h2 className="voice-demo__section-title">Trading Commands to Try</h2>
            <div className="voice-demo__examples">
              <div className="voice-demo__example-category">
                <h3 className="voice-demo__example-title">Strategy Creation</h3>
                <ul className="voice-demo__example-list">
                  <li>"Create a RSI strategy"</li>
                  <li>"Generate a moving average crossover"</li>
                  <li>"Build a Bollinger Bands breakout strategy"</li>
                  <li>"Make a MACD signal strategy"</li>
                </ul>
              </div>

              <div className="voice-demo__example-category">
                <h3 className="voice-demo__example-title">Indicators</h3>
                <ul className="voice-demo__example-list">
                  <li>"Add RSI with period 14"</li>
                  <li>"Include 20 period moving average"</li>
                  <li>"Use Bollinger Bands with 2 standard deviations"</li>
                  <li>"Apply MACD with 12, 26, 9 settings"</li>
                </ul>
              </div>

              <div className="voice-demo__example-category">
                <h3 className="voice-demo__example-title">Risk Management</h3>
                <ul className="voice-demo__example-list">
                  <li>"Set stop loss to 2 percent"</li>
                  <li>"Add take profit at 3 to 1 ratio"</li>
                  <li>"Use position size of 1 percent risk"</li>
                  <li>"Set maximum drawdown to 10 percent"</li>
                </ul>
              </div>

              <div className="voice-demo__example-category">
                <h3 className="voice-demo__example-title">Timeframes</h3>
                <ul className="voice-demo__example-list">
                  <li>"Use 5 minute timeframe"</li>
                  <li>"Switch to 1 hour chart"</li>
                  <li>"Apply to daily timeframe"</li>
                  <li>"Test on 15 minute intervals"</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .voice-demo {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .voice-demo__container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .voice-demo__header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 3rem 2rem;
          text-align: center;
        }

        .voice-demo__title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .voice-demo__description {
          font-size: 1.125rem;
          opacity: 0.9;
        }

        .voice-demo__content {
          padding: 2rem;
        }

        .voice-demo__section {
          margin-bottom: 3rem;
        }

        .voice-demo__section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #374151;
        }

        .voice-demo__section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .voice-demo__clear-button {
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .voice-demo__clear-button:hover:not(:disabled) {
          background: #dc2626;
        }

        .voice-demo__clear-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .voice-demo__config {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 0.5rem;
        }

        .voice-demo__config-group {
          display: flex;
          flex-direction: column;
        }

        .voice-demo__config-label {
          font-weight: 500;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .voice-demo__config-select,
        .voice-demo__config-input {
          margin-top: 0.25rem;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .voice-demo__config-checkbox {
          margin: 0;
        }

        .voice-demo__transcripts,
        .voice-demo__errors {
          background: #f9fafb;
          border-radius: 0.5rem;
          padding: 1rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .voice-demo__empty {
          text-align: center;
          color: #6b7280;
          font-style: italic;
        }

        .voice-demo__transcript,
        .voice-demo__error {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          background: white;
          border-radius: 0.375rem;
          border-left: 4px solid #3b82f6;
        }

        .voice-demo__error {
          border-left-color: #ef4444;
        }

        .voice-demo__transcript-index,
        .voice-demo__error-index {
          font-weight: 600;
          color: #6b7280;
          flex-shrink: 0;
        }

        .voice-demo__transcript-text,
        .voice-demo__error-text {
          flex: 1;
        }

        .voice-demo__examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .voice-demo__example-category {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 0.5rem;
        }

        .voice-demo__example-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #374151;
        }

        .voice-demo__example-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .voice-demo__example-list li {
          padding: 0.5rem;
          margin-bottom: 0.25rem;
          background: white;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875rem;
          color: #4f46e5;
          border-left: 3px solid #4f46e5;
        }

        @media (max-width: 768px) {
          .voice-demo {
            padding: 1rem;
          }

          .voice-demo__header {
            padding: 2rem 1rem;
          }

          .voice-demo__title {
            font-size: 2rem;
          }

          .voice-demo__content {
            padding: 1rem;
          }

          .voice-demo__config {
            grid-template-columns: 1fr;
          }

          .voice-demo__examples {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceDemo;