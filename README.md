# React Form Config

Reusable JSON-driven React form engine built with React Hook Form, Zod, and TanStack Query.

## Features

- Runtime validation of form JSON and its dependency graph.
- Async select, text, and number fields.
- Dependent options through `$values.fieldName` query parameters.
- Defaults applied only when async options contain the configured value.
- Parent changes reset configured descendants.
- Zod validation generated from config.
- TanStack Query caching, loading/error states, retry, and abort support.
- Validated options payloads and restricted API URL namespaces.

## Install from npm

```bash
npm install @phanthienquoc/react-form-config react react-dom react-hook-form @hookform/resolvers zod @tanstack/react-query
```

## Quick start

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicForm, formConfigSchema, type FormConfig } from "@phanthienquoc/react-form-config";
import "@phanthienquoc/react-form-config/styles.css";

const queryClient = new QueryClient();

const config: FormConfig = formConfigSchema.parse({
  id: "contact",
  title: "Contact details",
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    {
      name: "quantity", label: "Quantity", type: "number", required: true,
      validation: { min: 1 },
    },
  ],
});

export function ContactForm() {
  return (
    <QueryClientProvider client={queryClient}>
      <DynamicForm
        config={config}
        onSubmitted={(values) => console.log("Validated values:", values)}
      />
    </QueryClientProvider>
  );
}
```

`DynamicForm` calls `config.submit.url` when configured, then calls `onSubmitted` after a successful response. Without `submit`, it calls `onSubmitted` after client validation. The consuming application must provide a `QueryClientProvider` because async-select fields use TanStack Query.

## Config shape

Each form config has an `id`, optional `version`, `title`, and `description`, a non-empty `fields` array, and an optional `submit` endpoint. Supported field types are `text`, `number`, and `async-select`.

An async select requires a `dataSource`:

```json
{
  "name": "market",
  "label": "Market",
  "type": "async-select",
  "required": true,
  "dependsOn": ["exchange"],
  "dataSource": {
    "url": "/api/options/markets",
    "params": { "exchange": "$values.exchange" },
    "responsePath": "items"
  }
}
```

Options endpoints must be under `/api/options/` and return an array of `{ "value": string, "label": string }` at `responsePath` (default: `items`). Submit endpoints must start with `/api/`. These are client-side safety checks, not a replacement for server-side validation or authorization. Revalidate all submitted values and dependency relationships on the server.

## Develop this repository

```bash
pnpm install
pnpm dev
pnpm test
pnpm typecheck
pnpm build
pnpm build:lib
```

The Vite demo includes local mock endpoints for exchanges, markets, symbols, and order submission. The mock API is development-only and is not included in the published library runtime.
