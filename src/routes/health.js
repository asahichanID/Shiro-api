/**
 * Health Check Route Handler
 * GET /health
 */

import { successResponse } from "../utils/response.js";
import { PROVIDERS } from "../constants.js";

export async function handleHealth() {
  return successResponse({
    result: {
      status: "OK",
      healthy: true,
      timestamp: new Date().toISOString(),
    },
    provider: PROVIDERS.NAZE,
    cached: false,
  });
}
