import { describe, expect, it } from "vitest";
import { buildOptionsUrl, resolveParams } from "../src/api/options";
describe("async options URL",()=>{
 it("resolves dependency params and URL-encodes values",()=>{const url=buildOptionsUrl({url:"/api/options/symbols",params:{exchange:"$values.exchange",note:"a b"},method:"GET",responsePath:"items"},{exchange:"Binance & OKX"});expect(url).toBe("/api/options/symbols?exchange=Binance+%26+OKX&note=a+b");});
 it("rejects endpoints outside the options namespace",()=>{expect(()=>buildOptionsUrl({url:"https://example.com/options",method:"GET",responsePath:"items"},{})).toThrow(/must start with/);});
 it("rejects missing dependency values",()=>{expect(()=>resolveParams({exchange:"$values.exchange"},{})).toThrow(/Missing dependency/);});
});
