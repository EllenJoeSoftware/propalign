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

// Mirrors the Property table columns from schema.sql
export interface PropertyRow {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  lat: number;
  lng: number;
  features: string;       // JSON string e.g. '["Security","Pool"]'
  imageUrl?: string | null;
  isForRent: boolean;
}

export interface PropertyMatch {
  id: string;
  title: string;
  price: number;
  location: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl?: string | null;
  isForRent: boolean;
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

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function calculateSuitabilityScore(
  property: PropertyRow,
  profile: UserProfile
): PropertyMatch {
  const breakdown = {
    affordability: 0,
    commute: 0,
    schools: 0,
    transport: 0,
    lifestyle: 0,
    fit: 0,
  };

  // 1. Affordability (30%)
  // Use budget if set, else fall back to 30% of netIncome
  const cap = profile.budget > 0 ? profile.budget : profile.netIncome * 0.3;
  const ratio = cap > 0 ? property.price / cap : 1;
  if (ratio <= 0.8) breakdown.affordability = 30;
  else if (ratio <= 1.0) breakdown.affordability = 20;
  else if (ratio <= 1.2) breakdown.affordability = 10;
  else breakdown.affordability = 0;

  // 2. Commute (20%)
  if (profile.workLocation) {
    const dist = getDistance(property.lat, property.lng, profile.workLocation.lat, profile.workLocation.lng);
    if (dist <= 5) breakdown.commute = 20;
    else if (dist <= 15) breakdown.commute = 15;
    else if (dist <= 30) breakdown.commute = 10;
    else breakdown.commute = 5;
  } else {
    breakdown.commute = 10; // neutral
  }

  // 3. School Proximity (15%)
  if (profile.schoolLocations.length > 0) {
    const minDist = Math.min(
      ...profile.schoolLocations.map(s =>
        getDistance(property.lat, property.lng, s.lat, s.lng)
      )
    );
    if (minDist <= 3) breakdown.schools = 15;
    else if (minDist <= 8) breakdown.schools = 10;
    else if (minDist <= 15) breakdown.schools = 5;
  } else {
    breakdown.schools = 15; // no schools needed = full score
  }

  // 4. Transport Compatibility (15%)
  const features: string[] = JSON.parse(property.features || '[]');
  const featureLower = features.map(f => f.toLowerCase());
  if (profile.transportMode === 'public') {
    breakdown.transport = featureLower.some(f => f.includes('transport') || f.includes('central'))
      ? 15 : 8;
  } else {
    breakdown.transport = 15; // car owners aren't penalised
  }

  // 5. Lifestyle Match (10%)
  const matchCount = profile.lifestylePreferences.filter(pref =>
    featureLower.some(f => f.includes(pref.toLowerCase()))
  ).length;
  breakdown.lifestyle = profile.lifestylePreferences.length > 0
    ? Math.round((matchCount / profile.lifestylePreferences.length) * 10)
    : 10;

  // 6. Property Fit (10%)
  let fitScore = 0;
  if (property.bedrooms >= profile.minBedrooms) fitScore += 5;
  if (
    profile.preferredType &&
    property.propertyType.toLowerCase() === profile.preferredType.toLowerCase()
  ) fitScore += 5;
  else if (!profile.preferredType) fitScore += 5; // no preference = full fit
  breakdown.fit = fitScore;

  const totalScore = Math.min(
    100,
    Math.round(Object.values(breakdown).reduce((a, b) => a + b, 0))
  );

  // Build explanation
  const parts: string[] = [];
  if (breakdown.affordability >= 20) parts.push("well within your budget");
  if (breakdown.commute >= 15) parts.push("short commute to work");
  if (breakdown.schools >= 10 && profile.schoolLocations.length > 0)
    parts.push("close to schools");
  if (breakdown.lifestyle >= 7) parts.push("matches your lifestyle preferences");
  if (breakdown.fit >= 8) parts.push("right property type and size");

  const explanation = parts.length > 0
    ? `${totalScore}% match — ${parts.join(', ')}.`
    : `${totalScore}% match based on your requirements.`;

  return {
    id: property.id,
    title: property.title,
    price: property.price,
    location: property.location,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    imageUrl: property.imageUrl,
    isForRent: property.isForRent,
    score: totalScore,
    breakdown,
    explanation,
  };
}
