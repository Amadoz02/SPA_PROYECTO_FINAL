// Simple in-memory cache utility for API responses
class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
  }

  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    return this.cache.delete(key);
  }

  // Get cache size
  size() {
    return this.cache.size;
  }
}

// Global cache instance
export const apiCache = new SimpleCache();

// Cached API wrapper
export const getCached = async (endpoint, ttl) => {
  const cached = apiCache.get(endpoint);
  if (cached) {
    console.log(`Cache hit for ${endpoint}`);
    return cached;
  }

  // Import here to avoid circular dependency
  const { get } = await import('./manejo_api_optimizado.js');
  const data = await get(endpoint);
  apiCache.set(endpoint, data, ttl);
  console.log(`Cache miss for ${endpoint}, stored in cache`);
  return data;
};

// Clear cache on logout or when needed
export const clearApiCache = () => {
  apiCache.clear();
  console.log('API cache cleared');
};

// Auto-clear cache on route changes (optional)
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    // Clear cache on navigation to free memory
    setTimeout(() => {
      if (apiCache.size() > 50) { // If cache gets too large
        clearApiCache();
      }
    }, 1000);
  });
}
