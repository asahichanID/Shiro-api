/**
 * Version Info Route Handler
 * GET /version
 */

import { successResponse } from "../utils/response.js";
import { config } from "../config.js";
import { PROVIDERS } from "../constants.js";

export async function handleVersion() {
  return successResponse({
    result: {
      name: config.app.name,
      version: config.app.version,
      apiCompatibility: "v1",
      buildDate: "2026-07-24",
      targetEnvironment: "Cloudflare Workers",
    },
    provider: PROVIDERS.NAZE,
    cached: false,
  });
}
