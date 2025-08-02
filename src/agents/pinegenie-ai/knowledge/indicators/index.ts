/**
 * Indicators Module Index
 * 
 * Unified export for all indicator-related functionality
 */

// Technical Indicators
export {
  TechnicalIndicator,
  IndicatorParameter,
  IndicatorOutput,
  IndicatorInterpretation,
  IndicatorCompatibilityRule,
  IndicatorSuggestion,
  ParameterOptimization,
  IndicatorAnalysis,
  TechnicalIndicatorDatabase,
  TECHNICAL_INDICATORS
} from './technical';

// Oscillator Indicators
export {
  OscillatorDatabase,
  OSCILLATOR_INDICATORS
} from './oscillators';

// Combined Indicator System
import { TechnicalIndicatorDatabase, TechnicalIndicator } from './technical';
import { OscillatorDatabase, OSCILLATOR_INDICATORS } from './oscillators';

export class UnifiedIndicatorSystem {
  private technicalDb: TechnicalIndicatorDatabase;
  private oscillatorDb: OscillatorDatabase;
  private allIndicators: Map<string, TechnicalIndicator>;

  constructor() {
    this.technicalDb = new TechnicalIndicatorDatabase();
    this.oscillatorDb = new OscillatorDatabase();
    this.allIndicators = new Map();
    this.buildUnifiedMap();
  }

  private buildUnifiedMap(): void {
    // Add technical indicators
    this.technicalDb.getAllIndicators().forEach(indicator => {
      this.allIndicators.set(indicator.id, indicator);
    });

    // Add oscillator indicators
    this.oscillatorDb.getAllOscillators().forEach(oscillator => {
      this.allIndicators.set(oscillator.id, oscillator);
    });
  }

  /**
   * Get any indicator by ID
   */
  public getIndicator(id: string): TechnicalIndicator | null {
    return this.allIndicators.get(id) || null;
  }

  /**
   * Get all indicators from both databases
   */
  public getAllIndicators(): TechnicalIndicator[] {
    return Array.from(this.allIndicators.values());
  }

  /**
   * Get technical indicators database
   */
  public getTechnicalDatabase(): TechnicalIndicatorDatabase {
    return this.technicalDb;
  }

  /**
   * Get oscillator database
   */
  public getOscillatorDatabase(): OscillatorDatabase {
    return this.oscillatorDb;
  }

  /**
   * Search across all indicators
   */
  public searchAllIndicators(keywords: string[]): TechnicalIndicator[] {
    const technicalResults = this.technicalDb.searchIndicators(keywords);
    const oscillatorResults = this.oscillatorDb.getAllOscillators().filter(osc =>
      keywords.some(keyword =>
        osc.name.toLowerCase().includes(keyword.toLowerCase()) ||
        osc.description.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    // Combine and deduplicate results
    const allResults = [...technicalResults, ...oscillatorResults];
    const uniqueResults = allResults.filter((indicator, index, self) =>
      index === self.findIndex(i => i.id === indicator.id)
    );

    return uniqueResults;
  }

  /**
   * Get indicators by category across all databases
   */
  public getIndicatorsByCategory(category: string): TechnicalIndicator[] {
    return this.getAllIndicators().filter(indicator => indicator.category === category);
  }

  /**
   * Get comprehensive statistics
   */
  public getComprehensiveStatistics(): {
    total: number;
    technical: any;
    oscillators: any;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
  } {
    const technicalStats = this.technicalDb.getStatistics();
    const oscillatorStats = this.oscillatorDb.getStatistics();
    
    const byCategory: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};

    this.getAllIndicators().forEach(indicator => {
      byCategory[indicator.category] = (byCategory[indicator.category] || 0) + 1;
      byDifficulty[indicator.difficulty] = (byDifficulty[indicator.difficulty] || 0) + 1;
    });

    return {
      total: this.allIndicators.size,
      technical: technicalStats,
      oscillators: oscillatorStats,
      byCategory,
      byDifficulty
    };
  }
}

// Create and export singleton instance
export const indicatorSystem = new UnifiedIndicatorSystem();