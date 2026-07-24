/**
 * Upstream Request Helper
 * Supports Timeout, Exponential Backoff Retries, AbortController, JSON parsing, and Normalized Error Handling
 */

import { ERROR_CODES } from "../constants.js";
import { ProviderError } from "../utils/errors.js";

/**
 * Execute HTTP fetch request to external provider with timeout and retry logic
 * @param {string} url Destination URL
 * @param {Object} [options={}] Request options
 * @param {string} [options.method='GET'] HTTP Method
 * @param {Object} [options.headers={}] Headers
 * @param {any} [options.body=null] Request body
 * @param {number} [options.timeoutMs=15000] Request timeout in ms
 * @param {number} [options.retryCount=2] Max retries on failure
 * @param {number} [options.retryDelayMs=500] Delay between retries in ms
 * @returns {Promise<any>} Parsed JSON or Response payload
 */
export async function requestHelper(url, options = {}) {
  const {
    method = "GET",
    headers = {},
    body = null,
    timeoutMs = 15000,
    retryCount = 2,
    retryDelayMs = 500,
  } = options;

  let attempt = 0;
  let lastError = null;

  while (attempt <= retryCount) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const fetchOptions = {
        method,
        headers: {
          "User-Agent": "shiro-api-gateway/1.0",
          Accept: "application/json, text/plain, */*",
          ...headers,
        },
        signal: controller.signal,
      };

      if (body) {
        fetchOptions.body = typeof body === "object" ? JSON.stringify(body) : body;
        if (!fetchOptions.headers["Content-Type"]) {
          fetchOptions.headers["Content-Type"] = "application/json";
        }
      }

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetails = "";
        try {
          const errJson = await response.json();
          errorDetails = errJson.message || errJson.error || JSON.stringify(errJson);
        } catch {
          errorDetails = await response.text();
        }

        throw new ProviderError(
          `Upstream provider returned HTTP ${response.status}: ${errorDetails.slice(0, 200)}`,
          ERROR_CODES.PROVIDER_ERROR,
          response.status >= 500 ? 502 : response.status
        );
      }

      // Parse JSON response
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return await response.json();
      } else {
        const textData = await response.text();
        try {
          return JSON.parse(textData);
        } catch {
          return { data: textData };
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;

      if (err.name === "AbortError") {
        lastError = new ProviderError(
          `Upstream provider request timed out after ${timeoutMs}ms`,
          ERROR_CODES.PROVIDER_TIMEOUT,
          504
        );
      }

      attempt++;
      if (attempt <= retryCount) {
        // Wait exponential backoff before retry
        const delay = retryDelayMs * Math.pow(1.5, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // If retries exhausted, throw normalized error
  if (lastError instanceof ProviderError) {
    throw lastError;
  }

  throw new ProviderError(
    `Provider request failed after ${retryCount + 1} attempts: ${lastError?.message || "Unknown network error"}`,
    ERROR_CODES.PROVIDER_ERROR,
    502
  );
}
