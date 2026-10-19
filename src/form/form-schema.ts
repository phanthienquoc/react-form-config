import { z } from "zod";
import type { FieldConfig,FormConfig } from "../config/schema";
function fieldSchema(field:FieldConfig):z.ZodTypeAny{
 let schema:z.ZodTypeAny;
 if(field.type==="number"){
   let s=z.coerce.number({message:`${field.label} must be a number`});
   if(field.validation?.min!==undefined)s=s.min(field.validation.min,field.validation.message);
   if(field.validation?.max!==undefined)s=s.max(field.validation.max,field.validation.message);
   schema=s;
 }else{
   let s=z.string();
   if(field.validation?.minLength!==undefined)s=s.min(field.validation.minLength,field.validation.message);
   if(field.validation?.maxLength!==undefined)s=s.max(field.validation.maxLength,field.validation.message);
   if(field.validation?.pattern)s=s.regex(new RegExp(field.validation.pattern),field.validation.message);
   schema=s;
 }
 if(field.required)return schema.refine(v=>v!==""&&v!==null&&v!==undefined,field.validation?.message??`${field.label} is required`);
 return schema.optional().or(z.literal(""));
}
export function buildFormSchema(config:FormConfig){
 const shape:Record<string,z.ZodTypeAny>={};for(const f of config.fields)shape[f.name]=fieldSchema(f);
 return z.object(shape).superRefine((values,ctx)=>{
  for(const f of config.fields){const value=values[f.name];if(value===""||value===null||value===undefined)continue;
   for(const parent of f.dependsOn){const parentValue=values[parent];if(parentValue===""||parentValue===null||parentValue===undefined)ctx.addIssue({code:"custom",path:[f.name],message:`${f.label} requires ${parent}`});}
  }
 });
}