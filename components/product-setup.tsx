'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chips,Choice,MarketSelect } from './workspace-controls';
import { newProduct,recordChange, type Product } from '@/lib/product-model';
export function ProductSetup({kind,onCreate,onCancel}:{kind:'new'|'existing';onCreate:(p:Product)=>void;onCancel:()=>void}){
  const [p,set]=useState(()=>newProduct(kind));const [error,setError]=useState('');
  const patch=(v:Partial<Product>)=>set({...p,...v});
  return <form className="setup-form" onSubmit={e=>{e.preventDefault();if(!p.name.trim()||!p.markets.length||!p.areas.length||!p.users.length||!p.benefits.length||!p.channels.length){setError('Enter a name and choose at least one option in each selection.');return;}if(p.current.some(m=>!p.markets.includes(m))){setError('Current markets must be included in the target markets.');return;}onCreate(recordChange({...p,name:p.name.trim()},'Created Product Passport and original design brief.',{}));}}>
    <header className="page-heading"><div><h1>{kind==='new'?'Plan a new product':'Add an existing product'}</h1><p>{kind==='new'?'Choose markets and a product concept to create your design brief.':'Create the passport, then add product materials in its workspace.'}</p></div></header>
    <section className="panel setup-fields"><div className="form-pair"><label className="field">Working product name<Input required value={p.name} onChange={e=>patch({name:e.target.value})} placeholder="e.g. Barrier Glow Serum"/></label><label className="field">Internal SKU <small>Optional</small><Input value={p.sku} onChange={e=>patch({sku:e.target.value})}/></label></div>
    <MarketSelect value={p.markets} onChange={v=>patch({markets:v,current:p.current.filter(m=>v.includes(m))})}/><p className="muted setup-hint">Select every market you want LaunchLayer to assess. Current markets must also be selected above.</p>{kind==='existing'&&<MarketSelect label="Current markets" value={p.current} onChange={v=>patch({current:v.filter(m=>p.markets.includes(m))})}/>}
    <Choice label="SKU strategy" value={p.formulaStrategy==='Global'?'One global SKU preferred':'Regional variants acceptable'} options={['One global SKU preferred','Regional variants acceptable']} onChange={v=>patch({formulaStrategy:v.startsWith('One')?'Global':'Regional'})}/>
    <div className="form-pair"><Choice label="Product category" value={p.category} options={['Leave-on facial skincare']} onChange={v=>patch({category:v})}/><Choice label="Product format" value={p.format} options={['Serum','Cream','Lotion','Gel','Facial oil']} onChange={v=>patch({format:v})}/></div>
    <Chips label="Application areas" value={p.areas} options={['Face','Neck','Eye contour']} onChange={v=>patch({areas:v})}/>{p.areas.includes('Eye contour')&&<p className="inline-note">Eye-area use adds safety and ingredient-specific review to the brief.</p>}
    <Chips label="Intended users" value={p.users} options={['Adults','Sensitive skin','Pregnant or nursing adults']} onChange={v=>patch({users:v})}/>
    <Chips label="General consumer benefits" value={p.benefits} options={['Hydration','Smoother texture','Radiance','Firm-looking skin','Even-looking tone','Barrier support']} onChange={v=>patch({benefits:v})}/>
    <Chips label="Sales channels" value={p.channels} options={['DTC','Specialty retail','Marketplace','Professional']} onChange={v=>patch({channels:v})}/>
    {error&&<p role="alert" className="error">{error}</p>}<div className="form-footer"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit">Create Product Passport</Button></div></section>
  </form>;
}
