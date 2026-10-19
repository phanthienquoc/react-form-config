# React Form Config

Config-driven form prototype using React Hook Form, Zod, and TanStack Query.

## Features
- Runtime validation of JSON config and dependency graph.
- Async select, text, and number fields.
- API URL/query params per field using `$values.fieldName` placeholders.
- Defaults applied only if async response contains the configured option.
- Changing a parent field resets configured descendants.
- Zod validation generated from config.
- Query caching, retry/loading/error states, and AbortSignal support.
- Options response validation and restricted `/api/options/*` namespace.
- Configurable submit endpoint; backend must revalidate dependency relationships.

## Run
```bash
pnpm install
pnpm dev
pnpm test
pnpm typecheck
pnpm build
```

## API contract
Options endpoints return `{ "items": [{ "value": "BTCUSDT", "label": "BTC/USDT" }] }`.
Expected routes: `GET /api/options/exchanges`, `GET /api/options/markets?exchange=binance`, `GET /api/options/symbols?exchange=binance&market=spot`.

No backend is included. Connect routes or add a mock server before end-to-end use.

## Security
Treat config as untrusted: validate at runtime, restrict URLs, never evaluate JavaScript from config, validate async payloads, and revalidate relationships on the server. Client-side validation is not an authorization boundary.
