
BCX Compatibility Inject
========================
1) Copia `web/js/inject.control.js` e includilo in `control.html` PRIMA di `</body>`:
   <script type="module" src="/js/inject.control.js"></script>

   Cosa fa:
   - trova automaticamente il campo URL e il bottone "Connect";
   - chiama `IntifaceClient.connect(url)` e invia POST JSON a `/api/intiface/connect` (così il server non vede {});
   - evita listener duplicati;
   - se manca il DnD nativo, abilita un trascinamento compatibile con la scala della canvas;
   - mette la colonna destra in cima allo stacking (z-index) così i click non sono mangiati da overlay.

2) (Opzionale) usa `server/index.plus.js` se vuoi body parsing robusto + rotta /app/quit.

Se continui a vedere `[intiface] connect request {}` nel log, significa che la tua pagina non sta includendo `Content-Type: application/json` o esegue una fetch diversa.
Con l'inject qui sopra il POST viene sempre inviato con JSON, indipendentemente dal tuo codice.
