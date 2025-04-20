
export type LoadingState = 'pending' | 'loading' | 'loaded' | 'error';

interface LoadedResource {
  timestamp: number;
  data: any;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export class ProgressiveLoader {
  private static instance: ProgressiveLoader;
  private resourceStates: Map<string, LoadingState>;
  private loadQueue: string[];
  private cache: Map<string, LoadedResource>;

  private constructor() {
    this.resourceStates = new Map();
    this.loadQueue = [];
    this.cache = new Map();
    this.loadFromLocalStorage();
  }

  static getInstance(): ProgressiveLoader {
    if (!ProgressiveLoader.instance) {
      ProgressiveLoader.instance = new ProgressiveLoader();
    }
    return ProgressiveLoader.instance;
  }

  private loadFromLocalStorage() {
    const cached = localStorage.getItem('progressive-cache');
    if (cached) {
      const parsedCache = JSON.parse(cached);
      Object.entries(parsedCache).forEach(([key, value]: [string, LoadedResource]) => {
        if (Date.now() - value.timestamp < CACHE_DURATION) {
          this.cache.set(key, value);
        }
      });
    }
  }

  private saveToLocalStorage() {
    const cacheObject = Object.fromEntries(this.cache.entries());
    localStorage.setItem('progressive-cache', JSON.stringify(cacheObject));
  }

  queueResource(key: string, loadFn: () => Promise<any>) {
    if (!this.resourceStates.has(key)) {
      this.resourceStates.set(key, 'pending');
      this.loadQueue.push(key);
      
      // Start loading if this is the first resource
      if (this.loadQueue.length === 1) {
        this.processQueue(loadFn);
      }
    }
  }

  private async processQueue(loadFn: () => Promise<any>) {
    while (this.loadQueue.length > 0) {
      const key = this.loadQueue[0];
      this.resourceStates.set(key, 'loading');
      
      try {
        const data = await loadFn();
        this.cache.set(key, { data, timestamp: Date.now() });
        this.resourceStates.set(key, 'loaded');
        this.saveToLocalStorage();
      } catch (error) {
        this.resourceStates.set(key, 'error');
        console.error(`Failed to load resource: ${key}`, error);
      }
      
      this.loadQueue.shift();
    }
  }

  getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  getLoadingState(key: string): LoadingState {
    return this.resourceStates.get(key) || 'pending';
  }
}
