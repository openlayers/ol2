/**
 * @requires OpenLayers/Lang.js
 */

/**
 * Namespace: OpenLayers.Lang["nb"]
 * Dictionary for norwegian bokmål (Norway). Keys for entries are used in calls to
 *     <OpenLayers.Lang.translate>.  Entry bodies are normal strings or
 *     strings formatted for use with <OpenLayers.String.format> calls.
 */
OpenLayers.Lang["nb"] = {

    'unhandledRequest': "Ubehandlet forespørsel returnerte ${statusText}",

    'Permalink': "Kobling til denne siden",

    'Overlays': "Kartlag",

    'Base Layer': "Bakgrunnskart",

    'noFID': "Kan ikke oppdatere et feature (et objekt) som ikke har FID.",

    'browserNotSupported':
        "Din nettleser støtter ikke vektortegning. Tegnemetodene som støttes er:\n${renderers}",

    // console message
    'minZoomLevelError':
        "Egenskapen minZoomLevel er kun ment til bruk på lag " +
        "basert på FixedZoomLevels. At dette wfs-laget sjekker " +
        "minZoomLevel er en etterlevning fra tidligere versjoner. Det kan dog ikke " +
        "tas bort uten å risikere at OL-baserte applikasjoner " +
        "slutter å virke, så det er merket som foreldet: " +
        "minZoomLevel i sjekken nedenfor vil fjernes i 3.0. " +
        "Vennligst bruk innstillingene for min/maks oppløsning " +
        "som er beskrevet her: "+
        "http://trac.openlayers.org/wiki/SettingZoomLevels",

    'commitSuccess': "WFS-transaksjon: LYKTES ${response}",

    'commitFailed': "WFS-transaksjon: MISLYKTES ${response}",

    'googleWarning':
        "Google-laget kunne ikke lastes.<br><br>" +
        "Bytt til et annet bakgrunnslag i lagvelgeren i " +
        "øvre høyre hjørne for å slippe denne meldingen.<br><br>" +
        "Sannsynligvis forårsakes feilen av at Google Maps-biblioteket " +
        "ikke er riktig inkludert på nettsiden, eller at det ikke er " +
        "angitt riktig API-nøkkel for nettstedet.<br><br>" +
        "Utviklere: For hjelp til å få dette til å virke se "+
        "<a href='http://trac.openlayers.org/wiki/Google' " +
        "target='_blank'>her</a>.",

    'getLayerWarning':
        "${layerType}-laget kunne ikke lastes.<br><br>" +
        "Bytt til et annet bakgrunnslag i lagvelgeren i " +
        "øvre høyre hjørne for å slippe denne meldingen.<br><br>" +
        "Sannsynligvis forårsakes feilen av at " +
        "${layerLib}-biblioteket ikke var riktig inkludert " +
        "på nettsiden.<br><br>" +
        "Utviklere: For hjelp til å få dette til å virke se " +
        "<a href='http://trac.openlayers.org/wiki/${layerLib}' " +
        "target='_blank'>her</a>.",

    'Scale = 1 : ${scaleDenom}': "<strong>Skala</strong> 1 : ${scaleDenom}",

    // console message
    'reprojectDeprecated':
        "Du bruker innstillingen 'reproject' på laget ${layerName}. " +
        "Denne innstillingen er foreldet, den var ment for å støtte " +
        "visning av kartdata over kommersielle bakgrunnskart, men det " +
        "bør nå gjøres med støtten for Spherical Mercator. Mer informasjon " +
        "finnes på http://trac.openlayers.org/wiki/SphericalMercator.",

    // console message
    'methodDeprecated':
        "Denne metoden er markert som foreldet og vil bli fjernet i 3.0. " +
        "Vennligst bruk ${newMethod} i stedet.",

    'end': ''
};

OpenLayers.Lang["no"] = OpenLayers.Lang["nb"];
