import { listDevices } from './js/intiface.js';
export function initDevicesBadge(){
  let el = document.getElementById('devices-badge');
  if(!el){
    el = document.createElement('div');
    el.id = 'devices-badge';
    el.style.cssText = 'position:fixed;top:14px;right:14px;z-index:9999;background:#fff;border:1px solid #e6e9f2;border-radius:999px;padding:6px 10px;box-shadow:0 8px 26px rgba(60,80,130,.08);font-weight:800;color:#0a0d14;';
    const dot = document.createElement('span');
    dot.id='devices-dot';
    dot.style.cssText='display:inline-block;width:8px;height:8px;border-radius:50%;background:#36c275;margin-right:8px;vertical-align:middle;';
    el.appendChild(dot);
    const txt = document.createElement('span');
    txt.id='devices-count';
    el.appendChild(txt);
    document.body.appendChild(el);
  }
  const dot = el.querySelector('#devices-dot');
  const txt = el.querySelector('#devices-count');
  function render(){
    const n = (listDevices()||[]).length;
    txt.textContent = `${n} device${n===1?'':'s'}`;
    dot.style.background = n>0 ? '#36c275' : '#c7cbd6';
  }
  window.addEventListener('intiface:devices', render);
  setInterval(render, 2000);
  render();
}
