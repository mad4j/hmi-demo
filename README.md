# hmi-demo

Demo HMI sviluppata con Vue 3 e Vite per simulare un pannello veicolo 800x600 con menu gerarchici, widget parametro e stato apparato aggiornato in modo asincrono.

## Requisiti

- Node.js 20.19+ oppure 22.12+
- npm

## Avvio

Avvia il simulatore e il frontend in due terminali separati:

```sh
npm install
npm run dev:sim   # terminale 1 – simulatore su http://localhost:3001
npm run dev:app   # terminale 2 – frontend Vite su http://localhost:5173
```

Oppure in un unico comando (Unix/macOS):

```sh
npm run dev
```

Build di produzione:

```sh
npm run build
```

## Architettura

- `src/App.vue`: shell principale, griglie dei widget, barra di stato e modali di editing.
- `src/composables/useMenuConfig.js`: parsing e normalizzazione del menu YAML.
- `src/composables/useMenuNavigation.js`: stato singleton della navigazione tra primo e secondo livello.
- `src/composables/useParameterStore.js`: stato reattivo dei parametri e sincronizzazione con il client apparato.
- `src/composables/useDeviceClient.js`: client HTTP/SSE verso il simulatore (`fetch` per letture/scritture, `EventSource` per notifiche push).
- `simulator/deviceSimulator.js`: logica del simulatore lato server (stato, latenza artificiale, notifiche push).
- `simulator/server.js`: server HTTP Node.js che espone il simulatore via REST + SSE (porta 3001).
- `src/components/`: widget, modali e icone usati dall'interfaccia.

## Configurazione menu

La struttura del menu applicativo e i parametri visualizzati sono definiti in `src/config/platform.yaml`.

`platform.yaml` e il file padre e include i file figli con prefisso `platform-` nella stessa cartella, ad esempio:

- `platform-status-icons.yaml`
- `platform-pages-menu.yaml`
- `platform-pages-allarmi.yaml`
- `platform-pages-info.yaml`
- `platform-pages-impostazioni.yaml`

Ogni pagina puo contenere:

- `id`, `label`, `icon`
- `parameters`
- `submenus`

Per le pagine transaction (`mode: transaction`) e possibile aggiungere:

- `goOnApply`: comportamento dopo submit andato a buon fine
	- `STAY_HERE`: resta sulla pagina corrente (default)
	- `GO_HOME`: torna alla home
	- `GO_BACK`: torna alla pagina visitata in precedenza

Le pagine foglia visualizzano i parametri. Le pagine con `submenus` aprono invece il secondo livello di navigazione.

## Parametri supportati

I parametri dichiarati nel file YAML supportano questi tipi:

- `boolean`
- `number`
- `percentage`
- `enum`
- `text`
- `password`
- `date`

I valori sono inizializzati dal client simulato e poi aggiornati tramite notifiche periodiche o comandi inviati dall'interfaccia.

## Login simulato

Il simulatore parte in stato `unlogged` (icona login in stato `off`).
Quando riceve credenziali corrette passa a `logged` (icona login in stato `ok`).

Credenziali del simulatore:

- Name: `admin`
- Password: `admin`
