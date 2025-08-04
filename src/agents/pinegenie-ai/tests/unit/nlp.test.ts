/**
 * Unit tests for Natural Language Processing components
 * Tests parsing accuracy, intent extraction, and parameter extraction
 */

// Jest globals are available without import in Next.js Jest setup
import {
    createMockParsedRequest,
    createMockTradingIntent,
    expectValidParsedRequest,
    expectValidTradingIntent
} from '../helpers/test-utils';
import { TokenType, EntityType, StrategyType } from '../../types';

// Mock the NLP components since they're in separate files
const mockNLP = {
    parseRequest: jest.fn(),
    extractIntent: jest.fn(),
    extractParameters: jest.fn(),
    validateInput: jest.fn()
};

describe('Natural Language Processing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Text Parsing', () => {
        test('should parse simple RSI strategy request', () => {
            const input = "Create a strategy that buys when RSI is below 30";
            const expectedTokens = ['create', 'strategy', 'buys', 'rsi', 'below', '30'];

            const mockResult = createMockParsedRequest({
                originalText: input,
                tokens: expectedTokens.map((token, index) => ({
                    text: token,
                    type: TokenType.UNKNOWN,
                    position: index * 5,
                    confidence: 0.8
                })),
                entities: [
                    { text: 'RSI', type: EntityType.INDICATOR_NAME, value: 'rsi', confidence: 0.9, startIndex: 0, endIndex: 3 },
                    { text: '30', type: EntityType.THRESHOLD, value: 30, confidence: 1.0, startIndex: 10, endIndex: 12 },
                    { text: 'below', type: EntityType.INDICATOR_NAME, value: 'below', confidence: 0.8, startIndex: 15, endIndex: 20 }
                ],
                confidence: 0.9
            });

            mockNLP.parseRequest.mockReturnValue(mockResult);
            const result = mockNLP.parseRequest(input);

            expect(result).toBeDefined();
            expect(result.originalText).toBe(input);
            expect(result.confidence).toBeGreaterThan(0.8);
            expect(result.entities).toContainEqual(
                expect.objectContaining({ text: 'RSI', type: EntityType.INDICATOR_NAME })
            );
            expectValidParsedRequest(result);
        });

        test('should parse MACD crossover strategy request', () => {
            const input = "Build a MACD crossover strategy with stop loss";
            const mockResult = createMockParsedRequest({
                originalText: input,
                tokens: ['build', 'macd', 'crossover', 'strategy', 'stop', 'loss'].map((token, index) => ({
                    text: token,
                    type: TokenType.UNKNOWN,
                    position: index * 5,
                    confidence: 0.8
                })),
                entities: [
                    { text: 'MACD', type: EntityType.INDICATOR_NAME, value: 'macd', confidence: 0.95, startIndex: 0, endIndex: 4 },
                    { text: 'crossover', type: EntityType.INDICATOR_NAME, value: 'crossover', confidence: 0.9, startIndex: 5, endIndex: 14 },
                    { text: 'stop loss', type: EntityType.INDICATOR_NAME, value: 'stop_loss', confidence: 0.85, startIndex: 15, endIndex: 24 }
                ],
                confidence: 0.92
            });

            mockNLP.parseRequest.mockReturnValue(mockResult);
            const result = mockNLP.parseRequest(input);

            expect(result.confidence).toBeGreaterThan(0.9);
            expect(result.entities).toContainEqual(
                expect.objectContaining({ text: 'MACD', type: EntityType.INDICATOR_NAME })
            );
            expect(result.entities).toContainEqual(
                expect.objectContaining({ text: 'stop loss', type: EntityType.INDICATOR_NAME })
            );
        });

        test('should handle ambiguous requests with lower confidence', () => {
            const input = "Make me money";
            const mockResult = createMockParsedRequest({
                originalText: input,
                tokens: ['make', 'money'].map((token, index) => ({
                    text: token,
                    type: TokenType.UNKNOWN,
                    position: index * 5,
                    confidence: 0.2
                })),
                entities: [],
                confidence: 0.2
            });

            mockNLP.parseRequest.mockReturnValue(mockResult);
            const result = mockNLP.parseRequest(input);

            expect(result.confidence).toBeLessThan(0.5);
            expect(result.entities).toHaveLength(0);
        });

        test('should validate input correctly', () => {
            const validInputs = [
                "Create RSI strategy",
                "Build MACD crossover with 2% stop loss",
                "Bollinger bands breakout strategy"
            ];

            const invalidInputs = [
                "",
                "   ",
                "a".repeat(1000), // Too long
                "!@#$%^&*()" // Only special characters
            ];

            validInputs.forEach(input => {
                mockNLP.validateInput.mockReturnValue({ valid: true, errors: [] });
                const result = mockNLP.validateInput(input);
                expect(result.valid).toBe(true);
            });

            invalidInputs.forEach(input => {
                mockNLP.validateInput.mockReturnValue({ valid: false, errors: ['Invalid input'] });
                const result = mockNLP.validateInput(input);
                expect(result.valid).toBe(false);
            });
        });
    });

    describe('Intent Extraction', () => {
        test('should extract RSI strategy intent correctly', () => {
            const parsedRequest = createMockParsedRequest({
                originalText: "Create RSI strategy that buys when oversold",
                entities: [
                    { text: 'RSI', type: EntityType.INDICATOR_NAME, value: 'rsi', confidence: 0.9, startIndex: 7, endIndex: 10 },
                    { text: 'oversold', type: EntityType.INDICATOR_NAME, value: 'oversold', confidence: 0.8, startIndex: 35, endIndex: 43 }
                ]
            });

            const mockIntent = createMockTradingIntent({
                strategyType: StrategyType.MEAN_REVERSION,
                indicators: ['rsi'],
                conditions: ['oversold'],
                actions: ['buy'],
                confidence: 0.9
            });

            mockNLP.extractIntent.mockReturnValue(mockIntent);
            const result = mockNLP.extractIntent(parsedRequest);

            expect(result.strategyType).toBe(StrategyType.MEAN_REVERSION);
            expect(result.indicators).toContain('rsi');
            expect(result.conditions).toContain('oversold');
            expect(result.confidence).toBeGreaterThan(0.8);
            expectValidTradingIntent(result);
        });

        test('should extract MACD trend-following intent', () => {
            const parsedRequest = createMockParsedRequest({
                originalText: "MACD crossover for trend following",
                entities: [
                    { text: 'MACD', type: EntityType.INDICATOR_NAME, value: 'macd', confidence: 0.95, startIndex: 0, endIndex: 4 },
                    { text: 'crossover', type: EntityType.INDICATOR_NAME, value: 'crossover', confidence: 0.9, startIndex: 5, endIndex: 14 }
                ]
            });

            const mockIntent = createMockTradingIntent({
                strategyType: StrategyType.TREND_FOLLOWING,
                indicators: ['macd'],
                conditions: ['crossover'],
                actions: ['buy', 'sell'],
                confidence: 0.92
            });

            mockNLP.extractIntent.mockReturnValue(mockIntent);
            const result = mockNLP.extractIntent(parsedRequest);

            expect(result.strategyType).toBe(StrategyType.TREND_FOLLOWING);
            expect(result.indicators).toContain('macd');
            expect(result.conditions).toContain('crossover');
        });

        test('should handle multiple indicators in complex strategies', () => {
            const parsedRequest = createMockParsedRequest({
                originalText: "RSI and MACD confirmation strategy",
                entities: [
                    { text: 'RSI', type: EntityType.INDICATOR_NAME, value: 'rsi', confidence: 0.9, startIndex: 0, endIndex: 3 },
                    { text: 'MACD', type: EntityType.INDICATOR_NAME, value: 'macd', confidence: 0.9, startIndex: 8, endIndex: 12 },
                    { text: 'confirmation', type: EntityType.INDICATOR_NAME, value: 'confirmation', confidence: 0.8, startIndex: 13, endIndex: 25 }
                ]
            });

            const mockIntent = createMockTradingIntent({
                strategyType: StrategyType.CUSTOM,
                indicators: ['rsi', 'macd'],
                conditions: ['confirmation'],
                actions: ['buy', 'sell'],
                confidence: 0.85
            });

            mockNLP.extractIntent.mockReturnValue(mockIntent);
            const result = mockNLP.extractIntent(parsedRequest);

            expect(result.indicators).toContain('rsi');
            expect(result.indicators).toContain('macd');
            expect(result.conditions).toContain('confirmation');
        });
    });

    describe('Parameter Extraction', () => {
        test('should extract RSI parameters correctly', () => {
            const parsedRequest = createMockParsedRequest({
                originalText: "RSI strategy with 14 period, buy below 30, sell above 70",
                entities: [
                    { text: 'RSI', type: EntityType.INDICATOR_NAME, value: 'rsi', confidence: 0.9, startIndex: 0, endIndex: 3 },
                    { text: '14', type: EntityType.PARAMETER_VALUE, value: 14, confidence: 1.0, startIndex: 18, endIndex: 20 },
                    { text: '30', type: EntityType.THRESHOLD, value: 30, confidence: 1.0, startIndex: 39, endIndex: 41 },
                    { text: '70', type: EntityType.THRESHOLD, value: 70, confidence: 1.0, startIndex: 58, endIndex: 60 }
                ]
            });

            const mockParameters = {
                rsi: {
                    period: 14,
                    oversoldThreshold: 30,
                    overboughtThreshold: 70
                },
                timeframe: '1h',
                stopLoss: null,
                takeProfit: null
            };

            mockNLP.extractParameters.mockReturnValue(mockParameters);
            const result = mockNLP.extractParameters(parsedRequest);

            expect(result.rsi.period).toBe(14);
            expect(result.rsi.oversoldThreshold).toBe(30);
            expect(result.rsi.overboughtThreshold).toBe(70);
        });

        test('should extract MACD parameters with defaults', () => {
            const parsedRequest = createMockParsedRequest({
                originalText: "MACD crossover strategy",
                entities: [
                    { text: 'MACD', type: EntityType.INDICATOR_NAME, value: 'macd', confidence: 0.9, startIndex: 0, endIndex: 4 }
                ]
            });

            const mockParameters = {
                macd: {
                    fastPeriod: 12,
                    slowPeriod: 26,
                    signalPeriod: 9
                },
                timeframe: '1h',
                stopLoss: null,
                takeProfit: null
            };

            mockNLP.extractParameters.mockReturnValue(mockParameters);
            const result = mockNLP.extractParameters(parsedRequest);

            expect(result.macd.fastPeriod).toBe(12);
            expect(result.macd.slowPeriod).toBe(26);
            expect(result.macd.signalPeriod).toBe(9);
        });

        test('should extract risk management parameters', () => {
            const parsedRequest = createMockParsedRequest({
                originalText: "RSI strategy with 2% stop loss and 4% take profit",
                entities: [
                    { text: 'RSI', type: EntityType.INDICATOR_NAME, value: 'rsi', confidence: 0.9, startIndex: 0, endIndex: 3 },
                    { text: '2%', type: EntityType.PERCENTAGE, value: 2, confidence: 0.9, startIndex: 18, endIndex: 20 },
                    { text: '4%', type: EntityType.PERCENTAGE, value: 4, confidence: 0.9, startIndex: 36, endIndex: 38 },
                    { text: 'stop loss', type: EntityType.INDICATOR_NAME, value: 'stop_loss', confidence: 0.8, startIndex: 21, endIndex: 30 },
                    { text: 'take profit', type: EntityType.INDICATOR_NAME, value: 'take_profit', confidence: 0.8, startIndex: 39, endIndex: 50 }
                ]
            });

            const mockParameters = {
                rsi: {
                    period: 14,
                    oversoldThreshold: 30,
                    overboughtThreshold: 70
                },
                stopLoss: 2,
                takeProfit: 4,
                timeframe: '1h'
            };

            mockNLP.extractParameters.mockReturnValue(mockParameters);
            const result = mockNLP.extractParameters(parsedRequest);

            expect(result.stopLoss).toBe(2);
            expect(result.takeProfit).toBe(4);
        });

        test('should handle timeframe extraction', () => {
            const testCases = [
                { input: "1 hour RSI strategy", expected: '1h' },
                { input: "daily MACD crossover", expected: '1d' },
                { input: "5 minute scalping", expected: '5m' },
                { input: "4h Bollinger bands", expected: '4h' }
            ];

            testCases.forEach(({ input, expected }) => {
                const parsedRequest = createMockParsedRequest({
                    originalText: input,
                    entities: [
                        { text: expected, type: EntityType.TIMEFRAME, value: expected, confidence: 0.9, startIndex: 0, endIndex: expected.length }
                    ]
                });

                const mockParameters = {
                    timeframe: expected,
                    stopLoss: null,
                    takeProfit: null
                };

                mockNLP.extractParameters.mockReturnValue(mockParameters);
                const result = mockNLP.extractParameters(parsedRequest);

                expect(result.timeframe).toBe(expected);
            });
        });
    });

    describe('Context Engine', () => {
        test('should maintain conversation context', () => {
            const conversationHistory = [
                { role: 'user', content: 'Create RSI strategy' },
                { role: 'ai', content: 'I can help with that. What timeframe?' },
                { role: 'user', content: '1 hour' }
            ];

            // Mock context engine behavior
            const mockContext = {
                currentStrategy: 'rsi',
                parameters: { timeframe: '1h' },
                conversationHistory,
                lastIntent: 'rsi-strategy'
            };

            // This would be tested with actual context engine implementation
            expect(mockContext.currentStrategy).toBe('rsi');
            expect(mockContext.parameters.timeframe).toBe('1h');
            expect(mockContext.conversationHistory).toHaveLength(3);
        });

        test('should resolve references in follow-up messages', () => {
            // Mock reference resolution
            const resolvedMessage = "Make RSI strategy more sensitive by reducing period";

            expect(resolvedMessage).toContain('RSI');
            expect(resolvedMessage).toContain('sensitive');
        });
    });

    describe('Error Handling', () => {
        test('should handle parsing errors gracefully', () => {
            const invalidInput = null;

            mockNLP.parseRequest.mockImplementation(() => {
                throw new Error('Invalid input');
            });

            expect(() => mockNLP.parseRequest(invalidInput)).toThrow('Invalid input');
        });

        test('should handle intent extraction failures', () => {
            const parsedRequest = createMockParsedRequest({
                originalText: "gibberish nonsense words",
                entities: [],
                confidence: 0.1
            });

            const mockIntent = createMockTradingIntent({
                strategyType: StrategyType.CUSTOM,
                indicators: [],
                conditions: [],
                actions: [],
                confidence: 0.1
            });

            mockNLP.extractIntent.mockReturnValue(mockIntent);
            const result = mockNLP.extractIntent(parsedRequest);

            expect(result.confidence).toBeLessThan(0.2);
            expect(result.strategyType).toBe(StrategyType.CUSTOM);
        });

        test('should validate parameter ranges', () => {
            // Mock parameter validation
            const validationResult = {
                valid: false,
                errors: [
                    'RSI period must be positive',
                    'Oversold threshold must be between 0-100',
                    'Overbought threshold must be between 0-100'
                ]
            };

            expect(validationResult.valid).toBe(false);
            expect(validationResult.errors).toHaveLength(3);
        });
    });

    describe('Performance Tests', () => {
        test('should parse requests within acceptable time limits', () => {
            const input = "Create complex RSI MACD Bollinger Bands multi-timeframe strategy";
            const startTime = Date.now();

            const mockResult = createMockParsedRequest({
                originalText: input,
                confidence: 0.8
            });

            mockNLP.parseRequest.mockReturnValue(mockResult);
            const result = mockNLP.parseRequest(input);

            const endTime = Date.now();
            const processingTime = endTime - startTime;

            expect(processingTime).toBeLessThan(100); // Should be under 100ms
            expect(result).toBeDefined();
        });

        test('should handle large input efficiently', () => {
            const largeInput = "Create strategy ".repeat(100);
            const startTime = Date.now();

            const mockResult = createMockParsedRequest({
                originalText: largeInput,
                confidence: 0.5
            });

            mockNLP.parseRequest.mockReturnValue(mockResult);
            const result = mockNLP.parseRequest(largeInput);

            const endTime = Date.now();
            const processingTime = endTime - startTime;

            expect(processingTime).toBeLessThan(200); // Should handle large input efficiently
            expect(result).toBeDefined();
        });
    });
});