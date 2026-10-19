import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const exchanges = [
  { value: "binance", label: "Binance" },
  { value: "okx", label: "OKX" },
];
const markets = [
  { value: "spot", label: "Spot" },
  { value: "futures", label: "Futures" },
];
const symbols: Record<string, Record<string, { value: string; label: string }[]>> = {
  binance: {
    spot: [{ value: "BTCUSDT", label: "BTC/USDT" }, { value: "ETHUSDT", label: "ETH/USDT" }, { value: "BNBUSDT", label: "BNB/USDT" }],
    futures: [{ value: "BTCUSDT", label: "BTC/USDT Perpetual" }, { value: "ETHUSDT", label: "ETH/USDT Perpetual" }],
  },
  okx: {
    spot: [{ value: "BTC-USDT", label: "BTC/USDT" }, { value: "ETH-USDT", label: "ETH/USDT" }],
    futures: [{ value: "BTC-USDT-SWAP", label: "BTC/USDT Swap" }, { value: "ETH-USDT-SWAP", label: "ETH/USDT Swap" }],
  },
};

function mockApi() {
  return {
    name: "local-form-api",
    configureServer(server: { middlewares: { use: (middleware: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(body));
        };
        if (req.method === "GET" && url.pathname === "/api/options/exchanges") return send(200, { items: exchanges });
        if (req.method === "GET" && url.pathname === "/api/options/markets") {
          const exchange = url.searchParams.get("exchange");
          if (!exchanges.some(item => item.value === exchange)) return send(400, { message: "Unknown exchange" });
          return send(200, { items: markets });
        }
        if (req.method === "GET" && url.pathname === "/api/options/symbols") {
          const exchange = url.searchParams.get("exchange") ?? "";
          const market = url.searchParams.get("market") ?? "";
          const items = symbols[exchange]?.[market];
          if (!items) return send(400, { message: "Invalid exchange/market combination" });
          return send(200, { items });
        }
        if (req.method === "POST" && url.pathname === "/api/trading-orders") {
          let raw = "";
          req.on("data", (chunk: string | Uint8Array) => { raw += chunk; });
          req.on("end", () => {
            try {
              const body = JSON.parse(raw) as { values?: Record<string, unknown> };
              const value = body.values ?? {};
              const exchange = String(value.exchange ?? "");
              const market = String(value.market ?? "");
              const symbol = String(value.symbol ?? "");
              const quantity = Number(value.quantity);
              const allowedSymbols = symbols[exchange]?.[market] ?? [];
              if (!allowedSymbols.some(item => item.value === symbol) || !Number.isFinite(quantity) || quantity <= 0) {
                return send(400, { message: "Invalid order fields" });
              }
              return send(201, { orderId: `demo-${Date.now()}`, status: "accepted", values: value });
            } catch {
              return send(400, { message: "Invalid JSON payload" });
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), mockApi()],
  test: { environment: "jsdom", globals: true },
});
