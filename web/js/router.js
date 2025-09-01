
export function initRouter(){
  const items = document.querySelectorAll('.nav .item');
  const views = Array.from(document.querySelectorAll('[data-view]'));
  function allHide(){ views.forEach(v => v.hidden = true); }
  function show(id){
    allHide();
    const view = document.getElementById(id) || document.querySelector(`[id="${id}"]`);
    if (view) view.hidden = false;
    items.forEach(i => i.classList.toggle('active', i.dataset.nav === id));
    if (location.hash.slice(1) !== id) location.hash = id;
    window.dispatchEvent(new CustomEvent('route:change', { detail:{ id } }));
  }
  items.forEach(i => i.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); show(i.dataset.nav); }));
  window.addEventListener('hashchange', ()=> show(location.hash.slice(1) || 'view-home'));
  allHide();
  show(location.hash.slice(1) || 'view-home');
  return { show };
}
