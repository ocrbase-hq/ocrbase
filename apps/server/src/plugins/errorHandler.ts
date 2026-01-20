import { Elysia } from "elysia";

import { logger } from "./logging";

interface ErrorResponse {
  error: string;
  message: string;
  requestId?: string;
  statusCode: number;
}

const ERROR_CODE_MAP: Record<string, number> = {
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  VALIDATION_ERROR: 400,
};

const getStatusFromError = (error: Error): number => {
  const errorName = error.name.toUpperCase().replaceAll(" ", "_");
  return ERROR_CODE_MAP[errorName] ?? 500;
};

export const errorHandlerPlugin = new Elysia({ name: "errorHandler" }).onError(
  ({ code, error, set, ...rest }): ErrorResponse => {
    const reqId = (rest as { requestId?: string }).requestId;
    let statusCode = 500;
    let errorName = "Internal Server Error";
    let message = "An unexpected error occurred";
    let stack: string | undefined;

    const isError = error instanceof Error;

    if (code === "VALIDATION" && isError) {
      statusCode = 400;
      errorName = "Validation Error";
      ({ message } = error);
    } else if (code === "NOT_FOUND") {
      statusCode = 404;
      errorName = "Not Found";
      message = "The requested resource was not found";
    } else if (code === "PARSE") {
      statusCode = 400;
      errorName = "Parse Error";
      message = "Invalid request body";
    } else if (isError) {
      statusCode = getStatusFromError(error);
      errorName = error.name || "Error";
      message = error.message || message;
      ({ stack } = error);
    }

    logger.error(
      {
        code,
        error: errorName,
        message,
        requestId: reqId,
        stack,
        statusCode,
      },
      "Request error"
    );

    set.status = statusCode;

    return {
      error: errorName,
      message,
      requestId: reqId,
      statusCode,
    };
  }
);
