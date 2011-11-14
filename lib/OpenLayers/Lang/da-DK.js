/**
 * @requires OpenLayers/Lang.js
 */

/**
 * Namespace: OpenLayers.Lang["da-DK"]
 * Dictionary for Danish.  Keys for entries are used in calls to
 *     <OpenLayers.Lang.translate>.  Entry bodies are normal strings or
 *     strings formatted for use with <OpenLayers.String.format> calls.
 */
OpenLayers.Lang['da-DK'] = {

    'unhandledRequest': "En ikke håndteret forespørgsel returnerede ${statusText}",

    'Permalink': "Permalink",

    'Overlays': "Kortlag",

    'Base Layer': "Baggrundslag",

    'noFID': "Kan ikke opdateret en feature (et objekt) der ikke har et FID.",

    'browserNotSupported':
        "Din browser understøtter ikke vektor visning. Følgende vektor visninger understøttes:\n${renderers}",

    // console message
    'minZoomLevelError':
        "Egenskaben minZoomLevel er kun beregnet til brug " +
        "med FixedZoomLevels. At dette WFS lag kontrollerer " +
        "minZoomLevel egenskaben, er et levn fra en tidligere " +
        "version. Vi kan desværre ikke fjerne dette uden at risikere " +
        "at ødelægge eksisterende OL baserede programmer der " +
        " benytter denne funktionalitet. " +
        "Egenskaben bør derfor ikke anvendes, og minZoomLevel " +
        "kontrollen herunder vil blive fjernet i version 3.0. " +
        "Benyt istedet min/max opløsnings indstillingerne, som " +
        "er beskrevet her: " +
        "http://trac.openlayers.org/wiki/SettingZoomLevels",

    'commitSuccess': "WFS transaktion: LYKKEDES ${response}",

    'commitFailed': "WFS transaktion: MISLYKKEDES ${response}",

    'googleWarning':
        "Google laget kunne ikke indlæses.<br><br>" +
        "For at fjerne denne besked, vælg et nyt bagrundskort i " +
        "lagskifteren i øverste højre hjørne.<br><br>" +
        "Fejlen skyldes formentlig at Google Maps bibliotekts " +
        "scriptet ikke er inkluderet, eller ikke indeholder den " +
        "korrkte API nøgle for dit site.<br><br>" +
        "Udviklere: For hjælp til at få dette til at fungere, " +
        "<a href='http://trac.openlayers.org/wiki/Google' " +
        "target='_blank'>klik her</a>",

    'getLayerWarning':
        "${layerType}-laget kunne ikke indlæses.<br><br>" +
        "For at fjerne denne besked, vælg et nyt bagrundskort i " +
        "lagskifteren i øverste højre hjørne.<br><br>" +
        "Fejlen skyldes formentlig at ${layerLib} bibliotekts " +
        "scriptet ikke er inkluderet.<br><br>" +
        "Udviklere: For hjælp til at få dette til at fungere, " +
        "<a href='http://trac.openlayers.org/wiki/${layerLib}' " +
        "target='_blank'>klik her</a>",

    'Scale = 1 : ${scaleDenom}': "Målforhold = 1 : ${scaleDenom}",

    // console message
    'reprojectDeprecated':
        "Du anvender indstillingen 'reproject' på laget ${layerName}." + 
        "Denne indstilling bør ikke længere anvendes. Den var beregnet " +
        "til at vise data ovenpå kommercielle grundkort, men den funktionalitet " +
        "bør nu opnås ved at anvende Spherical Mercator understøttelsen. " +
        "Mere information er tilgængelig her: " +
        "http://trac.openlayers.org/wiki/SphericalMercator.",

    // console message
    'methodDeprecated':
        "Denne funktion bør ikke længere anvendes, og vil blive fjernet i version 3.0. " +
        "Anvend venligst funktionen ${newMethod} istedet."
};
