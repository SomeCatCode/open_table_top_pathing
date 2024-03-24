function parseLeafletPoint(pointData) {
  let id = pointData[2];
  let x = pointData[0];
  let y = 3175 - pointData[1];

  return {
    id: id,
    x: x,
    y: y,
  };
}

function parseLeafletEdge(edgeData) {
  let startPointId = edgeData[0];
  let endPointId = edgeData[1];
  let weight = edgeData[2];

  return {
    start: startPointId,
    end: endPointId,
    weight: weight,
  };
}

function XYFromEvent(event) {
  const x = Math.round(event.latlng.lng);
  const y = Math.round(3175 - event.latlng.lat);
  return { x: x, y: y };
}

function coordsTL2BL(coords) {
  const x = coords.x;
  const y = 3175 - coords.y;
  return { x: x, y: y };
}

function coordsBL2TL(coords) {
  const x = coords.x;
  const y = 3175 + coords.y;
  return { x: x, y: y };
}

// Nicht mehr Relevant in der Leaflet version
function findSimularPoints(array, tolerance = 0.002) {
  const duplicates = [];

  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      if ((array[i][2] = array[j][2])) {
        continue;
      }
      const dx = Math.abs(array[i][0] - array[j][0]);
      const dy = Math.abs(array[i][1] - array[j][1]);

      if (dx <= tolerance && dy <= tolerance) {
        duplicates.push([array[i][2], array[j][2]]);
      }
    }
  }

  return duplicates;
}

function getCleanPoint(points, duplicates) {
  // Erstelle ein Mapping von originalen IDs zu ihren Duplikaten
  const idMapping = {};
  duplicates.forEach(([originalId, duplicateId]) => {
    idMapping[originalId] = duplicateId;
  });

  // Ersetze die IDs in points mit den Duplikat-IDs, falls vorhanden
  const replacedPoints = points.map(([x, y, id]) => {
    if (idMapping[id]) {
      return [x, y, idMapping[id]]; // Ersetze ID durch Duplikat-ID
    }
    return [x, y, id]; // Kein Duplikat gefunden, verwende die ursprüngliche ID
  });

  return replacedPoints;
}
