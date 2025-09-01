
import { run as runMapping } from "./mappings.js";

let es = null;
export function initChaturbateUI(){
  const frm = document.getElementById('cb-form');
  const enable = document.getElementById('cb-enabled');
  const user = document.getElementById('cb-username');
  const token = document.getElementById('cb-token');
  const saveBtn = document.getElementById('cb-save');
  const startBtn = document.getElementById('cb-start');
  const stopBtn = document.getElementById('cb-stop');
  const testBtn = document.getElementById('cb-test');
  const log = document.getElementById('cb-log');

  function logLine(txt){ const p=document.createElement('div'); p.textContent=txt; log.prepend(p); }

  async function load(){
    try{
      const r = await fetch('/api/chaturbate/config'); const j = await r.json();
      enable.checked = !!j.enabled; user.value = j.username||''; token.value='';
    }catch(e){}
  }
  saveBtn.onclick = async ()=>{
    const body = { enabled: enable.checked, username: user.value, token: token.value || undefined };
    await fetch('/api/chaturbate/config', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    token.value='';
    logLine('Saved configuration.');
    connect();
  };
  startBtn.onclick = async ()=>{ enable.checked = true; saveBtn.click(); };
  stopBtn.onclick  = async ()=>{ enable.checked = false; saveBtn.click(); };
  testBtn.onclick  = async ()=>{ const amt = +(prompt('Tokens to simulate:', '10')||'10'); await fetch('/api/chaturbate/test-tip', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({tokens: amt})}); };

  function connect(){
    if(es) es.close();
    es = new EventSource('/sse/chaturbate');
    es.onmessage = (ev)=>{
      try{
        const data = JSON.parse(ev.data);
        if(data.type==='tip'){
          logLine(`Tip: ${data.user} -> ${data.tokens}`);
          // Map tokens to a rule and execute
          const rule = window.ChartsMappingsMatch ? window.ChartsMappingsMatch(data.tokens) : null;
          // If no global hook, call mapping.run directly with a pseudo rule (use intensity scaled by tokens)
          if (!rule) {
            const dyn = { pattern:'pulse', intensity: Math.min(1, (data.tokens||1)/50), duration: 1200 };
            runMapping(dyn);
          }
        }
      }catch(e){ console.warn('SSE parse', e); }
    };
    es.onerror = ()=>{ /* auto-retry by SSE */ };
  }

  // Expose helper so app can use match() externally if needed
  window.ChartsMappingsMatch = null;
  load(); connect();
}
