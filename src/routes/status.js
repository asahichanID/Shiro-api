/**
 * System Status Route Handler
 * GET /status
 */

import { successResponse } from "../utils/response.js";
import { config, getEnvConfig } from "../config.js";
import { PROVIDERS } from "../constants.js";

/**
 * Format uptime in human readable format
 * @param {number} seconds
 * @returns {string}
 */
function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);

  return parts.join(" ");
}

export async function handleStatus(request, env) {
  const envConfig = getEnvConfig(env);
  const uptimeSeconds = Math.floor((Date.now() - config.app.uptimeStart) / 1000);

  return successResponse({
    result: {
      status: "ONLINE",
      worker: config.app.name,
      version: config.app.version,
      environment: envConfig.environment,
      activeProvider: PROVIDERS.NAZE,
      providerBaseUrl: config.providers.naze.baseUrl,
      apiKeyConfigured: Boolean(envConfig.nazeApiKey),
      uptimeSeconds,
      uptimeFormatted: formatUptime(uptimeSeconds),
      timestamp: new Date().toISOString(),
    },
    provider: PROVIDERS.NAZE,
    cached: false,
  });
}
