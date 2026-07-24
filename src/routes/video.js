/**
 * YouTube MP4 Video Downloader Route Handler
 * GET /video?id=&quality=720
 */

import { validateId, validateQuality } from "../utils/validator.js";
import { NazeProvider } from "../providers/naze.js";
import { successResponse } from "../utils/response.js";
import { CacheManager } from "../utils/cache.js";
import { getEnvConfig } from "../config.js";
import { PROVIDERS } from "../constants.js";

export async function handleVideo(request, env) {
  const url = new URL(request.url);
  let rawId =
    url.searchParams.get("id") ||
    url.searchParams.get("url") ||
    url.searchParams.get("link") ||
    url.searchParams.get("v") ||
    url.searchParams.get("query") ||
    url.searchParams.get("q");

  let rawQuality =
    url.searchParams.get("quality") ||
    url.searchParams.get("q_val") ||
    url.searchParams.get("res");

  if (request.method === "POST" || request.method === "PUT") {
    try {
      const body = await request.json();
      if (!rawId) rawId = body?.id || body?.url || body?.link || body?.v;
      if (!rawQuality) rawQuality = body?.quality || body?.res;
    } catch {
      // Ignore JSON parse error
    }
  }

  const id = validateId(rawId);
  const quality = validateQuality(rawQuality);
  const cacheKey = `video:${id}:${quality}`;

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
  const providerResult = await NazeProvider.getVideoInfo(id, quality, nazeApiKey);

  // Cache for 15 minutes (900s)
  await CacheManager.set(cacheKey, providerResult, 900, env);

  return successResponse({
    result: providerResult,
    provider: PROVIDERS.NAZE,
    cached: false,
  });
}
