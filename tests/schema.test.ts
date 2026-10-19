import { describe, expect, it } from "vitest";
import { formConfigSchema } from "../src/config/schema";
describe("formConfigSchema",()=>{
 it("accepts valid configs with declared dependencies",()=>{const parsed=formConfigSchema.safeParse({id:"example",fields:[{name:"exchange",label:"Exchange",type:"text",required:true},{name:"market",label:"Market",type:"async-select",dependsOn:["exchange"],dataSource:{url:"/api/options/markets",params:{exchange:"$values.exchange"}}}]});expect(parsed.success).toBe(true);});
 it("rejects undeclared parameter references",()=>{const parsed=formConfigSchema.safeParse({id:"bad",fields:[{name:"market",label:"Market",type:"async-select",dependsOn:[],dataSource:{url:"/api/options/markets",params:{exchange:"$values.exchange"}}}]});expect(parsed.success).toBe(false);});
 it("rejects dependency cycles",()=>{const parsed=formConfigSchema.safeParse({id:"cycle",fields:[{name:"first",label:"First",type:"text",dependsOn:["second"]},{name:"second",label:"Second",type:"text",dependsOn:["first"]}]});expect(parsed.success).toBe(false);});
});
