
(function(){
  const S={mod:null,client:null,devices:[],connected:false,connecting:false,url:null,socket:null};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  async function load(){
    if(S.mod) return S.mod;
    try{
      S.mod = await import('/js/buttplug.min.mjs');
    }catch(e){
      console.warn('[intiface] local not found, falling back to CDN', e);
      S.mod = await import('https://cdn.jsdelivr.net/npm/buttplug@latest/dist/web/buttplug.min.mjs');
    }
    return S.mod;
  }
  function on(ev,cb){ try{ S.client.addListener?.(ev,cb);}catch(_){}
                      try{ S.client.on?.(ev,cb);}catch(_){}
                      try{ S.client.addEventListener?.(ev,cb);}catch(_){}};
  function list(){ try{ return S.client?.Devices || S.client?.devices || []; }catch(_){ return []; } }
  function updateBadge(){ const b=document.querySelector('[data-devices-count]')||document.getElementById('st'); const n=list().length;
    if(!b) return; if(b.id==='st') b.textContent=S.connected?`connected (${n} device${n===1?'':'s'})`:(S.connecting?'connecting…':'disconnected'); else b.textContent=String(n); }

  function defaultEndpoints(user){
    const L=[]; if(user) L.push(user.trim());
    const https = location.protocol==='https:';
    const ports=[12345,12346], hosts=['127.0.0.1','localhost'];
    for(const p of ports) for(const h of hosts){
      const ws=`ws://${h}:${p}`, wss=`wss://${h}:${p}`;
      if(https){ L.push(wss,ws); } else { L.push(ws,wss); }
    }
    return [...new Set(L)];
  }
  async function tryConnectTo(url){
    const M = await load();
    const BP   = M.ButtplugClient||M.default?.ButtplugClient||M.Client||M.default;
    const Conn = M.ButtplugBrowserWebsocketClientConnector||M.ButtplugBrowserWebsocketConnector||M.ButtplugBrowserWebsocketConnectorOptions;
    if(!BP||!Conn) throw new Error('Buttplug library incompatible');
    const c = new BP('Butturbate-X'); S.client=c; S.url=url;
    on('deviceadded',()=>{ S.devices=list(); updateBadge(); dispatchEvent(new CustomEvent('intiface:devices',{detail:S.devices})); });
    on('deviceremoved',()=>{ S.devices=list(); updateBadge(); dispatchEvent(new CustomEvent('intiface:devices',{detail:S.devices})); });
    on('disconnect',()=>{ S.connected=false; S.connecting=false; updateBadge(); });
    const conn = new Conn(url);
    if(c.connectWebsocket) await c.connectWebsocket(conn);
    else if(c.Connect)     await c.Connect(conn);
    else if(c.connect)     await c.connect(conn);
  }
  async function connect(userUrl){
    if(S.connected||S.connecting) return S.connected;
    S.connecting=true; updateBadge();
    const endpoints = defaultEndpoints(userUrl);
    let last=null;
    for(const url of endpoints){
      try{ await tryConnectTo(url); S.connected=true; S.connecting=false; updateBadge(); wireHapticsSocket(); return true; }
      catch(e){ last=e; await sleep(120); }
    }
    S.connecting=false; S.connected=false; updateBadge();
    throw new Error('Intiface non raggiungibile. Assicurati che il Websocket Server sia attivo (porta 12345).');
  }
  async function disconnect(){
    try{ await S.client?.Disconnect?.(); }catch(_){}
    try{ await S.client?.disconnect?.(); }catch(_){}
    S.connected=false; updateBadge();
  }

  // === Haptics player ===
  async function vibrateDevice(d, value, ms){
    try{
      if(d?.vibrate) await d.vibrate(value);
      else if(d?.Vibrate) await d.Vibrate(value);
      else if(d?.sendVibrateCmd) await d.sendVibrateCmd(value);
      else if(d?.SendVibrateCmd) await d.SendVibrateCmd(value);
    }catch(e){ /* ignore one-shot errors */ }
    if(ms>0){ await sleep(ms); }
  }
  async function stopDevice(d){
    try{
      if(d?.vibrate) await d.vibrate(0);
      else if(d?.Vibrate) await d.Vibrate(0);
      else if(d?.sendVibrateCmd) await d.sendVibrateCmd(0);
      else if(d?.SendVibrateCmd) await d.SendVibrateCmd(0);
    }catch(e){}
  }

  async function playPattern(spec){
    const devs = list(); if(!devs?.length) return;
    const type = spec?.type || 'steady';
    const duration = Math.max(50, Number(spec?.duration||800));
    const intensity = Math.max(0, Math.min(1, Number(spec?.intensity??0.6)));
    const now = Date.now();

    // Helper: run on all devices in parallel
    async function allDo(fn){ await Promise.all(devs.map(d=>fn(d))); }

    if(type==='steady'){
      await allDo(d=>vibrateDevice(d,intensity,duration));
      await allDo(stopDevice);
      return;
    }
    if(type==='pulse'){
      const hz = Math.max(0.5, Number(spec?.freq||2)); // pulses per second
      const duty = Math.max(0.05, Math.min(0.95, Number(spec?.duty||0.5)));
      const period = 1000/hz;
      const onMs = period*duty;
      const offMs = period - onMs;
      let t = 0;
      while(t < duration){
        const chunk = Math.min(onMs, duration - t);
        await allDo(d=>vibrateDevice(d,intensity,chunk));
        t += chunk;
        if(t>=duration) break;
        const gap = Math.min(offMs, duration - t);
        await allDo(stopDevice);
        await sleep(gap);
        t += gap;
      }
      await allDo(stopDevice);
      return;
    }
    if(type==='ramp'){
      const start = Math.max(0, Math.min(1, Number(spec?.start??0.1)));
      const end   = Math.max(0, Math.min(1, Number(spec?.end??1.0)));
      const steps = Math.max(4, Number(spec?.steps||24));
      const stepMs = duration/steps;
      for(let i=0;i<=steps;i++){
        const v = start + (end-start)*(i/steps);
        await allDo(d=>vibrateDevice(d,v,stepMs));
      }
      await allDo(stopDevice);
      return;
    }
    if(type==='pattern'){
      // pattern: array of [intensity(0-1), ms]
      let patt = spec?.pattern;
      try{ if(typeof patt==='string') patt = JSON.parse(patt); }catch(_){}
      if(!Array.isArray(patt) || !patt.length){ // fallback
        patt = [[intensity, duration]];
      }
      for(const [v,ms] of patt){
        const vi = Math.max(0, Math.min(1, Number(v||0)));
        const mi = Math.max(10, Number(ms||100));
        await allDo(d=>vibrateDevice(d,vi,mi));
      }
      await allDo(stopDevice);
      return;
    }
    // default
    await allDo(d=>vibrateDevice(d,intensity,duration));
    await allDo(stopDevice);
  }

  function wireHapticsSocket(){
    if(S.socket) return;
    const io = window.io || (()=>null);
    const sock = window.__io_socket || io();
    if(!sock) return;
    S.socket = sock;
    if(sock.__hapticsBound) return;
    sock.__hapticsBound = true;
    sock.on('haptics:trigger', async (payload)=>{
      try{ await playPattern(payload||{}); }catch(e){ console.warn('[haptics] pattern failed', e); }
    });
  }

  async function vibrateTest(sp=0.6,ms=900){
    if(!S.connected){ console.warn('[intiface] Not connected'); return; }
    await playPattern({type:'steady', intensity:sp, duration:ms});
  }

  window.IntifaceClient={connect,disconnect,vibrateTest,get devices(){return list();},get connected(){return S.connected;}};

  addEventListener('DOMContentLoaded',()=>{
    const btn=document.querySelector('[data-intiface-connect]')||document.getElementById('btnConn');
    const url=document.querySelector('[data-intiface-url]')||document.getElementById('ws');
    const test=document.querySelector('[data-vibrate-test]')||document.getElementById('vibrateTest');
    if(btn&&url){ btn.addEventListener('click',async()=>{ btn.disabled=true; try{ await connect((url.value||url.placeholder||'').trim()); }catch(e){ alert(e.message||String(e)); } finally{ btn.disabled=false; } }); }
    if(test){ test.addEventListener('click',async()=>{ test.disabled=true; try{ await vibrateTest(0.6,800);} finally{ test.disabled=false; } }); }
    updateBadge();
  });
})();
