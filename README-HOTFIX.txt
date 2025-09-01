BCX Control Hotfix
------------------
1) Sostituisci in /web/ il tuo control.html con web/control.hotfix.html (o rinomina il file in control.html).
   - Aggiunge il Content-Type: application/json al POST /api/intiface/connect
   - Usa getScale() dinamico per il drag/resize (niente più 0.5 fisso)
   - Sposta il pannello "Properties" nella colonna di destra sopra "Layers"
2) (Opzionale) Avvia server/index.hotfix.js se vuoi verificare cosa riceve /api/intiface/connect:
   node server/index.hotfix.js
   e poi premi "Connect" nella UI per vedere l'header/body in console.
