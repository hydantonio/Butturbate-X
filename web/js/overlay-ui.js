
// web/js/overlay-ui.js
export function initOverlayUI() {
  const api = window.BuilderAPI; if(!api) return;
  const canvas = document.querySelector(api.options.canvas);
  const listEl = document.getElementById("el-list");
  const form = document.getElementById("prop-form");
  const inputs = {
    left:  form.querySelector("[name='left']"),
    top:   form.querySelector("[name='top']"),
    width: form.querySelector("[name='width']"),
    height:form.querySelector("[name='height']"),
    z:     form.querySelector("[name='z']"),
    rotate:form.querySelector("[name='rotate']"),
    opacity:form.querySelector("[name='opacity']"),
  };
  function refresh(){ listEl.innerHTML=""; [...canvas.querySelectorAll(".element")].forEach(el=>{ const b=document.createElement('button'); b.className='el-item'; b.textContent=el.id||'(no id)'; b.onclick=()=>select(el); listEl.appendChild(b); }); }
  function select(el){ inputs.left.value=el.offsetLeft; inputs.top.value=el.offsetTop; inputs.width.value=el.offsetWidth; inputs.height.value=el.offsetHeight;
    inputs.z.value=+el.style.zIndex||0; inputs.rotate.value=+el.dataset.rotate||0; inputs.opacity.value=Number(el.style.opacity||"1");
  }
  form.addEventListener('input',()=>{ const el=api.getSelected?.(); if(!el) return;
    const L=+inputs.left.value||0, T=+inputs.top.value||0, W=+inputs.width.value||el.offsetWidth, H=+inputs.height.value||el.offsetHeight;
    const Z=+inputs.z.value||0, R=+inputs.rotate.value||0, O=Math.min(1,Math.max(0,parseFloat(inputs.opacity.value)||1));
    el.style.width=W+'px'; el.style.height=H+'px'; el.style.zIndex=Z; el.dataset.rotate=String(R); el.style.transform=`rotate(${R}deg)`; el.style.opacity=String(O);
  });
  document.getElementById('btn-dup').onclick = ()=>{ const el=api.getSelected?.(); if(el) api.duplicate(el); refresh(); };
  document.getElementById('btn-del').onclick = ()=>{ const el=api.getSelected?.(); if(el) api.remove(el); refresh(); };
  document.getElementById('btn-grid').onclick= ()=> api.toggleGrid?.();
  document.getElementById('btn-undo').onclick= ()=> api.undo();
  document.getElementById('btn-redo').onclick= ()=> api.redo();
  window.addEventListener('builder:select', e=> select(e.detail.el));
  refresh(); setInterval(refresh, 1500);
}
