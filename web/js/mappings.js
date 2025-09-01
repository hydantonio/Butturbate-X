
import { vibrateAll } from "./intiface.js";
import { saveToServer, loadFromServer, downloadJSON, uploadJSON } from "./storage.js";
let mappings = [];
export async function initMappings(){
  try { mappings = await loadFromServer('mappings', []); } catch(e){ console.warn('[Mappings] load failed', e); mappings=[]; }
  bind(); render();
}
function bind(){
  const addBtn=document.getElementById('map-add');
  const saveBtn=document.getElementById('map-save');
  const expBtn=document.getElementById('map-export');
  const impBtn=document.getElementById('map-import');
  const simBtn=document.getElementById('map-sim');
  if(addBtn) addBtn.onclick=add;
  if(saveBtn) saveBtn.onclick=save;
  if(expBtn) expBtn.onclick=()=>downloadJSON('mappings.json', mappings);
  if(impBtn) impBtn.onclick=async()=>{ try{ const data=await uploadJSON(); if(Array.isArray(data)){ mappings=data; render(); } }catch(e){ alert('Invalid JSON'); } };
  if(simBtn) simBtn.onclick=simulate;
}
function add(){ mappings.push({ min:1, max:10, pattern:'pulse', intensity:0.6, duration:1000 }); render(); }
async function save(){ await saveToServer('mappings', mappings); }
function row(m, idx){
  const wrap=document.createElement('div'); wrap.className='row';
  wrap.innerHTML=''
    +'<input type="number" class="input" value="'+m.min+'" style="width:70px"> - '
    +'<input type="number" class="input" value="'+m.max+'" style="width:70px">'
    +'<select class="input"><option>pulse</option><option>ramp</option><option>burst</option><option>sine</option><option>hold</option><option>stop</option></select>'
    +'<input type="number" class="input" step="0.05" min="0" max="1" value="'+m.intensity+'" style="width:90px">'
    +'<input type="number" class="input" value="'+m.duration+'" style="width:100px">'
    +'<button class="btn">X</button>';
  const inputs=wrap.querySelectorAll('input,select,button');
  const minEl=inputs[0], maxEl=inputs[1], sel=inputs[2], inten=inputs[3], dur=inputs[4], del=inputs[5];
  sel.value=m.pattern;
  minEl.oninput=()=>{ m.min=+minEl.value||1; };
  maxEl.oninput=()=>{ m.max=+maxEl.value||10; };
  sel.onchange=()=>{ m.pattern=sel.value; };
  inten.oninput=()=>{ m.intensity=+inten.value||0.5; };
  dur.oninput=()=>{ m.duration=+dur.value||1000; };
  del.onclick=()=>{ mappings.splice(idx,1); render(); };
  return wrap;
}
function render(){ const list=document.getElementById('map-list'); if(!list) return; list.innerHTML=''; mappings.sort((a,b)=>a.min-b.min).forEach((m,i)=> list.appendChild(row(m,i))); }
export function match(amount){ return mappings.find(m=>amount>=m.min && amount<=m.max); }
export async function simulate(){ const v=+(document.getElementById('map-amount')?.value||0); const rule=match(v); if(!rule){ alert('No mapping for amount '+v); return; } await run(rule); }
export async function run(rule){
  const t=rule.duration||1000, i=rule.intensity||0.6;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  switch(rule.pattern){
    case 'hold': await vibrateAll(i,t); break;
    case 'stop': await vibrateAll(0,0); break;
    case 'pulse': { const on=200, off=150, loops=Math.ceil(t/(on+off)); for(let k=0;k<loops;k++){ await vibrateAll(i,on); await sleep(off);} break; }
    case 'burst': { for(let k=0;k<5;k++){ await vibrateAll(1,120); await sleep(120);} break; }
    case 'ramp': { const steps=10, step=t/steps; for(let s=1;s<=steps;s++){ await vibrateAll(i*s/steps, step*0.8); await sleep(step*0.2);} break; }
    case 'sine': { const steps=24, step=t/steps; for(let s=0;s<steps;s++){ const lv=(Math.sin((s/steps)*Math.PI*2)+1)/2; await vibrateAll(i*lv, step*0.8); await sleep(step*0.2);} break; }
    default: await vibrateAll(i,t);
  }
}
