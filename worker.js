/**
 * shiro-api - Cloudflare Worker Main Entrypoint
 * Target Repository: shiro-api
 * Target Platform: Cloudflare Workers
 */

import { createConfiguredRouter } from "./src/router.js";
import { handleGlobalError } from "./src/utils/errors.js";
import { Logger } from "./src/utils/logger.js";
import { withCors } from "./src/utils/cors.js";

const router = createConfiguredRouter();

export default {
  /**
   * Main Cloudflare Worker Fetch Event Handler
   * @param {Request} request Incoming Cloudflare Worker request
   * @param {Object} env Environment bindings (NAZE_API_KEY, JWT_SECRET, etc.)
   * @param {Object} ctx Execution context
   * @returns {Promise<Response>}
   */
  async fetch(request, env, ctx) {
    const startTime = performance.now();
    const url = new URL(request.url);
    const endpoint = url.pathname + url.search;
    const method = request.method;
    const clientIp = request.headers.get("cf-connecting-ip") || "unknown";

    let response;
    try {
      response = await router.handle(request, env, ctx);
    } catch (err) {
      response = handleGlobalError(err);
    }

    // Ensure CORS headers are attached
    response = withCors(response);

    const durationMs = performance.now() - startTime;
    Logger.logRequest({
      endpoint,
      method,
      status: response.status,
      responseTimeMs: durationMs,
      clientIp,
    });

    return response;
  },
};
