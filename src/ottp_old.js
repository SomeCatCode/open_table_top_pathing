class OTTPWorldFilter {
  constructor(callback) {
    this.filterButton = document.getElementById("ottp-filter-button");

    this.filter = document.getElementById("ottp-filter-content");
    this.filterButton = document.getElementById("ottp-filter-content");
    this.filterButton.addEventListener("click", () => {
      this.filter.classList.toggle("open");
    });

    this.filterElements = ["layer_0", "layer_1", "layer_2", "layer_3", "info_coordinated"];
    this.filterElements.forEach((element) => {
      const filterElement = document.getElementById(element);
      filterElement.addEventListener("change", () => {
        callback();
      });
      this[element] = filterElement;
    });
  }
  getLayer0() {
    return this.layer_0.checked;
  }
  getLayer1() {
    return this.layer_1.checked;
  }
  getLayer2() {
    return this.layer_2.checked;
  }
  getLayer3() {
    return this.layer_3.checked;
  }
  getCoords() {
    return this.info_coordinated.checked;
  }
}

class OTTPWorldPoint {
  constructor(ctx, x, y, name, info) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.color = "#ff0000";
    this.radius = 10;
    this.name = name;
    this.info = info;
    this.highlighted = true;
  }

  draw() {
    if (this.highlighted) {
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = this.color;
      this.ctx.fill();
    }
  }

  highlight(mouseX, mouseY) {
    let oldHighlighted = this.highlighted;
    let distance = Math.sqrt(Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2));
    this.highlighted = distance <= this.radius;
    return oldHighlighted != this.highlighted; // true if highlighted changed
  }
}

class OTTPWorldInfo {
  constructor() {
    this.box = document.getElementById("ottp-info-box");
  }
  getContent() {
    return this.box.innerHTML;
  }
  updateContent(content) {
    this.box.innerHTML = content;
  }
  showInfo() {
    this.box.style.display = "block";
  }
  hideInfo() {
    this.box.style.display = "none";
  }
}

class OTTP {
  constructor() {
    // Data
    this.maxWidth = 3439;
    this.maxHeight = 3175;
    this.scaleFactor = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    // Virtual canvas
    this.vCanvas = document.createElement("canvas");
    this.vCtx = this.vCanvas.getContext("2d");
    // Real canvas
    this.canvas = document.getElementById("ottp-map");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    // Points
    this.points = [];
    // Info
    this.info = new OTTPWorldInfo();

    window.addEventListener("resize", this.onResize.bind(this));
    this.canvas.addEventListener("wheel", this.zoomMap.bind(this));

    this.filter = new OTTPWorldFilter(() => {
      this.loadVectorMap();
      this.drawMap();
      if (this.filter.getCoords()) {
        this.info.showInfo();
      } else {
        this.info.hideInfo();
      }
    });

    this.navigateMap();

    this.layer0 = new Image();
    this.layer0.src = "./assets/layer_0.svg";
    this.layer0.onload = () => {
      this.layer1 = new Image();
      this.layer1.src = "./assets/layer_1.svg";
      this.layer1.onload = () => {
        this.layer2 = new Image();
        this.layer2.src = "./assets/layer_2.svg";
        this.layer2.onload = () => {
          this.loadVectorMap();
          this.drawMap();
        };
      };
    };
  }

  onResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.drawMap();
  }

  loadVectorMap() {
    // Größe der Karte
    this.vCanvas.width = this.maxWidth;
    this.vCanvas.height = this.maxHeight;
    // Clear
    this.vCtx.clearRect(0, 0, this.maxWidth, this.maxHeight);
    this.vCtx.save();
    // Base Layer
    if (this.filter.getLayer0()) {
      this.vCtx.drawImage(this.layer0, 0, 0, this.maxWidth, this.maxHeight);
    }
    // Labels Layer
    if (this.filter.getLayer1()) {
      this.vCtx.drawImage(this.layer1, 0, 0, this.maxWidth, this.maxHeight);
    }
    // Routes Layer
    if (this.filter.getLayer2()) {
      this.vCtx.drawImage(this.layer2, 0, 0, this.maxWidth, this.maxHeight);
    }
    // Points Layer
    if (this.filter.getLayer3()) {
      this.points.forEach((point) => {
        point.draw();
      });
    }
    // Restore
    this.vCtx.restore();
  }

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

  zoomMap(event) {
    event.preventDefault();
    return;
    const oldWidth = this.maxWidth * this.scaleFactor;
    const oldHeight = this.maxHeight * this.scaleFactor;

    const delta = event.deltaY || event.detail || event.wheelDelta;
    this.scaleFactor = delta < 0 ? this.scaleFactor * 1.1 : this.scaleFactor / 1.1;

    const newWidth = this.maxWidth * this.scaleFactor;
    const newHeight = this.maxHeight * this.scaleFactor;

    this.offsetX -= (newWidth - oldWidth) / 2;
    this.offsetY -= (newHeight - oldHeight) / 2;
    this.drawMap();
  }

  navigateMap() {
    let isDragging = false;
    let startCoords = { x: 0, y: 0 };

    this.canvas.addEventListener("mousedown", (event) => {
      isDragging = true;
      startCoords.x = event.clientX - this.offsetX;
      startCoords.y = event.clientY - this.offsetY;
    });

    this.canvas.addEventListener("mousemove", (event) => {
      let x = event.clientX - this.offsetX;
      let y = event.clientY - this.offsetY;
      this.info.updateContent("X:" + x + " Y:" + y);

      this.points.forEach((point) => {
        if (point.highlight(x, y)) {
          this.loadVectorMap();
        }
      });
      this.drawMap();

      if (!isDragging) {
        return;
      }
      this.offsetX = event.clientX - startCoords.x;
      this.offsetY = event.clientY - startCoords.y;

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
    });

    this.canvas.addEventListener("mouseup", () => {
      isDragging = false;
    });

    this.canvas.addEventListener("mouseleave", () => {
      isDragging = false;
    });
  }
}
