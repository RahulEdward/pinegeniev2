/**
 * Pattern Cache System
 * Provides efficient caching for frequently used trading patterns and knowledge base lookups
 */

import { TradingPattern, IndicatorDefinition, StrategyTemplate } from '../../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  hitRate: number;
}

export class PatternCache {
  private patternCache = new Map<string, CacheEntry<TradingPattern>>();
  private indicatorCache = new Map<string, CacheEntry<IndicatorDefinition>>();
  private templateCache = new Map<string, CacheEntry<StrategyTemplate>>();
  private searchCache = new Map<string, CacheEntry<any>>();
  
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live in milliseconds
  private stats: CacheStats;

  constructor(maxSize = 1000, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0,
      hitRate: 0
    };
  }

  /**
   * Cache a trading pattern
   */
  cachePattern(key: string, pattern: TradingPattern): void {
    this.setCache(this.patternCache, key, pattern);
  }

  /**
   * Get cached trading pattern
   */
  getPattern(key: string): TradingPattern | null {
    return this.getCache(this.patternCache, key);
  }

  /**
   * Cache an indicator definition
   */
  cacheIndicator(key: string, indicator: IndicatorDefinition): void {
    this.setCache(this.indicatorCache, key, indicator);
  }

  /**
   * Get cached indicator definition
   */
  getIndicator(key: string): IndicatorDefinition | null {
    return this.getCache(this.indicatorCache, key);
  }

  /**
   * Cache a strategy template
   */
  cacheTemplate(key: string, template: StrategyTemplate): void {
    this.setCache(this.templateCache, key, template);
  }

  /**
   * Get cached strategy template
   */
  getTemplate(key: string): StrategyTemplate | null {
    return this.getCache(this.templateCache, key);
  }

  /**
   * Cache search results
   */
  cacheSearchResult(query: string, results: any): void {
    const key = this.hashQuery(query);
    this.setCache(this.searchCache, key, results);
  }

  /**
   * Get cached search results
   */
  getSearchResult(query: string): any | null {
    const key = this.hashQuery(query);
    return this.getCache(this.searchCache, key);
  }

  /**
   * Generic cache setter
   */
  private setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
    // Check if we need to evict entries
    if (cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed(cache);
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now()
    };

    cache.set(key, entry);
    this.updateStats();
  }

  /**
   * Generic cache getter
   */
  private getCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    this.updateHitRate();

    return entry.data;
  }

  /**
   * Evict least recently used entry
   */
  private evictLeastRecentlyUsed<T>(cache: Map<string, CacheEntry<T>>): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Hash query string for consistent caching
   */
  private hashQuery(query: string): string {
    // Simple hash function for query strings
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.totalSize = this.patternCache.size + 
                          this.indicatorCache.size + 
                          this.templateCache.size + 
                          this.searchCache.size;
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.patternCache.clear();
    this.indicatorCache.clear();
    this.templateCache.clear();
    this.searchCache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0,
      hitRate: 0
    };
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    const caches = [this.patternCache, this.indicatorCache, this.templateCache, this.searchCache];
    
    caches.forEach(cache => {
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > this.ttl) {
          cache.delete(key);
        }
      }
    });
    
    this.updateStats();
  }

  /**
   * Get cache size information
   */
  getSizeInfo(): { [key: string]: number } {
    return {
      patterns: this.patternCache.size,
      indicators: this.indicatorCache.size,
      templates: this.templateCache.size,
      searches: this.searchCache.size,
      total: this.stats.totalSize
    };
  }

  /**
   * Warm up cache with frequently used patterns
   */
  warmUp(patterns: TradingPattern[], indicators: IndicatorDefinition[], templates: StrategyTemplate[]): void {
    // Cache common patterns
    patterns.forEach(pattern => {
      this.cachePattern(pattern.id, pattern);
    });

    // Cache common indicators
    indicators.forEach(indicator => {
      this.cacheIndicator(indicator.id, indicator);
    });

    // Cache common templates
    templates.forEach(template => {
      this.cacheTemplate(template.id, template);
    });
  }
}

// Singleton instance
export const patternCache = new PatternCache();