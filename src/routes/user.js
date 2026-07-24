/**
 * User Module Profile Management
 * GET /user/profile
 * PUT /user/profile
 */

import { successResponse } from "../utils/response.js";
import { extractBearerToken, verifyJwt } from "../utils/jwt.js";
import { getEnvConfig } from "../config.js";
import { UnauthorizedError, ValidationError } from "../utils/errors.js";
import { CacheManager } from "../utils/cache.js";

/**
 * Get User Profile
 * GET /user/profile
 */
export async function handleUserProfile(request, env) {
  const token = extractBearerToken(request);
  if (!token) {
    throw new UnauthorizedError("Bearer token required to view user profile.");
  }

  const { jwtSecret } = getEnvConfig(env);
  const claims = await verifyJwt(token, jwtSecret);

  const userKey = `user:${claims.email.toLowerCase()}`;
  const profile = (await CacheManager.get(userKey, env)) || {
    id: claims.sub,
    email: claims.email,
    username: claims.email.split("@")[0],
    role: claims.role,
    createdAt: new Date().toISOString(),
  };

  return successResponse({
    result: profile,
    cached: false,
  });
}

/**
 * Update User Profile
 * PUT /user/profile
 */
export async function handleUpdateProfile(request, env) {
  const token = extractBearerToken(request);
  if (!token) {
    throw new UnauthorizedError("Bearer token required to update user profile.");
  }

  const { jwtSecret } = getEnvConfig(env);
  const claims = await verifyJwt(token, jwtSecret);

  let updates;
  try {
    updates = await request.json();
  } catch {
    throw new ValidationError("Invalid JSON payload provided.");
  }

  const userKey = `user:${claims.email.toLowerCase()}`;
  const existingProfile = (await CacheManager.get(userKey, env)) || {
    id: claims.sub,
    email: claims.email,
    username: claims.email.split("@")[0],
    role: claims.role,
    createdAt: new Date().toISOString(),
  };

  const updatedProfile = {
    ...existingProfile,
    username: updates.username ? String(updates.username).trim() : existingProfile.username,
    displayName: updates.displayName ? String(updates.displayName).trim() : existingProfile.displayName,
    avatarUrl: updates.avatarUrl ? String(updates.avatarUrl).trim() : existingProfile.avatarUrl,
    updatedAt: new Date().toISOString(),
  };

  await CacheManager.set(userKey, updatedProfile, 86400 * 30, env);

  return successResponse({
    result: {
      profile: updatedProfile,
      message: "Profile updated successfully.",
    },
    cached: false,
  });
}
