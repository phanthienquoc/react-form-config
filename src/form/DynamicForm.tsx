import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldConfig, FormConfig } from "../config/schema";
import type { FormValues } from "../types";
import { buildFormSchema } from "./form-schema";
import { getDescendants } from "./dependencies";
import { AsyncSelectField } from "./AsyncSelectField";
type Props = { config: FormConfig; onSubmitted?: (values: Record<string, unknown>) => void };
function emptyValues(config: FormConfig): FormValues { return Object.fromEntries(config.fields.map(field => [field.name, ""])); }

export function DynamicForm({ config, onSubmitted }: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resetVersions, setResetVersions] = useState<Record<string, number>>({});
  const schema = useMemo(() => buildFormSchema(config), [config]);
  const { control, handleSubmit, setValue, getValues, clearErrors, formState: { errors, isSubmitting, isValid } } = useForm<FormValues>({
    resolver: zodResolver(schema), defaultValues: emptyValues(config), mode: "onChange", reValidateMode: "onChange"
  });
  const values = useWatch({ control }) as FormValues;

  function changeField(field: FieldConfig, next: string, commit: (value: string) => void) {
    const previous = getValues(field.name);
    commit(next);
    if (String(previous ?? "") === String(next ?? "")) return;
    const versions: Record<string, number> = {};
    for (const name of getDescendants(config.fields, field.name)) {
      const child = config.fields.find(item => item.name === name);
      if (child?.resetOnDependencyChange === false) continue;
      setValue(name, "", { shouldDirty: true, shouldValidate: true, shouldTouch: false });
      clearErrors(name);
      versions[name] = (resetVersions[name] ?? 0) + 1;
    }
    if (Object.keys(versions).length) setResetVersions(previous => ({ ...previous, ...versions }));
  }

  async function submit(values: FormValues) {
    setSubmitError(null);
    try {
      if (config.submit) {
        if (!config.submit.url.startsWith("/api/")) throw new Error("Submit URL must start with /api/");
        const response = await fetch(config.submit.url, {
          method: config.submit.method, headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formId: config.id, formVersion: config.version, values })
        });
        if (!response.ok) throw new Error((await response.text()) || `Submit failed (${response.status})`);
      }
      onSubmitted?.(values);
    } catch (error) { setSubmitError(error instanceof Error ? error.message : "Submit failed"); }
  }

  return <form className="dynamic-form" onSubmit={handleSubmit(submit)} noValidate>
    <header className="form-header"><div className="eyebrow">CONFIG-DRIVEN UI</div><h1>{config.title ?? config.id}</h1>{config.description && <p>{config.description}</p>}<div className="form-meta"><span>{config.fields.length} fields</span><span>Config v{config.version}</span><span>RHF + Zod + Query</span></div></header>
    <div className="form-fields">{config.fields.map(field => {
      if (field.type === "async-select") return <AsyncSelectField key={field.name} field={field} control={control} setValue={setValue} values={values} resetVersion={resetVersions[field.name] ?? 0}
        onValueChange={(value, commit) => changeField(field, value, commit)} />;
      return <div className="field" key={field.name}><label htmlFor={field.name}>{field.label}{field.required && <span className="required"> *</span>}</label>
        <Controller name={field.name} control={control} render={({ field: input }) => <input id={field.name} type={field.type === "number" ? "number" : "text"} placeholder={field.placeholder}
          value={String(input.value ?? "")} name={input.name} ref={input.ref} onBlur={input.onBlur}
          onChange={event => changeField(field, event.target.value, input.onChange)}
          aria-invalid={Boolean(errors[field.name])} />} />
        {errors[field.name]?.message && <p role="alert" className="field-error">{String(errors[field.name]?.message)}</p>}
      </div>;
    })}</div>
    {submitError && <div className="submit-error" role="alert">{submitError}</div>}
    <div className="form-footer"><span className="form-footnote">Backend must revalidate dependency relationships before execution.</span><button type="submit" disabled={isSubmitting || !isValid}>{isSubmitting ? "Submitting…" : "Create order"}</button></div>
  </form>;
}
