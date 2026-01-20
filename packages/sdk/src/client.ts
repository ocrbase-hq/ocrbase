import type { App } from "server/src/app";

import { treaty } from "@elysiajs/eden";

import type { SDKConfig } from "./types";

import { createHealthClient, type HealthClient } from "./domains/health";
import { createJobsClient, type JobsClient } from "./domains/jobs";
import { createSchemasClient, type SchemasClient } from "./domains/schemas";
import {
  createWebSocketClient,
  type WebSocketClient,
} from "./domains/websocket";

export type EdenClient = ReturnType<typeof treaty<App>>;

export interface OCRBaseClient {
  /** Job management operations */
  jobs: JobsClient;
  /** Schema management operations */
  schemas: SchemasClient;
  /** Health check operations */
  health: HealthClient;
  /** WebSocket subscriptions */
  ws: WebSocketClient;
  /** Raw Eden Treaty client for advanced usage */
  _eden: EdenClient;
}

/**
 * Creates a type-safe OCRBase API client using Eden Treaty.
 *
 * @example
 * ```typescript
 * const client = createOCRBaseClient({
 *   baseUrl: "http://localhost:3000",
 *   credentials: "include",
 * });
 *
 * const jobs = await client.jobs.list({ status: "completed" });
 * ```
 */
export const createOCRBaseClient = (config: SDKConfig): OCRBaseClient => {
  const eden = treaty<App>(config.baseUrl, {
    fetch: {
      credentials: config.credentials ?? "include",
    },
    headers: config.headers,
    onRequest: config.onRequest,
    onResponse: config.onResponse,
  });

  return {
    _eden: eden,
    health: createHealthClient(eden),
    jobs: createJobsClient(eden),
    schemas: createSchemasClient(eden),
    ws: createWebSocketClient(eden),
  };
};
