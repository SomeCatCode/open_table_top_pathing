# OTTP - Open TableTop Pathing

OTTP (Open TableTop Pathing) ist ein JavaScript-Tool, das es ermöglicht, interaktive Karten mit Drag- und Zoom-Funktionalität für Tabletop-Spiele oder andere Anwendungen zu erstellen. Es unterstützt das Hinzufügen von Layern, das Platzieren von Punkten auf der Karte und die Berechnung von Pfaden zwischen Punkten mit dem Dijkstra-Algorithmus.

## Features

- **Drag- und Zoom-Funktionalität**: Ermöglicht es dem Benutzer, die Karte zu bewegen und den Zoom zu ändern.
- **Layer-Unterstützung**: Füge verschiedene Ebenen wie Hintergrund, Inseln, Namen und Routen hinzu.
- **Punkte und Pfade**: Platzieren Sie Punkte auf der Karte und berechnen Sie Pfade zwischen ihnen mit dem Dijkstra-Algorithmus.
- **Anpassbar**: Einfach zu integrieren und anzupassen für spezifische Anforderungen.

## Installation

Um OTTP in dein Projekt zu integrieren, kopiere einfach die `ottp.js` sowie die `ottp.css` in dein Projektverzeichnis und binde sie in deine HTML-Datei ein. Stelle sicher, dass du auch das Verzeichnis `assets` mit den Layern, Punkten und Routendaten in deinem Projekt hast.

## Verwendung

Füge die folgenden Zeilen in den `<head>`-Bereich deiner HTML-Datei ein:

```html
<link rel="stylesheet" href="./src/ottp.css" />
<script src="./src/ottp.js"></script>
<script src="./assets/point.js"></script>
<script src="./assets/routes.js"></script>
```

Initialisiere OTTP in einem eigenen <script>-Tag oder einer externen JavaScript-Datei:

```js
// Klasse OTTP erzeugen
const ottp = new OTTP();

// Füge Layer hinzu
ottp.addLayer(0, "Layer: Background", "./assets/layer_0.png", true);

// Punkte laden - addPoint(x, y, pointId, Name(optional), Beschreibung(optional))
for (let i = 0; i < points.length; i++) {
  ottp.addPoint(points[i][0], points[i][1], points[i][2] * 1, points[i][3] || null, points[i][4] || null);
}

// Routen laden - addRoute(startPointId, endPointId, routeWeight)
for (let i = 0; i < routes.length; i++) {
  ottp.addRoute(routes[i][0] * 1, routes[i][1] * 1, routes[i][2]);
}
ottp.init();
```

## Beispiel

siehe index.html

## Beitrag

Wir freuen uns über Beiträge von der Community. Wenn du einen Fehler findest, eine Funktion anfragen möchtest oder einen Pull-Request einreichen möchtest, zögere nicht, das zu tun.

## TODO

- Assets für Beispiel/Demo bereitstellen
- Nutzung der Tools erklären btw Workflow

## Credits

- [ChaoticEvilDM](https://github.com/ChaoticEvilDM) : Idee und Tools

## Lizenz

Dieses Projekt ist unter der GPL-3.0-Lizenz lizenziert - siehe die LICENSE.md Datei für Details.
