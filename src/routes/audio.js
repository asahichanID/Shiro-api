/**
 * YouTube MP3 Downloader Route Handler
 * GET /audio?id=
 */

import { validateId } from "../utils/validator.js";
import { NazeProvider } from "../providers/naze.js";
import { successResponse } from "../utils/response.js";
import { CacheManager } from "../utils/cache.js";
import { getEnvConfig } from "../config.js";
import { PROVIDERS } from "../constants.js";

export async function handleAudio(request, env) {
  const url = new URL(request.url);
  let rawId =
    url.searchParams.get("id") ||
    url.searchParams.get("url") ||
    url.searchParams.get("link") ||
    url.searchParams.get("v") ||
    url.searchParams.get("query") ||
    url.searchParams.get("q");

  if (!rawId && (request.method === "POST" || request.method === "PUT")) {
    try {
      const body = await request.json();
      rawId = body?.id || body?.url || body?.link || body?.v;
    } catch {
      // Ignore JSON parse error
    }
  }

  const id = validateId(rawId);
  const cacheKey = `audio:${id}`;

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
  const providerResult = await NazeProvider.getAudioInfo(id, nazeApiKey);

  // Cache for 15 minutes (900s)
  await CacheManager.set(cacheKey, providerResult, 900, env);

  return successResponse({
    result: providerResult,
    provider: PROVIDERS.NAZE,
    cached: false,
  });
}
