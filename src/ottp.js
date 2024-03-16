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
}

class OTTP {
  constructor() {
    this.debug = true;
    // Components
    this.infoBox = new OTTPInfoBox();
    this.contextMenu = new OTTPContextMenu();
    this.navigation = new OTTPNavigation();
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
    this.offsetX = 0;
    this.offsetY = 0;
    this.clickStartX = 0;
    this.clickStartY = 0;
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
    this.clickStartX = event.clientX - this.offsetX;
    this.clickStartY = event.clientY - this.offsetY;
  }

  onCanvasMouseMove(event) {
    let x = event.clientX - this.offsetX;
    let y = event.clientY - this.offsetY;
    this.infoBox.updateContent("X", x);
    this.infoBox.updateContent("Y", y);

    this.infoBox.updateContent("offsetX", this.offsetX);
    this.infoBox.updateContent("offsetY", this.offsetY);

    let highlightedPoints = [];
    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i].highlight(x, y)) {
        highlightedPoints.push(this.points[i]);
      }
    }
    if(highlightedPoints.length > 0) {
      this.infoBox.updateContent("Highlighted Points", highlightedPoints.map(p => p.id).join(", "));
    } else {
      this.infoBox.updateContent("Highlighted Points", "none");
    }


    // this.points.forEach((point) => {
    //   if (point.highlight(x, y)) {
    //     this.loadVectorMap();
    //   }
    // });
    // this.drawMap();

    if (!this.isDragging) {
      return;
    }

    this.offsetX = event.clientX - this.clickStartX;
    this.offsetY = event.clientY - this.clickStartY;

    const w = this.maxWidth * this.scaleFactor;
    const h = this.maxHeight * this.scaleFactor;
    const w2 = this.canvas.width / 2;
    const h2 = this.canvas.height / 2;

    if (this.offsetX > w2) {
      this.offsetX = w2;
    }
    if (this.offsetX < -1 * w + w2) {
      this.offsetX = -1 * w + w2;
    }

    if (this.offsetY > h2) {
      this.offsetY = h2;
    }
    if (this.offsetY < -1 * h + h2) {
      this.offsetY = -1 * h + h2;
    }

    this.drawMap();
  }

  onCanvasMouseUp() {
    this.isDragging = false;
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
        this.infoBox.updateContent("Layer_" + id, this.contextMenu.is(id));
        this.updateVMap();
        this.drawMap();
      },
      enabled
    );

    this.updateVMap();
    this.drawMap();
    this.infoBox.updateContent("Layer_" + id, this.contextMenu.is(id));
  }

  addPoint(x, y, id) {
    this.points.push(new OTTPWorldPoint(x, y, id));
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
    this.ctx.translate(this.offsetX, this.offsetY);
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

    // Restore
    this.vCtx.restore();
  }
}
