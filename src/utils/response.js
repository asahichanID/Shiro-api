/**
 * Standardized Response Formatter
 * Enforces unified response schema across shiro-api
 */

import { HTTP_STATUS, PROVIDERS } from "../constants.js";
import { withCors } from "./cors.js";

/**
 * Creates a standardized JSON Success Response
 * @param {Object} params
 * @param {any} params.result Payload result
 * @param {string} [params.provider='naze'] Provider identifier
 * @param {boolean} [params.cached=false] Is response served from cache
 * @param {number} [params.status=200] HTTP Status code
 * @param {Object} [params.extraHeaders={}] Additional response headers
 * @returns {Response}
 */
export function successResponse({
  result = {},
  provider = PROVIDERS.NAZE,
  cached = false,
  status = HTTP_STATUS.OK,
  extraHeaders = {},
}) {
  const body = {
    success: true,
    provider,
    cached,
    result,
  };

  const response = new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });

  return withCors(response);
}

/**
 * Creates a standardized JSON Error Response
 * @param {Object} params
 * @param {string} params.message Error description
 * @param {string} params.code Error code constant
 * @param {number} [params.status=400] HTTP Status code
 * @param {Object} [params.extraHeaders={}] Additional response headers
 * @returns {Response}
 */
export function errorResponse({
  message = "An error occurred",
  code = "ERROR",
  status = HTTP_STATUS.BAD_REQUEST,
  extraHeaders = {},
}) {
  const body = {
    success: false,
    message,
    code,
  };

  const response = new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });

  return withCors(response);
}
