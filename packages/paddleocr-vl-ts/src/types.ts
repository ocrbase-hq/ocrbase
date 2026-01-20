import type { z } from "zod";

import type {
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

// ============================================
// Inferred Types from Zod Schemas
// ============================================

/** File type: 0 = PDF, 1 = Image */
export type FileType = z.infer<typeof FileTypeSchema>;

/** Document parsing request */
export type InferRequest = z.infer<typeof InferRequestSchema>;

/** Parsing request options (without file) */
export type InferRequestOptions = Omit<InferRequest, "file">;

/** Markdown data from parsing */
export type MarkdownData = z.infer<typeof MarkdownDataSchema>;

/** Single layout parsing result */
export type LayoutParsingResult = z.infer<typeof LayoutParsingResultSchema>;

/** Image file metadata */
export type ImageInfo = z.infer<typeof ImageInfoSchema>;

/** PDF page metadata */
export type PDFPageInfo = z.infer<typeof PDFPageInfoSchema>;

/** PDF file metadata */
export type PDFInfo = z.infer<typeof PDFInfoSchema>;

/** File metadata (image or PDF) */
export type DataInfo = z.infer<typeof DataInfoSchema>;

/** Complete parsing result */
export type InferResult = z.infer<typeof InferResultSchema>;

/** Successful API response */
export type AIStudioSuccessResponse = z.infer<
  typeof AIStudioSuccessResponseSchema
>;

/** Error API response */
export type AIStudioErrorResponse = z.infer<typeof AIStudioErrorResponseSchema>;

/** API response (success or error) */
export type InferResponse = z.infer<typeof InferResponseSchema>;

/** Health check response */
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
