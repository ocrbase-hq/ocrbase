# ocrbase

Turn PDFs into structured data at scale.

PDF ->.MD/.JSON API & SDK for PaddleOCR-VL with structured data extraction. Self-hostable.

## Features

- Best-in-class OCR - PaddleOCR-VL-0.9B for accurate text extraction
- Structured extraction - Define schemas, get JSON back
- Built for scale - Queue-based processing for thousands of documents
- Type-safe SDK - Full TypeScript support with React hooks
- Real-time updates - WebSocket notifications for job progress
- Self-hostable - Run on your own infrastructure

## Stack

- **Backend**: Elysia + Bun + PostgreSQL + BullMQ + Redis + MinIO
- **Frontend**: TanStack Start + shadcn/ui(baseui) + @ocrbase/sdk
- **Auth**: Better Auth (GitHub + email, organizations)
- **OCR**: `@ocrbase/paddleocr-vl-ts` – type-safe SDK for Elysia backend
- **LLM**: Vercel AI SDK → OpenRouter / local vLLM

## Monorepo

```
apps/server, apps/web
packages/db, packages/env, packages/auth, packages/paddleocr-vl-ts
```
