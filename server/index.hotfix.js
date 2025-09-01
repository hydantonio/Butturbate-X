
// server/index.hotfix.js — optional: robust body parsing & logging for /api/intiface/connect
const express = require('express');
const app = express();
app.use(express.json({limit:'1mb'}));
app.use(express.urlencoded({extended:true}));

app.post('/api/intiface/connect', (req,res)=>{
  console.log('[intiface] connect request headers:', req.headers);
  console.log('[intiface] connect request body:', req.body);
  res.json({ok:true, received:req.body});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Hotfix server on http://localhost:'+PORT));
