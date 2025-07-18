import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { 
  Book, X, ChevronRight, ChevronDown, Play, Code, Zap, 
  BarChart3, GitBranch, Shield, Calculator, Timer, 
  CheckCircle, AlertTriangle, Info, Star, Target,
  TrendingUp, Activity, Lightbulb, Award, Users
} from 'lucide-react';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ManualSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  level: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  content: ManualContent[];
}

interface ManualContent {
  type: 'text' | 'list' | 'code' | 'example' | 'tip' | 'warning' | 'image';
  content: string | string[];
  title?: string;
}

const UserManual: React.FC<UserManualProps> = ({ isOpen, onClose }) => {
  const { colors } = useTheme();
  const [activeSection, setActiveSection] = useState('getting-started');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const manualSections: ManualSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Play className="w-5 h-5" />,
      level: 'beginner',
      content: [
        {
          type: 'text',
          title: 'Welcome to PineGenie Pro',
          content: 'PineGenie is a visual drag-and-drop builder that creates professional Pine Script strategies for TradingView without any coding knowledge required.'
        },
        {
          type: 'text',
          title: 'What is Pine Script?',
          content: 'Pine Script is TradingView\'s programming language for creating custom indicators and trading strategies. It only runs inside TradingView - our job is to generate perfect Pine Script code that you can copy and paste into TradingView.'
        },
        {
          type: 'list',
          title: 'What You Can Build:',
          content: [
            'Custom trading indicators (RSI, MACD, Moving Averages)',
            'Buy and sell signal strategies',
            'Risk management systems with stop losses',
            'Complex multi-condition trading logic',
            'Professional backtesting strategies'
          ]
        },
        {
          type: 'tip',
          content: 'No coding experience needed! Our visual builder handles all the Pine Script generation for you.'
        }
      ]
    },
    {
      id: 'interface-overview',
      title: 'Interface Overview',
      icon: <BarChart3 className="w-5 h-5" />,
      level: 'beginner',
      content: [
        {
          type: 'text',
          title: 'Main Components',
          content: 'The PineGenie interface consists of three main areas: the Component Sidebar (left), the Visual Canvas (center), and the Strategy Status Panel (right).'
        },
        {
          type: 'list',
          title: 'Component Sidebar (Left):',
          content: [
            'Data Sources - Price and volume data inputs',
            'Technical Analysis - Indicators like RSI, MACD, Moving Averages',
            'Conditions - Trading logic and decision points',
            'Actions - Buy/sell orders and position management',
            'Risk Management - Stop losses and take profits',
            'Math & Logic - Custom calculations and comparisons'
          ]
        },
        {
          type: 'list',
          title: 'Visual Canvas (Center):',
          content: [
            'Drag and drop components from sidebar',
            'Connect components with visual links',
            'Configure each component by clicking on it',
            'See your strategy flow visually',
            'Real-time validation and error checking'
          ]
        },
        {
          type: 'list',
          title: 'Strategy Status Panel (Right):',
          content: [
            'Real-time strategy validation',
            'Error and warning indicators',
            'Component count breakdown',
            'Strategy completeness status'
          ]
        },
        {
          type: 'list',
          title: 'Top Toolbar:',
          content: [
            'Generate Script - Creates Pine Script code',
            'Save Strategy - Saves your work',
            'Clear Canvas - Removes all components',
            'Theme Toggle - Switch between light/dark mode',
            'Zoom Controls - Adjust canvas view'
          ]
        }
      ]
    },
    {
      id: 'building-first-strategy',
      title: 'Building Your First Strategy',
      icon: <Zap className="w-5 h-5" />,
      level: 'beginner',
      content: [
        {
          type: 'text',
          title: 'Step-by-Step Tutorial: RSI Strategy',
          content: 'Let\'s build a simple RSI (Relative Strength Index) strategy that buys when RSI is oversold and sells when overbought.'
        },
        {
          type: 'example',
          title: 'Step 1: Add Price Data',
          content: '1. Click "Data Sources" in the sidebar\n2. Click "Price Data" to add it to canvas\n3. This provides OHLCV data that TradingView will handle'
        },
        {
          type: 'example',
          title: 'Step 2: Add RSI Indicator',
          content: '1. Click "Technical Analysis" tab\n2. Click "RSI" to add RSI indicator\n3. Click on the RSI node to configure (period: 14, overbought: 70, oversold: 30)'
        },
        {
          type: 'example',
          title: 'Step 3: Add Trading Conditions',
          content: '1. Click "Conditions" tab\n2. Add "Price Crossover" for buy condition\n3. Add another "Price Crossover" for sell condition\n4. Configure thresholds (30 for oversold, 70 for overbought)'
        },
        {
          type: 'example',
          title: 'Step 4: Add Trading Actions',
          content: '1. Click "Actions" tab\n2. Add "Buy Order" for long entries\n3. Add "Sell Order" for exits\n4. Configure order types and position sizes'
        },
        {
          type: 'example',
          title: 'Step 5: Connect Components',
          content: '1. Drag from Price Data to RSI\n2. Drag from RSI to both conditions\n3. Drag from buy condition to buy action\n4. Drag from sell condition to sell action'
        },
        {
          type: 'example',
          title: 'Step 6: Generate Pine Script',
          content: '1. Check Strategy Status shows "Ready"\n2. Click "Generate Script" button\n3. Perfect Pine Script code is copied to clipboard\n4. Paste into TradingView Pine Editor'
        },
        {
          type: 'tip',
          content: 'Always check the Strategy Status panel - it will guide you if anything is missing!'
        }
      ]
    },
    {
      id: 'components-guide',
      title: 'Components Guide',
      icon: <GitBranch className="w-5 h-5" />,
      level: 'intermediate',
      content: [
        {
          type: 'text',
          title: 'Understanding Each Component Type',
          content: 'Each component serves a specific purpose in your trading strategy. Here\'s a detailed breakdown:'
        },
        {
          type: 'list',
          title: '🔵 Data Sources:',
          content: [
            'Price Data - OHLCV candlestick data (handled by TradingView)',
            'Volume Data - Trading volume information',
            'Always start your strategy with a data source',
            'TradingView automatically provides the data - you just define the logic'
          ]
        },
        {
          type: 'list',
          title: '🟢 Technical Indicators:',
          content: [
            'RSI - Momentum oscillator (14 period default, 30/70 levels)',
            'Moving Average - Trend following (SMA/EMA, customizable periods)',
            'MACD - Trend and momentum (12/26/9 default settings)',
            'Bollinger Bands - Volatility indicator (20 period, 2 std dev)',
            'Stochastic - Momentum oscillator for overbought/oversold'
          ]
        },
        {
          type: 'list',
          title: '🟠 Conditions:',
          content: [
            'Price Crossover - When one value crosses above/below another',
            'Breakout - When price breaks support/resistance levels',
            'Divergence - When price and indicator move in opposite directions',
            'Pattern Match - Recognition of chart patterns',
            'Threshold - When indicator reaches specific levels'
          ]
        },
        {
          type: 'list',
          title: '🔴 Actions:',
          content: [
            'Buy Order - Enter long positions (market/limit orders)',
            'Sell Order - Enter short positions or close longs',
            'Close Position - Exit current trades',
            'Alert - Send notifications (TradingView alerts)',
            'Position sizing and order management'
          ]
        },
        {
          type: 'list',
          title: '🟡 Risk Management:',
          content: [
            'Stop Loss - Limit losses (percentage or fixed amount)',
            'Take Profit - Lock in profits at target levels',
            'Position Size - Calculate optimal trade size',
            'Risk/Reward ratios and money management'
          ]
        },
        {
          type: 'warning',
          content: 'Always include risk management in your strategies! Never trade without stop losses.'
        }
      ]
    },
    {
      id: 'advanced-strategies',
      title: 'Advanced Strategy Building',
      icon: <TrendingUp className="w-5 h-5" />,
      level: 'advanced',
      content: [
        {
          type: 'text',
          title: 'Complex Multi-Indicator Strategies',
          content: 'Learn to combine multiple indicators and conditions for sophisticated trading systems.'
        },
        {
          type: 'example',
          title: 'Multi-Timeframe Strategy Example:',
          content: '1. Use multiple moving averages (10, 20, 50 periods)\n2. Add RSI for momentum confirmation\n3. Include volume analysis\n4. Set multiple conditions for entry/exit\n5. Implement trailing stops'
        },
        {
          type: 'list',
          title: 'Advanced Techniques:',
          content: [
            'Combining trend and momentum indicators',
            'Using multiple timeframe analysis',
            'Creating custom indicator combinations',
            'Building mean reversion strategies',
            'Implementing breakout systems',
            'Adding volume confirmation',
            'Creating complex exit strategies'
          ]
        },
        {
          type: 'example',
          title: 'Professional Strategy Template:',
          content: 'Data → Primary Indicator → Secondary Indicator → Volume Filter → Entry Condition → Risk Management → Exit Strategy'
        },
        {
          type: 'tip',
          content: 'Test simple strategies first, then gradually add complexity. More indicators don\'t always mean better performance!'
        }
      ]
    },
    {
      id: 'error-handling',
      title: 'Error Handling & Troubleshooting',
      icon: <AlertTriangle className="w-5 h-5" />,
      level: 'intermediate',
      content: [
        {
          type: 'text',
          title: 'Understanding Validation Messages',
          content: 'PineGenie\'s zero-error system prevents bad Pine Script generation by catching issues early.'
        },
        {
          type: 'list',
          title: 'Common Errors and Solutions:',
          content: [
            '❌ "Strategy must have at least one data source" → Add Price Data or Volume Data',
            '❌ "Missing indicator ID" → Click on indicator node and configure properly',
            '❌ "Disconnected nodes found" → Connect all nodes with links',
            '❌ "Circular dependency detected" → Remove loops in your connections',
            '❌ "Invalid parameter values" → Check indicator settings are within valid ranges'
          ]
        },
        {
          type: 'list',
          title: 'Warning Messages (Strategy still works):',
          content: [
            '⚠️ "Strategy has no trading actions" → Add buy/sell orders',
            '⚠️ "No risk management defined" → Add stop loss/take profit',
            '⚠️ "Node not connected" → Connect isolated nodes',
            '⚠️ "Using default parameters" → Customize indicator settings'
          ]
        },
        {
          type: 'list',
          title: 'Strategy Status Indicators:',
          content: [
            '🟢 Ready - Strategy is complete and valid',
            '🟡 Warning - Strategy works but has recommendations',
            '🔴 Error - Strategy incomplete, fix required',
            '🔵 Empty - No components added yet'
          ]
        },
        {
          type: 'tip',
          content: 'Click on the Strategy Status to see detailed error explanations and fix suggestions!'
        }
      ]
    },
    {
      id: 'pine-script-integration',
      title: 'TradingView Integration',
      icon: <Code className="w-5 h-5" />,
      level: 'intermediate',
      content: [
        {
          type: 'text',
          title: 'From PineGenie to TradingView',
          content: 'Learn how to use your generated Pine Script code in TradingView for backtesting and live trading.'
        },
        {
          type: 'example',
          title: 'Step-by-Step Integration:',
          content: '1. Build strategy in PineGenie\n2. Click "Generate Script"\n3. Copy the generated Pine Script code\n4. Open TradingView Pine Editor\n5. Paste code and click "Add to Chart"\n6. Backtest and optimize in TradingView'
        },
        {
          type: 'list',
          title: 'Generated Code Features:',
          content: [
            'Pine Script v6 compatibility',
            'Professional code formatting',
            'Comprehensive comments and documentation',
            'Optimized performance',
            'Error-free syntax guaranteed',
            'Best practices implementation'
          ]
        },
        {
          type: 'list',
          title: 'TradingView Features You Get:',
          content: [
            'Historical backtesting with real data',
            'Strategy performance metrics',
            'Profit/loss analysis',
            'Drawdown calculations',
            'Live trading alerts',
            'Paper trading simulation'
          ]
        },
        {
          type: 'code',
          title: 'Example Generated Code Structure:',
          content: '//@version=6\nstrategy("PineGenie Strategy", overlay=true)\n\n// Strategy Inputs\nrsi_period = input.int(14, "RSI Period")\n\n// Technical Indicators\nrsi = ta.rsi(close, rsi_period)\n\n// Trading Logic\nlongCondition = rsi < 30\nif longCondition\n    strategy.entry("Long", strategy.long)\n\n// Plots\nplot(rsi, "RSI", color=color.purple)'
        },
        {
          type: 'warning',
          content: 'Always backtest your strategies thoroughly before using real money!'
        }
      ]
    },
    {
      id: 'best-practices',
      title: 'Best Practices & Tips',
      icon: <Star className="w-5 h-5" />,
      level: 'pro',
      content: [
        {
          type: 'text',
          title: 'Professional Strategy Development',
          content: 'Follow these best practices to create robust, profitable trading strategies.'
        },
        {
          type: 'list',
          title: '🎯 Strategy Design Principles:',
          content: [
            'Start simple - test basic concepts before adding complexity',
            'Always include risk management (stop losses, position sizing)',
            'Use multiple timeframe confirmation',
            'Combine trend and momentum indicators',
            'Test on different market conditions',
            'Keep risk per trade under 2% of capital'
          ]
        },
        {
          type: 'list',
          title: '📊 Backtesting Guidelines:',
          content: [
            'Test on at least 2+ years of data',
            'Include transaction costs and slippage',
            'Test on different market phases (bull, bear, sideways)',
            'Look for consistent performance across time periods',
            'Avoid over-optimization (curve fitting)',
            'Focus on risk-adjusted returns, not just profits'
          ]
        },
        {
          type: 'list',
          title: '⚡ Performance Optimization:',
          content: [
            'Use appropriate indicator periods for your timeframe',
            'Avoid too many indicators (analysis paralysis)',
            'Set realistic profit targets and stop losses',
            'Consider market volatility in your parameters',
            'Regular strategy review and adjustment',
            'Keep detailed trading logs'
          ]
        },
        {
          type: 'list',
          title: '🛡️ Risk Management Rules:',
          content: [
            'Never risk more than 1-2% per trade',
            'Use position sizing based on volatility',
            'Set stop losses before entering trades',
            'Diversify across different strategies/markets',
            'Have maximum daily/monthly loss limits',
            'Regular portfolio rebalancing'
          ]
        },
        {
          type: 'tip',
          content: 'The best strategy is one you can stick to consistently. Simplicity often beats complexity in trading!'
        }
      ]
    },
    {
      id: 'examples-library',
      title: 'Strategy Examples',
      icon: <Activity className="w-5 h-5" />,
      level: 'beginner',
      content: [
        {
          type: 'text',
          title: 'Ready-to-Use Strategy Examples',
          content: 'Learn from these proven strategy templates that you can build and customize.'
        },
        {
          type: 'example',
          title: '📈 RSI Mean Reversion Strategy:',
          content: 'Components: Price Data → RSI(14) → Oversold Condition(30) → Buy Order\nLogic: Buy when RSI < 30, Sell when RSI > 70\nBest for: Ranging markets, crypto, forex\nRisk Level: Medium'
        },
        {
          type: 'example',
          title: '📊 Moving Average Crossover:',
          content: 'Components: Price Data → SMA(10) + SMA(20) → Crossover Condition → Buy/Sell Orders\nLogic: Buy when fast MA crosses above slow MA\nBest for: Trending markets, stocks, indices\nRisk Level: Medium'
        },
        {
          type: 'example',
          title: '💥 Bollinger Bands Breakout:',
          content: 'Components: Price Data → Bollinger Bands(20,2) → Breakout Conditions → Buy/Sell Orders\nLogic: Buy on upper band breakout, Sell on lower band breakout\nBest for: Volatile markets, news events\nRisk Level: High'
        },
        {
          type: 'example',
          title: '🎯 MACD Momentum Strategy:',
          content: 'Components: Price Data → MACD(12,26,9) → Signal Crossover → Buy/Sell Orders\nLogic: Buy when MACD crosses above signal line\nBest for: Trending markets, medium-term trades\nRisk Level: Medium'
        },
        {
          type: 'example',
          title: '🛡️ Multi-Indicator Confirmation:',
          content: 'Components: Price Data → RSI + MACD + Volume → Multiple Conditions → Risk Management\nLogic: All indicators must align for trade entry\nBest for: High-probability setups\nRisk Level: Low-Medium'
        },
        {
          type: 'tip',
          content: 'Start with these examples and modify them to match your trading style and risk tolerance!'
        }
      ]
    },
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      icon: <Info className="w-5 h-5" />,
      level: 'beginner',
      content: [
        {
          type: 'text',
          title: 'Common Questions & Answers',
          content: 'Quick answers to the most frequently asked questions about PineGenie.'
        },
        {
          type: 'list',
          title: '❓ General Questions:',
          content: [
            'Q: Do I need coding experience? A: No! PineGenie is designed for non-coders.',
            'Q: Does PineGenie provide live data? A: No, TradingView handles all data and execution.',
            'Q: Can I backtest strategies? A: Yes, in TradingView after copying the generated code.',
            'Q: Is the generated code optimized? A: Yes, we generate professional Pine Script v6 code.',
            'Q: Can I modify the generated code? A: Yes, you can edit it in TradingView Pine Editor.'
          ]
        },
        {
          type: 'list',
          title: '🔧 Technical Questions:',
          content: [
            'Q: What Pine Script version? A: We generate Pine Script v6 (latest version).',
            'Q: Can I use custom indicators? A: Yes, through our Math & Logic components.',
            'Q: Does it work on mobile? A: Best experience on desktop, mobile support coming.',
            'Q: Can I save strategies? A: Yes, use the Save Strategy button.',
            'Q: How do I share strategies? A: Export the Pine Script code to share.'
          ]
        },
        {
          type: 'list',
          title: '💰 Trading Questions:',
          content: [
            'Q: Can I use this for live trading? A: Yes, through TradingView\'s execution.',
            'Q: What markets are supported? A: Any market available on TradingView.',
            'Q: Are there trading fees? A: TradingView handles all trading costs.',
            'Q: Can I paper trade first? A: Yes, TradingView offers paper trading.',
            'Q: How do I set up alerts? A: Configure alerts in TradingView after adding the strategy.'
          ]
        },
        {
          type: 'tip',
          content: 'Still have questions? Check our community forum or contact support!'
        }
      ]
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-orange-400';
      case 'pro': return 'text-red-400';
      default: return colors.text.tertiary;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner': return '🟢 Beginner';
      case 'intermediate': return '🟡 Intermediate';
      case 'advanced': return '🟠 Advanced';
      case 'pro': return '🔴 Pro';
      default: return level;
    }
  };

  const renderContent = (content: ManualContent) => {
    switch (content.type) {
      case 'text':
        return (
          <div className="mb-4">
            {content.title && (
              <h4 className={`text-lg font-semibold ${colors.text.primary} mb-2`}>
                {content.title}
              </h4>
            )}
            <p className={`${colors.text.secondary} leading-relaxed`}>
              {content.content}
            </p>
          </div>
        );
      
      case 'list':
        return (
          <div className="mb-4">
            {content.title && (
              <h4 className={`text-lg font-semibold ${colors.text.primary} mb-2`}>
                {content.title}
              </h4>
            )}
            <ul className={`${colors.text.secondary} space-y-2`}>
              {(content.content as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      
      case 'code':
        return (
          <div className="mb-4">
            {content.title && (
              <h4 className={`text-lg font-semibold ${colors.text.primary} mb-2`}>
                {content.title}
              </h4>
            )}
            <pre className={`${colors.bg.tertiary} rounded-lg p-4 overflow-x-auto text-sm font-mono ${colors.text.secondary}`}>
              <code>{content.content}</code>
            </pre>
          </div>
        );
      
      case 'example':
        return (
          <div className={`mb-4 ${colors.bg.card} rounded-lg p-4 ${colors.border.secondary} border`}>
            {content.title && (
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-400" />
                <h4 className={`text-lg font-semibold ${colors.text.primary}`}>
                  {content.title}
                </h4>
              </div>
            )}
            <pre className={`${colors.text.secondary} whitespace-pre-wrap text-sm leading-relaxed`}>
              {content.content}
            </pre>
          </div>
        );
      
      case 'tip':
        return (
          <div className={`mb-4 ${colors.bg.card} rounded-lg p-4 border-l-4 border-green-400`}>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p className={`${colors.text.secondary} text-sm`}>
                <strong className="text-green-400">Tip:</strong> {content.content}
              </p>
            </div>
          </div>
        );
      
      case 'warning':
        return (
          <div className={`mb-4 ${colors.bg.card} rounded-lg p-4 border-l-4 border-yellow-400`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className={`${colors.text.secondary} text-sm`}>
                <strong className="text-yellow-400">Warning:</strong> {content.content}
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const currentSection = manualSections.find(s => s.id === activeSection);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Manual Panel */}
      <div className={`relative w-full max-w-6xl mx-auto my-4 ${colors.bg.glass} ${colors.border.primary} border rounded-2xl shadow-2xl flex overflow-hidden`}>
        
        {/* Sidebar Navigation */}
        <div className={`w-80 ${colors.bg.secondary} ${colors.border.primary} border-r overflow-y-auto`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Book className="w-6 h-6 text-blue-400" />
                <h2 className={`text-xl font-bold ${colors.text.primary}`}>User Manual</h2>
              </div>
              <button
                onClick={onClose}
                className={`p-2 ${colors.bg.tertiary} rounded-lg ${colors.text.secondary} hover:${colors.text.primary} transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <nav className="space-y-2">
              {manualSections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      setActiveSection(section.id);
                      toggleSection(section.id);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? `bg-blue-500/20 text-blue-400 ${colors.border.accent} border`
                        : `${colors.bg.card} ${colors.text.secondary} hover:${colors.bg.tertiary} hover:${colors.text.primary}`
                    }`}
                  >
                    {expandedSections.has(section.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    {section.icon}
                    <div className="flex-1 text-left">
                      <div className="font-medium">{section.title}</div>
                      <div className={`text-xs ${getLevelColor(section.level)}`}>
                        {getLevelBadge(section.level)}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {currentSection && (
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  {currentSection.icon}
                  <h1 className={`text-3xl font-bold ${colors.text.primary}`}>
                    {currentSection.title}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(currentSection.level)} bg-current/10`}>
                    {getLevelBadge(currentSection.level)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-6">
                {currentSection.content.map((content, index) => (
                  <div key={index}>
                    {renderContent(content)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManual;