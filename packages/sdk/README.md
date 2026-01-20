# @ocrbase/sdk

Type-safe SDK for the OCRBase API, built with [Eden Treaty](https://elysiajs.com/eden/treaty/overview.html).

## Installation

```bash
bun add @ocrbase/sdk
```

For React integration:

```bash
bun add @ocrbase/sdk @tanstack/react-query
```

## Quick Start

```typescript
import { createOCRBaseClient } from "@ocrbase/sdk";

const client = createOCRBaseClient({
  baseUrl: "http://localhost:3000",
});

// List completed jobs
const { data, pagination } = await client.jobs.list({
  status: "completed",
  limit: 10,
});

// Create a job from file
const job = await client.jobs.create({
  file: document,
  type: "parse",
});

// Subscribe to real-time updates
const unsubscribe = client.ws.subscribeToJob(job.id, {
  onStatus: (status) => console.log("Status:", status),
  onComplete: (data) => console.log("Done:", data.markdownResult),
  onError: (error) => console.error("Error:", error),
});
```

## React Integration

### Setup Provider

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OCRBaseProvider } from "@ocrbase/sdk/react";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OCRBaseProvider config={{ baseUrl: "http://localhost:3000" }}>
        <YourApp />
      </OCRBaseProvider>
    </QueryClientProvider>
  );
}
```

### Use Hooks

```tsx
import {
  useJobs,
  useJob,
  useCreateJob,
  useJobSubscription,
} from "@ocrbase/sdk/react";

function JobsList() {
  const { data, isLoading } = useJobs({ status: "completed" });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.data.map((job) => (
        <li key={job.id}>{job.fileName}</li>
      ))}
    </ul>
  );
}

function JobUploader() {
  const createJob = useCreateJob();

  const handleUpload = (file: File) => {
    createJob.mutate({ file, type: "parse" });
  };

  return (
    <input type="file" onChange={(e) => handleUpload(e.target.files![0])} />
  );
}

function JobProgress({ jobId }: { jobId: string }) {
  const { isConnected, status } = useJobSubscription(jobId, {
    onComplete: (data) => {
      console.log("Job completed:", data);
    },
  });

  return (
    <div>
      {isConnected ? "🟢 Connected" : "🔴 Disconnected"} - Status: {status}
    </div>
  );
}
```

## API Reference

### Client Methods

#### Jobs

```typescript
// List jobs with filtering
client.jobs.list({ status?, type?, page?, limit?, sortBy?, sortOrder? })

// Get single job
client.jobs.get(id)

// Create job from file or URL
client.jobs.create({ file?, url?, type, schemaId?, llmProvider?, llmModel? })

// Delete job
client.jobs.delete(id)

// Download result
client.jobs.download(id, format?) // format: "md" | "json"
```

#### Schemas

```typescript
// List all schemas
client.schemas.list()

// Get single schema
client.schemas.get(id)

// Create schema
client.schemas.create({ name, description?, jsonSchema })

// Update schema
client.schemas.update(id, { name?, description?, jsonSchema? })

// Delete schema
client.schemas.delete(id)

// Generate schema from job
client.schemas.generate({ jobId?, hints?, name? })
```

#### Health

```typescript
// Liveness check
client.health.live();

// Readiness check with service status
client.health.ready();
```

#### WebSocket

```typescript
// Subscribe to job updates
const unsubscribe = client.ws.subscribeToJob(jobId, {
  onConnect: () => {},
  onDisconnect: () => {},
  onStatus: (status) => {},
  onComplete: (data) => {},
  onError: (error) => {},
});

// Unsubscribe
unsubscribe();
```

### React Hooks

| Hook                                 | Description                                   |
| ------------------------------------ | --------------------------------------------- |
| `useJobs(query?)`                    | List jobs with optional filtering             |
| `useJob(id)`                         | Get single job                                |
| `useCreateJob()`                     | Create job mutation                           |
| `useDeleteJob()`                     | Delete job mutation                           |
| `useDownloadJob()`                   | Download job result mutation                  |
| `useSchemas()`                       | List all schemas                              |
| `useSchema(id)`                      | Get single schema                             |
| `useCreateSchema()`                  | Create schema mutation                        |
| `useUpdateSchema()`                  | Update schema mutation                        |
| `useDeleteSchema()`                  | Delete schema mutation                        |
| `useGenerateSchema()`                | Generate schema mutation                      |
| `useJobSubscription(id, callbacks?)` | WebSocket subscription with auto-invalidation |

## Configuration

```typescript
const client = createOCRBaseClient({
  // Required
  baseUrl: "http://localhost:3000",

  // Optional: default headers
  headers: {
    "X-Custom-Header": "value",
  },

  // Optional: dynamic headers
  headers: (path, options) => ({
    "X-Request-Path": path,
  }),

  // Optional: credentials mode (default: "include")
  credentials: "include",

  // Optional: request interceptor
  onRequest: (path, options) => {
    console.log("Request:", path);
    return options;
  },

  // Optional: response interceptor
  onResponse: (response) => {
    console.log("Response:", response.status);
    return response;
  },
});
```

## Error Handling

All methods throw `SDKError` on failure:

```typescript
import { SDKError } from "@ocrbase/sdk";

try {
  await client.jobs.get("invalid-id");
} catch (error) {
  if (error instanceof SDKError) {
    console.log(error.code); // "NOT_FOUND" | "UNAUTHORIZED" | ...
    console.log(error.status); // 404
    console.log(error.message); // "Job not found"
  }
}
```

Error codes:

| Code               | Description                   |
| ------------------ | ----------------------------- |
| `UNAUTHORIZED`     | 401 - Authentication required |
| `NOT_FOUND`        | 404 - Resource not found      |
| `VALIDATION_ERROR` | 4xx - Invalid request         |
| `SERVER_ERROR`     | 5xx - Server error            |
| `NETWORK_ERROR`    | Connection failed             |
| `UNKNOWN_ERROR`    | Other errors                  |

## Advanced: Direct Eden Access

For advanced use cases, access the raw Eden Treaty client:

```typescript
const client = createOCRBaseClient({ baseUrl });

// Direct Eden Treaty access
const response = await client._eden.api.jobs.get();
```

## TypeScript

Full type inference from the server:

```typescript
import type {
  JobResponse,
  JobStatus,
  SchemaResponse,
  CreateJobInput,
} from "@ocrbase/sdk";
```

## License

MIT
