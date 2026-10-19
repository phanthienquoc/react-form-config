import {z} from "zod";import type {FieldConfig,FormConfig} from "../config/schema";
function fieldSchema(f:FieldConfig):z.ZodTypeAny{
 let schema:z.ZodTypeAny;
 if(f.type==="number"){let n=z.coerce.number({message:`${f.label} must be a number`});if(f.validation?.min!==undefined)n=n.min(f.validation.min,f.validation.message);if(f.validation?.max!==undefined)n=n.max(f.validation.max,f.validation.message);schema=n;}
 else{let s=z.string();if(f.validation?.minLength!==undefined)s=s.min(f.validation.minLength,f.validation.message);if(f.validation?.maxLength!==undefined)s=s.max(f.validation.maxLength,f.validation.message);if(f.validation?.pattern)s=s.regex(new RegExp(f.validation.pattern),f.validation.message);schema=s;}
 return f.required?schema.refine(v=>v!==""&&v!==null&&v!==undefined,f.validation?.message??`${f.label} is required`):schema.optional().or(z.literal(""));
}
export function buildFormSchema(config:FormConfig){const shape:Record<string,z.ZodTypeAny>={};for(const f of config.fields)shape[f.name]=fieldSchema(f);return z.object(shape).superRefine((values,ctx)=>{for(const f of config.fields){const value=values[f.name];if(value===""||value===null||value===undefined)continue;for(const parent of f.dependsOn){const pv=values[parent];if(pv===""||pv===null||pv===undefined)ctx.addIssue({code:"custom",path:[f.name],message:`${f.label} requires ${parent}`});}}});}
