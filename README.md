# Formazione Pro Club

Web app per schierare la formazione della modalità Club di EA FC 27. Pensata per il telefono e installabile come app (PWA). Nessun database: i dati restano nel browser (localStorage).

## Funzioni
- 29 moduli Club di FC 27; cambiando modulo nomi e numeri restano
- Cognome e numero per ogni giocatore (tocca la maglia o usa l'elenco), capitano
- Giocatori trascinabili, con "Ripristina posizione"
- Maglie personalizzabili (8 stili, 3 colori), portiere separato
- Panchina, scambio titolare/riserva
- Template con nome: salva, carica, sovrascrivi, elimina
- Condivisione della formazione come immagine
- Backup e ripristino dei template in JSON

## Sviluppo
```bash
npm install
npm run dev
```

Il deploy su GitHub Pages parte da solo a ogni push su `main` (`.github/workflows/deploy.yml`).

Progetto non ufficiale, senza loghi né asset EA.
