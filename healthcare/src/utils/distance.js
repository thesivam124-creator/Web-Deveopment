// Distance & time helper utilities with Haversine Geolocation formula

export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10;
}

export function calculateEtaMinutes(distanceKm, speedKmh = 35) {
  // Speed is average city traffic emergency speed (35 km/h)
  const timeHours = distanceKm / speedKmh;
  const timeMinutes = Math.round(timeHours * 60);
  return Math.max(2, timeMinutes); // Minimum 2 mins
}

export function sortFacilitiesByDistance(facilities) {
  return [...facilities].sort((a, b) => a.distanceKm - b.distanceKm);
}

export function sortFacilitiesByWaitTime(facilities) {
  return [...facilities].sort((a, b) => a.erWaitTimeMinutes - b.erWaitTimeMinutes);
}

export function generatePriorityToken(facilityId, doctorId = 'EMERGENCY') {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const timeStamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(' ', '');
  return `CP-${facilityId.toUpperCase().slice(-3)}-${randomNum}-${timeStamp}`;
}
