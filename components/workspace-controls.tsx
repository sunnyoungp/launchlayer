'use client';
import { Check, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sources, marketNames } from '@/lib/seed-data';
import { markets } from '@/lib/product-model';
import type { MarketCode } from '@/lib/launchlayer-types';
export function Choice({label,value,options,onChange}:{label:string;value:string;options:readonly string[];onChange:(v:string)=>void}){
  return <label className="field"><span>{label}</span><Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label}><SelectValue/></SelectTrigger><SelectContent>{options.map(x=><SelectItem value={x} key={x}>{x}</SelectItem>)}</SelectContent></Select></label>;
}
export function Chips({label,value,options,onChange}:{label:string;value:string[];options:readonly string[];onChange:(v:string[])=>void}){
  return <fieldset className="field"><legend>{label}</legend><div className="chips">{options.map(x=><button type="button" key={x} aria-pressed={value.includes(x)} onClick={()=>onChange(value.includes(x)?value.filter(v=>v!==x):[...value,x])}>{value.includes(x)&&<Check size={13}/>} {x}</button>)}</div></fieldset>;
}
export function MarketSelect({value,onChange,label='Target markets'}:{value:MarketCode[];onChange:(v:MarketCode[])=>void;label?:string}){
  return <fieldset className="field"><legend>{label}</legend><div className="market-select">{markets.map(m=><button type="button" key={m} aria-pressed={value.includes(m)} onClick={()=>onChange(value.includes(m)?value.filter(v=>v!==m):[...value,m])}><span className="country-code">{m}</span><strong>{marketNames[m]}</strong>{value.includes(m)&&<Check size={16}/>}</button>)}</div></fieldset>;
}
export function Pill({children}:{children:React.ReactNode}){
  const text=String(children);const tone=/risk|Avoid|Hold|Reformulation/.test(text)?'risk':/required|information|pending|review/i.test(text)?'warn':'neutral';
  return <span className={`pill ${tone}`}>{children}</span>;
}
export function SourceLink({id}:{id:string}){
  const source=sources.find(s=>s.id===id);if(!source)return null;
  return <a className="source-ref" href={source.url} target="_blank" rel="noreferrer">{source.authority} · {source.title}<ExternalLink size={13}/></a>;
}
export function Panel({title,children,action}:{title:string;children:React.ReactNode;action?:React.ReactNode}){return <section className="panel"><div className="panel-title"><h2>{title}</h2>{action}</div>{children}</section>;}
