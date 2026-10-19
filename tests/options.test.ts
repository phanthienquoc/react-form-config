import { describe, expect, it } from "vitest";
import { buildOptionsUrl, resolveParams } from "../src/api/options";

describe("option URL building", () => {
  it("resolves and encodes dependency params", () => {
    expect(buildOptionsUrl({ url: "/api/options/symbols", params: { exchange: "$values.exchange" }, method: "GET", responsePath: "items" }, { exchange: "Binance & OKX" }))
      .toBe("/api/options/symbols?exchange=Binance+%26+OKX");
  });
  it("blocks endpoints outside the options namespace", () => {
    expect(() => buildOptionsUrl({ url: "https://example.com/options", method: "GET", responsePath: "items" }, {})).toThrow();
  });
  it("throws when dependency values are missing", () => {
    expect(() => resolveParams({ exchange: "$values.exchange" }, {})).toThrow(/Missing dependency/);
  });
});
