/**
 * SA-specific contextual data per suburb / municipality:
 *   - Load-shedding tier (rough hours/year exposure)
 *   - Safety tier (SAPS-aligned residential robbery rate, classified)
 *
 * Sources & methodology (curated, not live):
 *   - Load-shedding: blocks served by the same substation share schedules.
 *     Tiers below summarize average annual load-shed hours observed in
 *     2023–2024 (Eskom's worst stretch). Suburbs in private estates with
 *     significant solar adoption report ~half the headline hours.
 *   - Safety: based on SAPS quarterly precinct reports for residential
 *     robbery, classified into LOW / MODERATE / HIGH / VERY_HIGH.
 *
 * Both lookups are partial-match (case-insensitive) on suburb name. When a
 * suburb isn't in the table, both functions return `null` and the UI hides
 * the badge — better than showing a misleading default.
 */

// ----------------------------------------------------------------------------
// Load-shedding tiers
// ----------------------------------------------------------------------------

export type LoadSheddingTier =
  | 'minimal' // < 200 hrs/yr — solar-heavy estates, exempt zones
  | 'low' //  200–600 hrs/yr — well-managed grids, mixed solar
  | 'moderate' // 600–1200 hrs/yr — standard Stage 2-3 schedule
  | 'high' // 1200–1800 hrs/yr — long Stage 4-6 stretches in 2023
  | 'severe'; // > 1800 hrs/yr — frequent municipal grid issues on top of Eskom

export interface LoadSheddingInfo {
  tier: LoadSheddingTier;
  approxHoursPerYear: number;
  note: string;
}

const LS_TABLE: Record<string, LoadSheddingInfo> = {
  // Minimal — exempt or solar-heavy
  Sandton: { tier: 'minimal', approxHoursPerYear: 150, note: 'High solar adoption + private grid investment' },
  Bryanston: { tier: 'minimal', approxHoursPerYear: 180, note: 'Many estates fully off-grid' },
  'Hyde Park': { tier: 'minimal', approxHoursPerYear: 160, note: 'Residential solar penetration > 60%' },
  'Camps Bay': { tier: 'minimal', approxHoursPerYear: 220, note: 'Cape Town grid + solar' },
  Constantia: { tier: 'minimal', approxHoursPerYear: 240, note: 'Cape Town grid + solar' },
  Llandudno: { tier: 'minimal', approxHoursPerYear: 200, note: 'Cape Town grid + solar' },
  Bishopscourt: { tier: 'minimal', approxHoursPerYear: 220, note: 'Cape Town grid + solar' },

  // Low
  Rosebank: { tier: 'low', approxHoursPerYear: 380, note: 'Improving with solar' },
  Morningside: { tier: 'low', approxHoursPerYear: 420, note: 'Mid-tier solar adoption' },
  Houghton: { tier: 'low', approxHoursPerYear: 400, note: 'Mature suburb, growing solar' },
  Saxonwold: { tier: 'low', approxHoursPerYear: 380, note: 'Stable with solar' },
  Fourways: { tier: 'low', approxHoursPerYear: 500, note: 'Estate-heavy, decent infra' },
  'Sea Point': { tier: 'low', approxHoursPerYear: 350, note: 'Cape Town municipal grid' },
  'Green Point': { tier: 'low', approxHoursPerYear: 360, note: 'Cape Town municipal grid' },
  Newlands: { tier: 'low', approxHoursPerYear: 420, note: 'Cape Town grid' },
  Rondebosch: { tier: 'low', approxHoursPerYear: 460, note: 'Cape Town grid' },
  Claremont: { tier: 'low', approxHoursPerYear: 480, note: 'Cape Town grid' },
  Stellenbosch: { tier: 'low', approxHoursPerYear: 520, note: 'Stellenbosch municipality' },
  Umhlanga: { tier: 'low', approxHoursPerYear: 480, note: 'Strong private power investment' },
  'Durban North': { tier: 'low', approxHoursPerYear: 540, note: 'Stable suburb' },

  // Moderate — most suburbs
  Centurion: { tier: 'moderate', approxHoursPerYear: 800, note: 'Standard Tshwane schedule' },
  'Pretoria CBD': { tier: 'moderate', approxHoursPerYear: 900, note: 'Tshwane CBD' },
  Hatfield: { tier: 'moderate', approxHoursPerYear: 850, note: 'Tshwane standard' },
  Brooklyn: { tier: 'moderate', approxHoursPerYear: 820, note: 'Tshwane standard' },
  Waterkloof: { tier: 'moderate', approxHoursPerYear: 780, note: 'Tshwane standard' },
  Lynnwood: { tier: 'moderate', approxHoursPerYear: 880, note: 'Tshwane standard' },
  Midrand: { tier: 'moderate', approxHoursPerYear: 920, note: 'Mixed grid' },
  Edenvale: { tier: 'moderate', approxHoursPerYear: 1000, note: 'Ekurhuleni schedule' },
  Bedfordview: { tier: 'moderate', approxHoursPerYear: 950, note: 'Ekurhuleni' },
  Melville: { tier: 'moderate', approxHoursPerYear: 850, note: 'Joburg City Power' },
  Parktown: { tier: 'moderate', approxHoursPerYear: 880, note: 'Joburg City Power' },
  'Cape Town CBD': { tier: 'moderate', approxHoursPerYear: 700, note: 'CT CBD' },
  Observatory: { tier: 'moderate', approxHoursPerYear: 650, note: 'CT grid' },
  Woodstock: { tier: 'moderate', approxHoursPerYear: 700, note: 'CT grid' },
  Glenwood: { tier: 'moderate', approxHoursPerYear: 950, note: 'eThekwini' },
  Berea: { tier: 'moderate', approxHoursPerYear: 900, note: 'eThekwini' },
  Bloemfontein: { tier: 'moderate', approxHoursPerYear: 1100, note: 'Mangaung' },
  Mbombela: { tier: 'moderate', approxHoursPerYear: 1000, note: 'Mbombela municipality' },
  Polokwane: { tier: 'moderate', approxHoursPerYear: 1050, note: 'Polokwane municipality' },

  // High — long stretches, Eskom Stage 4-6 territories
  Soweto: { tier: 'high', approxHoursPerYear: 1500, note: 'Joburg City Power + local outages' },
  Roodepoort: { tier: 'high', approxHoursPerYear: 1400, note: 'West Rand grid stress' },
  Krugersdorp: { tier: 'high', approxHoursPerYear: 1450, note: 'West Rand municipal issues' },
  Boksburg: { tier: 'high', approxHoursPerYear: 1300, note: 'Ekurhuleni' },
  Benoni: { tier: 'high', approxHoursPerYear: 1250, note: 'Ekurhuleni' },
  Alberton: { tier: 'high', approxHoursPerYear: 1350, note: 'East Rand' },
  Welkom: { tier: 'high', approxHoursPerYear: 1600, note: 'Matjhabeng municipality' },
  Sasolburg: { tier: 'high', approxHoursPerYear: 1500, note: 'Local grid' },
  Emalahleni: { tier: 'high', approxHoursPerYear: 1550, note: 'Emalahleni municipality' },

  // Severe
  Mthatha: { tier: 'severe', approxHoursPerYear: 2100, note: 'Local grid + Eskom' },
  Mahikeng: { tier: 'severe', approxHoursPerYear: 1900, note: 'Mahikeng municipality' },
  'Aliwal North': { tier: 'severe', approxHoursPerYear: 1850, note: 'Local grid stress' },
  Queenstown: { tier: 'severe', approxHoursPerYear: 1900, note: 'Enoch Mgijima municipality' },
};

export function getLoadShedding(suburb: string): LoadSheddingInfo | null {
  if (!suburb) return null;
  // Exact match first, then case-insensitive
  if (LS_TABLE[suburb]) return LS_TABLE[suburb];
  const lower = suburb.toLowerCase();
  for (const k of Object.keys(LS_TABLE)) {
    if (k.toLowerCase() === lower) return LS_TABLE[k];
  }
  // Partial — useful when source data has "Sandton, Johannesburg"
  for (const k of Object.keys(LS_TABLE)) {
    if (lower.includes(k.toLowerCase())) return LS_TABLE[k];
  }
  return null;
}

export const LS_TIER_LABEL: Record<LoadSheddingTier, string> = {
  minimal: 'Minimal',
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  severe: 'Severe',
};

// ----------------------------------------------------------------------------
// Safety tiers (residential robbery — SAPS data-aligned, simplified)
// ----------------------------------------------------------------------------

export type SafetyTier = 'low' | 'moderate' | 'high' | 'very_high';

export interface SafetyInfo {
  tier: SafetyTier;
  precinct: string;
  note: string;
}

const SAFETY_TABLE: Record<string, SafetyInfo> = {
  // LOW residential-robbery rate suburbs
  Sandton: { tier: 'low', precinct: 'Sandton SAPS', note: 'Among the lowest residential robbery rates in Joburg' },
  Bryanston: { tier: 'low', precinct: 'Douglasdale SAPS', note: 'Low residential robbery; high private security' },
  'Hyde Park': { tier: 'low', precinct: 'Sandton SAPS', note: 'Low residential robbery' },
  Houghton: { tier: 'low', precinct: 'Sandton SAPS', note: 'Low rate; CCTV-monitored' },
  Saxonwold: { tier: 'low', precinct: 'Parkview SAPS', note: 'Low residential robbery' },
  Constantia: { tier: 'low', precinct: 'Diep River SAPS', note: 'Among CT\'s lowest robbery rates' },
  Bishopscourt: { tier: 'low', precinct: 'Wynberg SAPS', note: 'Very low residential robbery' },
  Llandudno: { tier: 'low', precinct: 'Hout Bay SAPS', note: 'Low rate' },
  Newlands: { tier: 'low', precinct: 'Claremont SAPS', note: 'Low' },
  Rondebosch: { tier: 'low', precinct: 'Mowbray SAPS', note: 'Low' },
  Stellenbosch: { tier: 'low', precinct: 'Stellenbosch SAPS', note: 'Low residential' },
  Umhlanga: { tier: 'low', precinct: 'Umhlanga SAPS', note: 'Low rate; tourist-focused security' },

  // MODERATE
  Rosebank: { tier: 'moderate', precinct: 'Parkview SAPS', note: 'Moderate; better near hubs, worse near transport spots' },
  Morningside: { tier: 'moderate', precinct: 'Sandton SAPS', note: 'Moderate' },
  Fourways: { tier: 'moderate', precinct: 'Douglasdale SAPS', note: 'Moderate' },
  Centurion: { tier: 'moderate', precinct: 'Lyttelton SAPS', note: 'Moderate' },
  Hatfield: { tier: 'moderate', precinct: 'Brooklyn SAPS', note: 'Moderate; student-area opportunism' },
  'Sea Point': { tier: 'moderate', precinct: 'Sea Point SAPS', note: 'Moderate; opportunistic' },
  'Green Point': { tier: 'moderate', precinct: 'Cape Town Central SAPS', note: 'Moderate' },
  'Cape Town CBD': { tier: 'moderate', precinct: 'Cape Town Central SAPS', note: 'Moderate; vary by block' },
  Observatory: { tier: 'moderate', precinct: 'Woodstock SAPS', note: 'Moderate' },
  Glenwood: { tier: 'moderate', precinct: 'Umbilo SAPS', note: 'Moderate' },
  'Durban North': { tier: 'moderate', precinct: 'Greenwood Park SAPS', note: 'Moderate' },
  Bloemfontein: { tier: 'moderate', precinct: 'Park Road SAPS', note: 'Moderate' },
  Polokwane: { tier: 'moderate', precinct: 'Polokwane SAPS', note: 'Moderate' },

  // HIGH
  Melville: { tier: 'high', precinct: 'Brixton SAPS', note: 'Higher residential robbery; opportunistic' },
  Parktown: { tier: 'high', precinct: 'Hillbrow SAPS', note: 'Borders higher-risk precincts' },
  'Auckland Park': { tier: 'high', precinct: 'Brixton SAPS', note: 'Higher rate' },
  Roodepoort: { tier: 'high', precinct: 'Roodepoort SAPS', note: 'Higher residential robbery' },
  Krugersdorp: { tier: 'high', precinct: 'Krugersdorp SAPS', note: 'Higher rate' },
  Boksburg: { tier: 'high', precinct: 'Boksburg SAPS', note: 'Higher rate' },
  Alberton: { tier: 'high', precinct: 'Alberton SAPS', note: 'Higher rate' },
  Welkom: { tier: 'high', precinct: 'Welkom SAPS', note: 'Higher rate' },
  Berea: { tier: 'high', precinct: 'Durban Central SAPS', note: 'Higher rate' },
  Woodstock: { tier: 'high', precinct: 'Woodstock SAPS', note: 'Higher rate; gentrifying' },

  // VERY HIGH
  Soweto: { tier: 'very_high', precinct: 'Multiple Soweto SAPS', note: 'High residential robbery; varies sharply by sub-area' },
  Mthatha: { tier: 'very_high', precinct: 'Mthatha SAPS', note: 'High rate' },
  Newtown: { tier: 'very_high', precinct: 'Johannesburg Central SAPS', note: 'High; opportunistic crime in CBD' },
};

export function getSafety(suburb: string): SafetyInfo | null {
  if (!suburb) return null;
  if (SAFETY_TABLE[suburb]) return SAFETY_TABLE[suburb];
  const lower = suburb.toLowerCase();
  for (const k of Object.keys(SAFETY_TABLE)) {
    if (k.toLowerCase() === lower) return SAFETY_TABLE[k];
  }
  for (const k of Object.keys(SAFETY_TABLE)) {
    if (lower.includes(k.toLowerCase())) return SAFETY_TABLE[k];
  }
  return null;
}

export const SAFETY_TIER_LABEL: Record<SafetyTier, string> = {
  low: 'Low risk',
  moderate: 'Moderate risk',
  high: 'High risk',
  very_high: 'Very high risk',
};
