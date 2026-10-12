## Profilo di risoluzione dello schermo

La pagina **Impostazioni > Screen** permette di scegliere un profilo che adatta
l'area di lavoro HMI a tre dimensioni logiche. Il profilo non cambia la
risoluzione fisica del monitor: imposta i limiti del contenitore dell'app, la
scala tipografica e alcune regole di layout. Le dimensioni sono espresse in
pixel CSS.

| Profilo | Area logica massima | Scala base | Layout principale |
| --- | ---: | ---: | --- |
| `COMPACT` | 800 x 600 | 16 px | Griglia a 4 colonne |
| `STANDARD` | 1024 x 768 | 20 px | Griglia a 5 colonne |
| `EXTENDED` | 1920 x 1080 | 24 px | Griglia a 6 colonne, shell a tutto schermo |

Su finestre piu' piccole del profilo selezionato il contenitore e' limitato
all'area disponibile e la scala base si riduce proporzionalmente (minimo 12 px);
sotto i 600 px di larghezza le griglie passano a 2 colonne.
Il profilo `EXTENDED` usa tutta la viewport disponibile, quindi non forza un
monitor fisico a 1920 x 1080.

### Selezione automatica e manuale

Il profilo viene scelto in due modi, l'ultimo evento prevale:

- **Ridimensionamento dello schermo:** a ogni cambio di dimensione della finestra
  (con un debounce di 150 ms) viene selezionato automaticamente il profilo piu'
  adatto, cioe' il piu' grande la cui area logica entra nella viewport
  (`COMPACT` se nessuno entra). `EXTENDED` ha una tolleranza del 10% solo sulla
  larghezza: viene scelto anche con viewport di almeno 1728 x 1080.
- **Scelta dell'operatore:** da **Impostazioni > Screen** l'operatore sceglie un
  profilo, che resta applicato finche' lo schermo non viene ridimensionato di nuovo.

All'avvio si usa l'ultimo profilo salvato; se non esiste, quello piu' adatto alla
viewport corrente.

### Flusso implementato

1. La sottopagina **Screen** di Impostazioni e' dichiarata in
   [`src/config/platform-pages-impostazioni.yaml`](src/config/platform-pages-impostazioni.yaml)
   e renderizzata da `HmiScreenSettingsPage`.
2. [`src/composables/useScreenProfile.js`](src/composables/useScreenProfile.js)
   conserva il profilo (`COMPACT`, `STANDARD`, `EXTENDED`) in `localStorage`
   (chiave `hmi-screen-profile`), come il tema. Non e' inviato all'apparato.
3. Lo stesso modulo imposta `data-resolution-profile` sull'elemento `<html>`
   al caricamento e a ogni cambio, ed ascolta l'evento `resize`.
4. I fogli di stile applicano le dimensioni e i layout coerenti con
   quell'attributo: [`src/assets/main.css`](src/assets/main.css) gestisce
   dimensioni dell'app e scala del testo; [`src/App.css`](src/App.css) e
   [`src/components/PageParametersView.css`](src/components/PageParametersView.css)
   le colonne dei widget; [`src/components/HmiShell.css`](src/components/HmiShell.css)
   bordi e forma della shell. Senza un valore valido si applicano i valori di
   default (`STANDARD`); le media query restano solo per gli schermi stretti.

### Portare la funzionalita' in un progetto simile

1. **Definire i valori canonici e i requisiti di layout.** Usare un'unica
   nomenclatura (`COMPACT`, `STANDARD`, `EXTENDED`) in configurazione, modello
   dati e UI. Associare a ogni valore dimensioni logiche, scala tipografica e
   regole di layout appropriate al prodotto; non trattare i valori come
   risoluzioni fisiche del dispositivo.
2. **Aggiungere l'impostazione.** Definire un parametro enum equivalente a
   `ui_screen_profile` nella configurazione o nello schema del progetto,
   presentarlo nelle impostazioni, assegnare un default (`STANDARD`) e
   restringere i valori accettati all'enum. Fare in modo che il backend
   dell'apparato/configurazione legga e scriva il valore, se la scelta deve
   sopravvivere a una nuova sessione.
3. **Collegare stato e presentazione.** Leggere il parametro dallo store
   reattivo e convertirlo con una mappa esplicita, per esempio
   `COMPACT -> 800x600`, `STANDARD -> 1024x768`,
   `EXTENDED -> 1920x1080`. Applicare il risultato in un solo punto
   (ad esempio `data-resolution-profile` su `<html>` o una classe sul root);
   prevedere un default e rimuovere l'attributo se il valore non e' riconosciuto.
   Il cambio di layout deve seguire il valore confermato dallo store e
   rispettare la gestione degli errori di scrittura gia' usata dal progetto.
4. **Applicare stili per l'intero HMI.** Centralizzare la scala base e le
   dimensioni dell'area applicativa nel CSS globale; adeguare anche shell,
   header, footer, widget, griglie, tabelle, modali e controlli touch. Usare
   token CSS relativi (`rem`, percentuali, `min()`, `dvh`) ove appropriato.
   Mantenere regole responsive per viewport piu' piccole e verificare
   overflow, scrolling, testi e target touch in tutti i profili.
5. **Verificare selezione e persistenza.** Provare ciascun enum dalla UI,
   verificare che l'attributo e tutti i layout si aggiornino, ricaricare la
   pagina e controllare il ripristino dal backend. Testare errore di scrittura,
   valore mancante/sconosciuto, viewport piu' piccola del profilo, breakpoint
   mobile e tutte le pagine HMI. Se disponibile, fornire un override di debug
   separato per provare le dimensioni senza modificare il parametro persistito.

### Nota sulla nomenclatura in questo repository

Il profilo `1920 x 1080` si chiama `EXTENDED` ovunque: nella lista enum YAML e
nella mappa di [`src/App.jsx`](src/App.jsx). Non confondere il parametro utente
`ui_screen_profile` (`COMPACT`, `STANDARD`, `EXTENDED`) con l'attributo
`data-resolution-profile` applicato a `<html>`, che usa gli identificatori
`800x600`, `1024x768` e `1920x1080`. Questo attributo e' l'unico meccanismo di
ridimensionamento: non esistono piu' le media query `min-width: 1400px` e il
`font-size` fluido basato solo su `vw`/`vh`.
