import type { FieldConfig } from "../config/schema";
export function getDescendants(fields:FieldConfig[],changedName:string):string[]{
 const descendants=new Set<string>();const queue=[changedName];
 while(queue.length){const parent=queue.shift()!;for(const field of fields){if(field.dependsOn.includes(parent)&&!descendants.has(field.name)){descendants.add(field.name);queue.push(field.name);}}}
 descendants.delete(changedName);return fields.filter(f=>descendants.has(f.name)).map(f=>f.name);
}