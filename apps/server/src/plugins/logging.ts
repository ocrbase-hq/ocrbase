import { env } from "@ocrbase/env/server";
import { Elysia } from "elysia";
import { nanoid } from "nanoid";
import pino from "pino";

export const logger = pino(
  {
    level: env.NODE_ENV === "production" ? "info" : "debug",
  },
  pino.destination(1)
);

const createRequestId = (): string => `req_${nanoid(12)}`;

export const loggingPlugin = new Elysia({ name: "logging" })
  .derive({ as: "global" }, () => {
    const requestId = createRequestId();
    const startTime = performance.now();
    return { requestId, startTime };
  })
  .onBeforeHandle({ as: "global" }, ({ request, requestId }) => {
    logger.info(
      {
        method: request.method,
        requestId,
        url: request.url,
      },
      "Request started"
    );
  })
  .onAfterHandle({ as: "global" }, ({ request, requestId, set, startTime }) => {
    const duration = Math.round(performance.now() - startTime);

    logger.info(
      {
        duration,
        method: request.method,
        requestId,
        status: set.status ?? 200,
        url: request.url,
      },
      "Request completed"
    );

    set.headers["X-Request-Id"] = requestId;
  })
  .onError({ as: "global" }, ({ error, request, requestId, startTime }) => {
    const duration = Math.round(performance.now() - (startTime ?? 0));
    const isError = error instanceof Error;

    logger.error(
      {
        duration,
        error: isError ? error.message : String(error),
        method: request.method,
        requestId,
        stack: isError ? error.stack : undefined,
        url: request.url,
      },
      "Request failed"
    );
  });
