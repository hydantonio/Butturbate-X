
// web/js/builder-controls.js
export function enableBuilder(opts={}){
  const options = Object.assign({ grid:20, snap:true, canvas: ".canvas-abs", el: ".element", gridSelector: ".grid" }, opts);
  const canvas = document.querySelector(options.canvas);
  if(!canvas) return null;
  const sel = document.createElement('div'); sel.className='sel';
  const parts=['nw','n','ne','e','se','s','sw','w'];
  parts.forEach(k=>{ const h=document.createElement('div'); h.className='h '+k; sel.appendChild(h); });
  canvas.appendChild(sel);

  let selected=null, drag=null, start=null;
  const history=[]; let future=[];
  const push=()=>{ history.push(snapshot()); future=[]; };
  function snapshot(){
    const data=[...canvas.querySelectorAll(options.el)].map(el=>({
      id:el.id,left:el.style.left,top:el.style.top,width:el.style.width,height:el.style.height,
      z:el.style.zIndex||"0",opacity:el.style.opacity||"1",rotate:el.dataset.rotate||"0"
    })); return JSON.stringify(data);
  }
  function restore(s){ if(!s) return; const data=JSON.parse(s); for(const st of data){ const el=document.getElementById(st.id); if(!el) continue;
    el.style.left=st.left; el.style.top=st.top; el.style.width=st.width; el.style.height=st.height; el.style.zIndex=st.z; el.style.opacity=st.opacity; el.dataset.rotate=st.rotate; el.style.transform=`rotate(${st.rotate}deg)`; } select(selected); }

  function snap(v){ return options.snap ? Math.round(v/options.grid)*options.grid : v; }
  function select(el){ selected=el; if(!el){ sel.style.display='none'; return; } sel.style.display='block';
    sel.style.left=(el.offsetLeft-2)+'px'; sel.style.top=(el.offsetTop-2)+'px'; sel.style.width=el.offsetWidth+'px'; sel.style.height=el.offsetHeight+'px';
    window.dispatchEvent(new CustomEvent("builder:select",{detail:{el}}));
  }
  function begin(type,e){ if(!selected) return; start={type,x:e.clientX,y:e.clientY,l:selected.offsetLeft,t:selected.offsetTop,w:selected.offsetWidth,h:selected.offsetHeight}; drag=type; push(); }
  function move(e){ if(!drag) return; const dx=e.clientX-start.x, dy=e.clientY-start.y;
    if(drag==='move'){ to(selected, snap(start.l+dx), snap(start.t+dy), options.snap); }
    else{
      let L=start.l,T=start.t,W=start.w,H=start.h;
      if(drag.includes('e')) W=Math.max(10,snap(start.w+dx));
      if(drag.includes('s')) H=Math.max(10,snap(start.h+dy));
      if(drag.includes('w')) { L=snap(start.l+dx); W=Math.max(10,snap(start.w-dx)); }
      if(drag.includes('n')) { T=snap(start.t+dy); H=Math.max(10,snap(start.h-dy)); }
      size(selected,L,T,W,H);
    }
  }
  function end(){ drag=null; }
  function to(el,x,y,doSnap){ el.style.left=(doSnap?snap(x):x)+'px'; el.style.top=(doSnap?snap(y):y)+'px'; select(el); }
  function size(el,L,T,W,H){ el.style.left=L+'px'; el.style.top=T+'px'; el.style.width=W+'px'; el.style.height=H+'px'; select(el); }
  function dup(el){ const c=el.cloneNode(true); c.id=(el.id?el.id+"-copy":"el-"+Math.random().toString(36).slice(2)); c.style.left=(el.offsetLeft+10)+'px'; c.style.top=(el.offsetTop+10)+'px'; canvas.appendChild(c); bind(c); select(c); }
  function del(el){ if(!el) return; el.remove(); select(null); }
  function zUp(el){ el.style.zIndex=String((+el.style.zIndex||0)+1); }
  function zDown(el){ el.style.zIndex=String(Math.max(0,(+el.style.zIndex||0)-1)); }
  function rotate(el,deg){ el.dataset.rotate=String((+el.dataset.rotate||0)+deg); el.style.transform=`rotate(${el.dataset.rotate}deg)`; select(el); }
  function bind(el){ el.style.position='absolute'; el.addEventListener('pointerdown',e=>{ select(el); begin('move',e); el.setPointerCapture(e.pointerId); }); }
  function bindHandles(){ const map={'.h.nw':'nw','.h.n':'n','.h.ne':'ne','.h.e':'e','.h.se':'se','.h.s':'s','.h.sw':'sw','.h.w':'w'};
    for(const k in map){ sel.querySelector(k).addEventListener('pointerdown',e=>{ begin(map[k],e); sel.setPointerCapture(e.pointerId); }); }
    window.addEventListener('pointermove',move); window.addEventListener('pointerup',end);
  }
  [...canvas.querySelectorAll(options.el)].forEach(bind); bindHandles();
  const api={ options, getSelected:()=>selected, moveTo:to, duplicate:dup, remove:del, undo:()=>{if(history.length){const last=history.pop(); future.push(snapshot()); restore(last);}}, redo:()=>{if(future.length){const next=future.pop(); history.push(snapshot()); restore(next);}}, zUp, zDown, rotate, snapshot, restore };
  window.BuilderAPI = api; return api;
}
