import { describe, expect, it } from "vitest";
import { formConfigSchema } from "../src/config/schema";

describe("formConfigSchema", () => {
  it("accepts a valid config with a declared dependency", () => {
    const config = formConfigSchema.safeParse({ id: "example", fields: [
      { name: "exchange", label: "Exchange", type: "text", required: true },
      { name: "market", label: "Market", type: "async-select", dependsOn: ["exchange"], dataSource: { url: "/api/options/markets", params: { exchange: "$values.exchange" } } },
    ] });
    expect(config.success).toBe(true);
  });
  it("rejects a dependency cycle", () => {
    const config = formConfigSchema.safeParse({ id: "cycle", fields: [
      { name: "first", label: "First", type: "text", dependsOn: ["second"] },
      { name: "second", label: "Second", type: "text", dependsOn: ["first"] },
    ] });
    expect(config.success).toBe(false);
  });
});
