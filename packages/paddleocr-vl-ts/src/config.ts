import { z } from "zod";

import type { InferRequestOptions } from "./types";

/**
 * Client configuration schema with validation.
 */
export const ClientConfigSchema = z.object({
  /** Enable debug logging (default: false) */
  debug: z.boolean().default(false),

  /** Base URL for the GenAI service (optional, for future use) */
  genaiUrl: z
    .string()
    .transform((s) => new URL(s).href)
    .optional(),

  /** Base URL for the layout parsing service */
  layoutUrl: z.string().transform((s) => new URL(s).href),

  /** Number of retry attempts for transient failures (default: 0) */
  retries: z.number().int().min(0).max(10).default(0),

  /** Delay between retries in milliseconds (default: 1 second) */
  retryDelay: z.number().positive().default(1000),

  /** Request timeout in milliseconds (default: 5 minutes) */
  timeout: z.number().positive().default(300_000),
});

/** Validated client configuration */
export type ClientConfig = z.infer<typeof ClientConfigSchema>;

/** Input options for client constructor (with defaults applied) */
export type ClientOptions = z.input<typeof ClientConfigSchema>;

/**
 * Default request options applied to all parseDocument calls.
 */
export const DEFAULT_INFER_OPTIONS: Partial<InferRequestOptions> = {
  fileType: 0,
  maxNewTokens: 2048,
  prettifyMarkdown: true,
  useLayoutDetection: true,
};
