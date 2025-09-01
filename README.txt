
BCX Click Fix
=============
1) Copia i file in:
   - web/css/click-fix.css
   - web/js/click-fix.js
2) Includi in control.html (e in overlay.html se serve l'anteprima) PRIMA di chiudere </head> e </body>:

   <link rel="stylesheet" href="/css/click-fix.css">
   ...
   <script src="/js/click-fix.js"></script>

Cosa risolve:
- La canvas (.canvas-abs) non invade più la colonna di destra: è vincolata a 1920x1080 e scalata alla larghezza della .stage.
- Gli strati non interattivi (.grid, .glow, .canvas-abs) non intercettano più i click.
- Solo gli elementi (.element) restano drag/click.
- La colonna destra ha z-index alto e riceve i click normalmente.
