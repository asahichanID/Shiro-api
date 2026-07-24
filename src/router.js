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

  // Media & Download Provider Routes
  router.get("/search", handleSearch);
  router.get("/audio", handleAudio);
  router.get("/video", handleVideo);
  router.get("/spotify", handleSpotify);
  router.get("/tiktok", handleTikTok);

  // User & JWT Auth Routes
  router.post("/auth/register", handleRegister);
  router.post("/auth/login", handleLogin);
  router.get("/auth/me", handleMe);
  router.get("/user/profile", handleUserProfile);
  router.put("/user/profile", handleUpdateProfile);

  return router;
}
