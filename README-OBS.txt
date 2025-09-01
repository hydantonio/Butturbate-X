ButtCaster Studio + OBS preview
--------------------------------
- app.html: Studio con anteprima OBS via obs-websocket 5.x.
  * Compila ws://host:4455 e password (se configurata in OBS → Tools → WebSocket Server Settings).
  * "Usa come sfondo" mostra screenshot della scena corrente dietro al canvas.
  * FPS consigliato: 1–3 (request GetSourceScreenshot).

- overlay_editor.html: resta invariato (usa quello già installato).

Note:
- L'overlay di produzione per OBS è sempre /web/overlay.html (viewer muto).
- Questo pacchetto aggiunge solo il preview OBS nello Studio.
