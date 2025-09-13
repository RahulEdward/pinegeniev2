/**
 * AI Strategy Service
 * Enhanced AI service that connects to ChatGPT for intelligent strategy generation
 */

import { N8nNodeData } from '../ui/N8nNode';

interface StrategyRequest {
  userInput: string;
  context?: string;
}

interface StrategyResponse {
  nodes: N8nNodeData[];
  connections: any[];
  strategyName: string;
  explanation: string;
}

export class AIStrategyService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  }

  async generateStrategy(request: StrategyRequest): Promise<StrategyResponse> {
    try {
      // Call ChatGPT API for intelligent strategy analysis
      const aiResponse = await this.callChatGPT(request.userInput);
      
      // Parse AI response and generate nodes
      const strategy = this.parseAIResponse(aiResponse, request.userInput);
      
      return strategy;
    } catch (error) {
      console.error('AI Strategy Generation Error:', error);
      // Fallback to demo strategy
      return this.generateFallbackStrategy(request.userInput);
    }
  }

  private async callChatGPT(userInput: string): Promise<string> {
    const systemPrompt = `You are PineGenie AI, an expert Pine Script strategy builder with access to 18+ professional indicators.

Your task is to analyze trading strategy requests and return a JSON response with the following structure:

{
  "strategyName": "Strategy Name",
  "explanation": "Brief explanation of the strategy",
  "indicators": [
    {
      "type": "rsi|sma|ema|macd|bollinger|stochastic|atr|volume|williams_r|cci|adx|parabolic_sar|ichimoku|mfi|obv|aroon|vwma|keltner|price",
      "parameters": {"length": 14, "source": "close"},
      "description": "Indicator description"
    }
  ],
  "conditions": [
    {
      "type": "buy|sell",
      "logic": "greater_than|less_than|crosses_above|crosses_below",
      "threshold": 30,
      "description": "Condition description"
    }
  ],
  "riskManagement": {
    "stopLoss": "2%",
    "takeProfit": "4%",
    "positionSize": "25%"
  }
}

Available Professional Indicators:
- Basic: RSI, SMA, EMA, MACD, Bollinger Bands, Stochastic, ATR, Volume
- Advanced: Williams %R, CCI, ADX, Parabolic SAR, Ichimoku, MFI, OBV, Aroon, VWMA, Keltner Channels

Choose the most appropriate indicators for the requested strategy. Analyze this trading strategy request and provide a comprehensive JSON response:`;

    const response = await fetch('/api/ai-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
        modelId: 'gpt-4'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.content;
  }

  private parseAIResponse(aiResponse: string, userInput: string): StrategyResponse {
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return this.buildStrategyFromAI(parsedResponse);
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    // Fallback to keyword-based generation
    return this.generateFallbackStrategy(userInput);
  }

  private buildStrategyFromAI(aiData: any): StrategyResponse {
    const nodes: N8nNodeData[] = [];
    const connections: any[] = [];
    let nodeId = 1;

    // Add data source node
    const dataNode: N8nNodeData = {
      id: `data_${nodeId++}`,
      type: 'data',
      label: 'Market Data',
      description: 'BTCUSDT 1h data',
      config: { symbol: 'BTCUSDT', timeframe: '1h', source: 'close' },
      position: { x: 100, y: 100 }
    };
    nodes.push(dataNode);

    let yOffset = 50;
    let lastIndicatorId = dataNode.id;

    // Add indicator nodes
    if (aiData.indicators) {
      aiData.indicators.forEach((indicator: any, index: number) => {
        const indicatorNode: N8nNodeData = {
          id: `indicator_${nodeId++}`,
          type: 'indicator',
          label: this.getIndicatorLabel(indicator.type, indicator.parameters),
          description: indicator.description || `${indicator.type.toUpperCase()} indicator`,
          config: { 
            indicatorId: indicator.type, 
            parameters: indicator.parameters || {} 
          },
          position: { x: 350, y: yOffset + (index * 100) }
        };
        nodes.push(indicatorNode);

        // Connect to data source
        connections.push({
          id: `conn_${connections.length + 1}`,
          source: dataNode.id,
          target: indicatorNode.id
        });

        lastIndicatorId = indicatorNode.id;
      });
    }

    // Add condition and action nodes
    if (aiData.conditions) {
      aiData.conditions.forEach((condition: any, index: number) => {
        const conditionNode: N8nNodeData = {
          id: `condition_${nodeId++}`,
          type: 'condition',
          label: `${condition.type.toUpperCase()} Condition`,
          description: condition.description || `${condition.type} signal`,
          config: { 
            operator: condition.logic, 
            threshold: condition.threshold 
          },
          position: { x: 600, y: yOffset + (index * 100) }
        };
        nodes.push(conditionNode);

        const actionNode: N8nNodeData = {
          id: `action_${nodeId++}`,
          type: 'action',
          label: `${condition.type.toUpperCase()} Order`,
          description: `Execute ${condition.type} order`,
          config: { 
            orderType: 'market', 
            quantity: aiData.riskManagement?.positionSize || '25%' 
          },
          position: { x: 850, y: yOffset + (index * 100) }
        };
        nodes.push(actionNode);

        // Connect indicator to condition to action
        connections.push({
          id: `conn_${connections.length + 1}`,
          source: lastIndicatorId,
          target: conditionNode.id
        });

        connections.push({
          id: `conn_${connections.length + 1}`,
          source: conditionNode.id,
          target: actionNode.id
        });
      });
    }

    return {
      nodes,
      connections,
      strategyName: aiData.strategyName || 'AI Generated Strategy',
      explanation: aiData.explanation || 'Strategy generated by PineGenie AI'
    };
  }

  private getIndicatorLabel(type: string, parameters: any): string {
    switch (type) {
      case 'rsi':
        return `RSI (${parameters.length || 14})`;
      case 'sma':
        return `SMA (${parameters.length || 20})`;
      case 'ema':
        return `EMA (${parameters.length || 20})`;
      case 'macd':
        return `MACD (${parameters.fast || 12},${parameters.slow || 26},${parameters.signal || 9})`;
      case 'bollinger':
        return `Bollinger Bands (${parameters.length || 20})`;
      case 'stochastic':
        return `Stochastic (${parameters.k || 14},${parameters.d || 3})`;
      case 'atr':
        return `ATR (${parameters.length || 14})`;
      case 'volume':
        return 'Volume';
      case 'williams_r':
        return `Williams %R (${parameters.period || 14})`;
      case 'cci':
        return `CCI (${parameters.period || 20})`;
      case 'adx':
        return `ADX (${parameters.period || 14})`;
      case 'parabolic_sar':
        return 'Parabolic SAR';
      case 'ichimoku':
        return `Ichimoku (${parameters.tenkan || 9},${parameters.kijun || 26},${parameters.senkou || 52})`;
      case 'mfi':
        return `MFI (${parameters.period || 14})`;
      case 'obv':
        return 'OBV';
      case 'aroon':
        return `Aroon (${parameters.period || 14})`;
      case 'vwma':
        return `VWMA (${parameters.period || 20})`;
      case 'keltner':
        return `Keltner Channels (${parameters.period || 20})`;
      case 'price':
        return 'Price Action';
      default:
        return type.toUpperCase();
    }
  }

  private generateFallbackStrategy(userInput: string): StrategyResponse {
    const input = userInput.toLowerCase();
    
    if (input.includes('rsi')) {
      return this.generateRSIStrategy();
    } else if (input.includes('macd')) {
      return this.generateMACDStrategy();
    } else if (input.includes('bollinger')) {
      return this.generateBollingerStrategy();
    } else if (input.includes('moving average') || input.includes('ma') || input.includes('sma')) {
      return this.generateMAStrategy();
    } else if (input.includes('stochastic')) {
      return this.generateStochasticStrategy();
    } else {
      return this.generateSimpleStrategy();
    }
  }

  private generateRSIStrategy(): StrategyResponse {
    const nodes: N8nNodeData[] = [
      {
        id: 'data_1',
        type: 'data',
        label: 'Market Data',
        description: 'BTCUSDT 1h data',
        config: { symbol: 'BTCUSDT', timeframe: '1h', source: 'close' },
        position: { x: 100, y: 100 }
      },
      {
        id: 'rsi_1',
        type: 'indicator',
        label: 'RSI (14)',
        description: 'Relative Strength Index',
        config: { indicatorId: 'rsi', parameters: { length: 14, source: 'close' } },
        position: { x: 350, y: 100 }
      },
      {
        id: 'buy_condition',
        type: 'condition',
        label: 'RSI < 30',
        description: 'Buy when oversold',
        config: { operator: 'less_than', threshold: 30 },
        position: { x: 600, y: 50 }
      },
      {
        id: 'sell_condition',
        type: 'condition',
        label: 'RSI > 70',
        description: 'Sell when overbought',
        config: { operator: 'greater_than', threshold: 70 },
        position: { x: 600, y: 150 }
      },
      {
        id: 'buy_action',
        type: 'action',
        label: 'Buy Order',
        description: 'Execute buy order',
        config: { orderType: 'market', quantity: '25%' },
        position: { x: 850, y: 50 }
      },
      {
        id: 'sell_action',
        type: 'action',
        label: 'Sell Order',
        description: 'Execute sell order',
        config: { orderType: 'market', quantity: '100%' },
        position: { x: 850, y: 150 }
      }
    ];

    const connections = [
      { id: 'conn_1', source: 'data_1', target: 'rsi_1' },
      { id: 'conn_2', source: 'rsi_1', target: 'buy_condition' },
      { id: 'conn_3', source: 'rsi_1', target: 'sell_condition' },
      { id: 'conn_4', source: 'buy_condition', target: 'buy_action' },
      { id: 'conn_5', source: 'sell_condition', target: 'sell_action' }
    ];

    return {
      nodes,
      connections,
      strategyName: 'RSI Mean Reversion Strategy',
      explanation: 'A classic mean reversion strategy using RSI oversold/overbought levels'
    };
  }

  private generateMACDStrategy(): StrategyResponse {
    const nodes: N8nNodeData[] = [
      {
        id: 'data_1',
        type: 'data',
        label: 'Market Data',
        description: 'BTCUSDT 1h data',
        config: { symbol: 'BTCUSDT', timeframe: '1h', source: 'close' },
        position: { x: 100, y: 100 }
      },
      {
        id: 'macd_1',
        type: 'indicator',
        label: 'MACD (12,26,9)',
        description: 'MACD Oscillator',
        config: { indicatorId: 'macd', parameters: { fast: 12, slow: 26, signal: 9 } },
        position: { x: 350, y: 100 }
      },
      {
        id: 'buy_condition',
        type: 'condition',
        label: 'MACD Bullish Cross',
        description: 'MACD line crosses above signal',
        config: { operator: 'crosses_above', threshold: 0 },
        position: { x: 600, y: 50 }
      },
      {
        id: 'sell_condition',
        type: 'condition',
        label: 'MACD Bearish Cross',
        description: 'MACD line crosses below signal',
        config: { operator: 'crosses_below', threshold: 0 },
        position: { x: 600, y: 150 }
      },
      {
        id: 'buy_action',
        type: 'action',
        label: 'Buy Order',
        description: 'Execute buy order',
        config: { orderType: 'market', quantity: '50%' },
        position: { x: 850, y: 50 }
      },
      {
        id: 'sell_action',
        type: 'action',
        label: 'Sell Order',
        description: 'Execute sell order',
        config: { orderType: 'market', quantity: '100%' },
        position: { x: 850, y: 150 }
      }
    ];

    const connections = [
      { id: 'conn_1', source: 'data_1', target: 'macd_1' },
      { id: 'conn_2', source: 'macd_1', target: 'buy_condition' },
      { id: 'conn_3', source: 'macd_1', target: 'sell_condition' },
      { id: 'conn_4', source: 'buy_condition', target: 'buy_action' },
      { id: 'conn_5', source: 'sell_condition', target: 'sell_action' }
    ];

    return {
      nodes,
      connections,
      strategyName: 'MACD Crossover Strategy',
      explanation: 'Trend-following strategy based on MACD signal line crossovers'
    };
  }

  private generateBollingerStrategy(): StrategyResponse {
    const nodes: N8nNodeData[] = [
      {
        id: 'data_1',
        type: 'data',
        label: 'Market Data',
        description: 'BTCUSDT 1h data',
        config: { symbol: 'BTCUSDT', timeframe: '1h', source: 'close' },
        position: { x: 100, y: 100 }
      },
      {
        id: 'bb_1',
        type: 'indicator',
        label: 'Bollinger Bands (20)',
        description: 'Bollinger Bands',
        config: { indicatorId: 'bollinger', parameters: { length: 20, mult: 2 } },
        position: { x: 350, y: 100 }
      },
      {
        id: 'buy_condition',
        type: 'condition',
        label: 'Price < Lower Band',
        description: 'Buy when price touches lower band',
        config: { operator: 'less_than', threshold: 'lower_band' },
        position: { x: 600, y: 50 }
      },
      {
        id: 'sell_condition',
        type: 'condition',
        label: 'Price > Upper Band',
        description: 'Sell when price touches upper band',
        config: { operator: 'greater_than', threshold: 'upper_band' },
        position: { x: 600, y: 150 }
      },
      {
        id: 'buy_action',
        type: 'action',
        label: 'Buy Order',
        description: 'Execute buy order',
        config: { orderType: 'market', quantity: '30%' },
        position: { x: 850, y: 50 }
      },
      {
        id: 'sell_action',
        type: 'action',
        label: 'Sell Order',
        description: 'Execute sell order',
        config: { orderType: 'market', quantity: '100%' },
        position: { x: 850, y: 150 }
      }
    ];

    const connections = [
      { id: 'conn_1', source: 'data_1', target: 'bb_1' },
      { id: 'conn_2', source: 'bb_1', target: 'buy_condition' },
      { id: 'conn_3', source: 'bb_1', target: 'sell_condition' },
      { id: 'conn_4', source: 'buy_condition', target: 'buy_action' },
      { id: 'conn_5', source: 'sell_condition', target: 'sell_action' }
    ];

    return {
      nodes,
      connections,
      strategyName: 'Bollinger Bands Mean Reversion',
      explanation: 'Mean reversion strategy using Bollinger Bands extremes'
    };
  }

  private generateMAStrategy(): StrategyResponse {
    const nodes: N8nNodeData[] = [
      {
        id: 'data_1',
        type: 'data',
        label: 'Market Data',
        description: 'BTCUSDT 1h data',
        config: { symbol: 'BTCUSDT', timeframe: '1h', source: 'close' },
        position: { x: 100, y: 100 }
      },
      {
        id: 'sma_fast',
        type: 'indicator',
        label: 'SMA (10)',
        description: 'Fast moving average',
        config: { indicatorId: 'sma', parameters: { length: 10, source: 'close' } },
        position: { x: 350, y: 50 }
      },
      {
        id: 'sma_slow',
        type: 'indicator',
        label: 'SMA (20)',
        description: 'Slow moving average',
        config: { indicatorId: 'sma', parameters: { length: 20, source: 'close' } },
        position: { x: 350, y: 150 }
      },
      {
        id: 'crossover_up',
        type: 'condition',
        label: 'MA Cross Up',
        description: 'Fast MA crosses above slow MA',
        config: { operator: 'crosses_above' },
        position: { x: 600, y: 50 }
      },
      {
        id: 'crossover_down',
        type: 'condition',
        label: 'MA Cross Down',
        description: 'Fast MA crosses below slow MA',
        config: { operator: 'crosses_below' },
        position: { x: 600, y: 150 }
      },
      {
        id: 'buy_action',
        type: 'action',
        label: 'Buy Order',
        description: 'Execute buy order',
        config: { orderType: 'market', quantity: '50%' },
        position: { x: 850, y: 50 }
      },
      {
        id: 'sell_action',
        type: 'action',
        label: 'Sell Order',
        description: 'Execute sell order',
        config: { orderType: 'market', quantity: '100%' },
        position: { x: 850, y: 150 }
      }
    ];

    const connections = [
      { id: 'conn_1', source: 'data_1', target: 'sma_fast' },
      { id: 'conn_2', source: 'data_1', target: 'sma_slow' },
      { id: 'conn_3', source: 'sma_fast', target: 'crossover_up' },
      { id: 'conn_4', source: 'sma_slow', target: 'crossover_up' },
      { id: 'conn_5', source: 'sma_fast', target: 'crossover_down' },
      { id: 'conn_6', source: 'sma_slow', target: 'crossover_down' },
      { id: 'conn_7', source: 'crossover_up', target: 'buy_action' },
      { id: 'conn_8', source: 'crossover_down', target: 'sell_action' }
    ];

    return {
      nodes,
      connections,
      strategyName: 'Moving Average Crossover',
      explanation: 'Classic trend-following strategy using moving average crossovers'
    };
  }

  private generateStochasticStrategy(): StrategyResponse {
    const nodes: N8nNodeData[] = [
      {
        id: 'data_1',
        type: 'data',
        label: 'Market Data',
        description: 'BTCUSDT 1h data',
        config: { symbol: 'BTCUSDT', timeframe: '1h', source: 'close' },
        position: { x: 100, y: 100 }
      },
      {
        id: 'stoch_1',
        type: 'indicator',
        label: 'Stochastic (14,3)',
        description: 'Stochastic Oscillator',
        config: { indicatorId: 'stochastic', parameters: { k: 14, d: 3, smooth: 3 } },
        position: { x: 350, y: 100 }
      },
      {
        id: 'buy_condition',
        type: 'condition',
        label: 'Stoch < 20',
        description: 'Buy when oversold',
        config: { operator: 'less_than', threshold: 20 },
        position: { x: 600, y: 50 }
      },
      {
        id: 'sell_condition',
        type: 'condition',
        label: 'Stoch > 80',
        description: 'Sell when overbought',
        config: { operator: 'greater_than', threshold: 80 },
        position: { x: 600, y: 150 }
      },
      {
        id: 'buy_action',
        type: 'action',
        label: 'Buy Order',
        description: 'Execute buy order',
        config: { orderType: 'market', quantity: '25%' },
        position: { x: 850, y: 50 }
      },
      {
        id: 'sell_action',
        type: 'action',
        label: 'Sell Order',
        description: 'Execute sell order',
        config: { orderType: 'market', quantity: '100%' },
        position: { x: 850, y: 150 }
      }
    ];

    const connections = [
      { id: 'conn_1', source: 'data_1', target: 'stoch_1' },
      { id: 'conn_2', source: 'stoch_1', target: 'buy_condition' },
      { id: 'conn_3', source: 'stoch_1', target: 'sell_condition' },
      { id: 'conn_4', source: 'buy_condition', target: 'buy_action' },
      { id: 'conn_5', source: 'sell_condition', target: 'sell_action' }
    ];

    return {
      nodes,
      connections,
      strategyName: 'Stochastic Oscillator Strategy',
      explanation: 'Momentum strategy using Stochastic oscillator overbought/oversold levels'
    };
  }

  private generateSimpleStrategy(): StrategyResponse {
    const nodes: N8nNodeData[] = [
      {
        id: 'data_1',
        type: 'data',
        label: 'Market Data',
        description: 'BTCUSDT 1h data',
        config: { symbol: 'BTCUSDT', timeframe: '1h', source: 'close' },
        position: { x: 100, y: 100 }
      },
      {
        id: 'sma_1',
        type: 'indicator',
        label: 'SMA (20)',
        description: 'Simple moving average',
        config: { indicatorId: 'sma', parameters: { length: 20, source: 'close' } },
        position: { x: 350, y: 100 }
      },
      {
        id: 'condition_1',
        type: 'condition',
        label: 'Price > SMA',
        description: 'Price above moving average',
        config: { operator: 'greater_than', threshold: 'sma' },
        position: { x: 600, y: 100 }
      },
      {
        id: 'action_1',
        type: 'action',
        label: 'Buy Order',
        description: 'Execute buy order',
        config: { orderType: 'market', quantity: '25%' },
        position: { x: 850, y: 100 }
      }
    ];

    const connections = [
      { id: 'conn_1', source: 'data_1', target: 'sma_1' },
      { id: 'conn_2', source: 'sma_1', target: 'condition_1' },
      { id: 'conn_3', source: 'condition_1', target: 'action_1' }
    ];

    return {
      nodes,
      connections,
      strategyName: 'Simple Trend Following',
      explanation: 'Basic trend following strategy using price above moving average'
    };
  }
}