import { describe, expect, it } from "vitest";
import { formConfigSchema } from "../src/config/schema";
import { buildFormSchema } from "../src/form/form-schema";

describe("buildFormSchema", () => {
  const requiredNumberConfig = formConfigSchema.parse({
    id: "number-form",
    fields: [{ name: "quantity", label: "Quantity", type: "number", required: true, validation: { min: 1 } }],
  });

  it("rejects an empty required numeric input instead of coercing it to zero", () => {
    expect(buildFormSchema(requiredNumberConfig).safeParse({ quantity: "" }).success).toBe(false);
  });

  it("accepts a valid numeric string and coerces it to a number", () => {
    const parsed = buildFormSchema(requiredNumberConfig).safeParse({ quantity: "3" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.quantity).toBe(3);
  });

  it("enforces the configured minimum", () => {
    expect(buildFormSchema(requiredNumberConfig).safeParse({ quantity: "0" }).success).toBe(false);
  });
});
