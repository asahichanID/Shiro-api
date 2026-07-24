/**
 * Naze API Abstraction Layer
 * ALL external Provider endpoints MUST be declared here.
 * Base URL: https://api.naze.biz.id
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
 * Naze API Provider Methods
 */
export const NazeProvider = {
  /**
   * Search YouTube videos via Naze API
   * @param {string} query Search terms
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async searchYouTube(query, apiKey) {
    const key = ensureApiKey(apiKey);
    const targetUrl = `${BASE_URL}/api/ytsearch?q=${encodeURIComponent(query)}&apikey=${encodeURIComponent(key)}`;

    return await requestHelper(targetUrl, {
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
    });
  },

  /**
   * Get YouTube Audio (MP3) download information
   * @param {string} id YouTube Video ID or URL
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async getAudioInfo(id, apiKey) {
    const key = ensureApiKey(apiKey);
    const videoUrl = id.startsWith("http") ? id : `https://www.youtube.com/watch?v=${id}`;
    const targetUrl = `${BASE_URL}/api/ytaudio?url=${encodeURIComponent(videoUrl)}&apikey=${encodeURIComponent(key)}`;

    return await requestHelper(targetUrl, {
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
    });
  },

  /**
   * Get YouTube Video (MP4) download information
   * @param {string} id YouTube Video ID or URL
   * @param {string} quality Video quality (default 720)
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async getVideoInfo(id, quality = "720", apiKey) {
    const key = ensureApiKey(apiKey);
    const videoUrl = id.startsWith("http") ? id : `https://www.youtube.com/watch?v=${id}`;
    const targetUrl = `${BASE_URL}/api/ytvideo?url=${encodeURIComponent(videoUrl)}&quality=${encodeURIComponent(quality)}&apikey=${encodeURIComponent(key)}`;

    return await requestHelper(targetUrl, {
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
    });
  },

  /**
   * Get Spotify Downloader information
   * @param {string} spotifyUrl Spotify track/album URL
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async getSpotifyDownload(spotifyUrl, apiKey) {
    const key = ensureApiKey(apiKey);
    const targetUrl = `${BASE_URL}/api/spotify?url=${encodeURIComponent(spotifyUrl)}&apikey=${encodeURIComponent(key)}`;

    return await requestHelper(targetUrl, {
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
    });
  },

  /**
   * Get TikTok Downloader information
   * @param {string} tiktokUrl TikTok video URL
   * @param {string} apiKey NAZE_API_KEY
   * @returns {Promise<Object>}
   */
  async getTikTokDownload(tiktokUrl, apiKey) {
    const key = ensureApiKey(apiKey);
    const targetUrl = `${BASE_URL}/api/tiktok?url=${encodeURIComponent(tiktokUrl)}&apikey=${encodeURIComponent(key)}`;

    return await requestHelper(targetUrl, {
      timeoutMs: config.providers.naze.timeoutMs,
      retryCount: config.providers.naze.retryCount,
    });
  },
};
