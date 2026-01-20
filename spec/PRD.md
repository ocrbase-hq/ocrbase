# OCRBase

Self-hosted OCR SaaS using open-weight vLLM models.

## Features

| Feature        | Description                             |
| -------------- | --------------------------------------- |
| **Parse**      | PDF/Image → Markdown                    |
| **Extract**    | PDF/Image → JSON (with optional schema) |
| **Schema Gen** | LLM suggests JSON schema from sample    |

## Stack

- **Backend**: Elysia + Bun + PostgreSQL + BullMQ + Redis + MinIO
- **Frontend**: TanStack Start + Eden Treaty + shadcn/ui
- **Auth**: Better Auth (GitHub + email, organizations)
- **OCR**: `@ocrbase/paddleocr-vl-ts` – type-safe SDK for Elysia backend
- **LLM**: Vercel AI SDK → OpenRouter / local vLLM

## Monorepo

```
apps/server, apps/web
packages/db, packages/env, packages/auth, packages/paddleocr-vl-ts
```

## Scale

20k+ docs/day, 200MB max, RTX 3060 baseline
