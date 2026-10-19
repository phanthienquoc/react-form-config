import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";

type Option = { value: string; label: string };
const exchanges: Option[] = [
  { value: "binance", label: "Binance" },
  { value: "okx", label: "OKX" },
];
const markets: Record<string, Option[]> = {
  binance: [{ value: "spot", label: "Spot" }, { value: "futures", label: "Futures" }],
  okx: [{ value: "spot", label: "Spot" }, { value: "swap", label: "Swap" }],
};
const symbols: Record<string, Record<string, Option[]>> = {
  binance: {
    spot: [{ value: "BTCUSDT", label: "BTC/USDT" }, { value: "ETHUSDT", label: "ETH/USDT" }],
    futures: [{ value: "BTCUSDT", label: "BTC/USDT Perpetual" }, { value: "ETHUSDT", label: "ETH/USDT Perpetual" }],
  },
  okx: {
    spot: [{ value: "BTC-USDT", label: "BTC/USDT" }, { value: "ETH-USDT", label: "ETH/USDT" }],
    swap: [{ value: "BTC-USDT-SWAP", label: "BTC/USDT Swap" }, { value: "ETH-USDT-SWAP", label: "ETH/USDT Swap" }],
  },
};

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return null;
  try { return JSON.parse(raw) as unknown; } catch { return undefined; }
}

function mockApi(): Plugin {
  return {
    name: "react-form-config-demo-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        if (req.method === "GET" && url.pathname === "/api/options/exchanges") {
          sendJson(res, 200, { items: exchanges }); return;
        }
        if (req.method === "GET" && url.pathname === "/api/options/markets") {
          const exchange = url.searchParams.get("exchange") ?? "";
          const items = markets[exchange];
          sendJson(res, items ? 200 : 400, items ? { items } : { message: "Unknown exchange" }); return;
        }
        if (req.method === "GET" && url.pathname === "/api/options/symbols") {
          const exchange = url.searchParams.get("exchange") ?? "";
          const market = url.searchParams.get("market") ?? "";
          const items = symbols[exchange]?.[market];
          sendJson(res, items ? 200 : 400, items ? { items } : { message: "Unknown exchange or market" }); return;
        }
        if (req.method === "POST" && url.pathname === "/api/trading-orders") {
          const body = await readJson(req) as { values?: Record<string, unknown> } | undefined;
          const values = body?.values;
          if (!values || !values.exchange || !values.market || !values.symbol || !Number.isFinite(Number(values.quantity)) || Number(values.quantity) <= 0) {
            sendJson(res, 400, { message: "Invalid trading-order payload" }); return;
          }
          sendJson(res, 201, { ok: true, orderId: "demo-" + Date.now(), received: body }); return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), mockApi()],
  server: { host: "0.0.0.0" },
});
