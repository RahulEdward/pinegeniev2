/**
 * Formatting Helpers
 * Utility functions for formatting data, text, and output in the AI system
 */

import { TradingIntent, StrategyBlueprint, StrategyComponent, ParameterSet } from '../../types';

/**
 * Format trading intent for display
 */
export function formatTradingIntent(intent: TradingIntent): string {
  const parts: string[] = [];
  
  parts.push(`Strategy Type: ${formatStrategyType(intent.strategyType)}`);
  
  if (intent.indicators.length > 0) {
    parts.push(`Indicators: ${intent.indicators.map(formatIndicatorName).join(', ')}`);
  }
  
  if (intent.conditions.length > 0) {
    parts.push(`Conditions: ${intent.conditions.join(', ')}`);
  }
  
  if (intent.actions.length > 0) {
    parts.push(`Actions: ${intent.actions.join(', ')}`);
  }
  
  if (intent.riskManagement.length > 0) {
    parts.push(`Risk Management: ${intent.riskManagement.join(', ')}`);
  }
  
  if (intent.timeframe) {
    parts.push(`Timeframe: ${formatTimeframe(intent.timeframe)}`);
  }
  
  parts.push(`Confidence: ${formatPercentage(intent.confidence)}`);
  
  return parts.join('\n');
}

/**
 * Format strategy type for display
 */
export function formatStrategyType(type: string): string {
  const typeMap: Record<string, string> = {
    'trend-following': 'Trend Following',
    'mean-reversion': 'Mean Reversion',
    'breakout': 'Breakout',
    'scalping': 'Scalping',
    'custom': 'Custom Strategy'
  };
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Format indicator name for display
 */
export function formatIndicatorName(indicator: string): string {
  const indicatorMap: Record<string, string> = {
    'rsi': 'RSI (Relative Strength Index)',
    'sma': 'SMA (Simple Moving Average)',
    'ema': 'EMA (Exponential Moving Average)',
    'macd': 'MACD (Moving Average Convergence Divergence)',
    'bollinger': 'Bollinger Bands',
    'stochastic': 'Stochastic Oscillator',
    'atr': 'ATR (Average True Range)',
    'adx': 'ADX (Average Directional Index)'
  };
  
  return indicatorMap[indicator.toLowerCase()] || indicator.toUpperCase();
}

/**
 * Format timeframe for display
 */
export function formatTimeframe(timeframe: string): string {
  const timeframeMap: Record<string, string> = {
    '1m': '1 Minute',
    '5m': '5 Minutes',
    '15m': '15 Minutes',
    '30m': '30 Minutes',
    '1h': '1 Hour',
    '4h': '4 Hours',
    '1d': '1 Day',
    '1w': '1 Week',
    '1M': '1 Month'
  };
  
  return timeframeMap[timeframe] || timeframe;
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency = 'USD', decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format large numbers with appropriate suffixes
 */
export function formatNumber(value: number, decimals = 2): string {
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  let suffixIndex = 0;
  let formattedValue = value;
  
  while (Math.abs(formattedValue) >= 1000 && suffixIndex < suffixes.length - 1) {
    formattedValue /= 1000;
    suffixIndex++;
  }
  
  return `${formattedValue.toFixed(decimals)}${suffixes[suffixIndex]}`;
}

/**
 * Format duration in milliseconds to human readable
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = milliseconds / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  
  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${minutes.toFixed(1)}m`;
  }
  
  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
}

/**
 * Format strategy blueprint for display
 */
export function formatStrategyBlueprint(blueprint: StrategyBlueprint): string {
  const lines: string[] = [];
  
  lines.push(`# ${blueprint.name}`);
  lines.push('');
  lines.push(blueprint.description);
  lines.push('');
  
  lines.push('## Components:');
  blueprint.components.forEach((component, index) => {
    lines.push(`${index + 1}. ${formatStrategyComponent(component)}`);
  });
  
  if (blueprint.parameters && Object.keys(blueprint.parameters).length > 0) {
    lines.push('');
    lines.push('## Parameters:');
    lines.push(formatParameterSet(blueprint.parameters));
  }
  
  if (blueprint.riskProfile) {
    lines.push('');
    lines.push('## Risk Profile:');
    lines.push(`- Risk Level: ${blueprint.riskProfile.level || 'Medium'}`);
    lines.push(`- Max Drawdown: ${formatPercentage(blueprint.riskProfile.maxDrawdown || 0.1)}`);
    lines.push(`- Risk per Trade: ${formatPercentage(blueprint.riskProfile.riskPerTrade || 0.02)}`);
  }
  
  return lines.join('\n');
}

/**
 * Format strategy component for display
 */
export function formatStrategyComponent(component: StrategyComponent): string {
  const typeLabel = formatComponentType(component.type);
  const subtypeLabel = formatComponentSubtype(component.subtype);
  
  let result = `${typeLabel}: ${subtypeLabel}`;
  
  if (component.parameters && Object.keys(component.parameters).length > 0) {
    const paramStrings = Object.entries(component.parameters)
      .map(([key, value]) => `${key}=${formatParameterValue(value)}`)
      .join(', ');
    result += ` (${paramStrings})`;
  }
  
  if (component.priority !== undefined) {
    result += ` [Priority: ${component.priority}]`;
  }
  
  return result;
}

/**
 * Format component type for display
 */
export function formatComponentType(type: string): string {
  const typeMap: Record<string, string> = {
    'data-source': 'Data Source',
    'indicator': 'Indicator',
    'condition': 'Condition',
    'action': 'Action',
    'risk': 'Risk Management',
    'timing': 'Timing'
  };
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Format component subtype for display
 */
export function formatComponentSubtype(subtype: string): string {
  const subtypeMap: Record<string, string> = {
    // Data sources
    'market_data': 'Market Data',
    'custom_data': 'Custom Data',
    
    // Indicators
    'rsi': 'RSI',
    'sma': 'Simple Moving Average',
    'ema': 'Exponential Moving Average',
    'macd': 'MACD',
    'bollinger_bands': 'Bollinger Bands',
    'stochastic': 'Stochastic Oscillator',
    
    // Conditions
    'greater_than': 'Greater Than',
    'less_than': 'Less Than',
    'equal_to': 'Equal To',
    'crosses_above': 'Crosses Above',
    'crosses_below': 'Crosses Below',
    'in_range': 'In Range',
    
    // Actions
    'buy': 'Buy Order',
    'sell': 'Sell Order',
    'close_position': 'Close Position',
    
    // Risk management
    'stop_loss': 'Stop Loss',
    'take_profit': 'Take Profit',
    'position_sizing': 'Position Sizing',
    'max_risk': 'Maximum Risk'
  };
  
  return subtypeMap[subtype] || subtype.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format parameter set for display
 */
export function formatParameterSet(parameters: ParameterSet): string {
  const lines: string[] = [];
  
  Object.entries(parameters).forEach(([key, value]) => {
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const formattedValue = formatParameterValue(value);
    lines.push(`- ${formattedKey}: ${formattedValue}`);
  });
  
  return lines.join('\n');
}

/**
 * Format parameter value based on type
 */
export function formatParameterValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'Not set';
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (typeof value === 'number') {
    // Check if it's a percentage (between 0 and 1)
    if (value >= 0 && value <= 1 && value !== Math.floor(value)) {
      return formatPercentage(value);
    }
    
    // Check if it's a large number
    if (Math.abs(value) >= 1000) {
      return formatNumber(value);
    }
    
    // Regular number formatting
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (Array.isArray(value)) {
    return value.map(formatParameterValue).join(', ');
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  
  return String(value);
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) {
    return 'No errors found.';
  }
  
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
}

/**
 * Format code snippet with syntax highlighting markers
 */
export function formatCodeSnippet(code: string, language = 'pinescript'): string {
  const lines = code.split('\n');
  const formattedLines = lines.map((line, index) => {
    const lineNumber = (index + 1).toString().padStart(3, ' ');
    return `${lineNumber} | ${line}`;
  });
  
  return `\`\`\`${language}\n${formattedLines.join('\n')}\n\`\`\``;
}

/**
 * Format explanation text with proper structure
 */
export function formatExplanation(title: string, content: string, details?: string[]): string {
  const lines: string[] = [];
  
  lines.push(`## ${title}`);
  lines.push('');
  lines.push(content);
  
  if (details && details.length > 0) {
    lines.push('');
    lines.push('### Details:');
    details.forEach(detail => {
      lines.push(`- ${detail}`);
    });
  }
  
  return lines.join('\n');
}

/**
 * Format performance metrics
 */
export function formatPerformanceMetrics(metrics: Record<string, number>): string {
  const lines: string[] = [];
  
  Object.entries(metrics).forEach(([key, value]) => {
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    let formattedValue: string;
    
    // Format based on metric type
    if (key.includes('time') || key.includes('duration')) {
      formattedValue = formatDuration(value);
    } else if (key.includes('percentage') || key.includes('rate')) {
      formattedValue = formatPercentage(value / 100);
    } else if (key.includes('count') || key.includes('size')) {
      formattedValue = formatNumber(value, 0);
    } else {
      formattedValue = formatNumber(value);
    }
    
    lines.push(`${formattedKey}: ${formattedValue}`);
  });
  
  return lines.join('\n');
}

/**
 * Format list with proper numbering or bullets
 */
export function formatList(items: string[], numbered = false): string {
  return items.map((item, index) => {
    const prefix = numbered ? `${index + 1}.` : '-';
    return `${prefix} ${item}`;
  }).join('\n');
}

/**
 * Format table from data
 */
export function formatTable(headers: string[], rows: string[][]): string {
  const columnWidths = headers.map((header, index) => {
    const maxRowWidth = Math.max(...rows.map(row => (row[index] || '').length));
    return Math.max(header.length, maxRowWidth);
  });
  
  const formatRow = (row: string[]) => {
    return '| ' + row.map((cell, index) => 
      (cell || '').padEnd(columnWidths[index])
    ).join(' | ') + ' |';
  };
  
  const separator = '|' + columnWidths.map(width => 
    '-'.repeat(width + 2)
  ).join('|') + '|';
  
  const lines: string[] = [];
  lines.push(formatRow(headers));
  lines.push(separator);
  rows.forEach(row => lines.push(formatRow(row)));
  
  return lines.join('\n');
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Convert camelCase to readable text
 */
export function camelCaseToReadable(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Format file size in bytes to human readable
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}