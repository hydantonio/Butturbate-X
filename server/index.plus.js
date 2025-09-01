
// server/index.plus.js — same server with robust body parsing and /app/quit
const path = require('path');
const express = require('express');
const http = require('http');
const app = express();
const srv = http.createServer(app);

app.use(express.json({limit:'2mb'}));
app.use(express.urlencoded({extended:true}));

// Static
const webRoot = path.resolve(__dirname, '..', 'web');
app.use('/', express.static(webRoot));
app.use('/css', express.static(path.join(webRoot,'css')));
app.use('/js', express.static(path.join(webRoot,'js')));
app.use('/img', express.static(path.join(webRoot,'img')));
app.use('/public', express.static(path.join(webRoot,'img')));

// Quit route for the UI "Quit" button
app.get('/app/quit', (req,res)=>{ res.end('bye'); process.exit(0); });

// Minimal io overlay state
let overlay = { glow:true, watermark:true, goalTarget:2000, goalValue:0 };
let elements = [];
const io = require('socket.io')(srv, { cors: { origin: "*" } });

io.on('connection', (socket)=>{
  socket.emit('init', { overlay });
  socket.on('elements:get', ()=>{
    socket.emit('overlay:elements', elements);
    socket.emit('overlay:settings', { showWatermark:overlay.watermark, glow:overlay.glow });
    socket.emit('overlay:goal', { target:overlay.goalTarget, current:overlay.goalValue });
  });
});

// Intiface connect log
app.post('/api/intiface/connect', (req,res)=>{
  console.log('[intiface] connect request headers:', req.headers);
  console.log('[intiface] connect request body:', req.body);
  res.json({ok:true, received:req.body});
});

const PORT = process.env.PORT || 3000;
srv.listen(PORT, ()=> console.log('[BCX+] http://localhost:'+PORT));
