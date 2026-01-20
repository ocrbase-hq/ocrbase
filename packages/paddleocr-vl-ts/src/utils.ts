import type { InferResult } from "./types";

/**
 * Combine all markdown results from a parsing operation into a single string.
 * Each page's markdown is separated by a horizontal rule.
 */
export const combineMarkdown = (result: InferResult): string =>
  result.layoutParsingResults.map((r) => r.markdown.text).join("\n\n---\n\n");

/**
 * Get the page count from a parsing result.
 * Returns the number of pages for PDFs, or 1 for images.
 */
export const getPageCount = (result: InferResult): number => {
  if (result.dataInfo.type === "pdf") {
    return result.dataInfo.numPages;
  }
  return 1;
};

/**
 * Extract all embedded images from the parsing results.
 * Collects images from both markdown.images and outputImages.
 */
export const extractImages = (result: InferResult): Record<string, string> => {
  const images: Record<string, string> = {};

  for (const layoutResult of result.layoutParsingResults) {
    if (layoutResult.markdown.images) {
      Object.assign(images, layoutResult.markdown.images);
    }
    if (layoutResult.outputImages) {
      Object.assign(images, layoutResult.outputImages);
    }
  }

  return images;
};
