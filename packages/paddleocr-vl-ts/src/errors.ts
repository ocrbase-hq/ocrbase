/* eslint-disable max-classes-per-file -- Error hierarchies are best kept in a single file */

/** Base error class for all PaddleOCR-related errors. */
export class PaddleOCRError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "PaddleOCRError";
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the PaddleOCR API returns a non-2xx HTTP status.
 */
export class PaddleOCRHttpError extends PaddleOCRError {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly url: string,
    cause?: unknown
  ) {
    super(`HTTP ${status} ${statusText} from ${url}`, cause);
    this.name = "PaddleOCRHttpError";
  }
}

/**
 * Thrown when the PaddleOCR API returns an error response (errorCode !== 0).
 */
export class PaddleOCRApiError extends PaddleOCRError {
  constructor(
    public readonly errorCode: number,
    public readonly errorMsg: string,
    public readonly logId: string
  ) {
    super(
      `PaddleOCR API error: ${errorMsg} (code: ${errorCode}, logId: ${logId})`
    );
    this.name = "PaddleOCRApiError";
  }
}

/**
 * Thrown when the API response fails Zod schema validation.
 */
export class PaddleOCRValidationError extends PaddleOCRError {
  constructor(
    message: string,
    public readonly issues: unknown[],
    cause?: unknown
  ) {
    super(message, cause);
    this.name = "PaddleOCRValidationError";
  }
}

/**
 * Thrown when a network error occurs (fetch fails).
 */
export class PaddleOCRNetworkError extends PaddleOCRError {
  constructor(
    public readonly url: string,
    cause?: unknown
  ) {
    super(`Network error while connecting to ${url}`, cause);
    this.name = "PaddleOCRNetworkError";
  }
}

/**
 * Thrown when a request times out.
 */
export class PaddleOCRTimeoutError extends PaddleOCRError {
  constructor(
    public readonly timeoutMs: number,
    public readonly url: string
  ) {
    super(`Request to ${url} timed out after ${timeoutMs}ms`);
    this.name = "PaddleOCRTimeoutError";
  }
}
