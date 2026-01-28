import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { jobStatusEnum, jobTypeEnum } from "../lib/enums";
import { createId } from "../lib/ids";
import { organization, user } from "./auth";
import { schemas } from "./schemas";

export const jobs = pgTable(
  "jobs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("job")),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: jobTypeEnum("type").notNull(),
    status: jobStatusEnum("status").notNull().default("pending"),
    fileName: text("file_name").notNull(),
    fileKey: text("file_key"),
    fileSize: integer("file_size").notNull(),
    mimeType: text("mime_type").notNull(),
    sourceUrl: text("source_url"),
    schemaId: text("schema_id").references(() => schemas.id, {
      onDelete: "set null",
    }),
    llmProvider: text("llm_provider"),
    llmModel: text("llm_model"),
    markdownResult: text("markdown_result"),
    jsonResult: jsonb("json_result"),
    pageCount: integer("page_count"),
    tokenCount: integer("token_count"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    retryCount: integer("retry_count").notNull().default(0),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    processingTimeMs: integer("processing_time_ms"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("jobs_organization_id_idx").on(table.organizationId),
    index("jobs_user_id_idx").on(table.userId),
    index("jobs_status_idx").on(table.status),
    index("jobs_created_at_idx").on(table.createdAt),
  ]
);

export const jobsRelations = relations(jobs, ({ one }) => ({
  organization: one(organization, {
    fields: [jobs.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [jobs.userId],
    references: [user.id],
  }),
  schema: one(schemas, {
    fields: [jobs.schemaId],
    references: [schemas.id],
  }),
}));

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
