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
