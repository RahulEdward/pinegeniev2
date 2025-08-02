/**
 * Trading Patterns Index
 * 
 * Exports all trading pattern databases and matchers.
 */

// Pattern databases
export { 
  TREND_FOLLOWING_PATTERNS, 
  TrendFollowingPatternMatcher,
  type TrendFollowingPattern 
} from './trend-following';

export { 
  MEAN_REVERSION_PATTERNS, 
  MeanReversionPatternMatcher,
  type MeanReversionPattern 
} from './mean-reversion';

export { 
  BREAKOUT_PATTERNS, 
  BreakoutPatternMatcher,
  type BreakoutPattern 
} from './breakout';

// Combined pattern types
export type TradingPattern = 
  | import('./trend-following').TrendFollowingPattern
  | import('./mean-reversion').MeanReversionPattern
  | import('./breakout').BreakoutPattern;