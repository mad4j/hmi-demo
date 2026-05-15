# Debug Commands

Comandi utili da incollare nella console di debug del browser (DevTools), con app avviata in modalita sviluppo (`npm run dev`).

## Elencare tutti i parametri gestiti

```js
hmiDebug.listManagedParameters()
```

Versione tabellare:

```js
console.table(hmiDebug.listManagedParameters())
```

Solo gli ID dei parametri:

```js
hmiDebug.listManagedParameterIds()
```

Valori correnti in tempo reale (oggetto reattivo):

```js
hmiDebug.parameterValues
```

## Profilo di risoluzione

Mostrare il profilo attivo, quello rilevato dai media query e l'eventuale override forzato:

```js
hmiDebug.getResolutionProfile()
// Esempio output: { detected: '1024x768', forced: null, active: '1024x768' }
```

Forzare un profilo specifico (sovrascrive i media query via attributo CSS sul tag `<html>`):

```js
hmiDebug.setResolutionProfile('800x600')
hmiDebug.setResolutionProfile('1024x768')
hmiDebug.setResolutionProfile('1920x1080')
```

Profili validi: `'800x600'`, `'1024x768'`, `'1920x1080'`.

Rimuovere l'override e tornare al profilo rilevato automaticamente:

```js
hmiDebug.clearResolutionProfile()
```

Flusso tipico per testare un profilo diverso da quello della finestra corrente:

```js
hmiDebug.setResolutionProfile('1920x1080')   // attiva scala 24 px + 6 colonne
hmiDebug.getResolutionProfile()              // verifica stato
hmiDebug.clearResolutionProfile()            // ripristina
```

## Test notifiche HMI

Generare una notifica CRITICAL che deve essere confermata esplicitamente:

```js
hmiDebug.notifyCritical('Battery level below 10% - acknowledge required.')
```

Generare una notifica arbitraria specificando severita, messaggio e opzioni:

```js
hmiDebug.notify('WARNING', 'Link degraded')
hmiDebug.notify('ERROR', 'Backend write failed', { displayMode: 'DISMISS' })
```

Esito atteso per il caso CRITICAL:

- compare il popup modale di alert
- il tap sulla notification bar non chiude l'alert
- la chiusura avviene solo con il pulsante `Acknowledge`
