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
  },

  addPoint: function (point) {
    // Fügt einen Punkt hinzu
    this._points.push(point);

    const defaultIcon = L.icon({
      iconUrl: "./src/anchor.png", // Pfad zum Standardbild
      iconSize: [30, 30], // Größe des Icons
    });

    // Hover Icon
    const hoverIcon = L.icon({
      iconUrl: "./src/marker.png", // Pfad zum Bild für Hover-Zustand
      iconSize: [20, 20], // Größe des Icons für Hover
    });

    // Selected Icon
    const selectedIcon = L.icon({
      iconUrl: "./src/marker_set.png", // Pfad zum Bild für den geklickten Zustand
      iconSize: [30, 30], // Größe des Icons für Klick
    });

    // Zeichne den Punkt auf der Karte
    const circleMarker = L.marker([point.y, point.x], { icon: defaultIcon })
      .on("mouseover", (e) => {
        e.target.setIcon(selectedIcon);
      })
      .on("mouseout", (e) => {
        e.target.setIcon(defaultIcon);
      })
      .on("click", (e) => {
        e.target.setIcon(defaultIcon);
        this._onPointClick(point);
        console.log(`Punkt ${point.id} ausgewählt`);
      });
    this.addLayer(circleMarker);
  },

  addEdge: function (edge) {
    this._paths.push(edge);
    this._dijkstra.addEdge(edge.start, edge.end, edge.weight);
  },

  _onPointClick: function (point) {
    if (!this._startPoint) {
      this._startPoint = point;
      this._clearRouteLayer();
      console.log(`Startpunkt ${point.id} gewählt`);
    } else {
      this._endPoint = point;
      console.log(`Endpunkt ${point.id} gewählt`);
      this._calculateAndDrawRoute();
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

    let lines = [];
    for (let i = 0; i < path.length; i++) {
      const point = this._points.find((p) => p.id === path[i]);
      if (point) {
        lines.push([point.y, point.x]);
      }
    }

    L.polyline(lines, { color: "green" }).addTo(this._routesLayer);
    this._routesLayer.addTo(this._map);
  },

  getSelectedPoint: function () {
    return this._selectedPoint;
  },
});
