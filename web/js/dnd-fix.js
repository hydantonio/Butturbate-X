
/* web/js/dnd-fix.js */
(function(){
  const stage = document.querySelector('.stage') || document.querySelector('.canvas') || document.querySelector('.overlay-stage');
  const canvas = document.querySelector('.canvas-abs') || stage;
  if(!canvas || !stage) return;

  function scale(){ const r = stage.getBoundingClientRect(); return r.width/1920; }
  function toXY(e){ const r=stage.getBoundingClientRect(), s=scale(); const x=(e.clientX-r.left)/s, y=(e.clientY-r.top)/s; return {x:Math.max(0,Math.min(1920,x)), y:Math.max(0,Math.min(1080,y))}; }

  let drag=null, start=null, last=null, anim=null;

  canvas.addEventListener('pointerdown', (e)=>{
    const el = e.target.closest('.element'); if(!el) return;
    if(el.dataset.nativeDnd==='1') return; // non interferire con dnd nativo
    e.preventDefault();
    drag = el; const p=toXY(e);
    start={x:p.x,y:p.y,left:el.offsetLeft,top:el.offsetTop,w:el.offsetWidth,h:el.offsetHeight};
    el.setPointerCapture?.(e.pointerId);
    document.body.style.userSelect='none';
  });

  window.addEventListener('pointermove', (e)=>{
    if(!drag) return; last=e; if(!anim){ anim=requestAnimationFrame(()=>{ anim=null; const p=toXY(last); let nx=start.left+(p.x-start.x), ny=start.top+(p.y-start.y); nx=Math.round(nx/5)*5; ny=Math.round(ny/5)*5; drag.style.left=Math.max(0,Math.min(1920-start.w,nx))+'px'; drag.style.top=Math.max(0,Math.min(1080-start.h,ny))+'px'; }); }
  }, {passive:true});

  window.addEventListener('pointerup', (e)=>{ if(!drag) return; drag.releasePointerCapture?.(e.pointerId); drag=null; start=null; last=null; document.body.style.userSelect='auto'; });
})();