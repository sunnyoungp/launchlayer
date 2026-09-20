import { z } from 'zod';
import type { MarketCode, ReadinessStatus } from './launchlayer-types';

export const markets = ['US', 'EU', 'JP'] as const;
export const lifecycles = ['New · In development', 'Existing · On market', 'Launch candidate', 'Launched', 'Retired'] as const;
export const sections = ['overview', 'markets', 'formula', 'claims', 'launch', 'activity'] as const;
export type Section = typeof sections[number];
export const actionNames = ['Accept recommended wording', 'Keep current wording and accept risk', 'Create a country-specific version', 'Remove the claim from all markets', 'Add required evidence', 'Pursue a different regulatory pathway', 'Add the action to the launch plan', 'Leave unresolved'] as const;
export type ClaimAction = typeof actionNames[number];
export const claimStatuses = ['Lower risk', 'Evidence required', 'Interpretation risk', 'Different pathway required', 'Avoid', 'Insufficient information'] as const;
export type ClaimStatus = typeof claimStatuses[number];
export const findingStatuses = ['open','in_review','resolved','not_applicable','risk_acknowledged'] as const;
export type FindingStatus = typeof findingStatuses[number];
export const readinessImpacts = ['blocking','conditional','informational'] as const;
export type ReadinessImpact = typeof readinessImpacts[number];
export const claimsStrategies = ['unreviewed','no_marketing_claims','claims_planned'] as const;
export type ClaimsStrategy = typeof claimsStrategies[number];
export const claimExamples = [
  ['Plump', 'Hydrates for plump-looking skin', 'Helps skin look plump through hydration.'],
  ['Volume', 'Restores lost facial volume', 'Helps skin look smoother and hydrated.'],
  ['Bounce', 'Leaves skin feeling bouncy', 'Leaves skin feeling soft and supple.'],
  ['Repair', 'Repairs damaged skin', 'Helps support soft, smooth-looking skin.'],
  ['Regenerate', 'Regenerates skin cells', 'Refreshes the appearance of tired-looking skin.'],
  ['Stimulates collagen', 'Stimulates collagen production', 'Helps skin look smoother.'],
  ['Brighten', 'Brightens the appearance of dull skin', 'Helps skin look radiant.'],
  ['Whitening', 'Whitening serum that inhibits melanin production', 'Supports a radiant-looking complexion.'],
  ['Reduces pigmentation', 'Reduces pigmentation by suppressing melanin', 'Helps improve the appearance of uneven skin tone.'],
  ['Clinical', 'Clinically proven to erase wrinkles', 'Helps soften the appearance of fine lines.'],
] as const;

const attachmentSchema = z.object({ id:z.string(),name:z.string(),kind:z.enum(['formula','packaging','evidence','manufacturing']),mime:z.string(),data:z.string().max(2900000),manual:z.boolean() });
export const claimSchema = z.object({ id:z.string(),text:z.string(),context:z.string(),example:z.string(),decisions:z.record(z.enum(markets),z.object({action:z.enum(actionNames),wording:z.string(),note:z.string(),at:z.string()})).default({}),removed:z.boolean().default(false) });
export const findingSchema = z.object({id:z.string(),ruleId:z.string(),market:z.enum(markets),category:z.string(),severity:z.string(),status:z.enum(findingStatuses),readinessImpact:z.enum(readinessImpacts),title:z.string(),explanation:z.string(),action:z.string(),sourceIds:z.array(z.string()),createdAt:z.string(),updatedAt:z.string(),provision:z.string().optional(),effectiveDate:z.string().optional(),confidence:z.string().optional(),resolution:z.string().optional(),evidenceIds:z.array(z.string()).optional(),decisionId:z.string().optional()});
export const productSchema = z.object({
  id:z.string(),name:z.string().min(1),sku:z.string(),kind:z.enum(['new','existing']),lifecycle:z.enum(lifecycles),markets:z.array(z.enum(markets)),current:z.array(z.enum(markets)),category:z.string(),format:z.string(),areas:z.array(z.string()),users:z.array(z.string()),benefits:z.array(z.string()),channels:z.array(z.string()),formulaStrategy:z.enum(['Global','Regional']),packagingStrategy:z.enum(['Universal','Regional']),
  ingredients:z.array(z.object({name:z.string(),concentration:z.string(),confirmed:z.boolean()})),avoid:z.array(z.string()),preferences:z.array(z.string()),claims:z.array(claimSchema),claimsStrategy:z.enum(claimsStrategies).default('unreviewed'),packaging:z.string(),manufacturer:z.string(),evidenceWork:z.array(z.string()),attachments:z.array(attachmentSchema),safetyReviewed:z.boolean().default(false),marketEntryConfirmed:z.array(z.enum(markets)).default([]),findings:z.array(findingSchema).default([]),reviewed:z.boolean(),assessed:z.boolean(),version:z.number().int(),validatedVersion:z.number().int().nullable(),pathway:z.enum(['Cosmetic','Quasi-drug']).default('Cosmetic'),strategy:z.string(),tasks:z.array(z.object({id:z.string(),title:z.string(),market:z.string(),source:z.string(),owner:z.string(),due:z.string(),done:z.boolean(),dependency:z.string(),version:z.number()})),activity:z.array(z.object({id:z.string(),at:z.string(),message:z.string(),version:z.number()}))
});
export type Product = z.infer<typeof productSchema>;
export type Claim = z.infer<typeof claimSchema>;
export type Finding = z.infer<typeof findingSchema>;
export const workspaceSchema = z.object({products:z.array(productSchema),name:z.string(),revision:z.number().int()});
export type Workspace = z.infer<typeof workspaceSchema>;
export function normalizeWorkspace(value:unknown):Workspace {
  const raw=value as {products?:unknown[];name?:string;revision?:number};
  const products=(raw.products??[]).map(item=>{const base={...(item as Record<string,unknown>)}; const claims=Array.isArray(base.claims)?base.claims:[]; const p=productSchema.parse({...base,claimsStrategy:base.claimsStrategy??(claims.length?'claims_planned':'unreviewed'),findings:base.findings??[],safetyReviewed:base.safetyReviewed??false,marketEntryConfirmed:base.marketEntryConfirmed??[]}); return reconcileFindings(p);});
  return workspaceSchema.parse({name:raw.name??'Atelier Commerce',revision:Number.isInteger(raw.revision)?raw.revision:0,products});
}
export function newProduct(kind:'new'|'existing'):Product {
  return {id:crypto.randomUUID(),name:'',sku:'',kind,lifecycle:kind==='new'?'New · In development':'Existing · On market',markets:['US'],current:kind==='existing'?['US']:[],category:'Leave-on facial skincare',format:'Serum',areas:['Face'],users:['Adults'],benefits:['Hydration'],channels:['DTC'],formulaStrategy:'Global',packagingStrategy:'Universal',ingredients:[],avoid:[],preferences:[],claims:[],claimsStrategy:'unreviewed',packaging:'',manufacturer:'',evidenceWork:[],attachments:[],safetyReviewed:false,marketEntryConfirmed:[],findings:[],reviewed:false,assessed:false,version:1,validatedVersion:null,pathway:'Cosmetic',strategy:'',tasks:[],activity:[]};
}
export function makeClaim(example:string):Claim {
  const row=claimExamples.find(x=>x[0]===example);
  return {id:crypto.randomUUID(),text:row?.[1]??example,context:'Front panel; leave-on facial serum. No imagery or testimonial supplied.',example:row?.[0]??'Custom',decisions:{},removed:false};
}
export function seedWorkspace():Workspace {
  const p=newProduct('existing');
  return {name:'Atelier Commerce',revision:0,products:[{...p,id:'lumiere',name:'Lumière Renewal Serum',sku:'LUM-RS-30',markets:['US','EU','JP'],current:['US'],benefits:['Hydration','Smoother texture','Radiance'],ingredients:[{name:'Aqua',concentration:'81.9',confirmed:true},{name:'Glycerin',concentration:'8',confirmed:true},{name:'Niacinamide',concentration:'5',confirmed:true},{name:'Squalane',concentration:'4',confirmed:true},{name:'Retinol Complex',concentration:'0.3',confirmed:false},{name:'Phenoxyethanol',concentration:'0.8',confirmed:true}],claims:['Repair','Stimulates collagen','Clinical','Brighten'].map(makeClaim),claimsStrategy:'claims_planned',packaging:'Lumière Renewal Serum\nApply nightly to face.\nIngredients: Aqua, Glycerin, Niacinamide, Squalane, Retinol Complex, Phenoxyethanol.\nDistributed by Atelier Commerce, NY.',manufacturer:'Northstar Labs LLC — supplier documentation pending',assessed:true,reviewed:true,activity:[{id:'seed',at:'2026-09-19T12:00:00Z',version:1,message:'Imported Lumière demonstration passport and sample source set.'}]}]};
}
export type ClaimResult={status:ClaimStatus;impact:string;why:string;evidence:string;alternative:string;confidence:string;source:string;provision:string;effective:string;wording:string};
export function evaluateClaim(claim:Claim,market:MarketCode):ClaimResult {
  const d=claim.decisions[market];
  const rewritten=d?.action==='Accept recommended wording'||d?.action==='Create a country-specific version';
  const wording=rewritten?d.wording:claim.text;
  const lower=wording.toLowerCase();
  const context=claim.context.toLowerCase();
  // Full supplied phrases and surrounding context are evaluated. Unsupported copy remains unknown.
  const biologic=/stimulates collagen production|regenerates skin cells|repairs damaged skin|restores lost facial volume|inhibits melanin|suppressing melanin/.test(lower+' '+context);
  const bright=/brightens the appearance|skin look radiant|radiant-looking complexion|appearance of uneven/.test(lower);
  const supported=/plump-looking skin|skin feeling bouncy|skin feeling soft|soft, smooth-looking|skin look smoother|refreshes the appearance|appearance of fine lines/.test(lower)||bright;
  const clinical=/clinically proven|erase wrinkles/.test(lower);
  let status:ClaimStatus=biologic?(market==='JP'&&/melanin/.test(lower+' '+context)?'Different pathway required':'Interpretation risk'):clinical?'Evidence required':supported?(market==='EU'?'Evidence required':market==='JP'?'Interpretation risk':'Lower risk'):'Insufficient information';
  if (/erase wrinkles/.test(lower)&&market==='JP') status='Avoid';
  if (d?.action==='Pursue a different regulatory pathway') status='Different pathway required';
  const alternative=claimExamples.find(x=>x[0]===claim.example)?.[2]??'Use a substantiated appearance-focused claim after specialist review.';
  return {status,wording,impact:biologic?'May change classification beyond the cosmetic pathway.':market==='JP'?'Cosmetic wording needs localized validation.':'Cosmetic appearance positioning; substantiate the finished-product benefit.',why:biologic?'This complete phrase implies a biological mechanism or restoration of damaged tissue. Neighboring claims and supplied imagery/testimonial descriptions remain part of the review.':clinical?'The clinical and absolute performance impression exceeds the supplied finished-product evidence.':supported?'Appearance and hydration framing is lower risk; the market, evidence, and full presentation still determine the outcome.':'This phrase is outside the seeded examples. No automated conclusion is available.',evidence:'Finished-product substantiation matching the exact wording, formula, population, and use conditions; attachment alone does not establish adequacy.',alternative,confidence:status==='Insufficient information'?'Low':'Medium',source:market==='US'?'SRC-US-02':market==='EU'?'SRC-EU-02':'SRC-JP-02',provision:market==='US'?'FD&C Act §201(g)(1), §201(i), as explained in FDA guidance':market==='EU'?'Regulation 655/2013, Annex: evidential support and truthfulness':'PMD Act pathway overview; exact Japanese wording requires local review',effective:market==='EU'?'2013-07-11':'Not asserted for this guidance record'};
}
export function decisionConsequence(action:ClaimAction,market:MarketCode):string {
  const scope=market==='US'?'US':market==='EU'?'EU':'Japan';
  const outcomes:Record<ClaimAction,string>={
    'Accept recommended wording':`Replaces this phrase for ${scope}. US biological-claim risk may clear; EU evidence and Japan localization reviews remain. Contextual risks are re-evaluated.`,
    'Keep current wording and accept risk':'Records your rationale. The finding stays open and continues to block readiness.',
    'Create a country-specific version':`Creates a ${scope} wording variant. Other countries keep their existing text. The variant is assessed again.`,
    'Remove the claim from all markets':'Removes this claim from every selected market and its active findings. The decision remains in Activity.',
    'Add required evidence':'Records evidence work for review. Upload supporting files below; risk stays open until specialist review.',
    'Pursue a different regulatory pathway':'Adds pathway planning work. Marketing approval is still required; readiness remains blocked.',
    'Add the action to the launch plan':'Creates a linked task. Planning the action does not resolve the finding.',
    'Leave unresolved':'Keeps the current finding open for a later decision.'};
  return outcomes[action];
}
export type Issue={id:string;title:string;why:string;action:string;dimension:string;source:string;type:string;status:ReadinessStatus;target:Section;findingStatus:FindingStatus;readinessImpact:ReadinessImpact;confidence?:string;effectiveDate?:string;provision?:string};
function findingKey(ruleId:string,market:MarketCode,entity='product'){return `${ruleId}|${market}|${entity}`;}
export function findingsFor(p:Product,market:MarketCode):Finding[] {
  const previous=new Map(p.findings.filter(f=>f.market===market).map(f=>[f.id,f]));
  const out:Finding[]=[];
  const add=(ruleId:string,title:string,explanation:string,action:string,category:string,impact:ReadinessImpact,sourceIds:string[],entity='product',extra:Partial<Finding>={})=>{const id=findingKey(ruleId,market,entity),old=previous.get(id),now=new Date().toISOString();out.push({id,ruleId,market,category,severity:impact==='blocking'?'major':impact==='conditional'?'moderate':'informational',status:old?.status??extra.status??'open',readinessImpact:impact,title,explanation,action,sourceIds,createdAt:old?.createdAt??now,updatedAt:now,...extra});};
  if(!p.ingredients.length||p.ingredients.some(i=>!i.confirmed||i.concentration===''||!Number.isFinite(Number(i.concentration)))) add('formula.identity','Confirm formula identity and concentration','Missing ingredient facts prevent restriction checks.','Enter concentrations and supplier-confirmed identities.','Formula','blocking',[market==='EU'?'SRC-EU-01':'SRC-US-01']);
  else { const total=p.ingredients.reduce((n,i)=>n+Number(i.concentration),0); if(Math.abs(total-100)>0.01)add('formula.total',`Formula totals ${total.toFixed(2)}%`,'A full quantitative formula is needed.','Reconcile the formula to 100%.','Formula','blocking',['SRC-US-01']); if(p.ingredients.some(i=>p.avoid.includes(i.name)))add('formula.avoid','Candidate conflicts with the original brief','An ingredient is on your selected avoid list.','Remove it or record a revised product direction.','Formula','blocking',['SRC-US-01']); const phen=p.ingredients.find(i=>i.name==='Phenoxyethanol'); if(phen&&Number(phen.concentration)>1&&(market==='EU'||market==='JP'))add('formula.phenoxy','Phenoxyethanol exceeds the sample 1% boundary','The seeded preservative corridor is exceeded.','Reformulate and revalidate the candidate.','Formula','blocking',[market==='EU'?'SRC-EU-01':'SRC-JP-01']); if(p.ingredients.some(i=>/retinol/i.test(i.name)))add('formula.retinol','Review retinoid conditions','Identity confirmation alone does not prove concentration, warnings, and use conditions acceptable.','Obtain specialist review of current annex and warning conditions.','Formula','conditional',['SRC-US-01']); }
  for (const claim of p.claims.filter(c=>!c.removed)) { const r=evaluateClaim(claim,market); if(r.status!=='Lower risk') add(`claim.${claim.id}`,r.wording,r.why,'Choose a claim action and review its consequence.','Claims',r.status==='Insufficient information'?'blocking':'conditional',[r.source],claim.id,{provision:r.provision,effectiveDate:r.effective,confidence:r.confidence}); }
  if(!p.claims.some(c=>!c.removed)&&p.claimsStrategy!=='no_marketing_claims')add('claims.strategy',p.claimsStrategy==='claims_planned'?'Claims are planned but none are selected':'Review claim strategy before launch','An empty claim set is only complete when you explicitly choose no marketing claims.','Choose “No marketing claims planned” or add the intended claims.','Claims','blocking',['SRC-US-01']);
  if(!p.packaging.trim())add('packaging.label','Add candidate packaging','No label text was supplied.','Upload text or enter candidate label copy.','Label and packaging','blocking',['SRC-US-01']); else if(!/\d+\s*(ml|g)\b/i.test(p.packaging))add('packaging.contents','Add net contents','The candidate label has no detectable net contents.','Add the correct quantity to label text and validate artwork.','Label and packaging','blocking',[market==='EU'?'SRC-EU-01':'SRC-US-01']);
  add('safety.substantiation','Review safety and substantiation','Evidence must be reviewed for the final version; attachments alone do not establish adequacy.','Complete the evidence work, then explicitly confirm the demo review.','Safety and evidence','blocking',['SRC-US-01'],'product',{status:p.safetyReviewed?'resolved':'open',resolution:p.safetyReviewed?'Demo evidence reviewed; not legal certification.':undefined});
  add('market.entry',market==='EU'?'Responsible Person, PIF and CPNP':market==='JP'?'Confirm Japan local party and import pathway':'Review applicable MoCRA obligations','This administrative pathway must be confirmed for the selected market.','Confirm the demo administrative requirement after reviewing the applicable pathway.','Market entry','conditional',[market==='US'?'SRC-US-01':market==='EU'?'SRC-EU-01':'SRC-JP-02'],'product',{status:p.marketEntryConfirmed.includes(market)?'resolved':'open',resolution:p.marketEntryConfirmed.includes(market)?'Demo administrative requirement confirmed; not government approval.':undefined});
  return out;
}
export function reconcileFindings(p:Product):Product { const generated=p.markets.flatMap(m=>findingsFor(p,m)); const ids=new Set(generated.map(f=>f.id)); const historical=p.findings.filter(f=>!ids.has(f.id)).map(f=>f.status==='open'?{...f,status:'not_applicable' as const}:f); return {...p,findings:[...generated,...historical]}; }
export function issuesFor(p:Product,market:MarketCode):Issue[] {
  return findingsFor(p,market).filter(f=>f.status!=='resolved'&&f.status!=='not_applicable').map(f=>({id:f.id,title:f.title,why:f.explanation,action:f.action,dimension:f.category,source:f.sourceIds[0]??'SRC-US-01',type:f.readinessImpact==='blocking'?'Legal requirement':'Product recommendation',status:f.readinessImpact==='blocking'?'Changes required':'Ready after administrative actions',target:f.category==='Formula'?'formula':f.category==='Claims'?'claims':'launch',findingStatus:f.status,readinessImpact:f.readinessImpact,confidence:f.confidence,effectiveDate:f.effectiveDate,provision:f.provision}));
}
const precedence:ReadinessStatus[]=['Hold','Insufficient information','Classification risk','Reformulation required','Changes required','Ready after administrative actions','Ready based on reviewed information'];
export function readiness(p:Product,market:MarketCode):ReadinessStatus {
  if(!p.assessed)return 'Insufficient information';
  const active=findingsFor(p,market).filter(f=>f.status!=='resolved'&&f.status!=='not_applicable');
  if(active.some(f=>(f.status==='open'&&f.readinessImpact==='blocking')||(f.status==='in_review'&&f.readinessImpact!=='informational')||(f.status==='risk_acknowledged'&&f.readinessImpact==='blocking')))return 'Changes required';
  if(active.some(f=>f.readinessImpact==='conditional'))return 'Ready after administrative actions';
  return 'Ready based on reviewed information';
}
export function recordChange(p:Product,message:string,changes:Partial<Product>):Product {
  const version=p.version+1;
  const next={...p,...changes,version,activity:[{id:crypto.randomUUID(),at:new Date().toISOString(),version,message},...p.activity]};
  return reconcileFindings(next);
}
export function setFindingStatus(p:Product,id:string,status:FindingStatus,resolution?:string,evidenceIds?:string[]):Product {
  const findings=p.findings.map(f=>f.id===id?{...f,status,resolution:resolution??f.resolution,evidenceIds:evidenceIds??f.evidenceIds,updatedAt:new Date().toISOString()}:f);
  return recordChange(p,`${status==='resolved'?'Resolved':'Updated'} finding: ${p.findings.find(f=>f.id===id)?.title??id}.`,{findings});
}
export function setClaimsStrategy(p:Product,claimsStrategy:ClaimsStrategy):Product { return recordChange(p,`Claims strategy set to ${claimsStrategy}.`,{claimsStrategy}); }
export function confirmSafetyReview(p:Product):Product { if(!p.evidenceWork.includes('Safety assessment'))throw new Error('Add the Safety assessment work before confirming the demo review.'); return recordChange(p,'Safety and substantiation evidence reviewed for the demo flow; not legal certification.',{safetyReviewed:true}); }
export function confirmMarketEntry(p:Product,market:MarketCode):Product { if(!p.markets.includes(market))throw new Error('Market is outside this passport'); return recordChange(p,`${market} administrative pathway confirmed for the demonstration; not government approval.`,{marketEntryConfirmed:Array.from(new Set([...p.marketEntryConfirmed,market]))}); }
export function decide(p:Product,claimId:string,market:MarketCode,action:ClaimAction,wording:string,note:string):Product {
  if(!p.markets.includes(market))throw new Error('Market is outside this passport');
  if(action==='Keep current wording and accept risk'&&!note.trim())throw new Error('A risk rationale is required');
  if((action==='Accept recommended wording'||action==='Create a country-specific version')&&!wording.trim())throw new Error('Wording is required');
  const claim=p.claims.find(c=>c.id===claimId);if(!claim)throw new Error('Claim not found');
  const claims=p.claims.map(c=>c.id!==claimId?c:{...c,removed:action==='Remove the claim from all markets',decisions:{...c.decisions,[market]:{action,wording,note,at:new Date().toISOString()}}});
  const tasks=[...p.tasks];
  if(['Add the action to the launch plan','Add required evidence','Pursue a different regulatory pathway'].includes(action)){
    const id=`claim-${claimId}-${market}-${action}`;
    if(!tasks.some(t=>t.id===id))tasks.push({id,title:`${action}: ${claim.text}`,market,source:evaluateClaim(claim,market).source,owner:'Unassigned',due:'',done:false,dependency:'Final wording and product version',version:p.version+1});
  }
  return recordChange(p,`${market}: ${action} — “${claim.text}”. ${decisionConsequence(action,market)}${note?' Rationale: '+note:''}`,{claims,tasks});
}
export function makePlan(p:Product,strategy:string):Product {
  const tasks=[...p.tasks];
  for(const m of p.markets)for(const i of issuesFor(p,m)){
    const id=`${m}-${i.id}`;
    if(!tasks.some(t=>t.id===id))tasks.push({id,title:i.action,market:m,source:i.source,owner:'Unassigned',due:'',done:false,dependency:i.dimension==='Market entry'?'Final formula, artwork and safety dossier':'Review supporting documents',version:p.version});
  }
  return recordChange(p,`Selected ${strategy}; generated ${tasks.length-p.tasks.length} linked launch tasks.`,{tasks,strategy});
}
