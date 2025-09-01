
/* web/js/intiface.js */
(function(){
  const state = { mod:null, client:null, devices:[], connected:false, url:null };
  const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));

  async function loadModule(){
    if(state.mod) return state.mod;
    try { state.mod = await import('/js/buttplug.min.mjs'); return state.mod; }
    catch(e){ console.warn('[intiface] local not found, fallback CDN', e); state.mod = await import('https://cdn.jsdelivr.net/npm/buttplug@latest/dist/web/buttplug.min.mjs'); return state.mod; }
  }
  function on(ev, cb){ try{ state.client.addListener?.(ev,cb);}catch(_){} try{ state.client.on?.(ev,cb);}catch(_){} try{ state.client.addEventListener?.(ev,cb);}catch(_){} }
  function devList(){ return state.client?.Devices || state.client?.devices || []; }

  async function safeVibrate(device, speed=0.5, ms=1000){
    try{
      if(device?.vibrate) await device.vibrate(speed).then(()=>sleep(ms)).then(()=>device.vibrate(0));
      else if(device?.Vibrate) await device.Vibrate(speed).then(()=>sleep(ms)).then(()=>device.Vibrate(0));
      else if(device?.sendVibrateCmd) await device.sendVibrateCmd(speed).then(()=>sleep(ms)).then(()=>device.sendVibrateCmd(0));
      else if(device?.SendVibrateCmd) await device.SendVibrateCmd(speed).then(()=>sleep(ms)).then(()=>device.SendVibrateCmd(0));
    }catch(e){ console.warn('vibrate failed', e); }
  }

  async function connect(url='ws://127.0.0.1:12345'){
    const mod = await loadModule();
    const BPClient = mod.ButtplugClient || mod.default?.ButtplugClient || mod.Client || mod.default;
    const BrowserConnector =
      mod.ButtplugBrowserWebsocketClientConnector ||
      mod.ButtplugBrowserWebsocketConnector ||
      mod.ButtplugBrowserWebsocketConnectorOptions;

    if(!BPClient || !BrowserConnector) throw new Error('Buttplug module incompatible');

    const client = new BPClient('ButtCaster');
    state.client = client; state.url = url;

    on('deviceadded', ()=>{ state.devices = devList(); updateBadge(); });
    on('deviceremoved', ()=>{ state.devices = devList(); updateBadge(); });
    on('disconnect', ()=>{ state.connected=false; updateBadge(); });

    // Connect (handle different versions)
    const conn = new BrowserConnector(url);
    if(client.connectWebsocket) await client.connectWebsocket(conn);
    else if(client.Connect) await client.Connect(conn);
    else if(client.connect) await client.connect(conn);

    state.connected = true;
    state.devices = devList();
    updateBadge();
    try{ fetch('/api/intiface/connect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})}); }catch(_){}
    return true;
  }

  async function disconnect(){ try{ await state.client?.Disconnect?.(); }catch(_){ } try{ await state.client?.disconnect?.(); }catch(_){ } state.connected=false; state.devices=[]; updateBadge(); }
  async function vibrateTest(speed=0.6, ms=900){ const list = devList(); if(!list?.length) throw new Error('No devices'); for(const d of list){ await safeVibrate(d, speed, ms);} }

  function updateBadge(){ const el = document.querySelector('[data-devices-count]'); if(el){ const n = state.devices?.length||0; el.textContent = String(n); el.title = state.connected ? `${n} device(s)` : 'disconnected'; } }

  window.IntifaceClient = { connect, disconnect, vibrateTest, get devices(){ return devList(); }, get connected(){ return state.connected; } };
})();