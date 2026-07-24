/**
 * CORS Helper Utilities for Cloudflare Worker
 */

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-API-Key",
  "Access-Control-Max-Age": "86400",
};

/**
 * Handle preflight OPTIONS request
 * @returns {Response}
 */
export function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Attach CORS headers to a given Response
 * @param {Response} response
 * @returns {Response}
 */
export function withCors(response) {
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
