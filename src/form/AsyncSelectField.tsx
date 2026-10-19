import {useEffect,useRef} from "react";
import {useQuery} from "@tanstack/react-query";
import {Controller,type Control,type UseFormSetValue} from "react-hook-form";
import type {FieldConfig,Option} from "../config/schema";
import type {FormValues} from "../types";
import {fetchOptions} from "../api/options";
type Props={field:FieldConfig;control:Control<FormValues>;setValue:UseFormSetValue<FormValues>;values:FormValues;resetVersion:number};
export function AsyncSelectField({field,control,setValue,values,resetVersion}:Props){
 const source=field.dataSource!;
 const dependenciesReady=field.dependsOn.every(n=>values[n]!==undefined&&values[n]!==null&&values[n]!=="");
 const params=Object.entries(source.params??{}).map(([key,t])=>{const m=/^\$values\.([a-zA-Z][a-zA-Z0-9_]*)$/.exec(t);return [key,m?values[m[1]]:t];});
 const query=useQuery({queryKey:["form-options",source.url,params],queryFn:({signal})=>fetchOptions(source,values,signal),enabled:field.dependsOn.length===0||dependenciesReady,staleTime:30_000});
 const applied=useRef<string|null>(null);const context=JSON.stringify([resetVersion,params]);
 useEffect(()=>{
  if(!query.data||applied.current===context)return;applied.current=context;
  if(values[field.name]!==undefined&&values[field.name]!=="")return;
  if(field.defaultValue===undefined||field.defaultValue===null)return;
  const valid=query.data.some((option:Option)=>option.value===String(field.defaultValue));
  if(valid)setValue(field.name,String(field.defaultValue),{shouldDirty:false,shouldValidate:true});
 },[query.data,context,field.name,field.defaultValue,values,setValue]);
 return <Controller name={field.name} control={control} rules={{required:field.required?`${field.label} is required`:false,validate:value=>{
  if(value===""||value===undefined)return !field.required||`${field.label} is required`;
  if(!query.data)return "Options have not loaded";
  return query.data.some(option=>option.value===String(value))||"Selected option is no longer valid";
 }} render={({field:input,fieldState})=><div className="field">
  <label htmlFor={field.name}>{field.label}{field.required&&<span className="required"> *</span>}</label>
  <select id={field.name} name={input.name} ref={input.ref} value={String(input.value??"")} onBlur={input.onBlur} onChange={input.onChange} disabled={(field.dependsOn.length>0&&!dependenciesReady)||query.isFetching||query.isError} aria-invalid={Boolean(fieldState.error)}>
   <option value="">{!dependenciesReady&&field.dependsOn.length?"Select parent field first":query.isFetching?"Loading options…":query.isError?"Could not load options":field.placeholder??`Select ${field.label.toLowerCase()}`}</option>
   {(query.data??[]).map(option=><option key={option.value} value={option.value}>{option.label}</option>)}
  </select>
  {query.isError&&<button className="text-button" type="button" onClick={()=>void query.refetch()}>Retry</button>}
  {fieldState.error&&<p className="field-error" role="alert">{fieldState.error.message}</p>}
 </div>}/>;
}