/**
 * Planung der KLasse und so
 * - Hmm mehrere Karten instanzen sollen erzeugt werden
 * - Grund foo was GUI betrifft (Karten Select, Layer Select, xy Infobox bla bla)
 * - Man sollten zwischen den Instanzen wechseln können
 * - Karten sind erstmal fest aber Punkte kommen aus DB -> IDs sind bekannt
 * - Karten sind in einer Liste
 * - Login und Admin Modus
 * - Punkte in DB eintragen + routen, sollte irgendwas sinnvolles sein
 * - - denke mal sowas wie erst Punkt malen und die dann linken
 * - - oder einfach nur punkte malen und dann die verbinden, die dynamick könnte aber kacke sein
 * - uffz punkte kommen dann aus db und müssen nachgeladen werden
 * - Punkte Clustern? hmm schauen was DB hergibt
 *  */

class OTTP {
  constructor(divId) {
    this.maps = {};
    this.currentMap = null;
    this.container = document.getElementById(divId);
  }

  newMap(mapId, options) {
    // Erstellt eine neue Karte mit der ID mapId und den Optionen options
    // options enthält mindestens center und zoom
    this.maps[mapId] = L.map(this.container, options);
    this.currentMap = mapId;
    return this.maps[mapId];
  }

  getMap(mapId) {
    return this.maps[mapId] || null;
  }

  showMap(mapId) {
    // Zeigt die Karte mit der ID mapId an
    this.currentMap = mapId;
    for (const map in this.maps) {
      this.maps[map].setView([0, 0], 0);
    }
    this.maps[mapId].setView([0, 0], 0);
  }

}

export default OTTP;
