
const { app, Tray, Menu, shell, nativeImage } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
let tray = null;
let server = null;
const URL = 'http://localhost:3000/web/app.html';
const iconPath = path.join(__dirname, '..', 'public', 'logo-buttcaster.svg');
if (!app.requestSingleInstanceLock()) { app.quit(); } else { app.on('second-instance', () => shell.openExternal(URL)); }
function startServer(){ if(server) return; const node=process.execPath; const script=path.join(__dirname,'..','server','index.js'); server=spawn(node,[script],{stdio:'ignore'}); server.on('exit',()=>{server=null}); }
function stopServer(){ try{ if(server) server.kill(); }catch{} server=null; }
app.whenReady().then(()=>{ startServer(); const nimg=nativeImage.createFromPath(iconPath); tray=new Tray(nimg.isEmpty()?undefined:nimg); const ctx=Menu.buildFromTemplate([ {label:'Open Studio', click:()=>shell.openExternal(URL)}, {type:'separator'}, {label:'Restart Server', click:()=>{ stopServer(); setTimeout(startServer,300); }}, {label:'Quit', click:()=>{ stopServer(); app.quit(); }} ]); tray.setToolTip('ButtCaster Studio'); tray.setContextMenu(ctx); });
app.on('window-all-closed',(e)=>{ e.preventDefault(); });
