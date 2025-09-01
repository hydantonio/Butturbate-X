
// server/index.js
const path = require('path'); const fs = require('fs');
const express = require('express'); const http = require('http');
let cors; try{ cors=require('cors'); }catch(_){ cors=()=> (req,res,next)=>next(); }

const app = express(); app.disable('x-powered-by'); app.use(cors());
app.use(express.json({limit:'2mb'})); app.use(express.urlencoded({extended:true}));
const webRoot = path.resolve(__dirname,'..','web'); if(!fs.existsSync(webRoot)){ console.error('web/ mancante:',webRoot); process.exit(1); }

app.use('/', express.static(webRoot)); app.use('/css', express.static(path.join(webRoot,'css')));
app.use('/js', express.static(path.join(webRoot,'js'))); app.use('/img', express.static(path.join(webRoot,'img')));
app.use('/public', express.static(path.join(webRoot,'img'))); // per vecchi path
app.get('/app/quit', (req,res)=>{ res.end('bye'); process.exit(0); });

// Socket.IO overlay state (minimo)
const srv = http.createServer(app);
const io = require('socket.io')(srv, { cors: { origin: "*" } });
let overlay={ glow:true, watermark:true, goalTarget:2000, goalValue:0 }, elements=[];
io.on('connection', s=>{ s.emit('init',{overlay}); s.on('elements:get',()=>{ s.emit('overlay:elements',elements); s.emit('overlay:settings',{showWatermark:overlay.watermark,glow:overlay.glow}); s.emit('overlay:goal',{target:overlay.goalTarget,current:overlay.goalValue}); }); });

// Intiface POST (log body)
app.post('/api/intiface/connect', (req,res)=>{ console.log('[intiface] connect request', req.body); res.json({ok:true, received:req.body}); });

const basePort = Number(process.env.PORT||3000);
function listen(p){ srv.listen(p, ()=> console.log(`[ButtCaster] server up on http://localhost:${p}\nApri /control.html oppure /overlay.html`)).on('error', e=>{ if(e.code==='EADDRINUSE') listen(p+1); else console.error(e); }); }
listen(basePort);
