export interface UserProfile {
  name?: string;
  netIncome: number;
  budget: number;
  isBuying: boolean;
  workLocation?: { lat: number; lng: number; address: string };
  schoolLocations: { lat: number; lng: number; name: string }[];
  transportMode: 'car' | 'public' | 'ride-hailing';
  preferredType?: string;
  minBedrooms: number;
  lifestylePreferences: string[];
}

export interface PropertyMatch {
  id: string;
  title: string;
  price: number;
  score: number;
  breakdown: {
    affordability: number;
    commute: number;
    schools: number;
    transport: number;
    lifestyle: number;
    fit: number;
  };
  explanation: string;
}

/**
 * Calculates distance between two points in KM using Haversine formula
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function calculateSuitabilityScore(property: {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  features: string;
  propertyType: string;
  bedrooms: number;
}, profile: UserProfile): PropertyMatch {
  const breakdown = {
    affordability: 0,
    commute: 0,
    schools: 0,
    transport: 0,
    lifestyle: 0,
    fit: 0,
  };

  // 1. Affordability (30%)
  // Recommended ≤ 30% of net income
  const affordabilityRatio = property.price / profile.netIncome;
  if (affordabilityRatio <= 0.3) {
    breakdown.affordability = 30;
  } else if (affordabilityRatio <= 0.4) {
    breakdown.affordability = 20;
  } else if (affordabilityRatio <= 0.5) {
    breakdown.affordability = 10;
  } else {
    breakdown.affordability = 0;
  }

  // 2. Commute (20%)
  if (profile.workLocation) {
    const dist = getDistance(property.lat, property.lng, profile.workLocation.lat, profile.workLocation.lng);
    if (dist <= 5) breakdown.commute = 20;
    else if (dist <= 15) breakdown.commute = 15;
    else if (dist <= 30) breakdown.commute = 10;
    else breakdown.commute = 5;
  } else {
    breakdown.commute = 10; // Neutral if no work location
  }

  // 3. School Proximity (15%)
  if (profile.schoolLocations.length > 0) {
    const minSchoolDist = Math.min(...profile.schoolLocations.map(s => 
      getDistance(property.lat, property.lng, s.lat, s.lng)
    ));
    if (minSchoolDist <= 3) breakdown.schools = 15;
    else if (minSchoolDist <= 8) breakdown.schools = 10;
    else if (minSchoolDist <= 15) breakdown.schools = 5;
  } else {
    breakdown.schools = 15; // Max score if no children/schools needed
  }

  // 4. Transport Compatibility (15%)
  // Simple heuristic: if car owner, transport is less critical. If public, needs to be in urban area.
  // For now, let's assume a default high compatibility if not specified.
  breakdown.transport = 15;

  // 5. Lifestyle Match (10%)
  const propFeatures = JSON.parse(property.features || '[]');
  const matchCount = profile.lifestylePreferences.filter(pref => 
    propFeatures.some((f: string) => f.toLowerCase().includes(pref.toLowerCase()))
  ).length;
  breakdown.lifestyle = profile.lifestylePreferences.length > 0 
    ? (matchCount / profile.lifestylePreferences.length) * 10 
    : 10;

  // 6. Property Fit (10%)
  let fitScore = 0;
  if (property.bedrooms >= profile.minBedrooms) fitScore += 5;
  if (profile.preferredType && property.propertyType.toLowerCase() === profile.preferredType.toLowerCase()) fitScore += 5;
  breakdown.fit = fitScore;

  const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);

  // Generate explanation
  let explanation = `This property has a match score of ${Math.round(totalScore)}%. `;
  if (breakdown.affordability >= 20) explanation += "It's well within your affordability range. ";
  if (breakdown.commute >= 15) explanation += "It offers a very short commute to your workplace. ";
  if (breakdown.schools >= 10 && profile.schoolLocations.length > 0) explanation += "It's conveniently located near your children's schools. ";

  return {
    id: property.id,
    title: property.title,
    price: property.price,
    score: Math.round(totalScore),
    breakdown,
    explanation,
  };
}
