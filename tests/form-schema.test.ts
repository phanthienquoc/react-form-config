import { describe, expect, it } from "vitest";
import { formConfigSchema } from "../config/schema";
import { buildFormSchema } from "../form/form-schema";

const config = formConfigSchema.parse({
  id: "quantity-form",
  fields: [{ name: "quantity", label: "Quantity", type: "number", required: true, validation: { min: 0.01 } }]
});

describe("buildFormSchema", () => {
  const schema = buildFormSchema(config);
  it("rejects an empty required number instead of coercing it to zero", () => {
    expect(schema.safeParse({ quantity: "" }).success).toBe(false);
  });
  it("accepts a positive number", () => {
    expect(schema.safeParse({ quantity: 1 }).success).toBe(true);
  });
  it("rejects a number below its configured minimum", () => {
    expect(schema.safeParse({ quantity: 0.001 }).success).toBe(false);
  });
});
