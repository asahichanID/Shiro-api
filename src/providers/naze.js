/**
 * Naze API Abstraction Layer
 * ALL external Provider endpoints MUST be declared here.
 * Base URL: https://api.naze.biz.id
 * Documentation: https://naze.biz.id/docs
 */

import { config } from "../config.js";
import { requestHelper } from "./request.js";
import { ProviderError } from "../utils/errors.js";

const BASE_URL = config.providers.naze.baseUrl;

/**
 * Ensures NAZE_API_KEY is present
 * @param {string} apiKey
 */
function ensureApiKey(apiKey) {
  if (!apiKey || apiKey.trim() === "") {
    throw new ProviderError(
      "NAZE_API_KEY is not configured in environment variables.",
      "MISSING_API_KEY",
      500
    );
  }
  return apiKey.trim();
}

/**
 * Log pre-fetch details and provider HTTP status without revealing key secrets
 * @param {string} endpoint
 * @param {string} queryVal
 * @param {boolean} keyLoaded
 */
function logPreFetch(endpoint, queryVal, keyLoaded) {
  console.log(`\n--- [Naze API Request Audit] ---`);
  console.log(`Endpoint:\n${endpoint}`);
  console.log(`Query:\n${queryVal}`);
  console.log(`API Key Loaded:\n${keyLoaded}`);
}

/**
 * Naze API Provider Methods
 */
export const NazeProvider = {
  /**
   * Search YouTube videos via Naze API
   * Endpoint: /api/search/youtube (alias: /api/ytsearch)
   * @param {string} query Search terms
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async searchYouTube(query, apiKey) {
    const key = ensureApiKey(apiKey);
    const keyLoaded = Boolean(key);
    const cleanEndpoint = `${BASE_URL}/api/search/youtube`;
    const targetUrl = `${cleanEndpoint}?query=${encodeURIComponent(query)}&apikey=${encodeURIComponent(key)}`;

    logPreFetch(cleanEndpoint, query, keyLoaded);

    return await requestHelper(targetUrl, {
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
      fallbackUrl: `${BASE_URL}/api/ytsearch?q=${encodeURIComponent(query)}&apikey=${encodeURIComponent(key)}`,
    });
  },

  /**
   * Get YouTube Audio (MP3) download information
   * Endpoint: /api/downloader/ytaudio (alias: /api/ytaudio)
   * @param {string} id YouTube Video ID or URL
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async getAudioInfo(id, apiKey) {
    const key = ensureApiKey(apiKey);
    const keyLoaded = Boolean(key);
    const videoUrl = id.startsWith("http") ? id : `https://www.youtube.com/watch?v=${id}`;
    const cleanEndpoint = `${BASE_URL}/api/downloader/ytaudio`;
    const targetUrl = `${cleanEndpoint}?url=${encodeURIComponent(videoUrl)}&apikey=${encodeURIComponent(key)}`;

    logPreFetch(cleanEndpoint, videoUrl, keyLoaded);

    return await requestHelper(targetUrl, {
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
      fallbackUrl: `${BASE_URL}/api/ytaudio?url=${encodeURIComponent(videoUrl)}&apikey=${encodeURIComponent(key)}`,
    });
  },

  /**
   * Get YouTube Video (MP4) download information
   * Endpoint: /api/downloader/ytvideo (alias: /api/ytvideo)
   * @param {string} id YouTube Video ID or URL
   * @param {string} quality Video quality (default 720)
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async getVideoInfo(id, quality = "720", apiKey) {
    const key = ensureApiKey(apiKey);
    const keyLoaded = Boolean(key);
    const videoUrl = id.startsWith("http") ? id : `https://www.youtube.com/watch?v=${id}`;
    const cleanEndpoint = `${BASE_URL}/api/downloader/ytvideo`;
    const targetUrl = `${cleanEndpoint}?url=${encodeURIComponent(videoUrl)}&quality=${encodeURIComponent(quality)}&apikey=${encodeURIComponent(key)}`;

    logPreFetch(cleanEndpoint, `${videoUrl} (Quality: ${quality})`, keyLoaded);

    return await requestHelper(targetUrl, {
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
      fallbackUrl: `${BASE_URL}/api/ytvideo?url=${encodeURIComponent(videoUrl)}&quality=${encodeURIComponent(quality)}&apikey=${encodeURIComponent(key)}`,
    });
  },

  /**
   * Get Spotify Downloader information
   * Endpoint: /api/downloader/spotify (alias: /api/spotify)
   * @param {string} spotifyUrl Spotify track/album URL
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async getSpotifyDownload(spotifyUrl, apiKey) {
    const key = ensureApiKey(apiKey);
    const keyLoaded = Boolean(key);
    const cleanEndpoint = `${BASE_URL}/api/downloader/spotify`;
    const targetUrl = `${cleanEndpoint}?url=${encodeURIComponent(spotifyUrl)}&apikey=${encodeURIComponent(key)}`;

    logPreFetch(cleanEndpoint, spotifyUrl, keyLoaded);

    return await requestHelper(targetUrl, {
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
      fallbackUrl: `${BASE_URL}/api/spotify?url=${encodeURIComponent(spotifyUrl)}&apikey=${encodeURIComponent(key)}`,
    });
  },

  /**
   * Get TikTok Downloader information
   * Endpoint: /api/downloader/tiktok (alias: /api/tiktok)
   * @param {string} tiktokUrl TikTok video URL
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async getTikTokDownload(tiktokUrl, apiKey) {
    const key = ensureApiKey(apiKey);
    const keyLoaded = Boolean(key);
    const cleanEndpoint = `${BASE_URL}/api/downloader/tiktok`;
    const targetUrl = `${cleanEndpoint}?url=${encodeURIComponent(tiktokUrl)}&apikey=${encodeURIComponent(key)}`;

    logPreFetch(cleanEndpoint, tiktokUrl, keyLoaded);

    return await requestHelper(targetUrl, {
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
      fallbackUrl: `${BASE_URL}/api/tiktok?url=${encodeURIComponent(tiktokUrl)}&apikey=${encodeURIComponent(key)}`,
    });
  },
};

