export type SDKErrorCode =
  | "NETWORK_ERROR"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

export interface SDKErrorDetails {
  code: SDKErrorCode;
  message: string;
  status?: number;
  originalError?: unknown;
}

/**
 * Eden Treaty error response structure.
 * Eden returns { status, value } where value contains the error body.
 */
export interface EdenErrorResponse {
  status: unknown;
  value: unknown;
}

/**
 * Custom error class for SDK operations.
 * Provides structured error information with status codes and error codes.
 */
export class SDKError extends Error {
  readonly code: SDKErrorCode;
  readonly status?: number;
  readonly originalError?: unknown;

  constructor(details: SDKErrorDetails) {
    super(details.message);
    this.name = "SDKError";
    this.code = details.code;
    this.status = details.status;
    this.originalError = details.originalError;
  }

  /**
   * Creates an SDKError from an Eden Treaty error response.
   * Eden returns errors with { status, value } structure.
   */
  static fromEdenError(error: EdenErrorResponse): SDKError {
    const message = extractMessage(error.value);
    const status = typeof error.status === "number" ? error.status : 500;
    return SDKError.fromResponse(status, message, error.value);
  }

  /**
   * Creates an SDKError from an HTTP status code and optional message.
   */
  static fromResponse(
    status: number,
    message?: string,
    originalError?: unknown
  ): SDKError {
    if (status === 401) {
      return new SDKError({
        code: "UNAUTHORIZED",
        message: message ?? "Unauthorized",
        originalError,
        status,
      });
    }

    if (status === 404) {
      return new SDKError({
        code: "NOT_FOUND",
        message: message ?? "Resource not found",
        originalError,
        status,
      });
    }

    if (status >= 400 && status < 500) {
      return new SDKError({
        code: "VALIDATION_ERROR",
        message: message ?? "Validation error",
        originalError,
        status,
      });
    }

    if (status >= 500) {
      return new SDKError({
        code: "SERVER_ERROR",
        message: message ?? "Server error",
        originalError,
        status,
      });
    }

    return new SDKError({
      code: "UNKNOWN_ERROR",
      message: message ?? "Unknown error",
      originalError,
      status,
    });
  }

  /**
   * Creates an SDKError from a network error (e.g., connection refused).
   */
  static fromNetworkError(error: unknown): SDKError {
    return new SDKError({
      code: "NETWORK_ERROR",
      message: error instanceof Error ? error.message : "Network error",
      originalError: error,
    });
  }
}

/**
 * Extracts a message string from an error value.
 * Handles various error response formats.
 */
const extractMessage = (value: unknown): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && "message" in value) {
    const msg = (value as { message: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }

  return undefined;
};
