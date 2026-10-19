# @phanthienquoc/react-form-config

Reusable JSON-driven React forms built with React Hook Form, Zod, and TanStack Query.

## Install

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
  id: "profile",
  title: "Profile",
  fields: [
    { name: "displayName", label: "Display name", type: "text", required: true, validation: { minLength: 2 } },
    { name: "age", label: "Age", type: "number", validation: { min: 0, max: 120 } },
  ],
});

export function ProfileForm() {
  return <QueryClientProvider client={queryClient}>
    <DynamicForm config={config} onSubmitted={(values) => console.log(values)} />
  </QueryClientProvider>;
}
```

For async select fields, the parent app must provide a `QueryClientProvider`. The library uses TanStack Query for caching, loading, and retry behavior.

## JSON configuration

Supported field types: `text`, `number`, and `async-select`.

```json
{
  "id": "trade",
  "version": 1,
  "title": "Trade order",
  "fields": [
    { "name": "exchange", "label": "Exchange", "type": "async-select", "required": true, "dataSource": { "url": "/api/options/exchanges" } },
    { "name": "market", "label": "Market", "type": "async-select", "required": true, "dependsOn": ["exchange"], "dataSource": { "url": "/api/options/markets", "params": { "exchange": "$values.exchange" } } },
    { "name": "symbol", "label": "Symbol", "type": "async-select", "required": true, "dependsOn": ["exchange", "market"], "dataSource": { "url": "/api/options/symbols", "params": { "exchange": "$values.exchange", "market": "$values.market" } } }
  ],
  "submit": { "url": "/api/trades", "method": "POST" }
}
```

Options endpoints must start with `/api/options/` and return `{ "items": [{ "value": "...", "label": "..." }] }` unless `responsePath` is configured. Submit endpoints must start with `/api/`. These client-side restrictions are not authorization boundaries: validate input and dependency relationships on your backend.

## Exports

- `DynamicForm`, `DynamicFormProps`
- `formConfigSchema`, `fieldConfigSchema`, `optionSchema`
- `FormConfig`, `FieldConfig`, `Option`, `FormValues`, `DataSource`
- `buildFormSchema`, `getDescendants`
- `buildOptionsUrl`, `fetchOptions`, `resolveParams`

## Development and package checks

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
npm pack --dry-run
```

Publishing is intentionally manual after checks:

```bash
npm login
npm publish --access public
```

Never commit npm credentials. The package has not yet been published to npm.

## Local demo

The interactive trading-order demo uses a local-only Vite mock API. It does not send real orders.

```bash
pnpm install
pnpm demo
```

Open the local URL printed by Vite. The demo provides mock endpoints for exchanges, markets, symbols, and order submission. The mock API is development-only; use a real backend for production.
