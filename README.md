# hmi-demo

Demo HMI sviluppata con Vue 3 e Vite per simulare un pannello veicolo 800x600 con menu gerarchici, widget parametro e stato apparato aggiornato in modo asincrono.

## Requisiti

- Node.js 20.19+ oppure 22.12+
- npm

## Avvio

```sh
npm install
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
- `src/composables/useDeviceClient.js`: simulazione del backend remoto con fetch iniziale, comandi e notifiche push.
- `src/components/`: widget, modali e icone usati dall'interfaccia.

## Configurazione menu

La struttura del menu applicativo e i parametri visualizzati sono definiti in `src/config/menu.yml`.

Ogni pagina puo contenere:

- `id`, `label`, `icon`
- `parameters`
- `submenus`

Le pagine foglia visualizzano i parametri. Le pagine con `submenus` aprono invece il secondo livello di navigazione.

## Parametri supportati

I parametri dichiarati nel file YAML supportano questi tipi:

- `boolean`
- `number`
- `percentage`
- `enum`
- `text`
- `password`

I valori sono inizializzati dal client simulato e poi aggiornati tramite notifiche periodiche o comandi inviati dall'interfaccia.
