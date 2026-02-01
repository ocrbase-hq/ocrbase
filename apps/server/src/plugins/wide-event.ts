import { Elysia } from "elysia";
import { nanoid } from "nanoid";

import { envContext } from "../lib/env-context";
import { posthog } from "../lib/posthog";
import { WideEventContext } from "../lib/wide-event";
import { logger } from "./logging";

const createRequestId = (): string => `req_${nanoid(12)}`;

export const wideEventPlugin = new Elysia({ name: "wideEvent" })
  .derive({ as: "global" }, ({ request }) => {
    const url = new URL(request.url);
    const requestId = createRequestId();
    const wideEvent = new WideEventContext({
      env: envContext,
      method: request.method,
      path: url.pathname,
      requestId,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return { requestId, wideEvent };
  })
  .onAfterHandle({ as: "global" }, ({ requestId, set, wideEvent }) => {
    if (!wideEvent || !requestId) {
      return;
    }
    set.headers["X-Request-Id"] = requestId;
    const statusCode =
      typeof set.status === "number" ? set.status : Number(set.status) || 200;
    const event = wideEvent.finalize(statusCode);
    logger.info(event);

    if (posthog) {
      const distinctId = event.user?.id ?? `anon_${requestId}`;
      posthog.capture({
        distinctId,
        event: "api_request",
        groups: event.organization
          ? { organization: event.organization.id }
          : undefined,
        properties: {
          $set: event.user ? { email: event.user.email } : undefined,
          duration_ms: event.durationMs,
          method: event.method,
          outcome: event.outcome,
          path: event.path,
          status_code: event.statusCode,
        },
      });
    }
  })
  .onError({ as: "global" }, ({ error, requestId, set, wideEvent }) => {
    if (!wideEvent || !requestId) {
      return;
    }
    set.headers["X-Request-Id"] = requestId;
    wideEvent.setError(error);
    const statusCode =
      typeof set.status === "number" ? set.status : Number(set.status) || 500;
    const event = wideEvent.finalize(statusCode);
    logger.error(event);

    if (posthog) {
      const distinctId = event.user?.id ?? `anon_${requestId}`;
      posthog.capture({
        distinctId,
        event: "api_request",
        groups: event.organization
          ? { organization: event.organization.id }
          : undefined,
        properties: {
          $set: event.user ? { email: event.user.email } : undefined,
          duration_ms: event.durationMs,
          error_code: event.error?.code,
          error_message: event.error?.message,
          method: event.method,
          outcome: event.outcome,
          path: event.path,
          status_code: event.statusCode,
        },
      });
    }
  });
