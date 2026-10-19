import { z } from "zod";
import type { FieldConfig, FormConfig } from "../config/schema";

function makeFieldSchema(field: FieldConfig): z.ZodTypeAny {
  let schema: z.ZodTypeAny;
  if (field.type === "number") {
    let numeric = z.coerce.number({ message: `${field.label} must be a number` });
    if (field.validation?.min !== undefined) numeric = numeric.min(field.validation.min, field.validation.message);
    if (field.validation?.max !== undefined) numeric = numeric.max(field.validation.max, field.validation.message);
    // Put the empty-string branch first so z.coerce.number("") cannot turn an empty input into zero.
    schema = z.union([z.literal(""), numeric]);
  } else {
    let text = z.string();
    if (field.validation?.minLength !== undefined) text = text.min(field.validation.minLength, field.validation.message);
    if (field.validation?.maxLength !== undefined) text = text.max(field.validation.maxLength, field.validation.message);
    if (field.validation?.pattern) text = text.regex(new RegExp(field.validation.pattern), field.validation.message);
    schema = text;
  }
  return field.required
    ? schema.refine(value => value !== "" && value !== null && value !== undefined, field.validation?.message ?? `${field.label} is required`)
    : schema.optional();
}

export function buildFormSchema(config: FormConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of config.fields) shape[field.name] = makeFieldSchema(field);
  return z.object(shape).superRefine((values, ctx) => {
    for (const field of config.fields) {
      const value = values[field.name];
      if (value === "" || value === null || value === undefined) continue;
      for (const parent of field.dependsOn) {
        const parentValue = values[parent];
        if (parentValue === "" || parentValue === null || parentValue === undefined) {
          ctx.addIssue({ code: "custom", path: [field.name], message: `${field.label} requires ${parent}` });
        }
      }
    }
  });
}
