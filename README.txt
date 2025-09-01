
Butturbate-X — Mappings Pulse + Drag Ease
========================================
Questa patch aggiunge:
- MAPPINGS avanzati con pattern: **steady**, **pulse** (freq/duty), **ramp** (start→end), **pattern** (array JSON [value,ms]).
- Il client Intiface suona i pattern (multi-device) e ferma in sicurezza.
- Drag&drop/drag-move dell'overlay più fluido: offset del puntatore, snap alla griglia (se attiva), scale-correct.

File da sostituire nella tua repo:
- web/js/intiface.js
- server/index.js
- Incolla `control.patch.js` nel tuo `control.html` (dopo che hai definito lo `socket` e la canvas).
  Oppure includi come script a fondo pagina:
    <script src="/js/control.patch.js"></script>

Uso rapido:
- In "Mappings" crea una riga → scegli il tipo (steady/pulse/ramp/pattern) → compila i parametri.
- Premi "Tip test 50" / "Emit Tip 100" per verificare: vedrai vibrazioni corrispondenti e goal aggiornarsi.
- Per drag facile: attiva la griglia (20 px di default). Il movimento è con offset corretto e non “scivola”.

Nota: la goal bar va aggiunta con "Add Tip Goal" e si sposta **da Control** (non dall'overlay in OBS).
