/* Translators (2009 onwards):
 *  - Michawiki
 */

/**
 * @requires OpenLayers/Lang.js
 */

/**
 * Namespace: OpenLayers.Lang["hsb"]
 * Dictionary for Hornjoserbsce.  Keys for entries are used in calls to
 *     <OpenLayers.Lang.translate>.  Entry bodies are normal strings or
 *     strings formatted for use with <OpenLayers.String.format> calls.
 */
OpenLayers.Lang["hsb"] = OpenLayers.Util.applyDefaults({

    'unhandledRequest': "Wotmołwa njewobdźěłaneho naprašowanja ${statusText}",

    'Permalink': "Trajny wotkaz",

    'Overlays': "Naworštowanja",

    'Base Layer': "Zakładna runina",

    'noFID': "Funkcija, za kotruž FID njeje, njeda so aktualizować.",

    'browserNotSupported': "Twój wobhladowak wektorowe rysowanje njepodpěruje. Tuchwilu podpěrowane rysowaki su:\n${renderers}",

    'minZoomLevelError': "Kajkosć minZoomLevel je jenož za wužiwanje z worštami myslena, kotrež wot FixedZoomLevels pochadźeja. Zo tuta woršta wfs za minZoomLevel přepruwuje, je relikt zańdźenosće. Njemóžemy wšak ju wotstronić, bjeztoho zo aplikacije, kotrež na OpenLayers bazěruja a snano tutu kajkosć wužiwaja, hižo njefunguja. Tohodla smy ju jako zestarjenu woznamjenili -- přepruwowanje za minZoomLevel budu so we wersiji 3.0 wotstronjeć. Prošu wužij město toho nastajenje min/max, kaž je tu wopisane: http://trac.openlayers.org/wiki/SettingZoomLevels",

    'commitSuccess': "WFS-Transakcija: WUSPĚŠNA ${response}",

    'commitFailed': "WFS-Transakcija: NJEPORADŹENA ${response}",

    'googleWarning': "Woršta Google njemóžeše so korektnje začitać.\x3cbr\x3e\x3cbr\x3eZo by tutu zdźělenku wotbył, wubjer nowy BaseLayer z wuběra worštow horjeka naprawo.\x3cbr\x3e\x3cbr\x3eNajskerje so to stawa, dokelž skript biblioteki Google Maps pak njebu zapřijaty pak njewobsahuje korektny kluč API za twoje sydło.\x3cbr\x3e\x3cbr\x3eWuwiwarjo: Za pomoc ke korektnemu fungowanju worštow\n\x3ca href=\'http://trac.openlayers.org/wiki/Google\' target=\'_blank\'\x3etu kliknyć\x3c/a\x3e",

    'getLayerWarning': "Woršta ${layerType} njemóžeše so korektnje začitać.\x3cbr\x3e\x3cbr\x3eZo by tutu zdźělenku wotbył, wubjer nowy BaseLayer z wuběra worštow horjeka naprawo.\x3cbr\x3e\x3cbr\x3eNajskerje so to stawa, dokelž skript biblioteki ${layerLib} njebu korektnje zapřijaty.\x3cbr\x3e\x3cbr\x3eWuwiwarjo: Za pomoc ke korektnemu fungowanju worštow\n\x3ca href=\'http://trac.openlayers.org/wiki/${layerLib}\' target=\'_blank\'\x3etu kliknyć\x3c/a\x3e",

    'Scale = 1 : ${scaleDenom}': "Měritko = 1 : ${scaleDenom}",

    'W': "Z",

    'E': "W",

    'N': "S",

    'S': "J",

    'reprojectDeprecated': "Wužiwaš opciju \"reproject\" wořšty ${layerName}. Tuta opcija je zestarjena: jeje wužiwanje bě myslene, zo by zwobraznjenje datow nad komercielnymi bazowymi kartami podpěrało, ale funkcionalnosć měła so nětko z pomocu Sperical Mercator docpěć. Dalše informacije steja na http://trac.openlayers.org/wiki/SphericalMercator k dispoziciji.",

    'methodDeprecated': "Tuta metoda je so njeschwaliła a budźe so w 3.0 wotstronjeć. Prošu wužij ${newMethod} město toho."

});
