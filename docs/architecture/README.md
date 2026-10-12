# Architettura

Applicazione React 18 + Vite. L'organizzazione e a livelli con feature isolate ("feature-sliced" leggero).

## Struttura

```
src/
  app/                  composizione dell'applicazione
    main.jsx            bootstrap, registrazione del simulatore SW, hook di debug
    App.jsx             shell: header, notifiche, contenuto, footer
    HmiContentRouter.jsx  sceglie la vista della pagina corrente
  features/             una cartella per capacita funzionale
    navigation/         menu, link grid, useMenuNavigation
    parameters/         widget, viste pagina, editor modali (editorRegistry)
    transaction/        draft, submit ottimistico, rollback, policy
    notifications/      barra notifiche, modale allarmi critici
    header-status/      header, barra icone di stato
    theme/              tema e pagina impostazioni tema
    page-actions/       azioni di pagina (es. logout)
  core/                 infrastruttura indipendente dalla UI
    config/             parsing/normalizzazione YAML (menuConfig, applicationConfig)
    store/              parameterStore (singleton + useSyncExternalStore)
    gateway/            equipmentGateway
      adapters/         DeviceAdapter (contratto), NetworkAdapter (HTTP /api/*)
      notifications/    trasporti notifiche: poll, sse, text-tail
  shared/               riusabile, senza dipendenze dal dominio
    ui/                 AppIcon, HmiShell, HmiFooter
    icons/              icone SVG
    styles/             stili globali e token di tema
config/                 YAML di piattaforma (platform.yaml, application.yaml, status-icons.yaml, pages/)
public/sw.js            simulatore apparato (Service Worker, solo demo)
docs/                   architecture/, requirements/, dev/
```

## Regole di dipendenza

- Direzione unica: `app → features → core → shared`.
- Una feature importa un'altra feature solo tramite il suo `index.js` pubblico (`@features/<nome>`), mai file interni.
- `core` non dipende da `features` ne da `app`.
- `shared` non dipende da nessun altro livello.
- Alias di import: `@app`, `@core`, `@features`, `@shared`, `@config` (vedi `vite.config.js` e `jsconfig.json`). Dentro una stessa feature si usano percorsi relativi.

## Convenzioni

- Il prefisso `use` e riservato agli hook React. I moduli non-hook hanno nomi neutri (es. `parameterStore.js`, `equipmentGateway.js`; la factory e `createEquipmentGateway`).
- Gli stili `.css` stanno accanto al componente che li usa.

## Linee guida di estendibilita

| Voglio... | Cosa fare |
|-----------|-----------|
| Aggiungere pagine o voci di menu | Solo YAML: nuovo file in `config/pages/` e riferimento in `includes` di `config/platform.yaml`. |
| Nuovo tipo di parametro editabile | Creare il modale in `features/parameters/ui/` e registrarlo in `editorRegistry.js` (tipo → componente). |
| Nuovo trasporto notifiche | Implementarlo in `core/gateway/notifications/` e registrarlo in `notificationTransportModes.js` / `NetworkAdapter`. |
| Nuovo backend apparato | Implementare un adapter con la stessa interfaccia di `DeviceAdapter` e usarlo in `equipmentGateway.js`. |
| Nuova capacita funzionale | Nuova cartella in `features/` con `ui/`, `hooks/` e `index.js` pubblico; montarla in `app/`. |

## Simulatore

`public/sw.js` e un Service Worker che simula l'apparato su `/api/*`. Si attiva solo se `VITE_ENABLE_SW_SIMULATOR=true` (default) e non fa parte dell'applicazione di produzione.

## Evoluzioni previste

- Suddividere `public/sw.js` in moduli (router, stato, handler comandi, coda pending) con un entry di build dedicato.
- Aggiungere ESLint con regole di confine tra livelli (`import/no-restricted-paths` o `eslint-plugin-boundaries`).
- Aggiungere Vitest per `core/` (parsing menu, store, adapter).

Il diagramma di flusso dei dati e nel [README principale](../../README.md); lo schema delle API e in `API_refactoring.drawio`.
