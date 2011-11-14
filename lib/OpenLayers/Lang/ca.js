/**
 * @requires OpenLayers/Lang.js
 */

/**
 * Namespace: OpenLayers.Lang["ca"]
 * Dictionary for Catalan, UTF8 encoding. Keys for entries are used in calls to
 *     <OpenLayers.Lang.translate>.  Entry bodies are normal strings or
 *     strings formatted for use with <OpenLayers.String.format> calls.
 */
OpenLayers.Lang.ca = {

    'unhandledRequest': "Resposta a petició no gestionada ${statusText}",

    'Permalink': "Enllaç permanent",

    'Overlays': "Capes addicionals",

    'Base Layer': "Capa Base",

    'noFID': "No es pot actualitzar un element per al que no existeix FID.",

    'browserNotSupported':
        "El seu navegador no suporta renderització vectorial. Els renderitzadors suportats actualment són:\n${renderers}",

    // console message
    'minZoomLevelError':
        "La propietat minZoomLevel s'ha d'utilitzar només " +
        "amb les capes que tenen FixedZoomLevels. El fet que " +
        "una capa wfs comprovi minZoomLevel és una relíquia del " +
        "passat. No podem, però, eliminar-la sense trencar " +
        "les aplicacions d'OpenLayers que en puguin dependre. " +
        "Així doncs estem fent-la obsoleta -- la comprovació " +
        "minZoomLevel s'eliminarà a la versió 3.0. Feu servir " +
        "els paràmetres min/max resolution en substitució, tal com es descriu aquí: " +
        "http://trac.openlayers.org/wiki/SettingZoomLevels",

    'commitSuccess': "Transacció WFS: CORRECTA ${response}",

    'commitFailed': "Transacció WFS: HA FALLAT ${response}",

    'googleWarning':
        "La capa Google no s'ha pogut carregar correctament.<br><br>" +
        "Per evitar aquest missatge, seleccioneu una nova Capa Base " +
        "al gestor de capes de la cantonada superior dreta.<br><br>" +
        "Probablement això és degut a que l'script de la biblioteca de " +
    "Google Maps no ha estat inclòs a la vostra pàgina, o no " +
    "conté la clau de l'API correcta per a la vostra adreça.<br><br>" +
        "Desenvolupadors: Per obtenir consells sobre com fer anar això, " +
        "<a href='http://trac.openlayers.org/wiki/Google' " +
        "target='_blank'>féu clic aquí</a>",

    'getLayerWarning':
        "Per evitar aquest missatge, seleccioneu una nova Capa Base " +
        "al gestor de capes de la cantonada superior dreta.<br><br>" +
        "Probablement això és degut a que l'script de la biblioteca " +
        "${layerLib} " +
        "no ha estat inclòs a la vostra pàgina.<br><br>" +
        "Desenvolupadors: Per obtenir consells sobre com fer anar això, " +
        "<a href='http://trac.openlayers.org/wiki/${layerLib}' " +
        "target='_blank'>féu clic aquí</a>",

    'Scale = 1 : ${scaleDenom}': "Escala = 1 : ${scaleDenom}",

    //labels for the graticule control
    'W': 'O',
    'E': 'E',
    'N': 'N',
    'S': 'S',
    'Graticule': 'Retícula',    
        
    // console message
    'reprojectDeprecated':
        "Esteu fent servir l'opció 'reproject' a la capa " +
        "${layerName}. Aquesta opció és obsoleta: el seu ús fou concebut " +
        "per suportar la visualització de dades sobre mapes base comercials, " + 
        "però ara aquesta funcionalitat s'hauria d'assolir mitjançant el suport " +
        "de la projecció Spherical Mercator. Més informació disponible a " +
        "http://trac.openlayers.org/wiki/SphericalMercator.",

    // console message
    'methodDeprecated':
        "Aquest mètode és obsolet i s'eliminarà a la versió 3.0. " +
        "Si us plau feu servir em mètode alternatiu ${newMethod}.",

    // **** end ****
    'end': ''

};
