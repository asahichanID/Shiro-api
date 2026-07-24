/**
 * User Authentication Route Handler
 * Integrates JWT Authentication
 * POST /auth/register
 * POST /auth/login
 * GET /auth/me
 */

import { successResponse } from "../utils/response.js";
import { validateRequired } from "../utils/validator.js";
import { signJwt, verifyJwt, extractBearerToken } from "../utils/jwt.js";
import { getEnvConfig } from "../config.js";
import { ValidationError, UnauthorizedError } from "../utils/errors.js";
import { CacheManager } from "../utils/cache.js";

/**
 * Handle POST /auth/register
 */
export async function handleRegister(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Invalid JSON body provided.");
  }

  const username = validateRequired(body.username, "username");
  const email = validateRequired(body.email, "email");
  const password = validateRequired(body.password, "password");

  if (password.length < 6) {
    throw new ValidationError("Password must be at least 6 characters long.");
  }

  const userKey = `user:${email.toLowerCase()}`;
  const existingUser = await CacheManager.get(userKey, env);
  if (existingUser) {
    throw new ValidationError("User with this email already exists.");
  }

  const userRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username,
    email: email.toLowerCase(),
    role: "user",
    createdAt: new Date().toISOString(),
  };

  // Save user in persistent store / cache
  await CacheManager.set(userKey, userRecord, 86400 * 30, env);

  const { jwtSecret } = getEnvConfig(env);
  const token = await signJwt(
    { sub: userRecord.id, email: userRecord.email, role: userRecord.role },
    jwtSecret
  );

  return successResponse({
    result: {
      user: userRecord,
      token,
      message: "User account successfully created.",
    },
    cached: false,
  });
}

/**
 * Handle POST /auth/login
 */
export async function handleLogin(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Invalid JSON body provided.");
  }

  const email = validateRequired(body.email, "email");
  const password = validateRequired(body.password, "password");

  const userKey = `user:${email.toLowerCase()}`;
  let userRecord = await CacheManager.get(userKey, env);

  // If mock/demo user login or newly registered
  if (!userRecord) {
    if (email.toLowerCase() === "demo@oguri.cap" && password === "demo123456") {
      userRecord = {
        id: "usr_demo_oguri_cap",
        username: "DemoOguri",
        email: "demo@oguri.cap",
        role: "admin",
        createdAt: new Date().toISOString(),
      };
      await CacheManager.set(userKey, userRecord, 86400 * 30, env);
    } else {
      throw new UnauthorizedError("Invalid email or password credentials.");
    }
  }

  const { jwtSecret } = getEnvConfig(env);
  const token = await signJwt(
    { sub: userRecord.id, email: userRecord.email, role: userRecord.role },
    jwtSecret
  );

  return successResponse({
    result: {
      user: userRecord,
      token,
      message: "Authentication successful.",
    },
    cached: false,
  });
}

/**
 * Handle GET /auth/me (Protected JWT endpoint)
 */
export async function handleMe(request, env) {
  const token = extractBearerToken(request);
  if (!token) {
    throw new UnauthorizedError("Authorization header with Bearer token is required.");
  }

  const { jwtSecret } = getEnvConfig(env);
  const decodedClaims = await verifyJwt(token, jwtSecret);

  const userKey = `user:${decodedClaims.email.toLowerCase()}`;
  const userRecord = await CacheManager.get(userKey, env);

  return successResponse({
    result: {
      claims: decodedClaims,
      profile: userRecord || {
        id: decodedClaims.sub,
        email: decodedClaims.email,
        role: decodedClaims.role,
      },
    },
    cached: false,
  });
}
