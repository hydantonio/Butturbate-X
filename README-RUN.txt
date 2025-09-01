
ButtCaster Web UI — Debug Pack
==============================

Questo pacchetto ti evita che la finestra si chiuda subito e cattura l'errore nei log.

Contenuto:
- server/index.js    → server Express+Socket.IO con gestione errori e fallback porta
- run_debug.bat      → avvio con log in tempo reale (non si chiude mai)
- run_min.bat        → avvio "semplice" in console separata + apre il browser
- package.json       → comandi npm e dipendenze
- logs/              → cartella log (creata al primo avvio)

Istruzioni:
1) `npm i` (installa express, socket.io, cors)
2) Avvia *run_debug.bat* (consigliato): la console resta aperta, e scrive anche in logs/server.log.
3) Apri http://localhost:3000/control.html (se la porta è occupata, il server passa automaticamente a 3001, 3002, ...)

Se la pagina si chiude ancora:
- guarda lo stdout della console: tutti gli errori vengono stampati;
- controlla `logs/server.log` (ultima parte è anche dumpata in console a fine processo);
- verifica che la cartella `web/` sia accanto alla cartella `server/` (il server la cerca in ../web).
