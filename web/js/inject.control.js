
/* web/js/inject.control.js */
(function(){
  const qs=(s,root=document)=>root.querySelector(s);
  const qsa=(s,root=document)=>Array.from(root.querySelectorAll(s));

  function findUrlInput(){
    return qs('[data-intiface-url]')||qs('#intifaceUrl')||qsa('input').find(i=>/ws(s)?:\/\//i.test(i.value||i.placeholder||''));
  }
  function findConnectBtn(){ return qs('[data-intiface-connect]')||qs('#intifaceConnect')||qsa('button,.btn').find(b=>/connect/i.test(b.textContent||'')); }
  function findVibrateBtn(){ return qs('[data-vibrate-test]')||qs('#vibrateTest')||qsa('button,.btn').find(b=>/vibrate/i.test(b.textContent||'')); }

  async function tryConnect(){
    const input = findUrlInput();
    const url = (input?.value || input?.placeholder || 'ws://127.0.0.1:12345').trim();
    if(!window.IntifaceClient?.connect){
      try{ await import('/js/intiface.js'); }catch(e){ console.error('[inject] Impossibile caricare intiface.js', e); }
    }
    try{ await window.IntifaceClient.connect(url); }catch(e){ console.error('[inject] connect failed', e); }
    try{ await fetch('/api/intiface/connect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})}); }catch(_){}
  }

  function bind(){
    const c=findConnectBtn(); if(c && !c.dataset.bound){ c.dataset.bound='1'; c.addEventListener('click', (ev)=>{ev.preventDefault(); tryConnect();}); }
    const v=findVibrateBtn(); if(v && !v.dataset.bound){ v.dataset.bound='1'; v.addEventListener('click', async (ev)=>{ev.preventDefault(); try{ await window.IntifaceClient?.vibrateTest?.(0.6,800);}catch(e){ console.warn('vibrateTest failed',e);} }); }
  }
  bind();
  new MutationObserver(()=>bind()).observe(document.body,{childList:true,subtree:true});
})();