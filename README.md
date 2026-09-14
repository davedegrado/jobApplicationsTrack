# Candidature

Tracker personale delle candidature di lavoro: stato di ogni processo, link all'annuncio e allegati (CV, lettere di presentazione, copia dell'annuncio).

Costruito con **React + Vite**. Non c'è backend: dati e file vivono nel browser tramite **IndexedDB**, quindi puoi pubblicarlo su GitHub Pages senza server né database, e nulla esce dal tuo dispositivo.

## Cosa fa

- Elenco delle candidature con stato: da inviare, inviata, colloquio, offerta, rifiutata, ritirata.
- Link all'annuncio apribile con un clic dalla riga.
- Allegati per candidatura (CV, lettera, altro): si trascinano nel pannello e si riscaricano quando servono.
- Campi utili: luogo, modalità di lavoro, canale, RAL, referente, note, data della candidatura.
- Promemoria "prossima azione": le candidature con una data scaduta vengono marcate come da seguire.
- Ricerca testuale, filtri per stato, ordinamenti, e riepilogo con avanzamento per stato.
- Backup: esporta tutto (allegati inclusi) in un file JSON e reimportalo su un altro browser o dispositivo.

## Avvio in locale

```bash
npm install
npm run dev
```

L'app parte su http://localhost:5173.

Per generare la versione statica:

```bash
npm run build
npm run preview
```

## Pubblicazione su GitHub Pages

1. Crea un repository su GitHub e carica questo progetto.
2. Su GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Fai push sul branch `main`: il workflow in `.github/workflows/deploy.yml` compila e pubblica da solo.

Il sito sarà su `https://<tuo-utente>.github.io/<nome-repo>/`. La `base` di Vite è impostata su `./`, quindi funziona in qualsiasi sottocartella.

## Dove finiscono i dati

Tutto in IndexedDB, nel browser che stai usando. Questo significa:

- i dati **non** si sincronizzano tra browser o dispositivi diversi;
- svuotare i dati del sito, o usare una finestra anonima, cancella l'archivio;
- gli allegati sono salvati per intero, quindi conviene tenerli sotto qualche MB l'uno.

Usa **Esporta** ogni tanto: il JSON contiene candidature e allegati e si reimporta con **Importa**, unendo i dati a quelli già presenti.

## Struttura

```
src/
  App.jsx                  elenco, filtri, backup, stato generale
  lib/db.js                accesso a IndexedDB (candidature + file)
  lib/model.js             stati, campi e formattazioni
  lib/backup.js            esportazione/importazione JSON
  components/Rail.jsx      riepilogo e filtri
  components/Drawer.jsx    pannello di creazione e modifica
  components/Attachments.jsx  caricamento e download dei file
  components/ApplicationCard.jsx  riga dell'elenco
```

## Idee per il futuro

- Sincronizzazione opzionale con un backend (Supabase o simili).
- Esportazione in CSV per fogli di calcolo.
- Notifiche per le scadenze dei follow-up.

## Licenza

MIT.
