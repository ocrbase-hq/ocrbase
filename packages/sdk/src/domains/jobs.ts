import type { EdenClient } from "../client";
import type {
  CreateJobInput,
  JobResponse,
  ListJobsQuery,
  ListJobsResponse,
} from "../types";

import { SDKError } from "../errors";

export interface JobsClient {
  /** List jobs with optional filtering and pagination */
  list: (query?: ListJobsQuery) => Promise<ListJobsResponse>;
  /** Get a single job by ID */
  get: (id: string) => Promise<JobResponse>;
  /** Create a new job from file or URL */
  create: (input: CreateJobInput) => Promise<JobResponse>;
  /** Delete a job by ID */
  delete: (id: string) => Promise<{ message: string }>;
  /** Download job result as markdown or JSON */
  download: (id: string, format?: "md" | "json") => Promise<string>;
}

export const createJobsClient = (eden: EdenClient): JobsClient => ({
  create: async (input) => {
    const { data, error } = await eden.api.jobs.post({
      file: input.file,
      llmModel: input.llmModel,
      llmProvider: input.llmProvider,
      schemaId: input.schemaId,
      type: input.type,
      url: input.url,
    });

    if (error) {
      throw SDKError.fromEdenError(error);
    }

    return data as JobResponse;
  },

  delete: async (id) => {
    const { data, error } = await eden.api.jobs({ id }).delete();

    if (error) {
      throw SDKError.fromEdenError(error);
    }

    return data as { message: string };
  },

  download: async (id, format = "md") => {
    const { data, error } = await eden.api.jobs({ id }).download.get({
      query: { format },
    });

    if (error) {
      throw SDKError.fromEdenError(error);
    }

    return data as string;
  },

  get: async (id) => {
    const { data, error } = await eden.api.jobs({ id }).get();

    if (error) {
      throw SDKError.fromEdenError(error);
    }

    return data as JobResponse;
  },

  list: async (query = {}) => {
    const { data, error } = await eden.api.jobs.get({
      query: {
        limit: query.limit,
        page: query.page,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        status: query.status,
        type: query.type,
      },
    });

    if (error) {
      throw SDKError.fromEdenError(error);
    }

    return data as ListJobsResponse;
  },
});
