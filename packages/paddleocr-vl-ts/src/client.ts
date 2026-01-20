import type { InferRequestOptions, InferResult } from "./types";

import {
  ClientConfigSchema,
  DEFAULT_INFER_OPTIONS,
  type ClientConfig,
  type ClientOptions,
} from "./config";
import {
  PaddleOCRApiError,
  PaddleOCRHttpError,
  PaddleOCRNetworkError,
  PaddleOCRTimeoutError,
  PaddleOCRValidationError,
} from "./errors";
import {
  HealthResponseSchema,
  InferRequestSchema,
  InferResponseSchema,
} from "./schemas";
import { combineMarkdown, extractImages, getPageCount } from "./utils";

/* eslint-disable promise/avoid-new -- setTimeout wrapper is the standard pattern */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
/* eslint-enable promise/avoid-new */

/**
 * Type-safe PaddleOCR client with Zod validation.
 *
 * @example
 * ```typescript
 * const client = new PaddleOCRClient({
 *   layoutUrl: "http://localhost:8080",
 *   timeout: 60_000,
 * });
 *
 * const result = await client.parseDocument(base64File, { fileType: 0 });
 * const markdown = PaddleOCRClient.combineMarkdown(result);
 * ```
 */
export class PaddleOCRClient {
  private readonly config: ClientConfig;

  /** Create a new PaddleOCR client. Throws PaddleOCRValidationError if configuration is invalid. */
  constructor(options: ClientOptions) {
    const parseResult = ClientConfigSchema.safeParse(options);
    if (!parseResult.success) {
      throw new PaddleOCRValidationError(
        "Invalid client configuration",
        parseResult.error.issues,
        parseResult.error
      );
    }
    this.config = parseResult.data;
  }

  /** Get the configured layout URL */
  get layoutUrl(): string {
    return this.config.layoutUrl;
  }

  /** Get the configured GenAI URL (if set) */
  get genaiUrl(): string | undefined {
    return this.config.genaiUrl;
  }

  /** Check if the PaddleOCR service is healthy. Returns true if healthy, false otherwise. */
  async checkHealth(): Promise<boolean> {
    try {
      return await this.performHealthCheck();
    } catch {
      return false;
    }
  }

  private async performHealthCheck(): Promise<boolean> {
    const url = `${this.config.layoutUrl}/health`;
    const response = await this.fetchWithTimeout(url, {
      headers: { "Content-Type": "application/json" },
      method: "GET",
    });

    if (!response.ok) {
      return false;
    }

    const data: unknown = await response.json();
    const parsed = HealthResponseSchema.safeParse(data);

    if (!parsed.success) {
      this.debug("Health check validation failed:", parsed.error);
      return false;
    }

    return parsed.data.errorCode === 0;
  }

  /**
   * Parse a document using PaddleOCR.
   * Throws PaddleOCRHttpError, PaddleOCRApiError, PaddleOCRValidationError, PaddleOCRNetworkError, or PaddleOCRTimeoutError on failure.
   */
  parseDocument(
    fileBase64: string,
    options: Partial<InferRequestOptions> = {}
  ): Promise<InferResult> {
    const url = `${this.config.layoutUrl}/layout-parsing`;

    const request = InferRequestSchema.parse({
      ...DEFAULT_INFER_OPTIONS,
      ...options,
      file: fileBase64,
    });

    this.debug("Request params:", {
      fileType: request.fileType,
      useLayoutDetection: request.useLayoutDetection,
    });

    return this.executeWithRetries(() =>
      this.executeParseRequest(url, request)
    );
  }

  private async executeParseRequest(
    url: string,
    request: ReturnType<typeof InferRequestSchema.parse>
  ): Promise<InferResult> {
    const response = await this.fetchWithTimeout(url, {
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      throw new PaddleOCRHttpError(response.status, response.statusText, url);
    }

    const data: unknown = await response.json();
    return PaddleOCRClient.validateAndExtractResult(data);
  }

  private static validateAndExtractResult(data: unknown): InferResult {
    const parseResult = InferResponseSchema.safeParse(data);

    if (!parseResult.success) {
      throw new PaddleOCRValidationError(
        "Invalid API response structure",
        parseResult.error.issues,
        parseResult.error
      );
    }

    const validatedData = parseResult.data;

    if (validatedData.errorCode !== 0) {
      throw new PaddleOCRApiError(
        validatedData.errorCode,
        validatedData.errorMsg,
        validatedData.logId
      );
    }

    return (validatedData as { result: InferResult }).result;
  }

  // ============================================
  // Static utility methods (for backward compatibility)
  // ============================================

  /** Combine all markdown results into a single string */
  static combineMarkdown = combineMarkdown;

  /** Get page count from result */
  static getPageCount = getPageCount;

  /** Extract all embedded images from result */
  static extractImages = extractImages;

  // ============================================
  // Private helper methods
  // ============================================

  private async fetchWithTimeout(
    url: string,
    init: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new PaddleOCRTimeoutError(this.config.timeout, url);
      }
      throw new PaddleOCRNetworkError(url, error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async executeWithRetries<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.config.retries; attempt += 1) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        await this.handleRetryError(error, attempt);
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private async handleRetryError(
    error: unknown,
    attempt: number
  ): Promise<void> {
    const isRetryable =
      error instanceof PaddleOCRNetworkError ||
      error instanceof PaddleOCRTimeoutError;

    if (!isRetryable || attempt === this.config.retries) {
      throw error;
    }

    this.debug(`Retry attempt ${attempt + 1}/${this.config.retries}`);
    await sleep(this.config.retryDelay);
  }

  private debug(...args: unknown[]): void {
    if (this.config.debug) {
      console.info("[PaddleOCR]", ...args);
    }
  }
}
