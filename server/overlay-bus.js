
// server/overlay-bus.js
// Router Express per layout storage e broadcast SSE verso l'overlay viewer
const express = require('express');
const router = express.Router();

let lastLayout = [];
let gridOn = false;
const clients = new Set();

router.get('/sse/overlay', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');
  clients.add(res);
  // opzionale: invia stato iniziale
  res.write(`data: ${JSON.stringify({type:'layout', layout:lastLayout})}\n\n`);
  res.write(`data: ${JSON.stringify({type:'grid', on:gridOn})}\n\n`);
  req.on('close', () => clients.delete(res));
});

function broadcast(obj){
  const payload = `data: ${JSON.stringify(obj)}\n\n`;
  for(const res of clients){ try{ res.write(payload); }catch(_){} }
}

// Layout storage
router.get('/api/layout', (req,res)=> res.json(lastLayout));
router.post('/api/layout', express.json({limit:'2mb'}), (req,res)=>{
  lastLayout = Array.isArray(req.body) ? req.body : [];
  res.json({ok:true, count:lastLayout.length});
});

// Push verso OBS (SSE)
router.post('/api/overlay/push', express.json({limit:'2mb'}), (req,res)=>{
  const msg = req.body || {};
  if(msg.type==='layout' && Array.isArray(msg.layout)){ lastLayout = msg.layout; }
  if(msg.type==='grid' && typeof msg.on==='boolean'){ gridOn = msg.on; }
  broadcast(msg);
  res.json({ok:true});
});

module.exports = router;
