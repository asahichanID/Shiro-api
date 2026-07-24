/**
 * Global Configuration Settings
 * Central configuration file for shiro-api Cloudflare Worker API Gateway
 */

import { PROVIDERS, DEFAULT_QUALITY, API_VERSION } from "./constants.js";

export const config = {
  app: {
    name: "shiro-api",
    version: API_VERSION,
    environment: "production",
    defaultProvider: PROVIDERS.NAZE,
    uptimeStart: Date.now(),
  },
  providers: {
    naze: {
      name: "naze",
      baseUrl: "https://api.naze.biz.id",
      timeoutMs: 15000,
      retryCount: 2,
      retryDelayMs: 500,
    },
  },
  defaults: {
    videoQuality: DEFAULT_QUALITY.VIDEO,
    requestTimeoutMs: 20000,
  },
  cache: {
    ttlSeconds: 300, // 5 minutes default
    enabled: true,
  },
  jwt: {
    algorithm: "HS256",
    expiresInSeconds: 86400, // 24 hours
    issuer: "shiro-api-gateway",
  },
};

/**
 * Helper to retrieve environment configuration securely
 * @param {Object} env Cloudflare Worker env bindings
 */
export function getEnvConfig(env = {}) {
  return {
    nazeApiKey: env.NAZE_API_KEY || "",
    jwtSecret: env.JWT_SECRET || "shiro_api_default_jwt_secret_key_2026",
    environment: env.ENVIRONMENT || config.app.environment,
  };
}
