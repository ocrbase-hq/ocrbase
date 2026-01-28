import type { JobStatus } from "@ocrbase/db/lib/enums";

import { db } from "@ocrbase/db";
import { jobs } from "@ocrbase/db/schema/jobs";
import { eq } from "drizzle-orm";

import { publishJobUpdate } from "../services/websocket";

interface UpdateData {
  status?: JobStatus;
  markdownResult?: string;
  jsonResult?: unknown;
  pageCount?: number;
  tokenCount?: number;
  errorCode?: string;
  errorMessage?: string;
  retryCount?: number;
  startedAt?: Date;
  completedAt?: Date;
  processingTimeMs?: number;
}

interface CompleteJobResult {
  markdownResult: string;
  jsonResult?: unknown;
  pageCount: number;
  tokenCount?: number;
  processingTimeMs: number;
}

export const updateJobStatus = async (
  jobId: string,
  status: JobStatus,
  data?: Omit<UpdateData, "status">
): Promise<void> => {
  await db
    .update(jobs)
    .set({
      status,
      ...data,
    })
    .where(eq(jobs.id, jobId));

  await publishJobUpdate(jobId, {
    data: {
      processingTimeMs: data?.processingTimeMs,
      status,
    },
    jobId,
    type: "status",
  });
};

export const completeJob = async (
  jobId: string,
  result: CompleteJobResult
): Promise<void> => {
  const completedAt = new Date();

  await db
    .update(jobs)
    .set({
      completedAt,
      jsonResult: result.jsonResult,
      markdownResult: result.markdownResult,
      pageCount: result.pageCount,
      processingTimeMs: result.processingTimeMs,
      status: "completed",
      tokenCount: result.tokenCount,
    })
    .where(eq(jobs.id, jobId));

  await publishJobUpdate(jobId, {
    data: {
      jsonResult: result.jsonResult,
      markdownResult: result.markdownResult,
      processingTimeMs: result.processingTimeMs,
      status: "completed",
    },
    jobId,
    type: "completed",
  });
};

export const failJob = async (
  jobId: string,
  errorCode: string,
  errorMessage: string,
  shouldRetry = false
): Promise<void> => {
  const job = await db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
  });

  const retryCount = (job?.retryCount ?? 0) + 1;

  await db
    .update(jobs)
    .set({
      errorCode,
      errorMessage,
      retryCount,
      status: "failed",
    })
    .where(eq(jobs.id, jobId));

  if (!shouldRetry) {
    await publishJobUpdate(jobId, {
      data: {
        error: errorMessage,
        status: "failed",
      },
      jobId,
      type: "error",
    });
  }
};

export const getJobById = (jobId: string) =>
  db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
    with: {
      schema: true,
    },
  });

export const updateJobFileInfo = async (
  jobId: string,
  fileInfo: {
    fileKey: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }
): Promise<void> => {
  await db
    .update(jobs)
    .set({
      fileKey: fileInfo.fileKey,
      fileName: fileInfo.fileName,
      fileSize: fileInfo.fileSize,
      mimeType: fileInfo.mimeType,
    })
    .where(eq(jobs.id, jobId));
};
