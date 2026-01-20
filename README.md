# OCRBase

A powerful OCR document processing and structured data extraction API built with modern TypeScript tooling.

## Overview

OCRBase provides:

- Document OCR using PaddleOCR for accurate text extraction
- AI-powered structured data extraction using LLMs
- Custom schema support for targeted data extraction
- Real-time job status updates via WebSocket
- RESTful API with OpenAPI documentation
- **Type-safe TypeScript SDK** with React hooks

## Architecture

![Architecture Diagram](docs/architecture.svg)

## Tech Stack

| Layer         | Technology                                                    |
| ------------- | ------------------------------------------------------------- |
| Runtime       | [Bun](https://bun.sh/)                                        |
| API Framework | [Elysia](https://elysiajs.com/)                               |
| SDK           | [Eden Treaty](https://elysiajs.com/eden/treaty/overview.html) |
| Database      | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/)         |
| Queue         | Redis + [BullMQ](https://bullmq.io/)                          |
| Storage       | S3/MinIO                                                      |
| OCR           | [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)        |
| Auth          | [Better-Auth](https://better-auth.com/)                       |
| Build         | [Turborepo](https://turbo.build/)                             |

## Quick Start

### Using the SDK (Recommended)

```bash
bun add @ocrbase/sdk
```

```typescript
import { createOCRBaseClient } from "@ocrbase/sdk";

const client = createOCRBaseClient({ baseUrl: "http://localhost:3000" });

// Upload and process a document
const job = await client.jobs.create({
  file: document,
  type: "parse", // or "extract" for structured data
});

// Subscribe to real-time updates
client.ws.subscribeToJob(job.id, {
  onStatus: (status) => console.log("Status:", status),
  onComplete: (data) => console.log("Result:", data.markdownResult),
  onError: (error) => console.error("Error:", error),
});

// Or poll for results
const result = await client.jobs.get(job.id);
```

### React Integration

```bash
bun add @ocrbase/sdk @tanstack/react-query
```

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  OCRBaseProvider,
  useJobs,
  useCreateJob,
  useJobSubscription,
} from "@ocrbase/sdk/react";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OCRBaseProvider config={{ baseUrl: "http://localhost:3000" }}>
        <DocumentProcessor />
      </OCRBaseProvider>
    </QueryClientProvider>
  );
}

function DocumentProcessor() {
  const { data: jobs } = useJobs({ status: "completed" });
  const createJob = useCreateJob();

  const handleUpload = (file: File) => {
    createJob.mutate({ file, type: "parse" });
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files![0])} />
      <ul>
        {jobs?.data.map((job) => (
          <li key={job.id}>
            {job.fileName} - {job.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

See [`packages/sdk/README.md`](./packages/sdk/README.md) for complete SDK documentation.

## Self-Hosting

### Prerequisites

- [Bun](https://bun.sh/) installed globally
- Docker Desktop running

### 1. Clone and Install

```bash
git clone <repository-url>
cd ocrbase
bun install
```

### 2. Environment Setup

Create a `.env` file:

```bash
# Required
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ocrbase
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001

# Redis
REDIS_URL=redis://localhost:6379

# S3/MinIO Storage
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET=ocrbase
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# OCR Service
PADDLE_OCR_URL=http://localhost:8080

# Optional - LLM for data extraction
OPENROUTER_API_KEY=your-openrouter-api-key

# Optional - GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 3. Start Services

```bash
# Start infrastructure
docker compose up -d postgres redis minio paddleocr

# Setup database
bun run db:push

# Start API server + worker
bun run dev
```

The API will be available at `http://localhost:3000`.

## API Reference

### REST Endpoints

| Method   | Endpoint                 | Description        |
| -------- | ------------------------ | ------------------ |
| `GET`    | `/health/live`           | Liveness check     |
| `GET`    | `/health/ready`          | Readiness check    |
| `POST`   | `/api/jobs`              | Create OCR job     |
| `GET`    | `/api/jobs`              | List jobs          |
| `GET`    | `/api/jobs/:id`          | Get job            |
| `DELETE` | `/api/jobs/:id`          | Delete job         |
| `GET`    | `/api/jobs/:id/download` | Download result    |
| `POST`   | `/api/schemas`           | Create schema      |
| `GET`    | `/api/schemas`           | List schemas       |
| `GET`    | `/api/schemas/:id`       | Get schema         |
| `PATCH`  | `/api/schemas/:id`       | Update schema      |
| `DELETE` | `/api/schemas/:id`       | Delete schema      |
| `POST`   | `/api/schemas/generate`  | AI-generate schema |

### WebSocket

```
WS /ws/jobs/:jobId
```

Real-time job status updates. See SDK for type-safe usage.

### OpenAPI

Interactive documentation at: `http://localhost:3000/openapi`

## Project Structure

```
ocrbase/
├── apps/
│   ├── web/                 # Frontend (TanStack Start)
│   └── server/              # Backend API (Elysia)
│       ├── src/
│       │   ├── modules/     # Feature modules (jobs, schemas, health)
│       │   ├── plugins/     # Elysia plugins
│       │   ├── services/    # Core services (OCR, LLM, storage)
│       │   └── workers/     # Background job processors
├── packages/
│   ├── sdk/                 # TypeScript SDK (@ocrbase/sdk)
│   ├── auth/                # Authentication (Better-Auth)
│   ├── db/                  # Database schema (Drizzle)
│   ├── env/                 # Environment validation
│   └── paddleocr-vl-ts/     # PaddleOCR client
└── docker-compose.yml
```

## Scripts

| Command               | Description         |
| --------------------- | ------------------- |
| `bun run dev`         | Start all services  |
| `bun run dev:server`  | Start API only      |
| `bun run dev:web`     | Start frontend only |
| `bun run build`       | Build all packages  |
| `bun run check-types` | TypeScript checking |
| `bun run db:push`     | Push schema to DB   |
| `bun run db:studio`   | Open Drizzle Studio |
| `bun run db:migrate`  | Run migrations      |

## Docker Deployment

```bash
docker compose up --build
```

## License

MIT
