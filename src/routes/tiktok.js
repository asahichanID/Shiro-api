/**
 * TikTok Downloader Route Handler
 * GET /tiktok?url=
 */

import { validateUrl } from "../utils/validator.js";
import { NazeProvider } from "../providers/naze.js";
import { successResponse } from "../utils/response.js";
import { CacheManager } from "../utils/cache.js";
import { getEnvConfig } from "../config.js";
import { PROVIDERS } from "../constants.js";

export async function handleTikTok(request, env) {
  const url = new URL(request.url);
  const rawUrl = url.searchParams.get("url") || url.searchParams.get("link");

  const tiktokUrl = validateUrl(rawUrl, ["tiktok.com"]);
  const cacheKey = `tiktok:${tiktokUrl}`;

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
  const providerResult = await NazeProvider.getTikTokDownload(tiktokUrl, nazeApiKey);

  // Cache for 30 minutes (1800s)
  await CacheManager.set(cacheKey, providerResult, 1800, env);

  return successResponse({
    result: providerResult,
    provider: PROVIDERS.NAZE,
    cached: false,
  });
}
