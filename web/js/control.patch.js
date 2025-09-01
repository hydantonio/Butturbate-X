
/* === Control wiring for enhanced mappings + drag ease === */
(function(){
  const socket = window.__io_socket || (window.io ? window.io() : null);
  if(!socket){ console.warn('[control] no socket'); return; }

  const stage = document.getElementById('stage'),
        canvas = document.getElementById('canvas'),
        sel = document.getElementById('sel');

  let elements = [];
  let mappings = [];
  let selected = null;
  const gridChk = document.getElementById('gridChk') || document.querySelector('input#grid'); // optional
  const gridSizeInput = document.querySelector('input#gridSize'); // optional

  function getScale(){
    const r = canvas.getBoundingClientRect(); return {sc: r.width/1920, rect:r};
  }
  function snap(v){
    const on = gridChk ? gridChk.checked : false;
    const gs = gridSizeInput ? (Number(gridSizeInput.value)||20) : 20;
    return on ? Math.round(v/gs)*gs : v;
  }
  function px(n){ return (n|0)+'px'; }

  function render(){
    // only update selection box; element rendering is already in your control.html
    if(!selected){ sel.style.display='none'; return; }
    const el = elements.find(e=>e.id===selected);
    if(!el){ sel.style.display='none'; return; }
    sel.style.display='block';
    sel.style.left = px(el.x); sel.style.top=px(el.y);
    sel.style.width = px(el.w||600); sel.style.height = px(el.h||60);
    sel.querySelectorAll('.h').forEach(h=>attachResize(h,el,[...h.classList].pop()));
  }

  function select(id){ selected=id; render(); openProps && openProps(); }

  function attachResize(h,el,k){
    h.onpointerdown = (e)=>{
      h.setPointerCapture(e.pointerId);
      const {sc} = getScale();
      const start={x:e.clientX,y:e.clientY, ex:el.x,ey:el.y, ew:el.w||600, eh:el.h||60};
      function mv(ev){
        const dx=(ev.clientX-start.x)/sc, dy=(ev.clientY-start.y)/sc;
        let x=el.x,y=el.y,w=el.w||600,h=el.h||60;
        if(k.includes('e')) w=Math.max(20, snap(Math.round(start.ew+dx)));
        if(k.includes('s')) h=Math.max(20, snap(Math.round(start.eh+dy)));
        if(k.includes('w')){ x=snap(Math.round(start.ex+dx)); w=Math.max(20, snap(Math.round(start.ew-dx))); }
        if(k.includes('n')){ y=snap(Math.round(start.ey+dy)); h=Math.max(20, snap(Math.round(start.eh-dy))); }
        Object.assign(el,{x,y,w,h});
        socket.emit('element:update',el);
        render();
      }
      function up(){ h.releasePointerCapture(e.pointerId); removeEventListener('pointermove',mv); removeEventListener('pointerup',up); }
      addEventListener('pointermove',mv,{passive:true}); addEventListener('pointerup',up,{once:true});
    };
  }

  // Precise drag with pointer offset
  window.dragStart = function(el, node){
    return (e)=>{
      if(e.button!==0) return;
      node.setPointerCapture?.(e.pointerId);
      node.style.cursor='grabbing';
      const {sc, rect} = getScale();
      const offsetX = (e.clientX - rect.left)/sc - el.x;
      const offsetY = (e.clientY - rect.top)/sc - el.y;
      function mv(ev){
        const cx = (ev.clientX - rect.left)/sc;
        const cy = (ev.clientY - rect.top)/sc;
        el.x = snap(Math.round(cx - offsetX));
        el.y = snap(Math.round(cy - offsetY));
        socket.emit('element:update', el);
        render();
      }
      function up(){
        node.style.cursor='grab';
        node.onpointermove=null;
        removeEventListener('pointermove', mv);
        removeEventListener('pointerup', up);
      }
      addEventListener('pointermove', mv, {passive:true});
      addEventListener('pointerup', up, {once:true});
    };
  };

  // Enhance Mappings UI
  function renderMappings(){
    const root=document.getElementById('maps'); if(!root) return;
    root.querySelectorAll('.rowItem').forEach(n=>n.remove());
    mappings.forEach((m,idx)=>{
      const rowEl = document.createDocumentFragment();

      const min=document.createElement('input'); min.type='number'; min.value=m.min||0; min.title='min tokens';
      min.oninput=e=>{ m.min=+e.target.value||0; pushMappings(); };

      const max=document.createElement('input'); max.type='number'; max.value=m.max||0; max.title='max tokens';
      max.oninput=e=>{ m.max=+e.target.value||0; pushMappings(); };

      const type=document.createElement('select');
      ['steady','pulse','ramp','pattern'].forEach(t=>{ const o=document.createElement('option'); o.value=t; o.textContent=t; if((m.type||'steady')===t) o.selected=true; type.appendChild(o); });
      type.onchange=e=>{ m.type=e.target.value; renderMappings(); pushMappings(); };

      // Params container changes per type
      const params=document.createElement('div'); params.style.display='grid'; params.style.gridTemplateColumns='repeat(5, minmax(70px, 1fr))'; params.style.gap='6px';

      function paramInput(ph, key, def, step='any'){
        const inp=document.createElement('input'); inp.type='number'; if(step!=='any') inp.step=String(step);
        inp.placeholder=ph; inp.value = (m[key]??def);
        inp.oninput=e=>{ m[key]=+e.target.value||0; pushMappings(); };
        return inp;
      }
      function paramText(ph, key, def){
        const inp=document.createElement('input'); inp.type='text'; inp.placeholder=ph; inp.value = (m[key]??def)||'';
        inp.onchange=e=>{ m[key]=e.target.value; pushMappings(); };
        return inp;
      }

      if((m.type||'steady')==='steady'){
        params.append(paramInput('intensity(0-1)', 'intensity', 0.6, 0.05), paramInput('duration(ms)','duration',800,50));
      }else if(m.type==='pulse'){
        params.append(paramInput('intensity(0-1)', 'intensity', 0.7, 0.05),
                      paramInput('duration(ms)','duration',1200,50),
                      paramInput('freq(Hz)','freq', 2, 0.1),
                      paramInput('duty(0-1)','duty', 0.5, 0.05));
      }else if(m.type==='ramp'){
        params.append(paramInput('start(0-1)','start',0.1,0.05),
                      paramInput('end(0-1)','end', 1, 0.05),
                      paramInput('duration(ms)','duration',1500,50),
                      paramInput('steps','steps', 24, 1));
      }else if(m.type==='pattern'){
        params.append(paramText('pattern JSON es. [[0.2,200],[0,100],[1,300]]','pattern','[[0.2,200],[0,120],[1,300]]'));
      }

      const rm=document.createElement('button'); rm.textContent='Remove'; rm.className='rm'; rm.onclick=()=>{ mappings.splice(idx,1); renderMappings(); pushMappings(); };

      [min,max,type,params,rm].forEach(el=>{ el.classList.add('rowItem'); root.appendChild(el); });
    });
  }
  function pushMappings(){ socket.emit('mappings:set', mappings); }

  // Socket bindings
  socket.on('overlay:elements', list=>{ elements=list||[]; });
  socket.on('mappings', list=>{ mappings = Array.isArray(list)? list : []; renderMappings(); });

  // Export some helpers globally so the existing page code can call them
  window.__overlayHelpers = { select, render, renderMappings, pushMappings };

  // Initial fetch
  socket.emit('elements:get');
  socket.emit('mappings:get');
})();
