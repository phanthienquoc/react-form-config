import {useMemo,useState} from "react";
import rawConfig from "./config/trading-order.json";
import {formConfigSchema} from "./config/schema";
import {DynamicForm} from "./form/DynamicForm";
const parsed=formConfigSchema.safeParse(rawConfig);
export function App(){
 const [submitted,setSubmitted]=useState<Record<string,unknown>|null>(null);
 const config=useMemo(()=>parsed.success?parsed.data:null,[]);
 if(!config)return <main className="page"><section className="error-panel"><h1>Invalid form configuration</h1><p>Check the config schema and dependency definitions.</p><pre>{parsed.success?"":parsed.error.message}</pre></section></main>;
 return <main className="page">
  <section className="intro"><div className="status-pill"><span/> DEMO ENVIRONMENT</div><h2>Forms that adapt<br/><em>to your config.</em></h2><p>Change a parent field to reset dependent inputs. Async options are cached by dependencies and validated before submit.</p><div className="capabilities"><span>JSON-driven</span><span>Async dependencies</span><span>Zod validation</span></div></section>
  <section className="demo-layout"><DynamicForm config={config} onSubmitted={setSubmitted}/><aside className="side-panel"><div className="side-panel-header"><span>LIVE PAYLOAD</span><span className="live-dot"/></div><p>Values after successful client validation and API submission.</p><pre>{JSON.stringify(submitted??{exchange:"",market:"",symbol:"",quantity:""},null,2)}</pre><div className="side-note"><strong>Dependency policy</strong><p>Changing Exchange resets Market and Symbol. Changing Market resets Symbol. Async defaults apply only when the option exists in the API response.</p></div><div className="side-note"><strong>API contract</strong><p>GET /api/options/exchanges<br/>GET /api/options/markets?exchange=binance<br/>GET /api/options/symbols?exchange=binance&amp;market=spot</p></div></aside></section>
  <footer className="page-footer">REACT FORM CONFIG <span>•</span> PROTOTYPE 0.1</footer>
 </main>;
}