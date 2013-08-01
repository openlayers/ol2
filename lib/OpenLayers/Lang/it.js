/**
 * @requires OpenLayers/Lang.js
 */

/**
 * Namespace: OpenLayers.Lang["it"]
 * Dictionary for Italian.  Keys for entries are used in calls to
 *     <OpenLayers.Lang.translate>.  Entry bodies are normal strings or
 *     strings formatted for use with <OpenLayers.String.format> calls.
 */
OpenLayers.Lang.it = {

    'unhandledRequest': "Codice di ritorno della richiesta ${statusText}",

    'Permalink': "Permalink",

    'Overlays': "Overlay",

    'Base Layer': "Livello base",

    'noFID': "Impossibile aggiornare un elemento grafico che non abbia il FID.",

    'browserNotSupported':
        "Il tuo browser non supporta il rendering vettoriale. I renderizzatori attualmente supportati sono:\n${renderers}",

    // console message
    'minZoomLevelError':
        "La proprietà minZoomLevel è da utilizzare solamente " +
        "con livelli discendenti da FixedZoomLevels. Il fatto che " +
        "questo livello wfs controlli la proprietà minZoomLevel è " +
        "un retaggio del passato. Non possiamo comunque rimuoverla " +
        "senza rompere le vecchie applicazioni che dipendono da essa." +
        " Quindi la deprechiamo -- il controllo di minZoomLevel " +
        "sarà rimosso dalla versione 3.0. Si prega di utilizzare " +
        "l'impostazione della risoluzione min/max come descritto qui: " +
        "http://trac.openlayers.org/wiki/SettingZoomLevels",

    'commitSuccess': "Transazione WFS: SUCCESSO ${response}",

    'commitFailed': "Transazione WFS: FALLIMENTO ${response}",

    'googleWarning':
        "Il livello Google non è stato caricato correttamente.<br><br>" +
        "Per evitare questo messaggio, seleziona un nuovo livello di base " +
        "nel selettore di livelli nell'angolo in alto a destra.<br><br>" +
        "Probabilmente, ciò accade perchè la libreria Google Maps " +
        "non è stata inclusa nella pagina, oppure non contiene la " +
        "corretta API key per il tuo sito.<br><br>" +
        "Sviluppatori: per aiuto su come farlo funzionare correttamente, " +
        "<a href='http://trac.openlayers.org/wiki/Google' " +
        "target='_blank'>fare clic qui</a>",

    'getLayerWarning':
        "Il livello ${layerType} non è stato caricato correttamente.<br><br>" +
        "Per evitare questo messaggio, seleziona un nuovo livello di base " +
        "nel selettore di livelli nell'angolo in alto a destra.<br><br>" +
        "Probabilmente, ciò accade perché la libreria ${layerLib} " +
        "non è stata inclusa correttamente.<br><br>" +
        "Sviluppatori: per aiuto su come farlo funzionare correttamente, " +
        "<a href='http://trac.openlayers.org/wiki/${layerLib}' " +
        "target='_blank'>fare clic qui</a>",

    'Scale = 1 : ${scaleDenom}': "Scala = 1 : ${scaleDenom}",

    //labels for the graticule control
    'W': 'O',
    'E': 'E',
    'N': 'N',
    'S': 'S',
    'Graticule': 'Reticolato',

    // console message
    'reprojectDeprecated':
        "Stai utilizzando l'opzione 'reproject' sul livello ${layerName}. " +
        "Questa opzione è deprecata: il suo utilizzo è stato introdotto per" +
        "supportare il disegno dei dati sopra mappe commerciali, ma tale " + 
        "funzionalità dovrebbe essere ottenuta tramite l'utilizzo della proiezione " +
        "Spherical Mercator. Per maggiori informazioni consultare " +
        "http://trac.openlayers.org/wiki/SphericalMercator.",

    // console message
    'methodDeprecated':
        "Questo metodo è stato deprecato e sarà rimosso dalla versione 3.0. " +
        "Si prega di utilizzare il metodo ${newMethod} in alternativa.",

    // **** end ****
    'end': ''
};
