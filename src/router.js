/**
 * Modular Router Engine for Cloudflare Workers
 * Dispatches incoming requests cleanly without nested if blocks
 */

import { handleOptions } from "./utils/cors.js";
import { NotFoundError } from "./utils/errors.js";

import { handleHealth } from "./routes/health.js";
import { handleStatus } from "./routes/status.js";
import { handleVersion } from "./routes/version.js";
import { handleSearch } from "./routes/search.js";
import { handleAudio } from "./routes/audio.js";
import { handleVideo } from "./routes/video.js";
import { handleSpotify } from "./routes/spotify.js";
import { handleTikTok } from "./routes/tiktok.js";
import { handleRegister, handleLogin, handleMe } from "./routes/auth.js";
import { handleUserProfile, handleUpdateProfile } from "./routes/user.js";

export class Router {
  constructor() {
    this.routes = [];
  }

  /**
   * Register a route handler
   * @param {string} method HTTP Method
   * @param {string} path Exact or pattern path
   * @param {Function} handler
   */
  add(method, path, handler) {
    this.routes.push({
      method: method.toUpperCase(),
      path,
      handler,
    });
  }

  get(path, handler) {
    this.add("GET", path, handler);
  }

  post(path, handler) {
    this.add("POST", path, handler);
  }

  put(path, handler) {
    this.add("PUT", path, handler);
  }

  delete(path, handler) {
    this.add("DELETE", path, handler);
  }

  /**
   * Dispatch request to registered handler
   * @param {Request} request
   * @param {Object} env
   * @param {Object} ctx
   * @returns {Promise<Response>}
   */
  async handle(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const pathname = url.pathname;

    // Handle Preflight CORS OPTIONS requests
    if (method === "OPTIONS") {
      return handleOptions();
    }

    // Find matching route
    for (const route of this.routes) {
      if (route.method === method && route.path === pathname) {
        return await route.handler(request, env, ctx);
      }
    }

    // Default route match fallback for trailing slashes
    if (pathname.endsWith("/") && pathname.length > 1) {
      const trimmedPath = pathname.slice(0, -1);
      for (const route of this.routes) {
        if (route.method === method && route.path === trimmedPath) {
          return await route.handler(request, env, ctx);
        }
      }
    }

    throw new NotFoundError(`Endpoint '${method} ${pathname}' not found on this API Gateway.`);
  }
}

/**
 * Configure and initialize router instance
 */
export function createConfiguredRouter() {
  const router = new Router();

  // Core System Routes
  router.get("/", handleStatus);
  router.get("/health", handleHealth);
  router.get("/status", handleStatus);
  router.get("/version", handleVersion);

  router.get("/api", handleStatus);
  router.get("/api/health", handleHealth);
  router.get("/api/status", handleStatus);
  router.get("/api/version", handleVersion);

  // Search Routes (Aliases: /search, /search/youtube, /search/spotify, /ytsearch, /api/search, /api/search/youtube, /api/ytsearch)
  router.get("/search", handleSearch);
  router.get("/search/youtube", handleSearch);
  router.get("/search/spotify", handleSearch);
  router.get("/ytsearch", handleSearch);
  router.get("/api/search", handleSearch);
  router.get("/api/search/youtube", handleSearch);
  router.get("/api/search/spotify", handleSearch);
  router.get("/api/ytsearch", handleSearch);
  router.post("/search", handleSearch);
  router.post("/search/youtube", handleSearch);
  router.post("/search/spotify", handleSearch);

  // Audio Routes
  router.get("/audio", handleAudio);
  router.get("/ytaudio", handleAudio);
  router.get("/download/youtube", handleAudio);
  router.get("/download/audio", handleAudio);
  router.get("/downloader/ytaudio", handleAudio);
  router.get("/downloader/audio", handleAudio);
  router.get("/api/audio", handleAudio);
  router.get("/api/ytaudio", handleAudio);
  router.get("/api/download/youtube", handleAudio);
  router.get("/api/downloader/ytaudio", handleAudio);
  router.get("/api/downloader/audio", handleAudio);
  router.post("/audio", handleAudio);
  router.post("/ytaudio", handleAudio);

  // Video Routes
  router.get("/video", handleVideo);
  router.get("/ytvideo", handleVideo);
  router.get("/download/video", handleVideo);
  router.get("/downloader/ytvideo", handleVideo);
  router.get("/downloader/video", handleVideo);
  router.get("/api/video", handleVideo);
  router.get("/api/ytvideo", handleVideo);
  router.get("/api/download/video", handleVideo);
  router.get("/api/downloader/ytvideo", handleVideo);
  router.get("/api/downloader/video", handleVideo);
  router.post("/video", handleVideo);
  router.post("/ytvideo", handleVideo);

  // Spotify Routes
  router.get("/spotify", handleSpotify);
  router.get("/spotify/search", handleSpotify);
  router.get("/download/spotify", handleSpotify);
  router.get("/downloader/spotify", handleSpotify);
  router.get("/api/spotify", handleSpotify);
  router.get("/api/spotify/search", handleSpotify);
  router.get("/api/download/spotify", handleSpotify);
  router.get("/api/downloader/spotify", handleSpotify);
  router.post("/spotify", handleSpotify);

  // TikTok Routes
  router.get("/tiktok", handleTikTok);
  router.get("/download/tiktok", handleTikTok);
  router.get("/downloader/tiktok", handleTikTok);
  router.get("/api/tiktok", handleTikTok);
  router.get("/api/download/tiktok", handleTikTok);
  router.get("/api/downloader/tiktok", handleTikTok);
  router.post("/tiktok", handleTikTok);

  // User & JWT Auth Routes
  router.post("/auth/register", handleRegister);
  router.post("/auth/login", handleLogin);
  router.get("/auth/me", handleMe);
  router.get("/user/profile", handleUserProfile);
  router.put("/user/profile", handleUpdateProfile);

  router.post("/api/auth/register", handleRegister);
  router.post("/api/auth/login", handleLogin);
  router.get("/api/auth/me", handleMe);
  router.get("/api/user/profile", handleUserProfile);
  router.put("/api/user/profile", handleUpdateProfile);

  return router;
}
