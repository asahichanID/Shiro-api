/**
 * Spotify Downloader Route Handler
 * GET /spotify?url=
 */

import { validateUrl, validateQuery } from "../utils/validator.js";
import { NazeProvider } from "../providers/naze.js";
import { successResponse } from "../utils/response.js";
import { CacheManager } from "../utils/cache.js";
import { getEnvConfig } from "../config.js";
import { PROVIDERS } from "../constants.js";

export async function handleSpotify(request, env) {
  const url = new URL(request.url);
  let rawInput =
    url.searchParams.get("url") ||
    url.searchParams.get("link") ||
    url.searchParams.get("query") ||
    url.searchParams.get("q") ||
    url.searchParams.get("id");

  if (!rawInput && (request.method === "POST" || request.method === "PUT")) {
    try {
      const body = await request.json();
      rawInput = body?.url || body?.link || body?.query || body?.q || body?.id;
    } catch {
      // Ignore
    }
  }

  const { nazeApiKey } = getEnvConfig(env);

  // Check if input is a Spotify URL or general search query
  const isUrl = rawInput && (rawInput.startsWith("http://") || rawInput.startsWith("https://") || rawInput.includes("spotify.com"));

  if (isUrl || url.pathname.includes("/download")) {
    const spotifyUrl = validateUrl(rawInput, ["spotify.com"]);
    const cacheKey = `spotify:dl:${spotifyUrl}`;

    const cachedData = await CacheManager.get(cacheKey, env);
    if (cachedData) {
      return successResponse({
        result: cachedData,
        provider: PROVIDERS.NAZE,
        cached: true,
      });
    }

    const providerResult = await NazeProvider.getSpotifyDownload(spotifyUrl, nazeApiKey);
    await CacheManager.set(cacheKey, providerResult, 1800, env);

    return successResponse({
      result: providerResult,
      provider: PROVIDERS.NAZE,
      cached: false,
    });
  } else {
    const query = validateQuery(rawInput);
    const cacheKey = `spotify:search:${query.toLowerCase()}`;

    const cachedData = await CacheManager.get(cacheKey, env);
    if (cachedData) {
      return successResponse({
        result: cachedData,
        provider: PROVIDERS.NAZE,
        cached: true,
      });
    }

    const providerResult = await NazeProvider.searchSpotify(query, nazeApiKey);
    await CacheManager.set(cacheKey, providerResult, 600, env);

    return successResponse({
      result: providerResult,
      provider: PROVIDERS.NAZE,
      cached: false,
    });
  }
}
