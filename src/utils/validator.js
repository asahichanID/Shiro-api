/**
 * Parameter and Payload Validator Module
 * Validates search query, ID, URL, quality, and empty parameters
 */

import { DEFAULT_QUALITY, SUPPORTED_QUALITIES } from "../constants.js";
import { ValidationError } from "./errors.js";

/**
 * Validates that a required parameter exists and is not empty
 * @param {string} value Parameter value
 * @param {string} paramName Name of parameter for error reporting
 */
export function validateRequired(value, paramName) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new ValidationError(`Parameter '${paramName}' is required and cannot be empty.`);
  }
  return String(value).trim();
}

/**
 * Validates search query string
 * @param {string} query
 * @returns {string} Cleaned query string
 */
export function validateQuery(query) {
  const cleaned = validateRequired(query, "query");
  if (cleaned.length < 2) {
    throw new ValidationError("Search query must be at least 2 characters long.");
  }
  if (cleaned.length > 500) {
    throw new ValidationError("Search query exceeds maximum length of 500 characters.");
  }
  return cleaned;
}

/**
 * Validates resource ID (e.g. YouTube ID or Media ID)
 * @param {string} id
 * @returns {string}
 */
export function validateId(id) {
  const cleaned = validateRequired(id, "id");
  // Basic sanity check for media IDs (no extreme characters or script injection)
  if (!/^[a-zA-Z0-9_\-:=]+$/.test(cleaned)) {
    throw new ValidationError("Invalid 'id' format. Only alphanumeric characters, hyphens, and underscores are allowed.");
  }
  return cleaned;
}

/**
 * Validates target URL (Spotify, TikTok, YouTube, etc.)
 * @param {string} urlString
 * @param {Array<string>} [allowedDomains] Optional allowed domain substrings
 * @returns {string} Validated URL string
 */
export function validateUrl(urlString, allowedDomains = []) {
  const cleaned = validateRequired(urlString, "url");
  
  let parsedUrl;
  try {
    parsedUrl = new URL(cleaned);
  } catch {
    throw new ValidationError("Invalid URL format. Must be a valid HTTP or HTTPS URL.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new ValidationError("URL protocol must be HTTP or HTTPS.");
  }

  if (allowedDomains.length > 0) {
    const hostname = parsedUrl.hostname.toLowerCase();
    const isDomainAllowed = allowedDomains.some((domain) => hostname.includes(domain.toLowerCase()));
    if (!isDomainAllowed) {
      throw new ValidationError(`URL domain '${hostname}' is not supported for this provider.`);
    }
  }

  return cleaned;
}

/**
 * Validates video/media quality setting
 * @param {string} quality Input quality string
 * @returns {string} Normalized quality string (defaults to 720 if empty or invalid)
 */
export function validateQuality(quality) {
  if (!quality || String(quality).trim() === "") {
    return DEFAULT_QUALITY.VIDEO; // Default 720
  }

  const cleanQuality = String(quality).trim();
  if (!SUPPORTED_QUALITIES.includes(cleanQuality)) {
    // If numeric, extract digits, else fallback to default
    const digits = cleanQuality.replace(/\D/g, "");
    if (SUPPORTED_QUALITIES.includes(digits)) {
      return digits;
    }
    return DEFAULT_QUALITY.VIDEO;
  }

  return cleanQuality;
}
