
(function(){
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const $=(s,r=document)=>r.querySelector(s);

  let CURRENT_TAB = window.__currentTab || null;
  function show(tab){
    const views={
      overlay: $('#view-overlay'),
      mappings: $('#view-mappings'),
      devices:  $('#view-devices'),
      settings: $('#view-settings'),
    };
    Object.entries(views).forEach(([k,el])=> el && (el.hidden = (k !== tab)));
    $$('.navbtn').forEach(b=> b.classList.toggle('active', b.dataset.section===tab));
    CURRENT_TAB = tab; window.__currentTab = tab;
  }

  function wireNav(initial=false){
    const btns = $$('.navbtn');
    btns.forEach(btn=>{
      if(btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', (ev)=>{
        ev.stopPropagation(); ev.preventDefault();
        const tab = btn.dataset.section;
        if(tab) show(tab);
      }, true);
    });
    if(initial){
      const active = btns.find(b => b.classList.contains('active'));
      const def = window.__currentTab || (active ? active.dataset.section : 'overlay');
      show(def || 'overlay');
    }
  }

  function applyBounds(){
    const stage = $('.stage') || $('.stage-wrap');
    const cv = $('.canvas-abs');
    if(stage && cv){
      const r = stage.getBoundingClientRect();
      const sc = r.width / 1920;
      cv.style.width='1920px';
      cv.style.height='1080px';
      cv.style.transformOrigin='0 0';
      cv.style.transform=`scale(${sc})`;
      // Allow drop and element interactions
      cv.style.pointerEvents='auto';
    }
    // Non-interactive layers should not eat clicks
    $$('.grid,.glow').forEach(el=> el.style.pointerEvents='none');
    $$('.element').forEach(el=> el.style.pointerEvents='auto');
    const right=$('.right'); if(right){ right.style.pointerEvents='auto'; right.style.zIndex='9999'; }
    const left=$('.sidebar'); if(left){ left.style.pointerEvents='auto'; left.style.zIndex='9999'; }
  }

  window.addEventListener('resize', applyBounds);
  document.addEventListener('DOMContentLoaded', ()=>{
    applyBounds();
    wireNav(true);
  });
  new MutationObserver(()=>{
    applyBounds();
    wireNav(false);
  }).observe(document.body, {childList:true, subtree:true});

  // Enforce JSON header for Intiface connect only
  const _fetch = window.fetch;
  window.fetch = function(input, init){
    try {
      const url = (typeof input === 'string') ? input : (input?.url || '');
      if(url.includes('/api/intiface/connect')){
        init = init || {};
        init.headers = Object.assign({'Content-Type':'application/json'}, init.headers || {});
        if(init.body && typeof init.body !== 'string'){
          init.body = JSON.stringify(init.body);
        }
      }
    } catch(_) {}
    return _fetch.call(this, input, init);
  };

  // Ensure IntifaceClient is present
  async function ensureIntiface(){
    if(window.IntifaceClient?.connect) return;
    try { await import('/js/intiface.js'); } catch(e){ console.warn('[click-force] Cannot load /js/intiface.js', e); }
  }
  document.addEventListener('DOMContentLoaded', ensureIntiface);
})();
