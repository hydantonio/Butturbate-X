
const path=require('path'); const fs=require('fs'); const express=require('express'); const http=require('http');
let cors; try{ cors=require('cors'); }catch(_){ cors=()=> (req,res,next)=>next(); }
const app=express(); app.disable('x-powered-by'); app.use(cors()); app.use(express.json({limit:'2mb'})); app.use(express.urlencoded({extended:true}));
const webRoot=path.resolve(__dirname,'..','web'); if(!fs.existsSync(webRoot)){ console.error('web/ missing:',webRoot); process.exit(1); }
app.use('/', express.static(webRoot)); app.use('/css',express.static(path.join(webRoot,'css'))); app.use('/js',express.static(path.join(webRoot,'js'))); app.use('/img',express.static(path.join(webRoot,'img'))); app.use('/public',express.static(path.join(webRoot,'img')));
app.get('/app/quit',(req,res)=>{ res.end('bye'); process.exit(0); });

const srv=http.createServer(app); const io=require('socket.io')(srv,{cors:{origin:"*"}});

let overlay={glow:true,watermark:true,goalTarget:2000,goalValue:0};
let elements=[];
let mappings=[]; // [{min,max,type, ...params}]

io.on('connection',s=>{
  s.emit('init',{overlay});
  s.on('elements:get',()=>{
    s.emit('overlay:elements',elements);
    s.emit('overlay:settings',{showWatermark:overlay.watermark,glow:overlay.glow});
    s.emit('overlay:goal',{target:overlay.goalTarget,current:overlay.goalValue});
  });
  s.on('element:add', el=>{ if(!el.id) el.id=String(Date.now()); elements.push(el); io.emit('overlay:elements',elements); });
  s.on('element:update', el=>{ const i=elements.findIndex(x=>x.id===el.id); if(i>=0){ elements[i]={...elements[i],...el}; io.emit('overlay:elements',elements); } });
  s.on('settings:update', s2=>{ overlay.watermark=!!s2.showWatermark; overlay.glow=!!s2.glow; io.emit('overlay:update',{watermark:overlay.watermark,glow:overlay.glow}); });
  s.on('goal:set', t=>{ overlay.goalTarget=Number(t)||0; io.emit('overlay:goal',{target:overlay.goalTarget,current:overlay.goalValue}); });

  // Mappings
  s.on('mappings:get', ()=>{ s.emit('mappings', mappings); });
  s.on('mappings:set', list=>{
    // sanitize
    mappings = Array.isArray(list)? list.map(n=>{
      const type = (n.type||'steady').toLowerCase();
      const out={
        min:+n.min||0, max:+n.max||0, type,
        intensity: +n.intensity||0, duration:+n.duration||800,
        freq: +n.freq||2, duty: +n.duty||0.5,
        start: +n.start||0.1, end:+n.end||1.0, steps: +n.steps||24,
      };
      if(n.pattern) out.pattern = n.pattern;
      return out;
    }) : [];
    io.emit('mappings', mappings);
  });

  // Tips → goal + optional haptics via mapping
  s.on('tip', ({amount})=>{
    const amt = Number(amount||0);
    overlay.goalValue = Math.max(0, (overlay.goalValue||0) + amt);
    io.emit('overlay:goal',{target:overlay.goalTarget,current:overlay.goalValue});

    const m = mappings.find(r => amt >= r.min && amt <= r.max);
    if(m){
      const payload = {...m};
      // For backward compatibility: if type steady but intensity given in 0-100, normalize
      if(payload.type==='steady' && payload.intensity>1) payload.intensity = Math.min(1, Math.max(0, payload.intensity/100));
      io.emit('haptics:trigger', payload);
      console.log('[mapping] tip', amt, '→', payload);
    }
  });

  s.on('overlay:goal-reached', ()=>{ overlay.goalValue=overlay.goalTarget; io.emit('overlay:goal',{target:overlay.goalTarget,current:overlay.goalValue}); });
});

app.post('/api/intiface/connect',(req,res)=>{ console.log('[intiface] connect request', req.body); res.json({ok:true,received:req.body}); });

const PORT=Number(process.env.PORT||3000);
function listen(p){ srv.listen(p,()=>console.log(`[Butturbate-X] http://localhost:${p}`)).on('error',e=>{ if(e.code==='EADDRINUSE') listen(p+1); else console.error(e); }); }
listen(PORT);
