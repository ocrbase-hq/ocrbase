import { z } from "zod";

// ============================================
// Request Schemas
// ============================================

/** File type: 0 = PDF, 1 = Image */
export const FileTypeSchema = z.union([z.literal(0), z.literal(1)]);

/** Document parsing request schema */
export const InferRequestSchema = z.object({
  /** Base64 encoded file content */
  file: z.string().min(1, "Base64 file content is required"),
  /** File type: 0 = PDF, 1 = Image */
  fileType: FileTypeSchema.optional().default(0),
  /** Format block content */
  formatBlockContent: z.boolean().optional(),
  /** Bounding box merging strategy */
  layoutMergeBboxesMode: z
    .union([z.string(), z.record(z.string(), z.unknown())])
    .optional(),
  /** Non-maximum suppression for layout */
  layoutNms: z.boolean().optional(),
  /** Layout detection threshold */
  layoutThreshold: z
    .union([z.number(), z.record(z.string(), z.unknown())])
    .optional(),
  /** Unclip ratio for layout detection */
  layoutUnclipRatio: z
    .union([
      z.number(),
      z.tuple([z.number(), z.number()]),
      z.record(z.string(), z.unknown()),
    ])
    .optional(),
  /** Labels to ignore in markdown output */
  markdownIgnoreLabels: z.array(z.string()).optional(),
  /** Maximum tokens to generate */
  maxNewTokens: z.number().optional(),
  /** Maximum pixels for processing */
  maxPixels: z.number().optional(),
  /** Merge layout blocks */
  mergeLayoutBlocks: z.boolean().optional(),
  /** Minimum pixels for processing */
  minPixels: z.number().optional(),
  /** Pretty format markdown output */
  prettifyMarkdown: z.boolean().optional(),
  /** Custom prompt labels */
  promptLabel: z.string().optional(),
  /** LLM repetition penalty (0-2) */
  repetitionPenalty: z.number().optional(),
  /** Show formula numbers */
  showFormulaNumber: z.boolean().optional(),
  /** LLM temperature (0-2) */
  temperature: z.number().optional(),
  /** LLM top-p sampling */
  topP: z.number().optional(),
  /** Enable chart recognition */
  useChartRecognition: z.boolean().optional(),
  /** Enable document orientation classification */
  useDocOrientationClassify: z.boolean().optional(),
  /** Enable document unwarping/dewarping */
  useDocUnwarping: z.boolean().optional(),
  /** Enable layout detection */
  useLayoutDetection: z.boolean().optional(),
  /** Return visualization images */
  visualize: z.boolean().optional(),
});

// ============================================
// Response Schemas
// ============================================

/** Markdown data from parsing */
export const MarkdownDataSchema = z.object({
  /** Embedded images (name -> base64) */
  images: z.record(z.string(), z.string()).optional(),
  /** Extracted markdown text */
  text: z.string(),
});

/** Single layout parsing result (one page/section) */
export const LayoutParsingResultSchema = z.object({
  /** Input image (if visualize=true) */
  inputImage: z.string().optional(),
  /** Extracted markdown */
  markdown: MarkdownDataSchema,
  /** Output visualization images */
  outputImages: z.record(z.string(), z.string()).optional(),
  /** Raw parsing result data */
  prunedResult: z.record(z.string(), z.unknown()),
});

/** Image file metadata */
export const ImageInfoSchema = z.object({
  /** Image height in pixels */
  height: z.number(),
  /** Discriminator for image type */
  type: z.literal("image"),
  /** Image width in pixels */
  width: z.number(),
});

/** Single PDF page metadata */
export const PDFPageInfoSchema = z.object({
  /** Page height */
  height: z.number(),
  /** Page width */
  width: z.number(),
});

/** PDF file metadata */
export const PDFInfoSchema = z.object({
  /** Total number of pages */
  numPages: z.number(),
  /** Per-page metadata */
  pages: z.array(PDFPageInfoSchema),
  /** Discriminator for PDF type */
  type: z.literal("pdf"),
});

/** File metadata (discriminated union) */
export const DataInfoSchema = z.discriminatedUnion("type", [
  ImageInfoSchema,
  PDFInfoSchema,
]);

/** Complete parsing result */
export const InferResultSchema = z.object({
  /** Input file metadata */
  dataInfo: DataInfoSchema,
  /** Array of parsed pages/sections */
  layoutParsingResults: z.array(LayoutParsingResultSchema),
});

/** Successful API response */
export const AIStudioSuccessResponseSchema = z.object({
  /** Success error code (always 0) */
  errorCode: z.literal(0),
  /** Success message */
  errorMsg: z.literal("Success"),
  /** Request log ID */
  logId: z.string(),
  /** Parsing result */
  result: InferResultSchema,
});

/** Error API response */
export const AIStudioErrorResponseSchema = z.object({
  /** Non-zero error code */
  errorCode: z.number().refine((n) => n !== 0, "Error code must be non-zero"),
  /** Error message */
  errorMsg: z.string(),
  /** Request log ID */
  logId: z.string(),
});

/** API response (success or error) */
export const InferResponseSchema = z.union([
  AIStudioSuccessResponseSchema,
  AIStudioErrorResponseSchema,
]);

/** Health check response */
export const HealthResponseSchema = z.object({
  /** Error code (0 = healthy) */
  errorCode: z.number(),
  /** Status message */
  errorMsg: z.string(),
  /** Request log ID */
  logId: z.string(),
});
