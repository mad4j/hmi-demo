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
