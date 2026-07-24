/**
 * Global Error Classes and Central Error Handler
 */

import { HTTP_STATUS, ERROR_CODES } from "../constants.js";
import { errorResponse } from "./response.js";
import { Logger } from "./logger.js";

/**
 * Base Application Error
 */
export class AppError extends Error {
  constructor(message, code = ERROR_CODES.INTERNAL_ERROR, status = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message, code = ERROR_CODES.INVALID_PARAM) {
    super(message, code, HTTP_STATUS.BAD_REQUEST);
  }
}

/**
 * Provider Error (Naze API failure or upstream issue)
 */
export class ProviderError extends AppError {
  constructor(message, code = ERROR_CODES.PROVIDER_ERROR, status = HTTP_STATUS.BAD_GATEWAY) {
    super(message, code, status);
  }
}

/**
 * Unauthorized Error
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access", code = ERROR_CODES.UNAUTHORIZED) {
    super(message, code, HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(message = "Endpoint or resource not found", code = ERROR_CODES.NOT_FOUND) {
    super(message, code, HTTP_STATUS.NOT_FOUND);
  }
}

/**
 * Centralized Global Error Handler
 * Ensures worker never crashes and returns consistent JSON errors
 * @param {Error|AppError|any} err
 * @returns {Response}
 */
export function handleGlobalError(err) {
  Logger.error("Unhandled exception caught in global handler", err);

  if (err instanceof AppError) {
    return errorResponse({
      message: err.message,
      code: err.code,
      status: err.status,
    });
  }

  // Handle SyntaxError (JSON parse errors)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return errorResponse({
      message: "Malformed JSON payload provided.",
      code: ERROR_CODES.BAD_REQUEST,
      status: HTTP_STATUS.BAD_REQUEST,
    });
  }

  // Fallback for unhandled/unexpected native runtime errors
  const message = err?.message || "An unexpected internal server error occurred.";
  return errorResponse({
    message,
    code: ERROR_CODES.INTERNAL_ERROR,
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  });
}
