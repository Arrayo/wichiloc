export const getElevationStats = (elevationData) => {
  if (!elevationData || elevationData.length === 0) return null;

  let totalAscent = 0;
  let totalDescent = 0;
  let maxElevation = elevationData[0].elevation;
  let minElevation = elevationData[0].elevation;

  for (let i = 1; i < elevationData.length; i++) {
    const diff = elevationData[i].elevation - elevationData[i - 1].elevation;
    if (diff > 0) totalAscent += diff;
    if (diff < 0) totalDescent += Math.abs(diff);
    maxElevation = Math.max(maxElevation, elevationData[i].elevation);
    minElevation = Math.min(minElevation, elevationData[i].elevation);
  }

  return {
    totalDistance: (elevationData[elevationData.length - 1].distance / 1000).toFixed(2),
    totalAscent: Math.round(totalAscent),
    totalDescent: Math.round(totalDescent),
    maxElevation: Math.round(maxElevation),
    minElevation: Math.round(minElevation),
  };
};
