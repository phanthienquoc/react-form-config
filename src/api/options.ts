import { z } from "zod";
import type { DataSource,FormValues } from "../types";
import { optionSchema } from "../config/schema";
const ALLOWED_PREFIX="/api/options/";
export function resolveParams(params:Record<string,string>|undefined,values:FormValues):Record<string,string>{
  return Object.fromEntries(Object.entries(params??{}).map(([key,template])=>{
    const match=/^\$values\.([a-zA-Z][a-zA-Z0-9_]*)$/.exec(template);
    if(!match)return [key,template];
    const value=values[match[1]];
    if(value===undefined||value===null||value==="")throw new Error(`Missing dependency value: ${match[1]}`);
    return [key,String(value)];
  }));
}
export function buildOptionsUrl(source:DataSource,values:FormValues):string{
  if(!source.url.startsWith(ALLOWED_PREFIX))throw new Error("Options URL must start with /api/options/");
  const query=new URLSearchParams(resolveParams(source.params,values)).toString();
  return query?`${source.url}?${query}`:source.url;
}
function pathValue(data:unknown,path:string):unknown{return path.split(".").reduce<unknown>((current,key)=>{if(current===null||typeof current!=="object")return undefined;return (current as Record<string,unknown>)[key];},data);}
export async function fetchOptions(source:DataSource,values:FormValues,signal:AbortSignal){
  const response=await fetch(buildOptionsUrl(source,values),{method:"GET",signal});
  if(!response.ok)throw new Error(`Failed to load options (${response.status})`);
  const payload:unknown=await response.json();
  return z.array(optionSchema).parse(pathValue(payload,source.responsePath??"items"));
}