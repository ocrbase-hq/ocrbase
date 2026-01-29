import { cors } from "@elysiajs/cors";
import { openapi, fromTypes } from "@elysiajs/openapi";
import { auth } from "@ocrbase/auth";
import { env } from "@ocrbase/env/server";
import { Elysia } from "elysia";
import path from "node:path";

import { authRoutes } from "./modules/auth";
import { extractRoutes } from "./modules/extract";
import { healthRoutes } from "./modules/health";
import { jobsRoutes } from "./modules/jobs";
import { JobModel } from "./modules/jobs/model";
import { jobsWebSocket } from "./modules/jobs/websocket";
import { keysRoutes } from "./modules/keys";
import { KeyModel } from "./modules/keys/model";
import { parseRoutes } from "./modules/parse";
import { schemasRoutes } from "./modules/schemas";
import { SchemaModel } from "./modules/schemas/model";
import { errorHandlerPlugin } from "./plugins/errorHandler";
import { rateLimitPlugin } from "./plugins/rateLimit";
import { securityPlugin } from "./plugins/security";
import { wideEventPlugin } from "./plugins/wide-event";

export const app = new Elysia()
  .model({
    "job.create": JobModel.CreateJobBody,
    "job.createFromUrl": JobModel.CreateJobFromUrl,
    "job.listQuery": JobModel.ListJobsQuery,
    "job.listResponse": JobModel.ListJobsResponse,
    "job.response": JobModel.JobResponse,
    "key.create": KeyModel.createBody,
    "key.createResponse": KeyModel.createResponse,
    "key.listResponse": KeyModel.listResponse,
    "key.response": KeyModel.response,
    "key.usageResponse": KeyModel.usageResponse,
    "schema.create": SchemaModel.createBody,
    "schema.generate": SchemaModel.generateBody,
    "schema.generateResponse": SchemaModel.generateResponse,
    "schema.listResponse": SchemaModel.listResponse,
    "schema.response": SchemaModel.response,
    "schema.update": SchemaModel.updateBody,
  })
  .use(
    openapi({
      documentation: {
        info: {
          description:
            "API for OCR document processing and structured data extraction",
          title: "ocrbase API",
          version: "1.0.0",
        },
        tags: [
          { description: "Health check endpoints", name: "Health" },
          { description: "Authentication endpoints", name: "Auth" },
          { description: "Organization management", name: "Organization" },
          { description: "Document parsing (OCR to markdown)", name: "Parse" },
          { description: "Structured data extraction", name: "Extract" },
          { description: "OCR job management", name: "Jobs" },
          { description: "API key management", name: "Keys" },
          { description: "Extraction schema management", name: "Schemas" },
        ],
      },
      path: "/openapi",
      references: fromTypes(
        env.NODE_ENV === "production" ? "dist/src/index.d.ts" : "src/index.ts",
        {
          projectRoot: path.resolve(import.meta.dir, ".."),
        }
      ),
    })
  )
  .use(
    cors({
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      origin: env.CORS_ORIGIN,
    })
  )
  .use(securityPlugin)
  .use(wideEventPlugin)
  .use(rateLimitPlugin)
  .use(errorHandlerPlugin)
  .use(authRoutes)
  .all("/api/auth/*", (context) => auth.handler(context.request), {
    detail: { hide: true },
  })
  .use(healthRoutes)
  .use(parseRoutes)
  .use(extractRoutes)
  .use(jobsRoutes)
  .use(keysRoutes)
  .use(schemasRoutes)
  .use(jobsWebSocket);

export type App = typeof app;
