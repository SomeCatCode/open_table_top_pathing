L.MouseMoveHandler = L.Handler.extend({
  initialize: function (map) {
    this._map = map;
  },

  addHooks() {
    this._map.on("mousemove", this._mousemove, this);
  },

  removeHooks() {
    this._map.off("mousemove", this._mousemove, this);
  },

  _mousemove(event) {
    const pos = XYFromEvent(event);
    document.getElementById("info").innerHTML = `X: ${pos.x}, Y: ${pos.y}`;
  },
});
