class OTTPPriorityList {
  constructor(data) {
    this.next = null;
    this.data = data;
  }
}

class OTTPPriorityQueue {
  constructor(comparator) {
    this.size = 0;
    this.liststart = null;
    this.listend = null;
    this.comparator = comparator;
  }

  add(x) {
    this.size = this.size + 1;

    if (this.liststart == null) {
      this.liststart = new OTTPPriorityList(x);
    } else {
      let node = this.liststart;
      let comparator = this.comparator;
      let newnode = new OTTPPriorityList(x);
      let lastnode = null;
      let added = false;
      while (node) {
        if (comparator(newnode, node) < 0) {
          newnode.next = node;
          if (lastnode == null) {
            this.liststart = newnode;
          } else {
            lastnode.next = newnode;
          }
          added = true;
          break;
        }
        lastnode = node;
        node = node.next;
      }
      if (!added) {
        lastnode.next = newnode;
      }
    }
  }

  debug() {
    let node = this.liststart;
    let i = 0;
    if (!node) {
      return;
    }
    while (node) {
      node = node.next;
      i++;
    }
  }

  size() {
    return this.size;
  }

  peak() {
    return this.liststart.data;
  }

  remove() {
    let x = this.peak();
    this.size = this.size - 1;
    this.liststart = this.liststart.next;
    return x;
  }
}

class OTTPEdge {
  constructor(start, end, weight) {
    this.start = start;
    this.end = end;
    this.weight = weight;
  }
}

class OTTPGraph {
  constructor() {
    this.nodes = {};
  }

  debug() {
    console.log(this.nodes);
  }

  addEdge(start, end, weight = 0) {
    // make sure that they are numeric
    start = start * 1;
    end = end * 1;
    weight = weight * 1;

    if (!this.nodes[start]) {
      this.nodes[start] = [];
    }
    this.nodes[start].push(new OTTPEdge(start, end, weight));
  }

  removeNode(index) {
    delete this.nodes[index];
  }

  paths_from(from) {
    let dist = {};
    dist[from] = 0;

    let visited = {};
    let previous = {};

    let Q = new OTTPPriorityQueue((a, b) => a.data[0] - b.data[0]);
    Q.add([dist[from], from]);

    while (Q.size > 0) {
      let [distance, u] = Q.remove();

      if (visited[u]) {
        continue;
      }
      visited[u] = true;

      if (!this.nodes[u]) {
        console.log(`WARNING: '${u}' is not found in the node list`);
        continue;
      }

      this.nodes[u].forEach((edge) => {
        let alt = dist[u] + edge.weight;
        let end = edge.end;
        if (dist[end] === undefined || alt < dist[end]) {
          previous[end] = u;
          dist[end] = alt;
          Q.add([dist[end], end]);
        }
      });
    }
    return [dist, previous];
  }

  paths_to(node_dsts, tonode) {
    let current = tonode;
    let path = [];

    if (node_dsts[current] !== undefined) {
      path.push(tonode);
    }
    while (node_dsts[current] !== undefined) {
      let nextnode = node_dsts[current];
      path.push(nextnode);
      current = nextnode;
    }

    return path.reverse();
  }

  getpath(from, to) {
    let [distances, prev] = this.paths_from(from);
    return this.paths_to(prev, to);
  }
}

function compareWeights(a, b) {
  return a.data[0] - b.data[0];
}

class OTTPInfoBox {
  // TODO: Dynamisch Tag hinzufügen
  constructor() {
    this.box = document.getElementById("ottp-info-box");
    this.content = {};
    this.renderContent();
  }

  updateContent(id, value) {
    this.content[id] = value;

    // sort by key
    this.content = Object.keys(this.content)
      .sort()
      .reduce((acc, key) => {
        acc[key] = this.content[key];
        return acc;
      }, {});

    this.renderContent();
  }

  renderContent() {
    let content = "";
    for (const [key, value] of Object.entries(this.content)) {
      content += `${key}: ${value}</br>`;
    }
    this.box.innerHTML = content;
  }

  show() {
    this.box.style.display = "block";
  }

  hide() {
    this.box.style.display = "none";
  }
}

class OTTPContextMenu {
  // TODO: Dynamisch Tag hinzufügen
  constructor(openCallback = null) {
    this.labelPrefix = "ottp-layer-";

    this.button = document.getElementById("ottp-filter-button");
    this.context = document.getElementById("ottp-filter-content");

    this.button.addEventListener("click", this.onClick.bind(this));
    this.openCallback = openCallback;
  }

  onClick() {
    this.context.classList.toggle("open");

    if (this.openCallback) {
      this.openCallback();
    }
  }

  addCheckbox(id, label, callback, enabled = true) {
    id = this.labelPrefix + id;

    const li = document.createElement("li");
    const checked = enabled ? "checked" : "";
    li.innerHTML = `<input type="checkbox" id="${id}" name="${id}" ${checked}> ${label}`;
    this.context.querySelector("ul").appendChild(li);

    document.getElementById(`${id}`).addEventListener("change", callback);
  }

  is(id) {
    id = this.labelPrefix + id;
    return !!document.getElementById(id).checked;
  }
}

class OTTPNavigation {
  // TODO: Dynamisch Tag hinzufügen
  constructor(openCallback = null) {
    this.button = document.getElementById("ottp-action-navigation");
    this.button.addEventListener("click", this.onClick.bind(this));
    this.openCallback = openCallback;
  }

  isRunning() {
    return this.button.classList.contains("running");
  }

  onClick() {
    this.button.classList.toggle("running");
    let running = this.isRunning();
    this.button.innerHTML = !!running ? "Stop Navigation" : "Start Navigation";

    // Callback
    if (this.openCallback) {
      this.openCallback(running);
    }
  }
}

class OTTPWorldPoint {
  constructor(x, y, id) {
    this.X = x;
    this.Y = y;
    this.color = "#ff0000";
    this.radius = 10;
    this.id = id * 1;
    this.highlighted = false;
  }

  highlight(x, y) {
    const dx = this.X - x;
    const dy = this.Y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.highlighted = distance < this.radius;
    return this.highlighted;
  }

  compare(x, y, worldPoint) {
    const dxThis = this.X - x;
    const dyThis = this.Y - y;
    const distanceThis = Math.sqrt(dxThis * dxThis + dyThis * dyThis);

    const dxWorldPoint = worldPoint.x - x;
    const dyWorldPoint = worldPoint.y - y;
    const distanceWorldPoint = Math.sqrt(dxWorldPoint * dxWorldPoint + dyWorldPoint * dyWorldPoint);

    // Gibt `this` zurück, wenn die Distanz von `this` zu (x, y) kleiner ist als die von `worldPoint` zu (x, y),
    // ansonsten gibt `worldPoint` zurück.
    return distanceThis < distanceWorldPoint ? this : worldPoint;
  }
}

class OTTP {
  constructor() {
    this.debug = true;
    // Components
    this.infoBox = new OTTPInfoBox();
    this.contextMenu = new OTTPContextMenu();
    this.navigation = new OTTPNavigation(this.onStartNavigation.bind(this));
    this.dijkstra = new OTTPGraph();
    // Real canvas
    this.canvas = document.getElementById("ottp-map");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;

    // Virtual canvas
    this.vCanvas = document.createElement("canvas");
    this.vCtx = this.vCanvas.getContext("2d");
    this.vCtx.imageSmoothingEnabled = false;
    // Data
    this.layers = {};
    this.points = [];
    this.paths = [];
    this.isDragging = false;
    this.maxWidth = 3439;
    this.maxHeight = 3175;
    this.scaleFactor = 1;
    this.offset = { X: this.maxWidth / -4, Y: this.maxHeight / -4 };
    this.clickStart = { X: 0, Y: 0 };
    this.selectedPoint = null;
    this.routeStart = null;
    this.routeEnd = null;
    this.routeDistance = 0;
    this.routePath = [];
    // Marker
    this.markerPoint = new Image();
    this.markerPoint.src = "./src/marker.png";
    this.markerSet = new Image();
    this.markerSet.src = "./src/marker_set.png";
    //
  }

  init() {
    // Event-Listener
    window.addEventListener("resize", this.onResize.bind(this));
    this.canvas.addEventListener("wheel", this.zoomMap.bind(this));
    this.canvas.addEventListener("mousedown", this.onCanvasMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.onCanvasMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.onCanvasMouseUp.bind(this));
    this.canvas.addEventListener("mouseleave", this.onCanvasMouseLeave.bind(this));

    // Debug
    if (this.debug) {
      // this.infoBox.updateContent("Debug", "true");
      this.infoBox.show();
    }

    // Scale
    this.onResize();
  }

  onStartNavigation(running) {
    if (!!running) {
      this.routeStart = null;
      this.routeEnd = null;
    }
  }
  //#endregion
  onCanvasMouseDown(event) {
    this.isDragging = true;
    this.clickStart.X = event.clientX - this.offset.X;
    this.clickStart.Y = event.clientY - this.offset.Y;
  }

  checkSelectedPoints(x, y) {
    let selectedPoint = null;

    // Iteriere über alle Punkte und prüfe, ob einer hervorgehoben wird, der mit den geringsten Abstand zu (x, y) hat
    for (let i = 0; i < this.points.length; i++) {
      if (this.routeStart !== this.points[i] && this.points[i].highlight(x, y)) {
        if (selectedPoint === null || this.points[i] === this.points[i].compare(x, y, selectedPoint)) {
          selectedPoint = this.points[i];
        }
      }
    }

    this.updateSelectedPoint(selectedPoint);
  }

  updateSelectedPoint(obj) {
    if (this.selectedPoint != obj) {
      this.drawMap();
    }

    if (obj) {
      this.selectedPoint = obj;
      // this.infoBox.updateContent("Highlighted Point", this.selectedPoint.id);
    } else {
      this.selectedPoint = null;
      // this.infoBox.updateContent("Highlighted Point", "none");
    }
  }

  onCanvasMouseMove(event) {
    // this.infoBox.updateContent("real X", event.clientX);
    // this.infoBox.updateContent("real Y", event.clientY);

    let x = event.clientX - this.offset.X;
    let y = event.clientY - this.offset.Y;
    this.infoBox.updateContent("X", x);
    this.infoBox.updateContent("Y", y);

    // this.infoBox.updateContent("offsetX", this.offset.X);
    // this.infoBox.updateContent("offsetY", this.offset.Y);

    if (this.navigation.isRunning()) {
      this.checkSelectedPoints(x, y);
      if (this.selectedPoint) {
        // Punkt zeichnen
        let drawX = this.selectedPoint.X + this.offset.X;
        let drawY = this.selectedPoint.Y + this.offset.Y;
        this.drawMap();
        this.drawMarker(drawX, drawY);
      }
    }

    if (!this.isDragging) {
      return;
    }

    this.offset.X = event.clientX - this.clickStart.X;
    this.offset.Y = event.clientY - this.clickStart.Y;

    const w = this.maxWidth * this.scaleFactor;
    const h = this.maxHeight * this.scaleFactor;
    const w2 = this.canvas.width / 2;
    const h2 = this.canvas.height / 2;

    if (this.offset.X > w2) {
      this.offset.X = w2;
    }
    if (this.offset.X < -1 * w + w2) {
      this.offset.X = -1 * w + w2;
    }

    if (this.offset.Y > h2) {
      this.offset.Y = h2;
    }
    if (this.offset.Y < -1 * h + h2) {
      this.offset.Y = -1 * h + h2;
    }

    this.drawMap();
  }

  onCanvasMouseUp(event) {
    this.isDragging = false;

    if (this.navigation.isRunning() && this.selectedPoint !== null) {
      if (this.routeStart === null || (this.routeStart !== null && this.routeEnd !== null)) {
        this.routeStart = this.selectedPoint;
        this.routeEnd = null;
        this.routePath = [];
        this.routeDistance = 0;
      } else {
        this.routeEnd = this.selectedPoint;

        const [_, prev] = this.dijkstra.paths_from(this.routeStart.id);
        const path = this.dijkstra.paths_to(prev, this.routeEnd.id);
        this.routePath = path;
        this.routeDistance = this.getDistance(path);
        this.navigation.onClick();
      }

      // this.infoBox.updateContent("RouteStart", this.routeStart ? this.routeStart.id : "none");
      // this.infoBox.updateContent("RouteEnd", this.routeEnd ? this.routeEnd.id : "none");
      this.infoBox.updateContent("RouteDistance", this.routeDistance);
      this.updateMap(true);
    }
  }

  onCanvasMouseLeave() {
    this.isDragging = false;
  }

  async addLayer(id, label, file, enabled = true) {
    const layer = new Image();
    await new Promise((resolve, reject) => {
      layer.onload = () => resolve();
      layer.onerror = reject; // Fehlerbehandlung hinzufügen
      layer.src = file; // Setzen Sie den Dateipfad
    });
    this["layers"][id] = layer;
    this.contextMenu.addCheckbox(
      id,
      label,
      () => {
        this.updateMap(true);
      },
      enabled
    );

    this.updateMap(true);
  }

  addPoint(x, y, id) {
    this.points.push(new OTTPWorldPoint(x, y, id));
  }

  addRoute(from, to, weight) {
    this.dijkstra.addEdge(from, to, weight);
    this.paths.push([from, to, weight]);
  }

  onResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.updateMap();
  }

  zoomMap() {}

  updateMap(full = false) {
    if (full) {
      this.updateVMap();
    }
    this.drawMap();
  }

  drawMap() {
    // Größe der Karte
    const width = this.maxWidth * this.scaleFactor;
    const height = this.maxHeight * this.scaleFactor;
    // Clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    // Draw
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.translate(this.offset.X, this.offset.Y);
    this.ctx.scale(this.scaleFactor, this.scaleFactor);
    this.ctx.drawImage(this.vCanvas, 0, 0, width, height);
    this.ctx.restore();
  }

  updateVMap() {
    // Größe der Karte
    this.vCanvas.width = this.maxWidth;
    this.vCanvas.height = this.maxHeight;

    // Clear
    this.vCtx.clearRect(0, 0, this.maxWidth, this.maxHeight);
    this.vCtx.save();

    // Layer zeichnen
    for (const [id, layer] of Object.entries(this.layers)) {
      if (this.contextMenu.is(id)) {
        this.vCtx.drawImage(layer, 0, 0, this.maxWidth, this.maxHeight);
      }
    }

    // Route Zeichen (vor der Marker sonst werden die Marker übermalt)
    if (this.routeDistance > 0) {
      console.log(this.routePath);
      for (let i = 0; i < this.routePath.length - 1; i++) {
        const start = this.points.find((p) => p.id === this.routePath[i]);
        const end = this.points.find((p) => p.id === this.routePath[i + 1]);
        this.vCtx.beginPath();
        this.vCtx.moveTo(start.X, start.Y);
        this.vCtx.lineTo(end.X, end.Y);
        this.vCtx.strokeStyle = "#ff0000";
        this.vCtx.lineWidth = 5;
        this.vCtx.lineCap = "round";
        this.vCtx.stroke();
      }
    }

    // Marker zeichnen
    if (this.routeStart) {
      // this.infoBox.updateContent("RouteStart", this.routeStart.X + ":" + this.routeStart.Y);
      this.vCtx.drawImage(this.markerSet, this.routeStart.X - 5, this.routeStart.Y - 40, 40, 40);
    }

    if (this.routeEnd) {
      // this.infoBox.updateContent("RouteEnd", this.routeEnd.X + ":" + this.routeEnd.Y);
      this.vCtx.drawImage(this.markerSet, this.routeEnd.X - 5, this.routeEnd.Y - 40, 40, 40);
    }

    // Restore
    this.vCtx.restore();
  }

  drawMarker(x, y) {
    this.ctx.drawImage(this.markerPoint, x, y - 40, 40, 40);
  }

  getDistance(route) {
    let distance = 0; // Initialisiere distance

    for (let i = 0; i < route.length - 1; i++) {
      let a = route[i]; // Speichere das aktuelle Element in a
      let b = route[i + 1]; // Speichere das nächste Element in b

      this.paths.forEach((p) => {
        if (p[0] === a && p[1] === b) {
          distance += p[2]; // Addiere die Distanz, wenn die Bedingung erfüllt ist
        }
      });
    }

    return Math.round(distance * 100) / 100; // Runde die Distanz auf zwei Dezimalstellen
  }
}
