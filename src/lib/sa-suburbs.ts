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
