
export function initChaturbateBridge(){
  try{
    const es = new EventSource('/sse/chaturbate');
    es.onmessage = (ev)=>{
      try{
        const d = JSON.parse(ev.data);
        if(d.type==='tip'){
          // Add tokens to all goalbars
          window.postMessage({ type:'overlay:goalAll', add: Number(d.tokens||0) }, '*');
          // Also send directly to iframe if available
          const frame = document.getElementById('v-iframe');
          if (frame && frame.contentWindow) frame.contentWindow.postMessage({ type:'overlay:goalAll', add: Number(d.tokens||0) }, '*');
        }
      }catch(e){}
    };
  }catch(e){ console.warn('SSE error', e); }
}
