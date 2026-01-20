import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import type {
  CreateSchemaInput,
  GenerateSchemaInput,
  GenerateSchemaResponse,
  SchemaResponse,
  UpdateSchemaInput,
} from "../../types";

import { useOCRBaseClient } from "../provider";

export const schemaKeys = {
  all: ["schemas"] as const,
  detail: (id: string) => [...schemaKeys.details(), id] as const,
  details: () => [...schemaKeys.all, "detail"] as const,
  list: () => [...schemaKeys.all, "list"] as const,
};

export const useSchemas = (): UseQueryResult<SchemaResponse[]> => {
  const client = useOCRBaseClient();

  return useQuery({
    queryFn: () => client.schemas.list(),
    queryKey: schemaKeys.list(),
  });
};

export const useSchema = (id: string): UseQueryResult<SchemaResponse> => {
  const client = useOCRBaseClient();

  return useQuery({
    enabled: Boolean(id),
    queryFn: () => client.schemas.get(id),
    queryKey: schemaKeys.detail(id),
  });
};

export const useCreateSchema = (): UseMutationResult<
  SchemaResponse,
  Error,
  CreateSchemaInput
> => {
  const client = useOCRBaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input) => client.schemas.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schemaKeys.list() });
    },
  });
};

export const useUpdateSchema = (): UseMutationResult<
  SchemaResponse,
  Error,
  { id: string; input: UpdateSchemaInput }
> => {
  const client = useOCRBaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }) => client.schemas.update(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: schemaKeys.list() });
      queryClient.setQueryData(schemaKeys.detail(data.id), data);
    },
  });
};

export const useDeleteSchema = (): UseMutationResult<
  { success: boolean },
  Error,
  string
> => {
  const client = useOCRBaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => client.schemas.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: schemaKeys.list() });
      queryClient.removeQueries({ queryKey: schemaKeys.detail(id) });
    },
  });
};

export const useGenerateSchema = (): UseMutationResult<
  GenerateSchemaResponse,
  Error,
  GenerateSchemaInput
> => {
  const client = useOCRBaseClient();

  return useMutation({
    mutationFn: (input) => client.schemas.generate(input),
  });
};
