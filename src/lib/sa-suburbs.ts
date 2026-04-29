export type Province =
  | 'Gauteng'
  | 'Western Cape'
  | 'KwaZulu-Natal'
  | 'Eastern Cape'
  | 'Free State'
  | 'Mpumalanga'
  | 'Limpopo'
  | 'North West'
  | 'Northern Cape';

export const PROVINCES: Province[] = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
  'Free State', 'Mpumalanga', 'Limpopo', 'North West', 'Northern Cape',
];

export const SUBURBS_BY_PROVINCE: Record<Province, string[]> = {
  Gauteng: [
    'Sandton', 'Rosebank', 'Melville', 'Parktown', 'Houghton', 'Greenside',
    'Killarney', 'Saxonwold', 'Hyde Park', 'Bryanston', 'Morningside',
    'Fourways', 'Randburg', 'Linden', 'Blairgowrie', 'Northcliff', 'Cresta',
    'Auckland Park', 'Newtown', 'Maboneng', 'Soweto', 'Centurion',
    'Pretoria CBD', 'Hatfield', 'Brooklyn', 'Waterkloof', 'Lynnwood',
    'Menlyn', 'Midrand', 'Edenvale', 'Bedfordview', 'Kempton Park',
    'Boksburg', 'Benoni', 'Krugersdorp', 'Roodepoort', 'Alberton',
  ],
  'Western Cape': [
    'Cape Town CBD', 'Sea Point', 'Green Point', 'Camps Bay', 'Clifton',
    'Bantry Bay', 'Fresnaye', 'Bo-Kaap', 'Gardens', 'Tamboerskloof',
    'Vredehoek', 'Oranjezicht', 'Observatory', 'Woodstock', 'Salt River',
    'Rondebosch', 'Newlands', 'Claremont', 'Kenilworth', 'Wynberg',
    'Constantia', 'Tokai', 'Bishopscourt', 'Hout Bay', 'Llandudno',
    'Muizenberg', 'Kalk Bay', 'Fish Hoek', 'Simons Town', 'Stellenbosch',
    'Somerset West', 'Strand', 'Paarl', 'Franschhoek', 'Durbanville',
    'Bellville', 'Parow', 'Goodwood',
  ],
  'KwaZulu-Natal': [
    'Umhlanga', 'La Lucia', 'Ballito', 'Durban North', 'Morningside (Durban)',
    'Glenwood', 'Berea', 'Musgrave', 'Westville', 'Hillcrest', 'Kloof',
    'Pinetown', 'Amanzimtoti', 'Margate', 'Pietermaritzburg', 'Howick',
    'Richards Bay', 'Empangeni', 'Newcastle',
  ],
  'Eastern Cape': [
    'Gqeberha', 'Summerstrand', 'Walmer', 'East London', 'Beacon Bay',
    'Vincent', 'Stirling', 'Mthatha', 'Aliwal North', 'Queenstown',
    'Makhanda', 'Jeffreys Bay', 'Port Alfred', 'King Williams Town',
  ],
  'Free State': [
    'Bloemfontein', 'Westdene', 'Universitas', 'Langenhoven Park',
    'Welkom', 'Bethlehem', 'Sasolburg', 'Kroonstad', 'Parys',
  ],
  Mpumalanga: [
    'Mbombela', 'White River', 'Emalahleni', 'Middelburg', 'Secunda',
    'Sabie', 'Hazyview', 'Standerton', 'Ermelo',
  ],
  Limpopo: [
    'Polokwane', 'Tzaneen', 'Bela-Bela', 'Mokopane', 'Thohoyandou',
    'Phalaborwa', 'Louis Trichardt', 'Lephalale',
  ],
  'North West': [
    'Rustenburg', 'Mahikeng', 'Klerksdorp', 'Potchefstroom', 'Brits',
    'Lichtenburg', 'Vryburg',
  ],
  'Northern Cape': [
    'Kimberley', 'Upington', 'Kuruman', 'Kathu', 'Springbok', 'De Aar',
  ],
};

// ----------------------------------------------------------------------------
// Directional groupings — used by the suburb picker's quick-pick row.
// In SA, "Northern / Southern / Eastern / Western Suburbs" are city-scoped
// shorthand (Joburg-North vs Cape Town-North vs Durban-North), so the lists
// below span all three major metros where the convention applies.
// ----------------------------------------------------------------------------

export type Direction = 'north' | 'east' | 'south' | 'west';

export const SUBURB_DIRECTIONS: Record<Direction, string[]> = {
  north: [
    // Joburg North
    'Sandton', 'Rosebank', 'Bryanston', 'Hyde Park', 'Morningside',
    'Houghton', 'Saxonwold', 'Fourways', 'Randburg', 'Northcliff',
    'Greenside', 'Linden', 'Blairgowrie', 'Cresta', 'Killarney',
    'Parktown', 'Melville', 'Auckland Park', 'Midrand',
    // Pretoria North-ish
    'Centurion', 'Pretoria CBD', 'Hatfield', 'Brooklyn', 'Waterkloof',
    'Lynnwood', 'Menlyn',
    // Cape Town Northern Suburbs
    'Bellville', 'Parow', 'Goodwood', 'Durbanville',
    // Durban North
    'Umhlanga', 'La Lucia', 'Ballito', 'Durban North', 'Richards Bay',
    'Empangeni',
  ],
  east: [
    // Joburg East
    'Edenvale', 'Bedfordview', 'Kempton Park', 'Boksburg', 'Benoni',
    // Cape Winelands / Helderberg (east of Cape Town)
    'Stellenbosch', 'Somerset West', 'Strand', 'Paarl', 'Franschhoek',
  ],
  south: [
    // Joburg South
    'Soweto', 'Alberton',
    // Cape Town Southern Suburbs
    'Rondebosch', 'Newlands', 'Claremont', 'Kenilworth', 'Wynberg',
    'Constantia', 'Tokai', 'Bishopscourt', 'Observatory', 'Woodstock',
    'Salt River', 'Muizenberg', 'Kalk Bay', 'Fish Hoek', 'Simons Town',
    // Durban South
    'Amanzimtoti', 'Margate',
  ],
  west: [
    // Joburg West
    'Roodepoort', 'Krugersdorp',
    // Cape Town Atlantic Seaboard / City Bowl (west)
    'Cape Town CBD', 'Sea Point', 'Green Point', 'Camps Bay', 'Clifton',
    'Bantry Bay', 'Fresnaye', 'Bo-Kaap', 'Gardens', 'Tamboerskloof',
    'Vredehoek', 'Oranjezicht', 'Hout Bay', 'Llandudno',
    // Durban West
    'Westville', 'Hillcrest', 'Kloof', 'Pinetown',
  ],
};
