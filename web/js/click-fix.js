
/* click-fix.js — runtime guard to enforce proper bounds/scale and pointer-events */
(function(){
  function stage() { return document.querySelector('.stage') || document.querySelector('.stage-wrap'); }
  function canvas() { return document.querySelector('.canvas-abs'); }

  function applyBounds(){
    const st = stage();
    const cv = canvas();
    if(!st || !cv) return;
    const rect = st.getBoundingClientRect();
    const scale = rect.width / 1920;
    // Lock canvas to 1920x1080 and scale to stage width
    cv.style.width = '1920px';
    cv.style.height = '1080px';
    cv.style.transformOrigin = '0 0';
    cv.style.transform = `scale(${scale})`;

    // Non-interactive layers must not eat clicks
    const layers = document.querySelectorAll('.grid, .glow, .canvas-abs');
    layers.forEach(el => { el.style.pointerEvents = 'none'; });

    // Elements remain interactive
    document.querySelectorAll('.element').forEach(el => {
      el.style.pointerEvents = 'auto';
    });

    // Right column above everything
    const right = document.querySelector('.right');
    if(right){
      right.style.position = 'relative';
      right.style.zIndex = '20';
      right.style.pointerEvents = 'auto';
    }
  }

  window.addEventListener('resize', applyBounds);
  document.addEventListener('DOMContentLoaded', applyBounds);
  // Re-apply if the UI re-renders
  new MutationObserver(applyBounds).observe(document.documentElement, {childList:true, subtree:true});
})();
