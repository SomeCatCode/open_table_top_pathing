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

  addEdge(start, end, weight = 0) {
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
  constructor() {
    this.labelPrefix = "ottp-layer-";
    this.button = document.getElementById("ottp-filter-button");
    this.context = document.getElementById("ottp-filter-content");
  }

  init() {
    this.button.addEventListener("click", () => {
      this.context.classList.toggle("open");
    });
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
  constructor() {
    this.button = document.getElementById("ottp-action-navigation");
    this.button.addEventListener("click", this.onClick.bind(this));
  }

  isRunning() {
    return this.button.classList.contains("running");
  }

  onClick() {
    this.button.classList.toggle("running");
    this.button.innerHTML = this.isRunning() ? "Stop Navigation" : "Start Navigation";
  }
}

class OTTPWorldPoint {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.color = "#ff0000";
    this.radius = 10;
    this.id = id;
    this.highlighted = false;
  }

  highlight(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.highlighted = distance < this.radius;
    return this.highlighted;
  }

  compare(x, y, worldPoint) {
    const dxThis = this.x - x;
    const dyThis = this.y - y;
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
    this.navigation = new OTTPNavigation();
    this.dijkstra = new OTTPGraph();
    // Kontext-Menu
    this.filterButton = document.getElementById("ottp-filter-button");
    this.filterContext = document.getElementById("ottp-filter-content");
    // Real canvas
    this.canvas = document.getElementById("ottp-map");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    // Virtual canvas
    this.vCanvas = document.createElement("canvas");
    this.vCtx = this.vCanvas.getContext("2d");
    // Data
    this.layers = {};
    this.points = [];
    this.isDragging = false;
    this.maxWidth = 3439;
    this.maxHeight = 3175;
    this.scaleFactor = 1;
    this.offset = { X: 0, Y: 0 };
    this.clickStart = { X: 0, Y: 0 };
    this.selectedPoint = null;
    this.routeStart = null;
    this.routeEnd = null;
  }

  init() {
    // Event-Listener
    window.addEventListener("resize", this.onResize.bind(this));
    this.canvas.addEventListener("wheel", this.zoomMap.bind(this));
    this.canvas.addEventListener("mousedown", this.onCanvasMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.onCanvasMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.onCanvasMouseUp.bind(this));
    this.canvas.addEventListener("mouseleave", this.onCanvasMouseLeave.bind(this));

    // Menu auf/zu
    this.filterButton.addEventListener("click", () => {
      this.filterContext.classList.toggle("open");
    });

    // Debug
    if (this.debug) {
      this.infoBox.updateContent("Debug", "true");
      this.infoBox.show();
    }

    // Scale
    this.onResize();
  }

  onCanvasMouseDown(event) {
    this.isDragging = true;
    this.clickStart.X = event.clientX - this.offset.X;
    this.clickStart.Y = event.clientY - this.offset.Y;
  }

  updateSelectedPoint(x, y) {
    let highlightedPoints = [];
    // Sammel alle Punkte ein, die hervorgehoben werden
    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i].highlight(x, y)) {
        highlightedPoints.push(this.points[i]);
      }
    }
    // bestimme den nähsten Punkt
    if (highlightedPoints.length == 1) {
      this.selectedPoint = highlightedPoints[0];
      this.infoBox.updateContent("Highlighted Point", this.selectedPoint.id);
    } else if (highlightedPoints.length > 0) {
      this.selectedPoint = highlightedPoints[0];
      for (let i = 0; i < highlightedPoints.length - 1; i++) {
        this.selectedPoint = this.selectedPoint.compare(x, y, highlightedPoints[i + 1]);
      }
      this.infoBox.updateContent("Highlighted Point", this.selectedPoint.id);
    } else {
      this.infoBox.updateContent("Highlighted Point", "none");
      this.selectedPoint = null;
    }
  }

  onCanvasMouseMove(event) {
    this.infoBox.updateContent("real X", event.clientX);
    this.infoBox.updateContent("real Y", event.clientY);

    let x = event.clientX - this.offset.X;
    let y = event.clientY - this.offset.Y;
    this.infoBox.updateContent("X", x);
    this.infoBox.updateContent("Y", y);

    this.infoBox.updateContent("offsetX", this.offset.X);
    this.infoBox.updateContent("offsetY", this.offset.Y);

    if (this.navigation.isRunning()) {
      this.updateSelectedPoint(x, y);
      if (this.selectedPoint) {
        // Punkt zeichnen
        let drawX = this.selectedPoint.x + this.offset.X;
        let drawY = this.selectedPoint.y + this.offset.Y;
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
      } else {
        this.routeEnd = this.selectedPoint;
      }
      this.infoBox.updateContent("RouteStart", this.routeStart.id);
      this.infoBox.updateContent("RouteEnd", this.routeEnd.id);
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
        this.updateVMap();
        this.drawMap();
      },
      enabled
    );

    this.updateVMap();
    this.drawMap();
  }

  addPoint(x, y, id) {
    this.points.push(new OTTPWorldPoint(x, y, id));
  }

  addRoute(from, to, weight) {
    this.dijkstra.addEdge(from, to, weight);
  }

  onResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.drawMap();
  }

  zoomMap() {}

  drawMap() {
    // Größe der Karte
    const width = this.maxWidth * this.scaleFactor;
    const height = this.maxHeight * this.scaleFactor;
    // Clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    // Draw
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

    for (const [id, layer] of Object.entries(this.layers)) {
      if (this.contextMenu.is(id)) {
        this.vCtx.drawImage(layer, 0, 0, this.maxWidth, this.maxHeight);
      }
    }

    if (this.navigation.isRunning()) {
      if (this.navigationStart.X !== 0 && this.navigationStart.Y !== 0) {
        this.infoBox.updateContent("Start", this.navigationStart.X + ":" + this.navigationStart.Y);
        this.drawSetMarker(this.navigationStart.X, this.navigationStart.Y);
      }
    }

    // Restore
    this.vCtx.restore();
  }

  drawMarker(x, y) {
    this.infoBox.updateContent("Marker", x + ":" + y);
    let img = new Image();
    img.src = "./src/marker.png";
    this.ctx.drawImage(img, x, y - 40, 40, 40);
  }

  drawSetMarker(x, y) {
    this.infoBox.updateContent("SetMarker", x + ":" + y);
    let img = new Image();
    img.src = "./src/marker_set.png";
    this.vCtx.drawImage(img, x - 20, y - 40, 40, 40);
  }
}
