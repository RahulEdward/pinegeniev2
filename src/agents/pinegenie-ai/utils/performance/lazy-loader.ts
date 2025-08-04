/**
 * Lazy Loader
 * Implements lazy loading for complex strategy components and large datasets
 */

interface LazyLoadConfig {
  chunkSize: number;
  loadDelay: number;
  maxConcurrent: number;
  cacheResults: boolean;
}

interface LoadableItem<T> {
  id: string;
  loader: () => Promise<T>;
  priority: number;
  dependencies?: string[];
}

interface LoadResult<T> {
  id: string;
  data: T;
  loadTime: number;
  fromCache: boolean;
}

export class LazyLoader<T> {
  private config: LazyLoadConfig;
  private loadQueue: LoadableItem<T>[] = [];
  private loadingItems = new Set<string>();
  private loadedItems = new Map<string, T>();
  private loadPromises = new Map<string, Promise<T>>();
  private loadStats = {
    totalLoaded: 0,
    totalLoadTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  constructor(config: Partial<LazyLoadConfig> = {}) {
    this.config = {
      chunkSize: config.chunkSize || 10,
      loadDelay: config.loadDelay || 100,
      maxConcurrent: config.maxConcurrent || 3,
      cacheResults: config.cacheResults !== false
    };
  }

  /**
   * Add item to lazy loading queue
   */
  addItem(item: LoadableItem<T>): void {
    // Check if already loaded or loading
    if (this.loadedItems.has(item.id) || this.loadingItems.has(item.id)) {
      return;
    }

    // Insert item in priority order
    const insertIndex = this.loadQueue.findIndex(queueItem => queueItem.priority < item.priority);
    if (insertIndex === -1) {
      this.loadQueue.push(item);
    } else {
      this.loadQueue.splice(insertIndex, 0, item);
    }
  }

  /**
   * Load item by ID
   */
  async loadItem(id: string): Promise<T | null> {
    // Check cache first
    if (this.loadedItems.has(id)) {
      this.loadStats.cacheHits++;
      return this.loadedItems.get(id)!;
    }

    // Check if already loading
    if (this.loadPromises.has(id)) {
      return this.loadPromises.get(id)!;
    }

    // Find item in queue
    const itemIndex = this.loadQueue.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return null;
    }

    const item = this.loadQueue[itemIndex];
    
    // Check dependencies
    if (item.dependencies) {
      await this.loadDependencies(item.dependencies);
    }

    // Start loading
    const loadPromise = this.performLoad(item);
    this.loadPromises.set(id, loadPromise);

    try {
      const result = await loadPromise;
      return result;
    } finally {
      this.loadPromises.delete(id);
    }
  }

  /**
   * Load multiple items
   */
  async loadItems(ids: string[]): Promise<LoadResult<T>[]> {
    const results: LoadResult<T>[] = [];
    const chunks = this.chunkArray(ids, this.config.chunkSize);

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async id => {
        const startTime = Date.now();
        const data = await this.loadItem(id);
        const loadTime = Date.now() - startTime;
        const fromCache = this.loadedItems.has(id);

        return {
          id,
          data: data!,
          loadTime,
          fromCache
        };
      });

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults.filter(result => result.data !== null));

      // Add delay between chunks to prevent overwhelming
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await this.delay(this.config.loadDelay);
      }
    }

    return results;
  }

  /**
   * Load all queued items
   */
  async loadAll(): Promise<LoadResult<T>[]> {
    const ids = this.loadQueue.map(item => item.id);
    return this.loadItems(ids);
  }

  /**
   * Load dependencies
   */
  private async loadDependencies(dependencies: string[]): Promise<void> {
    const dependencyPromises = dependencies.map(depId => this.loadItem(depId));
    await Promise.all(dependencyPromises);
  }

  /**
   * Perform actual loading
   */
  private async performLoad(item: LoadableItem<T>): Promise<T> {
    this.loadingItems.add(item.id);
    this.loadStats.cacheMisses++;

    try {
      const startTime = Date.now();
      const result = await item.loader();
      const loadTime = Date.now() - startTime;

      // Cache result if enabled
      if (this.config.cacheResults) {
        this.loadedItems.set(item.id, result);
      }

      // Update stats
      this.loadStats.totalLoaded++;
      this.loadStats.totalLoadTime += loadTime;

      // Remove from queue
      const queueIndex = this.loadQueue.findIndex(queueItem => queueItem.id === item.id);
      if (queueIndex !== -1) {
        this.loadQueue.splice(queueIndex, 1);
      }

      return result;
    } finally {
      this.loadingItems.delete(item.id);
    }
  }

  /**
   * Preload high-priority items
   */
  async preloadHighPriority(minPriority = 80): Promise<void> {
    const highPriorityItems = this.loadQueue
      .filter(item => item.priority >= minPriority)
      .slice(0, this.config.maxConcurrent);

    const preloadPromises = highPriorityItems.map(item => this.loadItem(item.id));
    await Promise.all(preloadPromises);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.loadedItems.clear();
    this.loadPromises.clear();
    this.loadingItems.clear();
  }

  /**
   * Get loading statistics
   */
  getStats(): typeof this.loadStats & { averageLoadTime: number; hitRate: number } {
    const averageLoadTime = this.loadStats.totalLoaded > 0 
      ? this.loadStats.totalLoadTime / this.loadStats.totalLoaded 
      : 0;
    
    const totalRequests = this.loadStats.cacheHits + this.loadStats.cacheMisses;
    const hitRate = totalRequests > 0 ? this.loadStats.cacheHits / totalRequests : 0;

    return {
      ...this.loadStats,
      averageLoadTime,
      hitRate
    };
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    queueSize: number;
    loadingCount: number;
    loadedCount: number;
    pendingHighPriority: number;
  } {
    return {
      queueSize: this.loadQueue.length,
      loadingCount: this.loadingItems.size,
      loadedCount: this.loadedItems.size,
      pendingHighPriority: this.loadQueue.filter(item => item.priority >= 80).length
    };
  }

  /**
   * Chunk array into smaller arrays
   */
  private chunkArray<U>(array: U[], chunkSize: number): U[][] {
    const chunks: U[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Remove item from queue
   */
  removeItem(id: string): boolean {
    const index = this.loadQueue.findIndex(item => item.id === id);
    if (index !== -1) {
      this.loadQueue.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Update item priority
   */
  updatePriority(id: string, newPriority: number): boolean {
    const item = this.loadQueue.find(item => item.id === id);
    if (item) {
      item.priority = newPriority;
      // Re-sort queue
      this.loadQueue.sort((a, b) => b.priority - a.priority);
      return true;
    }
    return false;
  }

  /**
   * Check if item is loaded
   */
  isLoaded(id: string): boolean {
    return this.loadedItems.has(id);
  }

  /**
   * Check if item is loading
   */
  isLoading(id: string): boolean {
    return this.loadingItems.has(id);
  }

  /**
   * Get loaded item without triggering load
   */
  getLoadedItem(id: string): T | null {
    return this.loadedItems.get(id) || null;
  }
}

/**
 * Strategy Component Lazy Loader
 * Specialized lazy loader for strategy components
 */
export class StrategyComponentLoader extends LazyLoader<any> {
  constructor() {
    super({
      chunkSize: 5,
      loadDelay: 50,
      maxConcurrent: 5,
      cacheResults: true
    });
  }

  /**
   * Add indicator for lazy loading
   */
  addIndicator(id: string, loader: () => Promise<any>, priority = 50): void {
    this.addItem({
      id: `indicator_${id}`,
      loader,
      priority
    });
  }

  /**
   * Add template for lazy loading
   */
  addTemplate(id: string, loader: () => Promise<any>, priority = 30): void {
    this.addItem({
      id: `template_${id}`,
      loader,
      priority
    });
  }

  /**
   * Add pattern for lazy loading
   */
  addPattern(id: string, loader: () => Promise<any>, priority = 70): void {
    this.addItem({
      id: `pattern_${id}`,
      loader,
      priority
    });
  }

  /**
   * Load indicator
   */
  async loadIndicator(id: string): Promise<any> {
    return this.loadItem(`indicator_${id}`);
  }

  /**
   * Load template
   */
  async loadTemplate(id: string): Promise<any> {
    return this.loadItem(`template_${id}`);
  }

  /**
   * Load pattern
   */
  async loadPattern(id: string): Promise<any> {
    return this.loadItem(`pattern_${id}`);
  }
}

// Singleton instances
export const strategyComponentLoader = new StrategyComponentLoader();
export const generalLazyLoader = new LazyLoader();