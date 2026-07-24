/**
 * Simple Structured Request Logger
 * Logs Endpoint, Method, Status, Response Time (ms), and Timestamp
 */

export class Logger {
  /**
   * Log an incoming request cycle outcome
   * @param {Object} params
   * @param {string} params.endpoint Requested URL path
   * @param {string} params.method HTTP Method
   * @param {number} params.status Response HTTP Status Code
   * @param {number} params.responseTimeMs Duration in milliseconds
   * @param {string} [params.clientIp] Client IP address if available
   */
  static logRequest({ endpoint, method, status, responseTimeMs, clientIp = "unknown" }) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      method: method.toUpperCase(),
      endpoint,
      status,
      responseTimeMs: `${responseTimeMs.toFixed(2)}ms`,
      clientIp,
    };

    const statusGroup = Math.floor(status / 100);
    const logPrefix = `[shiro-api] [${timestamp}] ${method} ${endpoint} -> ${status} (${responseTimeMs.toFixed(2)}ms)`;

    if (statusGroup >= 5) {
      console.error(logPrefix, JSON.stringify(logData));
    } else if (statusGroup >= 4) {
      console.warn(logPrefix, JSON.stringify(logData));
    } else {
      console.log(logPrefix, JSON.stringify(logData));
    }
  }

  static error(message, error) {
    console.error(`[shiro-api ERROR] ${new Date().toISOString()} - ${message}`, error);
  }

  static info(message, data) {
    console.log(`[shiro-api INFO] ${new Date().toISOString()} - ${message}`, data || "");
  }
}
