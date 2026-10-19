import type { FieldConfig } from "../config/schema";
export function getDescendants(fields: FieldConfig[], parentName: string): string[] {
  const children = new Map<string, string[]>();
  for (const field of fields) for (const dependency of field.dependsOn) children.set(dependency, [...(children.get(dependency) ?? []), field.name]);
  const result:string[]=[]; const visited=new Set<string>(); const queue=[...(children.get(parentName)??[])];
  while(queue.length){const name=queue.shift()!;if(visited.has(name))continue;visited.add(name);result.push(name);queue.push(...(children.get(name)??[]));}
  return result;
}
