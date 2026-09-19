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
export const productSchema = z.object({
  id:z.string(),name:z.string().min(1),sku:z.string(),kind:z.enum(['new','existing']),lifecycle:z.enum(lifecycles),markets:z.array(z.enum(markets)).min(1),current:z.array(z.enum(markets)),category:z.string(),format:z.string(),areas:z.array(z.string()),users:z.array(z.string()),benefits:z.array(z.string()),channels:z.array(z.string()),formulaStrategy:z.enum(['Global','Regional']),packagingStrategy:z.enum(['Universal','Regional']),
  ingredients:z.array(z.object({name:z.string(),concentration:z.string(),confirmed:z.boolean()})),avoid:z.array(z.string()),preferences:z.array(z.string()),claims:z.array(claimSchema),packaging:z.string(),manufacturer:z.string(),evidenceWork:z.array(z.string()),attachments:z.array(attachmentSchema),reviewed:z.boolean(),assessed:z.boolean(),version:z.number().int(),validatedVersion:z.number().int().nullable(),pathway:z.enum(['Cosmetic','Quasi-drug']).default('Cosmetic'),strategy:z.string(),tasks:z.array(z.object({id:z.string(),title:z.string(),market:z.string(),source:z.string(),owner:z.string(),due:z.string(),done:z.boolean(),dependency:z.string(),version:z.number()})),activity:z.array(z.object({id:z.string(),at:z.string(),message:z.string(),version:z.number()}))
});
export type Product = z.infer<typeof productSchema>;
export type Claim = z.infer<typeof claimSchema>;
export const workspaceSchema = z.object({products:z.array(productSchema),name:z.string(),revision:z.number().int()});
export type Workspace = z.infer<typeof workspaceSchema>;
export function newProduct(kind:'new'|'existing'):Product {
  return {id:crypto.randomUUID(),name:'',sku:'',kind,lifecycle:kind==='new'?'New · In development':'Existing · On market',markets:['US','EU','JP'],current:kind==='existing'?['US']:[],category:'Leave-on facial skincare',format:'Serum',areas:['Face'],users:['Adults'],benefits:['Hydration'],channels:['DTC'],formulaStrategy:'Global',packagingStrategy:'Universal',ingredients:[],avoid:[],preferences:[],claims:[],packaging:'',manufacturer:'',evidenceWork:[],attachments:[],reviewed:false,assessed:false,version:1,validatedVersion:null,pathway:'Cosmetic',strategy:'',tasks:[],activity:[]};
}
export function makeClaim(example:string):Claim {
  const row=claimExamples.find(x=>x[0]===example);
  return {id:crypto.randomUUID(),text:row?.[1]??example,context:'Front panel; leave-on facial serum. No imagery or testimonial supplied.',example:row?.[0]??'Custom',decisions:{},removed:false};
}
export function seedWorkspace():Workspace {
  const p=newProduct('existing');
  return {name:'Atelier Commerce',revision:0,products:[{...p,id:'lumiere',name:'Lumière Renewal Serum',sku:'LUM-RS-30',benefits:['Hydration','Smoother texture','Radiance'],ingredients:[{name:'Aqua',concentration:'81.9',confirmed:true},{name:'Glycerin',concentration:'8',confirmed:true},{name:'Niacinamide',concentration:'5',confirmed:true},{name:'Squalane',concentration:'4',confirmed:true},{name:'Retinol Complex',concentration:'0.3',confirmed:false},{name:'Phenoxyethanol',concentration:'0.8',confirmed:true}],claims:['Repair','Stimulates collagen','Clinical','Brighten'].map(makeClaim),packaging:'Lumière Renewal Serum\nApply nightly to face.\nIngredients: Aqua, Glycerin, Niacinamide, Squalane, Retinol Complex, Phenoxyethanol.\nDistributed by Atelier Commerce, NY.',manufacturer:'Northstar Labs LLC — supplier documentation pending',assessed:true,reviewed:true,activity:[{id:'seed',at:'2026-09-19T12:00:00Z',version:1,message:'Imported Lumière demonstration passport and sample source set.'}]}]};
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
export type Issue={id:string;title:string;why:string;action:string;dimension:string;source:string;type:string;status:ReadinessStatus;target:Section};
export function issuesFor(p:Product,market:MarketCode):Issue[] {
  const issues:Issue[]=[];
  const add=(id:string,title:string,why:string,action:string,dimension:string,status:ReadinessStatus,target:Section,source=market==='US'?'SRC-US-01':market==='EU'?'SRC-EU-01':'SRC-JP-01',type='Product recommendation')=>issues.push({id,title,why,action,dimension,status,target,source,type});
  if (!p.ingredients.length||p.ingredients.some(i=>!i.confirmed||i.concentration===''||!Number.isFinite(Number(i.concentration)))) add('formula','Confirm formula identity and concentration','Missing ingredient facts prevent restriction checks.','Enter concentrations and supplier-confirmed identities.','Formula','Insufficient information','formula');
  else {
    const total=p.ingredients.reduce((n,i)=>n+Number(i.concentration),0);
    if(Math.abs(total-100)>0.01) add('total',`Formula totals ${total.toFixed(2)}%`,'A full quantitative formula is needed.','Reconcile the formula to 100%.','Formula','Insufficient information','formula');
    if(p.ingredients.some(i=>p.avoid.includes(i.name)))add('avoid','Candidate conflicts with the original brief','An ingredient is on your selected avoid list.','Remove it or record a revised product direction.','Formula','Changes required','formula');
    const phen=p.ingredients.find(i=>i.name==='Phenoxyethanol');
    if(phen&&Number(phen.concentration)>1&&(market==='EU'||market==='JP'))add('limit','Phenoxyethanol exceeds the sample 1% boundary','The seeded preservative corridor is exceeded.','Reformulate and revalidate the candidate.','Formula','Reformulation required','formula',market==='EU'?'SRC-EU-01':'SRC-JP-01','Legal requirement');
    if(p.ingredients.some(i=>/retinol/i.test(i.name)))add('retinol','Review retinoid conditions','Identity confirmation alone does not prove concentration, warnings, and use conditions acceptable.','Obtain specialist review of current annex and warning conditions.','Formula','Changes required','formula');
  }
  for (const claim of p.claims.filter(c=>!c.removed)) {
    const r=evaluateClaim(claim,market);
    if(r.status!=='Lower risk')add(`claim-${claim.id}`,r.wording,r.why,'Choose a claim action and review its consequence.','Claims',r.status==='Insufficient information'?'Insufficient information':r.status==='Evidence required'?'Changes required':'Classification risk','claims',r.source,'Product recommendation');
  }
  if(!p.claims.some(c=>!c.removed))add('claims','No claims selected','Presentation has not been reviewed.','Choose claim directions or enter the exact copy.','Claims','Insufficient information','claims');
  if(!p.packaging.trim())add('package','Add candidate packaging','No label text was supplied.','Upload text or enter candidate label copy.','Label and packaging','Insufficient information','claims');
  else if(!/\d+\s*(ml|g)\b/i.test(p.packaging))add('contents','Add net contents','The candidate label has no detectable net contents.','Add the correct quantity to label text and validate artwork.','Label and packaging','Changes required','claims',market==='EU'?'SRC-EU-01':'SRC-US-01','Legal requirement');
  add('safety','Review safety and substantiation','Uploaded evidence needs qualified review for the final version.','Complete safety, stability, and claim-evidence review.','Safety and evidence','Changes required','launch');
  add('entry',market==='EU'?'Responsible Person, PIF and CPNP':market==='JP'?'Confirm Japan local party and import pathway':'Review applicable MoCRA obligations','Administrative and local-party work is not evidenced by completing a task.','Collect and verify applicable market-entry documentation.','Market entry','Ready after administrative actions','launch',market==='US'?'SRC-US-01':market==='EU'?'SRC-EU-01':'SRC-JP-02','Legal requirement');
  return issues;
}
const precedence:ReadinessStatus[]=['Hold','Insufficient information','Classification risk','Reformulation required','Changes required','Ready after administrative actions','Ready based on reviewed information'];
export function readiness(p:Product,market:MarketCode):ReadinessStatus {
  if(!p.assessed)return 'Insufficient information';
  return issuesFor(p,market).map(i=>i.status).sort((a,b)=>precedence.indexOf(a)-precedence.indexOf(b))[0]??'Ready based on reviewed information';
}
export function recordChange(p:Product,message:string,changes:Partial<Product>):Product {
  const version=p.version+1;
  return {...p,...changes,version,activity:[{id:crypto.randomUUID(),at:new Date().toISOString(),version,message},...p.activity]};
}
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
