/**
 * YouTube Search Route Handler
 * GET /search?query=
 */

import { validateQuery } from "../utils/validator.js";
import { NazeProvider } from "../providers/naze.js";
import { successResponse } from "../utils/response.js";
import { CacheManager } from "../utils/cache.js";
import { getEnvConfig } from "../config.js";
import { PROVIDERS } from "../constants.js";

export async function handleSearch(request, env) {
  const url = new URL(request.url);
  const rawQuery = url.searchParams.get("query") || url.searchParams.get("q");

  const query = validateQuery(rawQuery);
  const cacheKey = `search:${query.toLowerCase()}`;

  // Check cache
  const cachedData = await CacheManager.get(cacheKey, env);
  if (cachedData) {
    return successResponse({
      result: cachedData,
      provider: PROVIDERS.NAZE,
      cached: true,
    });
  }

  const { nazeApiKey } = getEnvConfig(env);
  const providerResult = await NazeProvider.searchYouTube(query, nazeApiKey);

  // Cache for 10 minutes (600s)
  await CacheManager.set(cacheKey, providerResult, 600, env);

  return successResponse({
    result: providerResult,
    provider: PROVIDERS.NAZE,
    cached: false,
  });
}
