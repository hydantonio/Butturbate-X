// web/js/scenes.js (fixed)
import { saveToServer, loadFromServer, downloadJSON, uploadJSON } from "./storage.js";

let scenes = [];

export async function initScenes(){
  scenes = await loadFromServer('presets', []);
  render();
  const addBtn = document.getElementById('scene-add');
  const saveBtn = document.getElementById('scene-save');
  const expBtn  = document.getElementById('scene-export');
  const impBtn  = document.getElementById('scene-import');
  addBtn && (addBtn.onclick = add);
  saveBtn && (saveBtn.onclick = save);
  expBtn && (expBtn.onclick = () => downloadJSON('presets.json', scenes));
  impBtn && (impBtn.onclick = async () => { try { const data = await uploadJSON(); if(Array.isArray(data)) { scenes = data; render(); } } catch(e){ alert('Invalid JSON'); } });
}

function add(){
  scenes.push({ name: "New Scene", layout: null });
  render();
}

async function save(){
  await saveToServer('presets', scenes);
}

function sceneRow(scene, idx){
  const wrap = document.createElement('div');
  wrap.className = 'row';
  const nameInput = document.createElement('input');
  nameInput.className = 'input';
  nameInput.style.flex = '1';
  nameInput.value = scene.name || 'Scene';
  nameInput.oninput = () => { scene.name = nameInput.value; document.getElementById('scene-select').options[idx].textContent = scene.name; };

  const useBtn = document.createElement('button');
  useBtn.className = 'btn';
  useBtn.textContent = 'Use';
  useBtn.onclick = () => { document.getElementById('scene-select').value = String(idx); };

  wrap.appendChild(nameInput);
  wrap.appendChild(useBtn);
  return wrap;
}

function render(){
  const sel = document.getElementById('scene-select');
  const list = document.getElementById('scene-list');
  if (!sel || !list) return;
  sel.innerHTML = "";
  list.innerHTML = "";
  scenes.forEach((s, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = s.name || ('Scene ' + (i+1));
    sel.appendChild(opt);
    list.appendChild(sceneRow(s, i));
  });
}

export function setCurrentLayout(layout){
  const idx = +document.getElementById('scene-select').value || 0;
  if (scenes[idx]) scenes[idx].layout = layout;
}

export function getCurrentLayout(){
  const idx = +document.getElementById('scene-select').value || 0;
  return scenes[idx] ? scenes[idx].layout : null;
}
