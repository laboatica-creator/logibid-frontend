// utils/rateCalculator.js
// Tasas mockeadas como fallback si la base de datos no está disponible.

const DEFAULT_RATES = {
  motorcycle: { base_rate_km: 250, base_rate_kg: 50, min_fare: 1000 },
  car: { base_rate_km: 400, base_rate_kg: 80, min_fare: 2000 },
  van: { base_rate_km: 600, base_rate_kg: 100, min_fare: 3000 },
  truck: { base_rate_km: 800, base_rate_kg: 120, min_fare: 5000 },
}

export const calculateSuggestedPrice = (distanceKm, weightKg, vehicleType, demandMultiplier = 1.0) => {
  const rates = DEFAULT_RATES[vehicleType] || DEFAULT_RATES['car'];
  
  const distanceCost = distanceKm * rates.base_rate_km;
  const weightCost = weightKg * rates.base_rate_kg;
  
  let total = distanceCost + weightCost + (demandMultiplier * 0.1 * distanceCost);
  
  if (total < rates.min_fare) total = rates.min_fare;
  
  return total;
}

// Simulador rudimentario de distancia basada en coordenadas
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
