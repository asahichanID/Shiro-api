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
   * Endpoint: /search/youtube?query={query}&apikey={apikey}
   * @param {string} query Search terms
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async searchYouTube(query, apiKey) {
    const key = ensureApiKey(apiKey);
    const keyLoaded = Boolean(key);
    const cleanEndpoint = `${BASE_URL}/search/youtube`;

    const candidateUrls = [
      `${BASE_URL}/search/youtube?query=${encodeURIComponent(query)}&apikey=${encodeURIComponent(key)}`,
      `${BASE_URL}/api/search/youtube?query=${encodeURIComponent(query)}&apikey=${encodeURIComponent(key)}`,
    ];

    logPreFetch(cleanEndpoint, query, keyLoaded);

    return await requestHelper(candidateUrls[0], {
      candidateUrls,
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
    });
  },

  /**
   * Get YouTube Audio (MP3) download information
   * Endpoint: /download/youtube?url={url}&format=mp3&apikey={apikey}
   * @param {string} id YouTube Video ID or URL
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async getAudioInfo(id, apiKey) {
    const key = ensureApiKey(apiKey);
    const keyLoaded = Boolean(key);
    const videoUrl = id.startsWith("http") ? id : `https://www.youtube.com/watch?v=${id}`;
    const cleanEndpoint = `${BASE_URL}/download/youtube`;

    const candidateUrls = [
      `${BASE_URL}/download/youtube?url=${encodeURIComponent(videoUrl)}&format=mp3&apikey=${encodeURIComponent(key)}`,
      `${BASE_URL}/api/download/youtube?url=${encodeURIComponent(videoUrl)}&format=mp3&apikey=${encodeURIComponent(key)}`,
    ];

    logPreFetch(cleanEndpoint, `${videoUrl} (format: mp3)`, keyLoaded);

    return await requestHelper(candidateUrls[0], {
      candidateUrls,
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
    });
  },

  /**
   * Get YouTube Video (MP4) download information
   * Endpoint: /download/youtube?url={url}&format={quality}&apikey={apikey}
   * @param {string} id YouTube Video ID or URL
   * @param {string} quality Video quality (default 720)
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async getVideoInfo(id, quality = "720", apiKey) {
    const key = ensureApiKey(apiKey);
    const keyLoaded = Boolean(key);
    const videoUrl = id.startsWith("http") ? id : `https://www.youtube.com/watch?v=${id}`;
    const format = quality || "720";
    const cleanEndpoint = `${BASE_URL}/download/youtube`;

    const candidateUrls = [
      `${BASE_URL}/download/youtube?url=${encodeURIComponent(videoUrl)}&format=${encodeURIComponent(format)}&apikey=${encodeURIComponent(key)}`,
      `${BASE_URL}/api/download/youtube?url=${encodeURIComponent(videoUrl)}&format=${encodeURIComponent(format)}&apikey=${encodeURIComponent(key)}`,
    ];

    logPreFetch(cleanEndpoint, `${videoUrl} (format: ${format})`, keyLoaded);

    return await requestHelper(candidateUrls[0], {
      candidateUrls,
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
    });
  },

  /**
   * Get Spotify Downloader information
   * Endpoint: /download/spotify?url={url}&apikey={apikey}
   * @param {string} spotifyUrl Spotify track/album URL
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async getSpotifyDownload(spotifyUrl, apiKey) {
    const key = ensureApiKey(apiKey);
    const keyLoaded = Boolean(key);
    const cleanEndpoint = `${BASE_URL}/download/spotify`;

    const candidateUrls = [
      `${BASE_URL}/download/spotify?url=${encodeURIComponent(spotifyUrl)}&apikey=${encodeURIComponent(key)}`,
      `${BASE_URL}/api/download/spotify?url=${encodeURIComponent(spotifyUrl)}&apikey=${encodeURIComponent(key)}`,
    ];

    logPreFetch(cleanEndpoint, spotifyUrl, keyLoaded);

    return await requestHelper(candidateUrls[0], {
      candidateUrls,
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
    });
  },

  /**
   * Search Spotify songs via Naze API
   * Endpoint: /search/spotify?query={query}&apikey={apikey}
   * @param {string} query Search query
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async searchSpotify(query, apiKey) {
    const key = ensureApiKey(apiKey);
    const keyLoaded = Boolean(key);
    const cleanEndpoint = `${BASE_URL}/search/spotify`;

    const candidateUrls = [
      `${BASE_URL}/search/spotify?query=${encodeURIComponent(query)}&apikey=${encodeURIComponent(key)}`,
      `${BASE_URL}/api/search/spotify?query=${encodeURIComponent(query)}&apikey=${encodeURIComponent(key)}`,
    ];

    logPreFetch(cleanEndpoint, query, keyLoaded);

    return await requestHelper(candidateUrls[0], {
      candidateUrls,
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
    });
  },

  /**
   * Get TikTok Downloader information
   * Endpoint: /download/tiktok?url={url}&apikey={apikey}
   * @param {string} tiktokUrl TikTok video URL
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async getTikTokDownload(tiktokUrl, apiKey) {
    const key = ensureApiKey(apiKey);
    const keyLoaded = Boolean(key);
    const cleanEndpoint = `${BASE_URL}/download/tiktok`;

    const candidateUrls = [
      `${BASE_URL}/download/tiktok?url=${encodeURIComponent(tiktokUrl)}&apikey=${encodeURIComponent(key)}`,
      `${BASE_URL}/api/download/tiktok?url=${encodeURIComponent(tiktokUrl)}&apikey=${encodeURIComponent(key)}`,
    ];

    logPreFetch(cleanEndpoint, tiktokUrl, keyLoaded);

    return await requestHelper(candidateUrls[0], {
      candidateUrls,
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
    });
  },
};

