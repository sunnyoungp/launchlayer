import test from 'node:test';
import assert from 'node:assert/strict';
import {seedWorkspace,findingsFor,reconcileFindings,readiness,recordChange,decide,setClaimsStrategy,confirmSafetyReview,confirmMarketEntry,normalizeWorkspace,type Product} from '@/lib/product-model';

function seeded(){return seedWorkspace().products[0];}
function readyFormula(p:Product){return recordChange(p,'Confirmed formula identity.',{ingredients:p.ingredients.filter(i=>!i.name.includes('Retinol')).map((i,n)=>({...i,confirmed:true,concentration:n===0?'82.2':i.concentration}))});}

test('golden path progresses from blocked to ready for one market',()=>{
  let p=seeded(); assert.notEqual(readiness(p,'US'),'Ready based on reviewed information');
  p=readyFormula(p); p=recordChange(p,'Added net contents.',{packaging:p.packaging+'\n30 ml'});
  for(const c of p.claims) if(!c.removed) p=decide(p,c.id,'US','Accept recommended wording','Helps skin look smoother.','');
  p=setClaimsStrategy(p,'claims_planned'); p=recordChange(p,'Added safety work.',{evidenceWork:['Safety assessment']}); p=confirmSafetyReview(p); p=confirmMarketEntry(p,'US'); p=recordChange(p,'Assessed current product.',{assessed:true,reviewed:true});
  assert.equal(readiness(p,'US'),'Ready based on reviewed information');
  p=confirmMarketEntry(p,'US'); assert.equal(readiness(p,'US'),'Ready based on reviewed information');
});

test('no marketing claims is intentional and does not create a blocker',()=>{let p=seeded(); p=recordChange(p,'Removed claims intentionally.',{claims:[],claimsStrategy:'no_marketing_claims'}); assert.equal(findingsFor(p,'US').some(f=>f.ruleId==='claims.strategy'),false);});
test('saved decisions survive serialization and recomputation',()=>{let p=seeded(); const c=p.claims[0]!; p=decide(p,c.id,'US','Keep current wording and accept risk',c.text,'Reviewed in demo'); const restored=normalizeWorkspace({name:'x',revision:0,products:[JSON.parse(JSON.stringify(p))]}).products[0]!; assert.equal(restored.claims[0]!.decisions.US!.note,'Reviewed in demo');});
test('resolved findings remain resolved after recompute',()=>{let p=seeded(); const f=findingsFor(p,'US')[0]; p={...p,findings:[{...f,status:'resolved',resolution:'Evidence confirmed'}]}; const next=reconcileFindings(p); assert.equal(next.findings.find(x=>x.id===f.id)?.status,'resolved');});
test('risk acknowledgement never produces full readiness',()=>{let p=seeded(); const f=findingsFor(p,'US').find(x=>x.readinessImpact==='blocking')!; p={...p,assessed:true,findings:[{...f,status:'risk_acknowledged'}]}; assert.notEqual(readiness(p,'US'),'Ready based on reviewed information');});
