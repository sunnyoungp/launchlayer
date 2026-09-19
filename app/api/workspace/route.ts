import { env } from 'cloudflare:workers';
import { workspaceSchema, seedWorkspace } from '@/lib/product-model';

// The demo is intentionally scoped to local development and this private Sites
// deployment. It is not an account-isolated production workspace.
function allowedHost(request:Request) {
  const host = new URL(request.url).hostname;
  return ['localhost','127.0.0.1','[::1]'].includes(host) || host.endsWith('.chatgpt.site');
}
export async function GET(request:Request) {
  if(!allowedHost(request))return Response.json({error:'This demonstration workspace is restricted to the LaunchLayer preview.'},{status:403});
  try {
    if(!env.DB)throw new Error('Database unavailable');
    const seed=seedWorkspace();
    await env.DB.prepare('INSERT OR IGNORE INTO demo_workspace (id,payload,revision) VALUES (?,?,0)').bind('local',JSON.stringify(seed)).run();
    const row=await env.DB.prepare('SELECT payload, revision FROM demo_workspace WHERE id=?').bind('local').first<{payload:string;revision:number}>();
    return Response.json({...JSON.parse(row!.payload),revision:row!.revision});
  } catch {return Response.json({error:'Local workspace storage is unavailable. Your edits have not been saved.'},{status:503});}
}
export async function PUT(request:Request) {
  if(!allowedHost(request))return Response.json({error:'LaunchLayer preview only'},{status:403});
  try {
    const value=workspaceSchema.safeParse(await request.json());
    if(!value.success)return Response.json({error:'Invalid product data'},{status:400});
    if(!env.DB)throw new Error('Database unavailable');
    const data=value.data;
    const result=await env.DB.prepare('UPDATE demo_workspace SET payload=?,revision=revision+1 WHERE id=? AND revision=?').bind(JSON.stringify(data),'local',data.revision).run();
    if(!result.meta.changes)return Response.json({error:'Another tab saved a newer version. Reload before making further changes.'},{status:409});
    return Response.json({revision:data.revision+1});
  } catch {return Response.json({error:'Saving failed. Keep this page open and retry.'},{status:503});}
}
