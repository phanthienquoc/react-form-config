import { z } from "zod";
export const optionSchema = z.object({ value: z.string(), label: z.string() });
export const dataSourceSchema = z.object({ url: z.string().min(1), method: z.literal("GET").optional().default("GET"), params: z.record(z.string(), z.string()).optional(), responsePath: z.string().optional().default("items") });
export const fieldConfigSchema = z.object({
  name: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/), label: z.string().min(1), type: z.enum(["async-select", "text", "number"]),
  required: z.boolean().optional().default(false), dependsOn: z.array(z.string()).optional().default([]), resetOnDependencyChange: z.boolean().optional().default(true),
  defaultValue: z.union([z.string(), z.number(), z.null()]).optional(), defaultOption: optionSchema.optional(), placeholder: z.string().optional(), dataSource: dataSourceSchema.optional(),
  validation: z.object({ minLength:z.number().int().nonnegative().optional(), maxLength:z.number().int().nonnegative().optional(), min:z.number().optional(), max:z.number().optional(), pattern:z.string().optional(), message:z.string().optional() }).optional()
}).superRefine((f,ctx)=>{
  if(f.type==="async-select"&&!f.dataSource)ctx.addIssue({code:"custom",path:["dataSource"],message:"async-select requires dataSource"});
  if(f.validation?.minLength!==undefined&&f.validation.maxLength!==undefined&&f.validation.minLength>f.validation.maxLength)ctx.addIssue({code:"custom",path:["validation"],message:"minLength cannot exceed maxLength"});
});
export const formConfigSchema = z.object({ id:z.string().min(1), version:z.number().int().positive().optional().default(1), title:z.string().optional(), description:z.string().optional(), fields:z.array(fieldConfigSchema).min(1), submit:z.object({url:z.string().min(1),method:z.enum(["POST","PUT","PATCH"]).optional().default("POST")}).optional() }).superRefine((c,ctx)=>{
  const names=new Set<string>(); for(const [i,f] of c.fields.entries()){ if(names.has(f.name))ctx.addIssue({code:"custom",path:["fields",i,"name"],message:"Duplicate field: "+f.name}); names.add(f.name); }
  const all=new Set(c.fields.map(f=>f.name)); for(const [i,f] of c.fields.entries()){ for(const d of f.dependsOn){ if(!all.has(d))ctx.addIssue({code:"custom",path:["fields",i,"dependsOn"],message:"Unknown dependency: "+d}); if(d===f.name)ctx.addIssue({code:"custom",path:["fields",i,"dependsOn"],message:"Self dependency is not allowed"}); } for(const template of Object.values(f.dataSource?.params??{})){const m=/^\$values\.([a-zA-Z][a-zA-Z0-9_]*)$/.exec(template); if(m&&!f.dependsOn.includes(m[1])&&m[1]!==f.name)ctx.addIssue({code:"custom",path:["fields",i,"dataSource","params"],message:"Parameter "+m[1]+" must be declared in dependsOn"});} }
  const map=new Map(c.fields.map(f=>[f.name,f])); const visiting=new Set<string>(),visited=new Set<string>(); function visit(n:string):boolean { if(visiting.has(n))return false; if(visited.has(n))return true; visiting.add(n); for(const d of map.get(n)?.dependsOn??[])if(map.has(d)&&!visit(d))return false; visiting.delete(n);visited.add(n);return true; }
  for(const f of c.fields)if(!visit(f.name)){ctx.addIssue({code:"custom",path:["fields"],message:"Dependency cycle detected"});break;}
});
export type FormConfig = z.infer<typeof formConfigSchema>;
export type FieldConfig = FormConfig["fields"][number];
export type Option = z.infer<typeof optionSchema>;
