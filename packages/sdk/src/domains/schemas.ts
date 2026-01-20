import type { EdenClient } from "../client";
import type {
  CreateSchemaInput,
  GenerateSchemaInput,
  GenerateSchemaResponse,
  SchemaResponse,
  UpdateSchemaInput,
} from "../types";

import { SDKError } from "../errors";

export interface SchemasClient {
  /** List all schemas */
  list: () => Promise<SchemaResponse[]>;
  /** Get a single schema by ID */
  get: (id: string) => Promise<SchemaResponse>;
  /** Create a new schema */
  create: (input: CreateSchemaInput) => Promise<SchemaResponse>;
  /** Update an existing schema */
  update: (id: string, input: UpdateSchemaInput) => Promise<SchemaResponse>;
  /** Delete a schema by ID */
  delete: (id: string) => Promise<{ success: boolean }>;
  /** Generate a schema from a processed job */
  generate: (input: GenerateSchemaInput) => Promise<GenerateSchemaResponse>;
}

export const createSchemasClient = (eden: EdenClient): SchemasClient => ({
  create: async (input) => {
    const { data, error } = await eden.api.schemas.post({
      description: input.description,
      jsonSchema: input.jsonSchema,
      name: input.name,
    });

    if (error) {
      throw SDKError.fromEdenError(error);
    }

    return data as SchemaResponse;
  },

  delete: async (id) => {
    const { data, error } = await eden.api.schemas({ id }).delete();

    if (error) {
      throw SDKError.fromEdenError(error);
    }

    return data as { success: boolean };
  },

  generate: async (input) => {
    const { data, error } = await eden.api.schemas.generate.post({
      hints: input.hints,
      jobId: input.jobId,
      name: input.name,
    });

    if (error) {
      throw SDKError.fromEdenError(error);
    }

    return data as GenerateSchemaResponse;
  },

  get: async (id) => {
    const { data, error } = await eden.api.schemas({ id }).get();

    if (error) {
      throw SDKError.fromEdenError(error);
    }

    return data as SchemaResponse;
  },

  list: async () => {
    const { data, error } = await eden.api.schemas.get();

    if (error) {
      throw SDKError.fromEdenError(error);
    }

    return data as SchemaResponse[];
  },

  update: async (id, input) => {
    const { data, error } = await eden.api.schemas({ id }).patch({
      description: input.description,
      jsonSchema: input.jsonSchema,
      name: input.name,
    });

    if (error) {
      throw SDKError.fromEdenError(error);
    }

    return data as SchemaResponse;
  },
});
