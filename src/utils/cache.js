/**
 * Abstract Cache Interface
 * Unified caching abstraction compatible with In-Memory, Cloudflare KV, Cloudflare Cache API, or Redis
 */

class InMemoryCacheStore {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key, value, ttlSeconds = 300) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  async delete(key) {
    this.store.delete(key);
  }

  async clear() {
    this.store.clear();
  }
}

class CloudflareKVCacheStore {
  constructor(kvNamespace) {
    this.kv = kvNamespace;
  }

  async get(key) {
    try {
      const data = await this.kv.get(key, { type: "json" });
      return data;
    } catch {
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    try {
      await this.kv.put(key, JSON.stringify(value), { expirationTtl: Math.max(ttlSeconds, 60) });
    } catch (err) {
      console.error("KV Set Error:", err);
    }
  }

  async delete(key) {
    try {
      await this.kv.delete(key);
    } catch (err) {
      console.error("KV Delete Error:", err);
    }
  }

  async clear() {
    // KV does not support clear all natively without listing keys
  }
}

// Singleton In-Memory Cache Instance
const defaultMemoryStore = new InMemoryCacheStore();

/**
 * Cache Manager Facade
 */
export class CacheManager {
  /**
   * Resolve appropriate cache store based on Cloudflare env bindings
   * @param {Object} [env] Cloudflare env object
   */
  static getStore(env = {}) {
    if (env.SHIRO_CACHE_KV) {
      return new CloudflareKVCacheStore(env.SHIRO_CACHE_KV);
    }
    return defaultMemoryStore;
  }

  /**
   * Retrieve cached value
   * @param {string} key
   * @param {Object} [env]
   * @returns {Promise<any|null>}
   */
  static async get(key, env) {
    const store = this.getStore(env);
    return await store.get(key);
  }

  /**
   * Save value to cache
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlSeconds=300]
   * @param {Object} [env]
   */
  static async set(key, value, ttlSeconds = 300, env) {
    const store = this.getStore(env);
    await store.set(key, value, ttlSeconds);
  }

  /**
   * Delete cached key
   * @param {string} key
   * @param {Object} [env]
   */
  static async delete(key, env) {
    const store = this.getStore(env);
    await store.delete(key);
  }
}
