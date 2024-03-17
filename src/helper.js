function findSimularPoints(array, tolerance = 0.0003) {
  const duplicates = [];

  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      const dx = Math.abs(array[i][0] - array[j][0]);
      const dy = Math.abs(array[i][1] - array[j][1]);

      if (dx <= tolerance && dy <= tolerance) {
        duplicates.push([array[i][2], array[j][2]]);
      }
    }
  }

  return duplicates;
}
