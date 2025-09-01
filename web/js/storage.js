
// web/js/storage.js
export async function saveToServer(key, data){
  const r = await fetch(`/api/${key}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
  if(!r.ok) throw new Error('Save failed');
  return true;
}
export async function loadFromServer(key, fallback){
  try{ const r = await fetch(`/api/${key}`); if(!r.ok) return fallback; return await r.json(); }
  catch{ return fallback; }
}
export function downloadJSON(filename, obj){
  const a=document.createElement('a'); a.href='data:application/json,'+encodeURIComponent(JSON.stringify(obj,null,2)); a.download=filename; a.click();
}
export function uploadJSON(){ return new Promise((res)=>{ const i=document.createElement('input'); i.type='file'; i.accept='application/json'; i.onchange=()=>{ const f=i.files[0]; const r=new FileReader(); r.onload=()=>res(JSON.parse(r.result)); r.readAsText(f); }; i.click(); }); }
