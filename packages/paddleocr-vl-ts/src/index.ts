// Client
export { PaddleOCRClient } from "./client";

// Types (inferred from Zod schemas)
export type {
  AIStudioErrorResponse,
  AIStudioSuccessResponse,
  DataInfo,
  FileType,
  HealthResponse,
  ImageInfo,
  InferRequest,
  InferRequestOptions,
  InferResponse,
  InferResult,
  LayoutParsingResult,
  MarkdownData,
  PDFInfo,
  PDFPageInfo,
} from "./types";

// Errors
export {
  PaddleOCRApiError,
  PaddleOCRError,
  PaddleOCRHttpError,
  PaddleOCRNetworkError,
  PaddleOCRTimeoutError,
  PaddleOCRValidationError,
} from "./errors";

// Configuration
export type { ClientConfig, ClientOptions } from "./config";

// Utilities (also available as static methods on PaddleOCRClient)
export { combineMarkdown, extractImages, getPageCount } from "./utils";

// Schemas (for advanced use cases - extend or compose with your own)
export {
  AIStudioErrorResponseSchema,
  AIStudioSuccessResponseSchema,
  DataInfoSchema,
  FileTypeSchema,
  HealthResponseSchema,
  ImageInfoSchema,
  InferRequestSchema,
  InferResponseSchema,
  InferResultSchema,
  LayoutParsingResultSchema,
  MarkdownDataSchema,
  PDFInfoSchema,
  PDFPageInfoSchema,
} from "./schemas";
