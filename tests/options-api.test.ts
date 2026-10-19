import { describe, expect, it } from "vitest";
import { buildOptionsUrl, resolveParams } from "../src/api/options";
describe("options API", () => {
  it("resolves placeholders", () => expect(resolveParams({ exchange: "$values.exchange", market: "$values.market" }, { exchange: "binance", market: "spot" })).toEqual({ exchange: "binance", market: "spot" }));
  it("encodes query params", () => expect(buildOptionsUrl({ url: "/api/options/symbols", method: "GET", params: { market: "$values.market" }, responsePath: "items" }, { market: "spot & margin" })).toBe("/api/options/symbols?market=spot+%26+margin"));
  it("rejects external URLs", () => expect(() => buildOptionsUrl({ url: "https://example.com", method: "GET" }, {})).toThrow(/must start with/));
});
