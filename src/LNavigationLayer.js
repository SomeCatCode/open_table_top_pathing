L.NavigationLayer = L.FeatureGroup.extend({
  _routesLayer: null, // Layer für die Routen

  options: {
    radius: 10, // Radius der Punkte, kann angepasst werden
    highlightColor: "#ff0000", // Farbe für Hervorhebung
    normalColor: "#3388ff", // Normale Farbe der Punkte
  },

  initialize: function (options) {
    L.setOptions(this, options);
    L.FeatureGroup.prototype.initialize.call(this, []);
    this._dijkstra = new DijkstraGraph();
    this._points = [];
    this._paths = [];
    this._startPoint = null;
    this._endPoint = null;
    this._distance = null;
  },

  addPoint: function (point) {
    // Fügt einen Punkt hinzu
    this._points.push(point);

    const defaultIcon = L.icon({
      iconUrl: "./src/marker/" + point.icon + ".png", // Pfad zum Standardbild
      iconSize: [30, 30], // Größe des Icons
    });

    // Selected Icon
    const selectedIcon = L.icon({
      iconUrl: "./src/marker/selected.png", // Pfad zum Bild für den geklickten Zustand
      iconSize: [30, 30], // Größe des Icons für Klick
    });

    // Zeichne den Punkt auf der Karte
    const circleMarker = L.marker([point.y, point.x], { icon: defaultIcon })
      .on("mouseover", (e) => {
        e.target.setIcon(selectedIcon);
        if (point.name || point.description) {
          e.target.bindPopup(`<h3>${point.name || ""}</h3>${point.description || ""}`).openPopup();
        }
      })
      .on("mouseout", (e) => {
        e.target.setIcon(defaultIcon);
        if (point.name || point.description) {
          e.target.closePopup();
        }
      })
      .on("click", (e) => {
        this._onPointClick(point);
      });
    this.addLayer(circleMarker);
  },

  addEdge: function (edge) {
    this._paths.push(edge);
    this._dijkstra.addEdge(edge.start, edge.end, edge.weight);
  },

  _clearInfoBox: function () {
    document.getElementById("navigation-info").classList.remove("active");
  },

  _showInfoBox: function () {
    let infoBox = document.getElementById("navigation-info");
    let routeBox = infoBox.getElementsByClassName("route")[0];
    let distanceBox = infoBox.getElementsByClassName("distance")[0];

    let route = "" 
    + (this._startPoint ? (this._startPoint.name || "Punkt: " + this._startPoint.id) : '' ) 
    + " - "
    + (this._endPoint ? (this._endPoint.name || "Punkt: " + this._endPoint.id) : '' ) 
    ;

    routeBox.innerHTML = route;
    distanceBox.innerHTML = `Distance: ${this._distance || 0}`;
    infoBox.classList.add("active");
  },

  _onPointClick: function (point) {
    if (!this._startPoint) {
      console.log(`Startpunkt ${point.id} gewählt`);
      this._startPoint = point;
      this._endPoint = null;
      this._distance = 0;
      this._clearRouteLayer();
      this._showInfoBox();
    } else {
      console.log(`Endpunkt ${point.id} gewählt`);
      this._endPoint = point;
      this._calculateAndDrawRoute();
      this._showInfoBox();
      this._startPoint = null; // Setzt den Startpunkt zurück für die nächste Route
    }
  },

  _clearRouteLayer: function () {
    // Entfernt die Routen
    if (this._routesLayer) {
      this._map.removeLayer(this._routesLayer);
    }
    this._routesLayer = L.layerGroup();
  },

  _calculateAndDrawRoute: function () {
    const [_, prev] = this._dijkstra.paths_from(this._startPoint.id);
    const path = this._dijkstra.paths_to(prev, this._endPoint.id);
    this._distance = this._dijkstra.getDistance(path);

    let lines = [];
    for (let i = 0; i < path.length; i++) {
      const point = this._points.find((p) => p.id === path[i]);
      if (point) {
        lines.push([point.y, point.x]);
      }
    }

    this._showInfoBox();
    L.polyline(lines, { color: "green" }).addTo(this._routesLayer);
    this._routesLayer.addTo(this._map);
  },

  getSelectedPoint: function () {
    return this._selectedPoint;
  },
});
