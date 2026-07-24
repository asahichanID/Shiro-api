/**
 * WebCrypto JWT Utility for Cloudflare Workers
 * Uses native crypto.subtle (HMAC SHA-256) - Zero dependencies
 */

import { ERROR_CODES } from "../constants.js";
import { UnauthorizedError } from "./errors.js";

/**
 * Base64URL encode string or ArrayBuffer
 * @param {Uint8Array|ArrayBuffer|string} input
 * @returns {string}
 */
function base64UrlEncode(input) {
  let bytes;
  if (typeof input === "string") {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = new Uint8Array(input);
  }

  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Base64URL decode
 * @param {string} input
 * @returns {string}
 */
function base64UrlDecode(input) {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Get CryptoKey for HMAC SHA-256
 * @param {string} secret
 * @returns {Promise<CryptoKey>}
 */
async function getCryptoKey(secret) {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Sign JWT token
 * @param {Object} payload Payload claims
 * @param {string} secret Secret signing key
 * @param {number} [expiresInSeconds=86400] Expiration in seconds
 * @returns {Promise<string>} Signed JWT string
 */
export async function signJwt(payload, secret, expiresInSeconds = 86400) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
    iss: "shiro-api-gateway",
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(dataToSign)
  );

  const encodedSignature = base64UrlEncode(signatureBuffer);
  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verify and decode JWT token
 * @param {string} token JWT token string
 * @param {string} secret Secret signing key
 * @returns {Promise<Object>} Decoded payload claims
 */
export async function verifyJwt(token, secret) {
  if (!token || typeof token !== "string") {
    throw new UnauthorizedError("JWT token is missing or invalid format.", ERROR_CODES.JWT_INVALID);
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new UnauthorizedError("JWT token structure is invalid.", ERROR_CODES.JWT_INVALID);
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey(secret);

  // Decode signature to Uint8Array
  let signatureBytes;
  try {
    let base64Sig = encodedSignature.replace(/-/g, "+").replace(/_/g, "/");
    while (base64Sig.length % 4) {
      base64Sig += "=";
    }
    const binarySig = atob(base64Sig);
    signatureBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      signatureBytes[i] = binarySig.charCodeAt(i);
    }
  } catch {
    throw new UnauthorizedError("JWT signature decoding failed.", ERROR_CODES.JWT_INVALID);
  }

  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    new TextEncoder().encode(dataToSign)
  );

  if (!isValid) {
    throw new UnauthorizedError("JWT signature verification failed.", ERROR_CODES.JWT_INVALID);
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload));
  } catch {
    throw new UnauthorizedError("Failed to parse JWT payload.", ERROR_CODES.JWT_INVALID);
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new UnauthorizedError("JWT token has expired.", ERROR_CODES.JWT_EXPIRED);
  }

  return payload;
}

/**
 * Helper to extract Bearer token from Authorization header
 * @param {Request} request
 * @returns {string|null}
 */
export function extractBearerToken(request) {
  const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1].trim();
  }
  return null;
}
