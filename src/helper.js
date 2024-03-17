function findSimularPoints(array, tolerance = 0.002) {
  const duplicates = [];

  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      if(array[i][2] = array[j][2]){
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
