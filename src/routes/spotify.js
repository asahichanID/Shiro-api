/**
 * Spotify Downloader Route Handler
 * GET /spotify?url=
 */

import { validateUrl } from "../utils/validator.js";
import { NazeProvider } from "../providers/naze.js";
import { successResponse } from "../utils/response.js";
import { CacheManager } from "../utils/cache.js";
import { getEnvConfig } from "../config.js";
import { PROVIDERS } from "../constants.js";

export async function handleSpotify(request, env) {
  const url = new URL(request.url);
  const rawUrl = url.searchParams.get("url") || url.searchParams.get("link");

  const spotifyUrl = validateUrl(rawUrl, ["spotify.com"]);
  const cacheKey = `spotify:${spotifyUrl}`;

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
  const providerResult = await NazeProvider.getSpotifyDownload(spotifyUrl, nazeApiKey);

  // Cache for 30 minutes (1800s)
  await CacheManager.set(cacheKey, providerResult, 1800, env);

  return successResponse({
    result: providerResult,
    provider: PROVIDERS.NAZE,
    cached: false,
  });
}
