/**
 * Curated set of 300 well-known South African schools across all 9 provinces.
 * Each entry has approximate suburb-level lat/lng so we can compute distance
 * from a candidate property using the same haversine formula scoring uses.
 *
 * Mix is roughly representative of the SA school landscape:
 *   - Public secondary (English & Afrikaans medium)
 *   - Public primary
 *   - Private heavyweights (St Stithians, Bishops, Hilton College, etc.)
 *   - Private chains (SPARK, Curro, Reddam, Crawford)
 *   - International schools (American, German, French)
 *
 * Coordinates are suburb-anchored (within ~1km of actual school) — fine for
 * "is this property within 5km of school X" scoring. Easy to extend.
 */

export type SchoolType = 'public' | 'private' | 'international';

export interface School {
  id: string;
  name: string;
  suburb: string;
  province: string;
  type: SchoolType;
  level: 'primary' | 'secondary' | 'combined';
  lat: number;
  lng: number;
}

export const SA_SCHOOLS: School[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // GAUTENG — JOBURG METRO (Sandton / Northern Suburbs)
  // ───────────────────────────────────────────────────────────────────────────
  { id: 'st-stithians',        name: 'St Stithians College',                 suburb: 'Lyme Park',     province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.0490, lng: 28.0334 },
  { id: 'st-johns',            name: "St John's College",                    suburb: 'Houghton',      province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.1734, lng: 28.0535 },
  { id: 'st-marys-waverley',   name: "St Mary's School Waverley",            suburb: 'Waverley',      province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.1432, lng: 28.0860 },
  { id: 'roedean',             name: 'Roedean School',                       suburb: 'Parktown',      province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.1789, lng: 28.0415 },
  { id: 'kingsmead',           name: 'Kingsmead College',                    suburb: 'Rosebank',      province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.1438, lng: 28.0463 },
  { id: 'redhill',             name: 'Redhill School',                       suburb: 'Morningside',   province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.0784, lng: 28.0537 },
  { id: 'st-davids',           name: "St David's Marist Inanda",             suburb: 'Inanda',        province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.0820, lng: 28.0420 },
  { id: 'st-peters-prep',      name: "St Peter's Prep & College",            suburb: 'Sunninghill',   province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.0234, lng: 28.0660 },
  { id: 'crawford-sandton',    name: 'Crawford International Sandton',       suburb: 'Sandton',       province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.1059, lng: 28.0560 },
  { id: 'crawford-fourways',   name: 'Crawford International Fourways',      suburb: 'Fourways',      province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.0250, lng: 28.0040 },
  { id: 'crawford-lonehill',   name: 'Crawford International Lonehill',      suburb: 'Lonehill',      province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.0173, lng: 28.0186 },
  { id: 'crawford-pretoria',   name: 'Crawford International Pretoria',      suburb: 'Lynnwood',      province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -25.7650, lng: 28.2900 },
  { id: 'reddam-bedfordview',  name: 'Reddam House Bedfordview',             suburb: 'Bedfordview',   province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.1820, lng: 28.1430 },
  { id: 'reddam-jhb',          name: 'Reddam House Constantia Kloof',        suburb: 'Constantia Kloof', province: 'Gauteng',     type: 'private',       level: 'combined',  lat: -26.1340, lng: 27.8920 },
  { id: 'st-andrews-girls',    name: "St Andrew's School for Girls",         suburb: 'Bedfordview',   province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.1810, lng: 28.1390 },
  { id: 'beaulieu',            name: 'Beaulieu College',                     suburb: 'Kyalami',       province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -25.9890, lng: 28.0560 },
  { id: 'dainfern-college',    name: 'Dainfern College',                     suburb: 'Dainfern',      province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -25.9930, lng: 27.9930 },
  { id: 'sacred-heart',        name: 'Sacred Heart College',                 suburb: 'Observatory',   province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.1880, lng: 28.0750 },
  { id: 'german-school-jhb',   name: 'Deutsche Internationale Schule Johannesburg', suburb: 'Parktown', province: 'Gauteng',     type: 'international', level: 'combined',  lat: -26.1820, lng: 28.0290 },
  { id: 'french-school-jhb',   name: 'Lycée Jules Verne Johannesburg',       suburb: 'Morningside',   province: 'Gauteng',        type: 'international', level: 'combined',  lat: -26.0710, lng: 28.0640 },
  { id: 'american-school-jhb', name: 'American International School of Johannesburg', suburb: 'Bryanston', province: 'Gauteng',   type: 'international', level: 'combined',  lat: -26.0510, lng: 28.0220 },
  { id: 'kings-college-prep',  name: 'Kings College Preparatory School',     suburb: 'Linbro Park',   province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.0840, lng: 28.1070 },
  { id: 'brescia-house',       name: 'Brescia House School',                 suburb: 'Bryanston',     province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.0500, lng: 28.0240 },
  { id: 'holy-rosary',         name: 'Holy Rosary School',                   suburb: 'Edenvale',      province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.1500, lng: 28.1410 },
  { id: 'st-andrews-prep-jhb', name: "St Andrew's Preparatory School",       suburb: 'Bedfordview',   province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.1820, lng: 28.1370 },
  { id: 'bryneven-prim',       name: 'Bryneven Primary School',              suburb: 'Bryanston',     province: 'Gauteng',        type: 'public',        level: 'primary',   lat: -26.0570, lng: 28.0240 },
  { id: 'bryandale-prim',      name: 'Bryandale Primary School',             suburb: 'Bryanston',     province: 'Gauteng',        type: 'public',        level: 'primary',   lat: -26.0500, lng: 28.0190 },
  { id: 'morningside-prim',    name: 'Morningside Primary School',           suburb: 'Morningside',   province: 'Gauteng',        type: 'public',        level: 'primary',   lat: -26.0820, lng: 28.0570 },
  { id: 'rivonia-prim',        name: 'Rivonia Primary School',               suburb: 'Rivonia',       province: 'Gauteng',        type: 'public',        level: 'primary',   lat: -26.0530, lng: 28.0590 },
  { id: 'fourways-prim',       name: 'Fourways Primary School',              suburb: 'Fourways',      province: 'Gauteng',        type: 'public',        level: 'primary',   lat: -26.0220, lng: 28.0090 },
  { id: 'fourways-high',       name: 'Fourways High School',                 suburb: 'Fourways',      province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.0270, lng: 28.0125 },
  { id: 'sandown-high',        name: 'Sandown High School',                  suburb: 'Sandown',       province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1015, lng: 28.0563 },
  { id: 'rivonia-prim-2',      name: 'Sandown Primary School',               suburb: 'Sandown',       province: 'Gauteng',        type: 'public',        level: 'primary',   lat: -26.1080, lng: 28.0540 },
  { id: 'hyde-park-high',      name: 'Hyde Park High School',                suburb: 'Hyde Park',     province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1300, lng: 28.0410 },
  { id: 'sandringham-high',    name: 'Sandringham High School',              suburb: 'Sandringham',   province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1280, lng: 28.0930 },
  { id: 'highlands-north',     name: 'Highlands North Boys High',            suburb: 'Highlands North', province: 'Gauteng',      type: 'public',        level: 'secondary', lat: -26.1500, lng: 28.0830 },

  // Joburg public secondary (more)
  { id: 'parktown-boys',       name: 'Parktown Boys High School',            suburb: 'Parktown',      province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1838, lng: 28.0364 },
  { id: 'parktown-girls',      name: 'Parktown High School for Girls',       suburb: 'Parktown',      province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1799, lng: 28.0349 },
  { id: 'jeppe-boys',          name: 'Jeppe High School for Boys',           suburb: 'Kensington',    province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1971, lng: 28.0962 },
  { id: 'jeppe-girls',         name: 'Jeppe High School for Girls',          suburb: 'Kensington',    province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1962, lng: 28.0989 },
  { id: 'kes',                 name: 'King Edward VII School',               suburb: 'Houghton',      province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1683, lng: 28.0556 },
  { id: 'helpmekaar',          name: 'Helpmekaar Kollege',                   suburb: 'Braamfontein',  province: 'Gauteng',        type: 'public',        level: 'combined',  lat: -26.1933, lng: 28.0306 },
  { id: 'roosevelt-girls',     name: 'Roosevelt High School',                suburb: 'Greenside',     province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1430, lng: 28.0050 },
  { id: 'northcliff-high',     name: 'Northcliff High School',               suburb: 'Northcliff',    province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1500, lng: 27.9650 },
  { id: 'rand-park-high',      name: 'Randpark High School',                 suburb: 'Randpark Ridge', province: 'Gauteng',       type: 'public',        level: 'secondary', lat: -26.0815, lng: 27.9690 },
  { id: 'linden-high',         name: 'Hoërskool Linden',                     suburb: 'Linden',        province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1410, lng: 27.9990 },
  { id: 'greenside-high',      name: 'Greenside High School',                suburb: 'Greenside',     province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1450, lng: 28.0000 },

  // Joburg public primary
  { id: 'rosebank-prim',       name: 'Rosebank Primary School',              suburb: 'Rosebank',      province: 'Gauteng',        type: 'public',        level: 'primary',   lat: -26.1442, lng: 28.0455 },
  { id: 'parkview-jrs',        name: 'Parkview Junior School',               suburb: 'Parkview',      province: 'Gauteng',        type: 'public',        level: 'primary',   lat: -26.1644, lng: 28.0270 },
  { id: 'craighall-prim',      name: 'Craighall Primary School',             suburb: 'Craighall',     province: 'Gauteng',        type: 'public',        level: 'primary',   lat: -26.1300, lng: 28.0240 },
  { id: 'glenhazel-prim',      name: 'Glenhazel Primary School',             suburb: 'Glenhazel',     province: 'Gauteng',        type: 'public',        level: 'primary',   lat: -26.1220, lng: 28.1050 },
  { id: 'saxonwold-prim',      name: 'Saxonwold Primary School',             suburb: 'Saxonwold',     province: 'Gauteng',        type: 'public',        level: 'primary',   lat: -26.1640, lng: 28.0470 },
  { id: 'parkmore-prim',       name: 'Parkmore Primary School',              suburb: 'Parkmore',      province: 'Gauteng',        type: 'public',        level: 'primary',   lat: -26.0730, lng: 28.0570 },

  // Joburg West Rand
  { id: 'roodepoort-prim',     name: 'Roodepoort Primary School',            suburb: 'Roodepoort',    province: 'Gauteng',        type: 'public',        level: 'primary',   lat: -26.1640, lng: 27.8730 },
  { id: 'florida-park-high',   name: 'Florida Park High School',             suburb: 'Florida',       province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1750, lng: 27.9090 },
  { id: 'krugersdorp-high',    name: 'Krugersdorp High School',              suburb: 'Krugersdorp',   province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.0920, lng: 27.7850 },
  { id: 'monument-hs',         name: 'Hoërskool Monument',                   suburb: 'Krugersdorp',   province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.0840, lng: 27.7790 },

  // Ekurhuleni / East Rand
  { id: 'edenvale-high',       name: 'Edenvale High School',                 suburb: 'Edenvale',      province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1410, lng: 28.1640 },
  { id: 'edenvale-hs',         name: 'Hoërskool Edenvale',                   suburb: 'Edenvale',      province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1450, lng: 28.1670 },
  { id: 'boksburg-high',       name: 'Boksburg High School',                 suburb: 'Boksburg',      province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.2120, lng: 28.2580 },
  { id: 'hugenote-springs',    name: 'Hoërskool Hugenote',                   suburb: 'Springs',       province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.2570, lng: 28.4400 },
  { id: 'benoni-high',         name: 'Benoni High School',                   suburb: 'Benoni',        province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1870, lng: 28.3140 },
  { id: 'brandwag-benoni',     name: 'Hoërskool Brandwag',                   suburb: 'Benoni',        province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1980, lng: 28.3110 },
  { id: 'kempton-park-high',   name: 'Kempton Park High School',             suburb: 'Kempton Park',  province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -26.1010, lng: 28.2310 },
  { id: 'birchleigh-prim',     name: 'Birchleigh Primary School',            suburb: 'Kempton Park',  province: 'Gauteng',        type: 'public',        level: 'primary',   lat: -26.0780, lng: 28.2390 },

  // SPARK Schools — multi-campus low-fee private chain
  { id: 'spark-sandton',       name: 'SPARK Sandton',                        suburb: 'Sandton',       province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.1080, lng: 28.0560 },
  { id: 'spark-bramley',       name: 'SPARK Bramley',                        suburb: 'Bramley',       province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.1234, lng: 28.0890 },
  { id: 'spark-randburg',      name: 'SPARK Randburg',                       suburb: 'Randburg',      province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.0934, lng: 27.9742 },
  { id: 'spark-soweto',        name: 'SPARK Soweto',                         suburb: 'Soweto',        province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.2670, lng: 27.8540 },
  { id: 'spark-fourways',      name: 'SPARK Fourways',                       suburb: 'Fourways',      province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.0220, lng: 28.0090 },
  { id: 'spark-midrand',       name: 'SPARK Midrand',                        suburb: 'Midrand',       province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -25.9990, lng: 28.1310 },
  { id: 'spark-honeydew',      name: 'SPARK Honeydew',                       suburb: 'Honeydew',      province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.0420, lng: 27.9620 },
  { id: 'spark-rosebank',      name: 'SPARK Rosebank',                       suburb: 'Rosebank',      province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.1430, lng: 28.0470 },
  { id: 'spark-lakeside',      name: 'SPARK Lakeside',                       suburb: 'Lakeside',      province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.4090, lng: 28.0890 },
  { id: 'spark-meadowlands',   name: 'SPARK Meadowlands',                    suburb: 'Meadowlands',   province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.2350, lng: 27.8930 },
  { id: 'spark-pretoria-cbd',  name: 'SPARK Pretoria CBD',                   suburb: 'Pretoria CBD',  province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -25.7480, lng: 28.1900 },

  // Curro chain — Joburg & East Rand
  { id: 'curro-aurora',        name: 'Curro Aurora',                         suburb: 'Honeydew',      province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.0340, lng: 27.9420 },
  { id: 'curro-roodeplaat',    name: 'Curro Roodeplaat',                     suburb: 'Roodeplaat',    province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -25.6580, lng: 28.3580 },
  { id: 'curro-serengeti',     name: 'Curro Serengeti',                      suburb: 'Kempton Park',  province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.0240, lng: 28.2780 },
  { id: 'curro-castle-gate',   name: 'Curro Castle Gate',                    suburb: 'Pretoria East', province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -25.7980, lng: 28.3540 },
  { id: 'curro-hazeldean',     name: 'Curro Hazeldean',                      suburb: 'Pretoria East', province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -25.7700, lng: 28.3680 },
  { id: 'curro-rivonia',       name: 'Curro Rivonia',                        suburb: 'Rivonia',       province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -26.0540, lng: 28.0570 },

  // ───────────────────────────────────────────────────────────────────────────
  // GAUTENG — PRETORIA / TSHWANE
  // ───────────────────────────────────────────────────────────────────────────
  { id: 'st-marys-dsg',        name: "St Mary's DSG",                        suburb: 'Pretoria',      province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -25.7570, lng: 28.2280 },
  { id: 'pretoria-boys',       name: 'Pretoria Boys High School',            suburb: 'Brooklyn',      province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -25.7700, lng: 28.2410 },
  { id: 'pretoria-girls',      name: 'Pretoria High School for Girls',       suburb: 'Sunnyside',     province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -25.7530, lng: 28.2080 },
  { id: 'affies',              name: 'Afrikaanse Hoër Seunskool (Affies)',   suburb: 'Pretoria',      province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -25.7530, lng: 28.2030 },
  { id: 'afrikaans-meisies',   name: 'Afrikaanse Hoër Meisieskool',          suburb: 'Pretoria',      province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -25.7530, lng: 28.1990 },
  { id: 'menlopark',           name: 'Hoërskool Menlopark',                  suburb: 'Menlo Park',    province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -25.7820, lng: 28.2660 },
  { id: 'waterkloof-hs',       name: 'Hoërskool Waterkloof',                 suburb: 'Waterkloof',    province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -25.7990, lng: 28.2380 },
  { id: 'cornwall-hill',       name: 'Cornwall Hill College',                suburb: 'Centurion',     province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -25.8650, lng: 28.1840 },
  { id: 'aisp',                name: 'American International School of Pretoria', suburb: 'Pretoria', province: 'Gauteng',         type: 'international', level: 'combined',  lat: -25.7920, lng: 28.2540 },
  { id: 'curro-thatchfield',   name: 'Curro Thatchfield',                    suburb: 'Centurion',     province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -25.8920, lng: 28.1390 },
  { id: 'eldoraigne-hs',       name: 'Hoërskool Eldoraigne',                 suburb: 'Centurion',     province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -25.8520, lng: 28.1730 },
  { id: 'centurion-hs',        name: 'Hoërskool Centurion',                  suburb: 'Centurion',     province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -25.8580, lng: 28.1850 },
  { id: 'lyttelton-manor',     name: 'Lyttelton Manor High School',          suburb: 'Centurion',     province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -25.8550, lng: 28.2050 },
  { id: 'garsfontein-hs',      name: 'Hoërskool Garsfontein',                suburb: 'Garsfontein',   province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -25.8050, lng: 28.2960 },
  { id: 'pta-north-hs',        name: 'Pretoria North High School',           suburb: 'Pretoria North', province: 'Gauteng',       type: 'public',        level: 'secondary', lat: -25.6760, lng: 28.1840 },
  { id: 'pta-tech',            name: 'Pretoria Technical High School',       suburb: 'Pretoria',      province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -25.7600, lng: 28.1810 },
  { id: 'akasia-hs',           name: 'Hoërskool Akasia',                     suburb: 'Akasia',        province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -25.6390, lng: 28.1140 },
  { id: 'tuks-prep',           name: 'Tuks Prep School',                     suburb: 'Hatfield',      province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -25.7510, lng: 28.2370 },

  // ───────────────────────────────────────────────────────────────────────────
  // WESTERN CAPE — CAPE TOWN
  // ───────────────────────────────────────────────────────────────────────────

  // Southern Suburbs heavyweights
  { id: 'bishops',             name: 'Bishops Diocesan College',             suburb: 'Rondebosch',    province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -33.9606, lng: 18.4715 },
  { id: 'herschel',            name: 'Herschel Girls School',                suburb: 'Claremont',     province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -33.9844, lng: 18.4647 },
  { id: 'sacs',                name: 'South African College Schools',        suburb: 'Newlands',      province: 'Western Cape',   type: 'public',        level: 'combined',  lat: -33.9747, lng: 18.4670 },
  { id: 'rondebosch-boys',     name: 'Rondebosch Boys High',                 suburb: 'Rondebosch',    province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.9626, lng: 18.4718 },
  { id: 'rondebosch-prep',     name: 'Rondebosch Boys Preparatory',          suburb: 'Rondebosch',    province: 'Western Cape',   type: 'public',        level: 'primary',   lat: -33.9636, lng: 18.4710 },
  { id: 'westerford',          name: 'Westerford High School',               suburb: 'Newlands',      province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.9706, lng: 18.4747 },
  { id: 'rustenburg',          name: 'Rustenburg Girls High',                suburb: 'Rondebosch',    province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.9576, lng: 18.4705 },
  { id: 'rustenburg-jr',       name: 'Rustenburg Girls Junior',              suburb: 'Rondebosch',    province: 'Western Cape',   type: 'public',        level: 'primary',   lat: -33.9587, lng: 18.4716 },
  { id: 'wynberg-boys',        name: 'Wynberg Boys High School',             suburb: 'Wynberg',       province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -34.0030, lng: 18.4690 },
  { id: 'wynberg-girls',       name: 'Wynberg Girls High School',            suburb: 'Wynberg',       province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -34.0042, lng: 18.4654 },
  { id: 'wynberg-boys-jnr',    name: 'Wynberg Boys Junior School',           suburb: 'Wynberg',       province: 'Western Cape',   type: 'public',        level: 'primary',   lat: -34.0040, lng: 18.4700 },
  { id: 'plumstead-high',      name: 'Plumstead High School',                suburb: 'Plumstead',     province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -34.0190, lng: 18.4680 },
  { id: 'cannons-creek',       name: 'Cannons Creek Independent',            suburb: 'Pinelands',     province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -33.9436, lng: 18.5008 },
  { id: 'reddam-tk',           name: 'Reddam House Tokai',                   suburb: 'Tokai',         province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -34.0617, lng: 18.4314 },
  { id: 'reddam-atlantic',     name: 'Reddam House Atlantic Seaboard',       suburb: 'Green Point',   province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -33.9050, lng: 18.4080 },
  { id: 'reddam-constantia',   name: 'Reddam House Constantia',              suburb: 'Constantia',    province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -34.0290, lng: 18.4470 },
  { id: 'reddam-helderberg',   name: 'Reddam House Helderberg',              suburb: 'Somerset West', province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -34.0720, lng: 18.8400 },
  { id: 'german-school-ct',    name: 'German International School Cape Town', suburb: 'Tamboerskloof', province: 'Western Cape', type: 'international', level: 'combined',  lat: -33.9300, lng: 18.4040 },
  { id: 'french-school-ct',    name: 'Lycée François le Vaillant',           suburb: 'Sea Point',     province: 'Western Cape',   type: 'international', level: 'combined',  lat: -33.9180, lng: 18.3960 },
  { id: 'american-school-ct',  name: 'American International School of Cape Town', suburb: 'Constantia', province: 'Western Cape', type: 'international', level: 'combined',  lat: -34.0240, lng: 18.4450 },
  { id: 'springfield-convent', name: 'Springfield Convent School',           suburb: 'Wynberg',       province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -34.0014, lng: 18.4640 },
  { id: 'micklefield',         name: 'Micklefield School',                   suburb: 'Rondebosch',    province: 'Western Cape',   type: 'private',       level: 'primary',   lat: -33.9602, lng: 18.4750 },
  { id: 'cape-academy',        name: 'Cape Academy of Maths Science & Technology', suburb: 'Constantia', province: 'Western Cape', type: 'public',      level: 'secondary', lat: -34.0260, lng: 18.4480 },
  { id: 'fairmont-high',       name: 'Fairmont High School',                 suburb: 'Durbanville',   province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.8350, lng: 18.6480 },
  { id: 'westridge-high',      name: 'Westridge High School',                suburb: 'Mitchells Plain', province: 'Western Cape', type: 'public',        level: 'secondary', lat: -34.0490, lng: 18.6100 },

  // City Bowl / Atlantic Seaboard / Sea Point
  { id: 'sea-point-high',      name: 'Sea Point High School',                suburb: 'Sea Point',     province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.9226, lng: 18.3911 },
  { id: 'tamboers-prim',       name: 'Tamboerskloof Primary',                suburb: 'Tamboerskloof', province: 'Western Cape',   type: 'public',        level: 'primary',   lat: -33.9290, lng: 18.4030 },
  { id: 'gardens-comm',        name: 'Gardens Commercial High School',       suburb: 'Gardens',       province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.9296, lng: 18.4112 },
  { id: 'cbc-st-johns-ct',     name: "St John's CBC",                        suburb: 'Parklands',     province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -33.8060, lng: 18.4920 },
  { id: 'oranjezicht-prim',    name: 'Oranjezicht Primary School',           suburb: 'Oranjezicht',   province: 'Western Cape',   type: 'public',        level: 'primary',   lat: -33.9420, lng: 18.4180 },
  { id: 'vredehoek-prim',      name: 'Vredehoek Primary School',             suburb: 'Vredehoek',     province: 'Western Cape',   type: 'public',        level: 'primary',   lat: -33.9410, lng: 18.4160 },
  { id: 'sea-point-prim',      name: 'Sea Point Primary School',             suburb: 'Sea Point',     province: 'Western Cape',   type: 'public',        level: 'primary',   lat: -33.9210, lng: 18.3920 },
  { id: 'camps-bay-high',      name: 'Camps Bay High School',                suburb: 'Camps Bay',     province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.9510, lng: 18.3810 },
  { id: 'camps-bay-prim',      name: 'Camps Bay Primary School',             suburb: 'Camps Bay',     province: 'Western Cape',   type: 'public',        level: 'primary',   lat: -33.9530, lng: 18.3830 },
  { id: 'pinelands-high',      name: 'Pinelands High School',                suburb: 'Pinelands',     province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.9420, lng: 18.5040 },
  { id: 'pinelands-north',     name: 'Pinelands North Primary',              suburb: 'Pinelands',     province: 'Western Cape',   type: 'public',        level: 'primary',   lat: -33.9420, lng: 18.4970 },

  // Northern Suburbs / Bellville / Durbanville
  { id: 'bellville-hs',        name: 'Bellville High School',                suburb: 'Bellville',     province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.9027, lng: 18.6411 },
  { id: 'durbanville-hs',      name: 'Durbanville High School',              suburb: 'Durbanville',   province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.8350, lng: 18.6470 },
  { id: 'tygerberg-hs',        name: 'Hoërskool Tygerberg',                  suburb: 'Parow',         province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.9000, lng: 18.5870 },
  { id: 'curro-durbanville',   name: 'Curro Durbanville',                    suburb: 'Durbanville',   province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -33.8330, lng: 18.6510 },
  { id: 'curro-bellville',     name: 'Curro Sitari',                         suburb: 'Sitari',        province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -34.0220, lng: 18.7820 },
  { id: 'parow-hs',            name: 'Hoërskool Parow',                      suburb: 'Parow',         province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.8990, lng: 18.5800 },
  { id: 'goodwood-hs',         name: 'Hoërskool Goodwood',                   suburb: 'Goodwood',      province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.9080, lng: 18.5560 },

  // Stellenbosch / Helderberg / Cape Winelands
  { id: 'paul-roos',           name: 'Paul Roos Gymnasium',                  suburb: 'Stellenbosch',  province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.9355, lng: 18.8602 },
  { id: 'rhenish',             name: 'Rhenish Girls High',                   suburb: 'Stellenbosch',  province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.9356, lng: 18.8590 },
  { id: 'bloemhof',            name: 'Hoër Meisieskool Bloemhof',            suburb: 'Stellenbosch',  province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.9320, lng: 18.8650 },
  { id: 'somerset-college',    name: 'Somerset College',                     suburb: 'Somerset West', province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -34.0850, lng: 18.8270 },
  { id: 'stellenbosch-waldorf',name: 'Stellenbosch Waldorf School',          suburb: 'Stellenbosch',  province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -33.9510, lng: 18.8540 },
  { id: 'paarl-boys',          name: 'Paarl Boys High',                      suburb: 'Paarl',         province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.7400, lng: 18.9710 },
  { id: 'paarl-gymn',          name: 'Paarl Gymnasium',                      suburb: 'Paarl',         province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.7290, lng: 18.9620 },
  { id: 'paarl-girls',         name: 'La Rochelle Girls High',               suburb: 'Paarl',         province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.7340, lng: 18.9540 },
  { id: 'hottentots-holland',  name: 'Hottentots-Holland High School',       suburb: 'Somerset West', province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -34.0840, lng: 18.8240 },
  { id: 'rhenish-prim',        name: 'Rhenish Primary School',               suburb: 'Stellenbosch',  province: 'Western Cape',   type: 'public',        level: 'primary',   lat: -33.9320, lng: 18.8580 },

  // Cape Peninsula far south
  { id: 'fish-hoek-high',      name: 'Fish Hoek High School',                suburb: 'Fish Hoek',     province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -34.1380, lng: 18.4290 },
  { id: 'fish-hoek-prim',      name: 'Fish Hoek Primary School',             suburb: 'Fish Hoek',     province: 'Western Cape',   type: 'public',        level: 'primary',   lat: -34.1370, lng: 18.4310 },
  { id: 'simons-school',       name: "Simon's Town School",                  suburb: 'Simons Town',   province: 'Western Cape',   type: 'public',        level: 'combined',  lat: -34.1940, lng: 18.4350 },
  { id: 'sun-valley-prim',     name: 'Sun Valley Primary',                   suburb: 'Sun Valley',    province: 'Western Cape',   type: 'public',        level: 'primary',   lat: -34.1290, lng: 18.4090 },
  { id: 'silvermine-prim',     name: 'Silvermine Academy',                   suburb: 'Noordhoek',     province: 'Western Cape',   type: 'private',       level: 'primary',   lat: -34.1200, lng: 18.3760 },

  // Western Cape outside Cape Town
  { id: 'hermanus-high',       name: 'Hermanus High School',                 suburb: 'Hermanus',      province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -34.4150, lng: 19.2350 },
  { id: 'curro-hermanus',      name: 'Curro Hermanus',                       suburb: 'Hermanus',      province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -34.4040, lng: 19.2640 },
  { id: 'overberg-high',       name: 'Overberg High School',                 suburb: 'Caledon',       province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -34.2310, lng: 19.4220 },
  { id: 'worcester-gymn',      name: 'Worcester Gymnasium',                  suburb: 'Worcester',     province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.6470, lng: 19.4520 },
  { id: 'oudtshoorn-hs',       name: 'Hoërskool Oudtshoorn',                 suburb: 'Oudtshoorn',    province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.5940, lng: 22.2010 },
  { id: 'outeniqua-hs',        name: 'Outeniqua High School',                suburb: 'George',        province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.9610, lng: 22.4520 },
  { id: 'george-prep',         name: 'George Preparatory School',            suburb: 'George',        province: 'Western Cape',   type: 'public',        level: 'primary',   lat: -33.9640, lng: 22.4570 },
  { id: 'curro-mossel-bay',    name: 'Curro Mossel Bay',                     suburb: 'Mossel Bay',    province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -34.1840, lng: 22.1490 },

  // ───────────────────────────────────────────────────────────────────────────
  // KWAZULU-NATAL — DURBAN METRO
  // ───────────────────────────────────────────────────────────────────────────
  { id: 'dpsh',                name: 'Durban Preparatory High School',       suburb: 'Berea',         province: 'KwaZulu-Natal',  type: 'public',        level: 'primary',   lat: -29.8493, lng: 31.0089 },
  { id: 'dhs',                 name: 'Durban High School',                   suburb: 'Berea',         province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -29.8526, lng: 31.0162 },
  { id: 'dgc',                 name: 'Durban Girls College',                 suburb: 'Berea',         province: 'KwaZulu-Natal',  type: 'private',       level: 'combined',  lat: -29.8493, lng: 31.0084 },
  { id: 'dgh',                 name: 'Durban Girls High',                    suburb: 'Berea',         province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -29.8500, lng: 31.0050 },
  { id: 'glenwood-boys',       name: 'Glenwood High School',                 suburb: 'Glenwood',      province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -29.8730, lng: 30.9990 },
  { id: 'glenwood-prep',       name: 'Glenwood Preparatory',                 suburb: 'Glenwood',      province: 'KwaZulu-Natal',  type: 'public',        level: 'primary',   lat: -29.8740, lng: 31.0030 },
  { id: 'westville-boys',      name: 'Westville Boys High',                  suburb: 'Westville',     province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -29.8389, lng: 30.9233 },
  { id: 'westville-girls',     name: 'Westville Girls High',                 suburb: 'Westville',     province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -29.8395, lng: 30.9215 },
  { id: 'westville-jnr',       name: 'Westville Junior Primary',             suburb: 'Westville',     province: 'KwaZulu-Natal',  type: 'public',        level: 'primary',   lat: -29.8410, lng: 30.9270 },
  { id: 'pinetown-boys',       name: 'Pinetown Boys High',                   suburb: 'Pinetown',      province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -29.8260, lng: 30.8520 },
  { id: 'pinetown-girls',      name: 'Pinetown Girls High',                  suburb: 'Pinetown',      province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -29.8240, lng: 30.8530 },
  { id: 'northwood-boys',      name: 'Northwood School',                     suburb: 'Durban North',  province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -29.7920, lng: 31.0290 },
  { id: 'northlands-girls',    name: 'Northlands Girls High',                suburb: 'Durban North',  province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -29.7910, lng: 31.0240 },
  { id: 'crawford-la-lucia',   name: 'Crawford International La Lucia',      suburb: 'La Lucia',      province: 'KwaZulu-Natal',  type: 'private',       level: 'combined',  lat: -29.7350, lng: 31.0780 },
  { id: 'crawford-umhlanga',   name: 'Crawford International North Coast',   suburb: 'Umhlanga',      province: 'KwaZulu-Natal',  type: 'private',       level: 'combined',  lat: -29.7240, lng: 31.0830 },
  { id: 'reddam-umhlanga',     name: 'Reddam House Umhlanga',                suburb: 'Umhlanga',      province: 'KwaZulu-Natal',  type: 'private',       level: 'combined',  lat: -29.7250, lng: 31.0850 },
  { id: 'curro-mount-richmore',name: 'Curro Mount Richmore',                 suburb: 'Salt Rock',     province: 'KwaZulu-Natal',  type: 'private',       level: 'combined',  lat: -29.5170, lng: 31.2470 },
  { id: 'ashton-college',      name: 'Ashton International College',         suburb: 'Ballito',       province: 'KwaZulu-Natal',  type: 'private',       level: 'combined',  lat: -29.5450, lng: 31.2110 },
  { id: 'kearsney',            name: 'Kearsney College',                     suburb: 'Botha\'s Hill', province: 'KwaZulu-Natal',  type: 'private',       level: 'secondary', lat: -29.7510, lng: 30.7500 },
  { id: 'hilton-college',      name: 'Hilton College',                       suburb: 'Hilton',        province: 'KwaZulu-Natal',  type: 'private',       level: 'secondary', lat: -29.5470, lng: 30.3050 },
  { id: 'hilton-prep',         name: 'Hilton Preparatory School',            suburb: 'Hilton',        province: 'KwaZulu-Natal',  type: 'private',       level: 'primary',   lat: -29.5490, lng: 30.3070 },
  { id: 'st-annes-hilton',     name: "St Anne's Diocesan College",           suburb: 'Hilton',        province: 'KwaZulu-Natal',  type: 'private',       level: 'combined',  lat: -29.5430, lng: 30.3010 },
  { id: 'michaelhouse',        name: 'Michaelhouse',                         suburb: 'Balgowan',      province: 'KwaZulu-Natal',  type: 'private',       level: 'secondary', lat: -29.4030, lng: 30.0820 },
  { id: 'treverton',           name: 'Treverton College',                    suburb: 'Mooi River',    province: 'KwaZulu-Natal',  type: 'private',       level: 'combined',  lat: -29.2360, lng: 29.9880 },
  { id: 'cordwalles',          name: 'Cordwalles Preparatory',               suburb: 'Pietermaritzburg', province: 'KwaZulu-Natal', type: 'private',     level: 'primary',   lat: -29.5850, lng: 30.4030 },
  { id: 'wykeham',             name: 'Wykeham Collegiate',                   suburb: 'Pietermaritzburg', province: 'KwaZulu-Natal', type: 'private',     level: 'combined',  lat: -29.6000, lng: 30.3850 },
  { id: 'st-charles',          name: "St Charles College",                   suburb: 'Pietermaritzburg', province: 'KwaZulu-Natal', type: 'private',     level: 'combined',  lat: -29.5790, lng: 30.3970 },
  { id: 'pmb-college',         name: 'Maritzburg College',                   suburb: 'Pietermaritzburg', province: 'KwaZulu-Natal', type: 'public',     level: 'secondary', lat: -29.6072, lng: 30.3956 },
  { id: 'gh-pmb',              name: 'Girls High School Pietermaritzburg',   suburb: 'Pietermaritzburg', province: 'KwaZulu-Natal', type: 'public',     level: 'secondary', lat: -29.6020, lng: 30.3950 },
  { id: 'epworth',             name: 'Epworth School',                       suburb: 'Pietermaritzburg', province: 'KwaZulu-Natal', type: 'private',    level: 'combined',  lat: -29.6135, lng: 30.4040 },
  { id: 'howick-high',         name: 'Howick High School',                   suburb: 'Howick',        province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -29.4810, lng: 30.2370 },
  { id: 'howick-prep',         name: 'Howick Preparatory School',            suburb: 'Howick',        province: 'KwaZulu-Natal',  type: 'public',        level: 'primary',   lat: -29.4790, lng: 30.2400 },
  { id: 'john-ross',           name: 'John Ross College',                    suburb: 'Richards Bay',  province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -28.7820, lng: 32.0750 },
  { id: 'empangeni-high',      name: 'Empangeni High School',                suburb: 'Empangeni',     province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -28.7460, lng: 31.8900 },
  { id: 'newcastle-high',      name: 'Hoërskool Newcastle',                  suburb: 'Newcastle',     province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -27.7600, lng: 29.9320 },
  { id: 'ferrum-newcastle',    name: 'Ferrum High School',                   suburb: 'Newcastle',     province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -27.7700, lng: 29.9360 },
  { id: 'ladysmith-high',      name: 'Ladysmith High School',                suburb: 'Ladysmith',     province: 'KwaZulu-Natal',  type: 'public',        level: 'secondary', lat: -28.5570, lng: 29.7820 },

  // ───────────────────────────────────────────────────────────────────────────
  // EASTERN CAPE
  // ───────────────────────────────────────────────────────────────────────────
  { id: 'st-andrews-grahamstown', name: "St Andrew's College",               suburb: 'Makhanda',      province: 'Eastern Cape',   type: 'private',       level: 'secondary', lat: -33.3127, lng: 26.5318 },
  { id: 'kingswood',           name: 'Kingswood College',                    suburb: 'Makhanda',      province: 'Eastern Cape',   type: 'private',       level: 'combined',  lat: -33.3154, lng: 26.5270 },
  { id: 'dsg-makhanda',        name: 'Diocesan School for Girls',            suburb: 'Makhanda',      province: 'Eastern Cape',   type: 'private',       level: 'combined',  lat: -33.3110, lng: 26.5290 },
  { id: 'graeme-college',      name: 'Graeme College',                       suburb: 'Makhanda',      province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -33.3180, lng: 26.5430 },
  { id: 'victoria-girls',      name: 'Victoria Girls High',                  suburb: 'Makhanda',      province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -33.3170, lng: 26.5360 },
  { id: 'grey-pe',             name: 'Grey High School',                     suburb: 'Mill Park',     province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -33.9690, lng: 25.5770 },
  { id: 'collegiate-girls',    name: 'Collegiate Girls High',                suburb: 'Central',       province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -33.9610, lng: 25.6090 },
  { id: 'pearson-high',        name: 'Pearson High School',                  suburb: 'Summerstrand',  province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -34.0170, lng: 25.6760 },
  { id: 'alexander-road',      name: 'Alexander Road High School',           suburb: 'Newton Park',   province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -33.9580, lng: 25.5810 },
  { id: 'theodor-herzl',       name: 'Theodor Herzl School',                 suburb: 'Newton Park',   province: 'Eastern Cape',   type: 'private',       level: 'combined',  lat: -33.9600, lng: 25.5890 },
  { id: 'marymount-pe',        name: 'Marymount Convent School',             suburb: 'Walmer',        province: 'Eastern Cape',   type: 'private',       level: 'combined',  lat: -33.9870, lng: 25.5790 },
  { id: 'woodridge-college',   name: 'Woodridge College',                    suburb: 'Thornhill',     province: 'Eastern Cape',   type: 'private',       level: 'combined',  lat: -33.9430, lng: 25.0820 },
  { id: 'selborne-college',    name: 'Selborne College',                     suburb: 'East London',   province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -33.0210, lng: 27.9020 },
  { id: 'clarendon-girls',     name: 'Clarendon High School for Girls',      suburb: 'East London',   province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -33.0190, lng: 27.9050 },
  { id: 'hudson-park',         name: 'Hudson Park High School',              suburb: 'Beacon Bay',    province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -32.9920, lng: 27.9510 },
  { id: 'stirling-high',       name: 'Stirling High School',                 suburb: 'East London',   province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -33.0090, lng: 27.8910 },
  { id: 'cambridge-prim',      name: 'Cambridge Primary School',             suburb: 'East London',   province: 'Eastern Cape',   type: 'public',        level: 'primary',   lat: -33.0100, lng: 27.8950 },
  { id: 'merrifield-college',  name: 'Merrifield College',                   suburb: 'East London',   province: 'Eastern Cape',   type: 'private',       level: 'combined',  lat: -33.0150, lng: 27.9170 },
  { id: 'queens-college',      name: "Queen's College",                      suburb: 'Queenstown',    province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -31.8970, lng: 26.8770 },
  { id: 'mthatha-high',        name: 'Mthatha High School',                  suburb: 'Mthatha',       province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -31.5930, lng: 28.7920 },
  { id: 'holy-cross-mthatha',  name: 'Holy Cross High School',               suburb: 'Mthatha',       province: 'Eastern Cape',   type: 'private',       level: 'combined',  lat: -31.5870, lng: 28.7790 },
  { id: 'aliwal-north-hs',     name: 'Hoërskool Aliwal',                     suburb: 'Aliwal North',  province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -30.6900, lng: 26.7080 },
  { id: 'jeffreys-bay-hs',     name: 'Jeffreys Bay High School',             suburb: 'Jeffreys Bay',  province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -34.0340, lng: 24.9120 },
  { id: 'port-alfred-hs',      name: 'Port Alfred High School',              suburb: 'Port Alfred',   province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -33.5940, lng: 26.8870 },
  { id: 'kwt-hs',              name: 'Hoërskool Stirling',                   suburb: "King William's Town", province: 'Eastern Cape', type: 'public',    level: 'secondary', lat: -32.8810, lng: 27.3960 },

  // ───────────────────────────────────────────────────────────────────────────
  // FREE STATE
  // ───────────────────────────────────────────────────────────────────────────
  { id: 'grey-college',        name: 'Grey College',                         suburb: 'Bloemfontein',  province: 'Free State',     type: 'public',        level: 'secondary', lat: -29.1117, lng: 26.2079 },
  { id: 'eunice',              name: 'Eunice Hoërskool',                     suburb: 'Bloemfontein',  province: 'Free State',     type: 'public',        level: 'secondary', lat: -29.1150, lng: 26.2160 },
  { id: 'sentraal-bloem',      name: 'Hoërskool Sentraal',                   suburb: 'Bloemfontein',  province: 'Free State',     type: 'public',        level: 'secondary', lat: -29.1090, lng: 26.2250 },
  { id: 'jim-fouche',          name: 'Hoërskool Jim Fouché',                 suburb: 'Bloemfontein',  province: 'Free State',     type: 'public',        level: 'secondary', lat: -29.0980, lng: 26.1860 },
  { id: 'st-michaels-bloem',   name: "St Michael's School",                  suburb: 'Bloemfontein',  province: 'Free State',     type: 'private',       level: 'combined',  lat: -29.1190, lng: 26.2110 },
  { id: 'st-andrews-bloem',    name: "St Andrew's School Bloemfontein",      suburb: 'Bloemfontein',  province: 'Free State',     type: 'private',       level: 'combined',  lat: -29.1060, lng: 26.2080 },
  { id: 'curro-bloem',         name: 'Curro Bloemfontein',                   suburb: 'Bloemfontein',  province: 'Free State',     type: 'private',       level: 'combined',  lat: -29.0890, lng: 26.2420 },
  { id: 'voortrekker-bethlehem', name: 'Hoërskool Voortrekker',              suburb: 'Bethlehem',     province: 'Free State',     type: 'public',        level: 'secondary', lat: -28.2300, lng: 28.3050 },
  { id: 'welkom-gymnasium',    name: 'Welkom Gimnasium',                     suburb: 'Welkom',        province: 'Free State',     type: 'public',        level: 'secondary', lat: -27.9740, lng: 26.7290 },
  { id: 'goudveld-hs',         name: 'Hoërskool Goudveld',                   suburb: 'Welkom',        province: 'Free State',     type: 'public',        level: 'secondary', lat: -27.9810, lng: 26.7340 },
  { id: 'sasolburg-hs',        name: 'Hoërskool Sasolburg',                  suburb: 'Sasolburg',     province: 'Free State',     type: 'public',        level: 'secondary', lat: -26.8160, lng: 27.8160 },
  { id: 'kroonstad-hs',        name: 'Hoërskool Kroonstad',                  suburb: 'Kroonstad',     province: 'Free State',     type: 'public',        level: 'secondary', lat: -27.6500, lng: 27.2350 },
  { id: 'parys-hs',            name: 'Hoërskool Parys',                      suburb: 'Parys',         province: 'Free State',     type: 'public',        level: 'secondary', lat: -26.9020, lng: 27.4570 },

  // ───────────────────────────────────────────────────────────────────────────
  // MPUMALANGA
  // ───────────────────────────────────────────────────────────────────────────
  { id: 'penryn-college',      name: 'Penryn College',                       suburb: 'Mbombela',      province: 'Mpumalanga',     type: 'private',       level: 'combined',  lat: -25.4980, lng: 30.9890 },
  { id: 'uplands-college',     name: 'Uplands College',                      suburb: 'White River',   province: 'Mpumalanga',     type: 'private',       level: 'combined',  lat: -25.3220, lng: 31.0080 },
  { id: 'lowveld-high',        name: 'Lowveld High School',                  suburb: 'Mbombela',      province: 'Mpumalanga',     type: 'public',        level: 'secondary', lat: -25.4680, lng: 30.9740 },
  { id: 'nelspruit-hs',        name: 'Hoërskool Nelspruit',                  suburb: 'Mbombela',      province: 'Mpumalanga',     type: 'public',        level: 'secondary', lat: -25.4820, lng: 30.9710 },
  { id: 'witbank-hs',          name: 'Hoërskool Hoogenhout',                 suburb: 'Emalahleni',    province: 'Mpumalanga',     type: 'public',        level: 'secondary', lat: -25.8770, lng: 29.2330 },
  { id: 'curro-secunda',       name: 'Curro Secunda',                        suburb: 'Secunda',       province: 'Mpumalanga',     type: 'private',       level: 'combined',  lat: -26.5170, lng: 29.1730 },
  { id: 'middelburg-hs',       name: 'Hoërskool Middelburg',                 suburb: 'Middelburg',    province: 'Mpumalanga',     type: 'public',        level: 'secondary', lat: -25.7720, lng: 29.4640 },
  { id: 'standerton-hs',       name: 'Hoërskool Standerton',                 suburb: 'Standerton',    province: 'Mpumalanga',     type: 'public',        level: 'secondary', lat: -26.9520, lng: 29.2440 },
  { id: 'ermelo-hs',           name: 'Hoërskool Ermelo',                     suburb: 'Ermelo',        province: 'Mpumalanga',     type: 'public',        level: 'secondary', lat: -26.5320, lng: 29.9810 },
  { id: 'curro-hazyview',      name: 'Curro Hazyview',                       suburb: 'Hazyview',      province: 'Mpumalanga',     type: 'private',       level: 'combined',  lat: -25.0490, lng: 31.1230 },
  { id: 'sabie-prim',          name: 'Sabie Primary School',                 suburb: 'Sabie',         province: 'Mpumalanga',     type: 'public',        level: 'primary',   lat: -25.0980, lng: 30.7820 },

  // ───────────────────────────────────────────────────────────────────────────
  // LIMPOPO
  // ───────────────────────────────────────────────────────────────────────────
  { id: 'capricorn-hs',        name: 'Capricorn High School',                suburb: 'Polokwane',     province: 'Limpopo',        type: 'public',        level: 'secondary', lat: -23.9000, lng: 29.4490 },
  { id: 'pietersburg-hs',      name: 'Pietersburg High School',              suburb: 'Polokwane',     province: 'Limpopo',        type: 'public',        level: 'secondary', lat: -23.9020, lng: 29.4510 },
  { id: 'tom-naude',           name: 'Hoërskool Tom Naudé',                  suburb: 'Polokwane',     province: 'Limpopo',        type: 'public',        level: 'secondary', lat: -23.8970, lng: 29.4470 },
  { id: 'polokwane-hs',        name: 'Hoërskool Pietersburg',                suburb: 'Polokwane',     province: 'Limpopo',        type: 'public',        level: 'secondary', lat: -23.8950, lng: 29.4520 },
  { id: 'merensky',            name: 'Merensky High School',                 suburb: 'Tzaneen',       province: 'Limpopo',        type: 'public',        level: 'secondary', lat: -23.7770, lng: 30.1620 },
  { id: 'tzaneen-prim',        name: 'Tzaneen Primary School',               suburb: 'Tzaneen',       province: 'Limpopo',        type: 'public',        level: 'primary',   lat: -23.8330, lng: 30.1620 },
  { id: 'curro-heuwelkruin',   name: 'Curro Heuwelkruin',                    suburb: 'Polokwane',     province: 'Limpopo',        type: 'private',       level: 'combined',  lat: -23.8900, lng: 29.4670 },
  { id: 'phalaborwa-hs',       name: 'Hoërskool Phalaborwa',                 suburb: 'Phalaborwa',    province: 'Limpopo',        type: 'public',        level: 'secondary', lat: -23.9450, lng: 31.1260 },
  { id: 'mokopane-hs',         name: 'Hoërskool Potgietersrus',              suburb: 'Mokopane',      province: 'Limpopo',        type: 'public',        level: 'secondary', lat: -24.1860, lng: 29.0090 },
  { id: 'louis-trichardt-hs',  name: 'Hoërskool Louis Trichardt',            suburb: 'Louis Trichardt', province: 'Limpopo',      type: 'public',        level: 'secondary', lat: -23.0510, lng: 29.9050 },
  { id: 'thohoyandou-prim',    name: 'Thohoyandou Primary',                  suburb: 'Thohoyandou',   province: 'Limpopo',        type: 'public',        level: 'primary',   lat: -22.9460, lng: 30.4830 },

  // ───────────────────────────────────────────────────────────────────────────
  // NORTH WEST
  // ───────────────────────────────────────────────────────────────────────────
  { id: 'rustenburg-hs',       name: 'Hoërskool Rustenburg',                 suburb: 'Rustenburg',    province: 'North West',     type: 'public',        level: 'secondary', lat: -25.6680, lng: 27.2420 },
  { id: 'potch-boys',          name: 'Potchefstroom Boys High',              suburb: 'Potchefstroom', province: 'North West',     type: 'public',        level: 'secondary', lat: -26.6940, lng: 27.0980 },
  { id: 'potch-gymnasium',     name: 'Potchefstroom Gymnasium',              suburb: 'Potchefstroom', province: 'North West',     type: 'public',        level: 'secondary', lat: -26.6980, lng: 27.0950 },
  { id: 'potch-girls',         name: 'Potchefstroom Girls High',             suburb: 'Potchefstroom', province: 'North West',     type: 'public',        level: 'secondary', lat: -26.6960, lng: 27.0970 },
  { id: 'curro-klerksdorp',    name: 'Curro Klerksdorp',                     suburb: 'Klerksdorp',    province: 'North West',     type: 'private',       level: 'combined',  lat: -26.8470, lng: 26.6610 },
  { id: 'klerksdorp-hs',       name: 'Hoërskool Klerksdorp',                 suburb: 'Klerksdorp',    province: 'North West',     type: 'public',        level: 'secondary', lat: -26.8520, lng: 26.6680 },
  { id: 'lichtenburg-hs',      name: 'Hoërskool Lichtenburg',                suburb: 'Lichtenburg',   province: 'North West',     type: 'public',        level: 'secondary', lat: -26.1500, lng: 26.1620 },
  { id: 'mahikeng-hs',         name: 'Mahikeng High School',                 suburb: 'Mahikeng',      province: 'North West',     type: 'public',        level: 'secondary', lat: -25.8650, lng: 25.6440 },
  { id: 'brits-hs',            name: 'Hoërskool Brits',                      suburb: 'Brits',         province: 'North West',     type: 'public',        level: 'secondary', lat: -25.6310, lng: 27.7780 },
  { id: 'schoonspruit-hs',     name: 'Hoërskool Schoonspruit',               suburb: 'Klerksdorp',    province: 'North West',     type: 'public',        level: 'secondary', lat: -26.8540, lng: 26.6720 },
  { id: 'vryburg-hs',          name: 'Hoërskool Vryburg',                    suburb: 'Vryburg',       province: 'North West',     type: 'public',        level: 'secondary', lat: -26.9520, lng: 24.7280 },
  { id: 'stilfontein-hs',      name: 'Hoërskool Stilfontein',                suburb: 'Stilfontein',   province: 'North West',     type: 'public',        level: 'secondary', lat: -26.8410, lng: 26.7530 },

  // ───────────────────────────────────────────────────────────────────────────
  // NORTHERN CAPE
  // ───────────────────────────────────────────────────────────────────────────
  { id: 'kim-boys',            name: 'Kimberley Boys High School',           suburb: 'Kimberley',     province: 'Northern Cape',  type: 'public',        level: 'secondary', lat: -28.7350, lng: 24.7650 },
  { id: 'kim-girls',           name: 'Kimberley Girls High',                 suburb: 'Kimberley',     province: 'Northern Cape',  type: 'public',        level: 'secondary', lat: -28.7330, lng: 24.7670 },
  { id: 'diamantveld',         name: 'Hoërskool Diamantveld',                suburb: 'Kimberley',     province: 'Northern Cape',  type: 'public',        level: 'secondary', lat: -28.7470, lng: 24.7790 },
  { id: 'upington-hs',         name: 'Hoërskool Upington',                   suburb: 'Upington',      province: 'Northern Cape',  type: 'public',        level: 'secondary', lat: -28.4480, lng: 21.2470 },
  { id: 'kuruman-hs',          name: 'Hoërskool Kuruman',                    suburb: 'Kuruman',       province: 'Northern Cape',  type: 'public',        level: 'secondary', lat: -27.4570, lng: 23.4310 },
  { id: 'springbok-hs',        name: 'Hoërskool Namakwaland',                suburb: 'Springbok',     province: 'Northern Cape',  type: 'public',        level: 'secondary', lat: -29.6630, lng: 17.8870 },
  { id: 'kathu-hs',            name: 'Hoërskool Kathu',                      suburb: 'Kathu',         province: 'Northern Cape',  type: 'public',        level: 'secondary', lat: -27.6920, lng: 23.0390 },
  { id: 'de-aar-hs',           name: 'Hoërskool De Aar',                     suburb: 'De Aar',        province: 'Northern Cape',  type: 'public',        level: 'secondary', lat: -30.6500, lng: 24.0080 },
  { id: 'calvinia-hs',         name: 'Hoërskool Calvinia',                   suburb: 'Calvinia',      province: 'Northern Cape',  type: 'public',        level: 'secondary', lat: -31.4670, lng: 19.7780 },
  { id: 'kim-prim',            name: 'Kimberley Junior School',              suburb: 'Kimberley',     province: 'Northern Cape',  type: 'public',        level: 'primary',   lat: -28.7370, lng: 24.7660 },

  // ───────────────────────────────────────────────────────────────────────────
  // FILL-INS — additional well-known schools across regions
  // ───────────────────────────────────────────────────────────────────────────
  { id: 'st-stithians-boys-prep', name: 'St Stithians Boys Prep School',     suburb: 'Lyme Park',     province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.0500, lng: 28.0344 },
  { id: 'st-stithians-girls-prep', name: 'St Stithians Girls Prep School',   suburb: 'Lyme Park',     province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.0510, lng: 28.0354 },
  { id: 'st-johns-prep',       name: "St John's Preparatory School",         suburb: 'Houghton',      province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.1740, lng: 28.0540 },
  { id: 'bryanston-methodist', name: 'Bryanston Methodist Preparatory',      suburb: 'Bryanston',     province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.0540, lng: 28.0220 },
  { id: 'hartbeespoort-hs',    name: 'Hoërskool Hartbeespoort',              suburb: 'Hartbeespoort', province: 'North West',     type: 'public',        level: 'secondary', lat: -25.7460, lng: 27.8480 },
  { id: 'voortrekker-pta',     name: 'Hoërskool Voortrekker Pretoria',       suburb: 'Pretoria',      province: 'Gauteng',        type: 'public',        level: 'secondary', lat: -25.7480, lng: 28.1880 },
  { id: 'bridge-house',        name: 'Bridge House College',                 suburb: 'Franschhoek',   province: 'Western Cape',   type: 'private',       level: 'combined',  lat: -33.9050, lng: 19.0710 },
  { id: 'df-malan',            name: 'DF Malan Hoërskool',                   suburb: 'Bellville',     province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.8980, lng: 18.6280 },
  { id: 'brackenfell-hs',      name: 'Hoërskool Brackenfell',                suburb: 'Brackenfell',   province: 'Western Cape',   type: 'public',        level: 'secondary', lat: -33.8730, lng: 18.6940 },
  { id: 'crawford-pinetown',   name: 'Crawford International Pinetown',      suburb: 'Pinetown',      province: 'KwaZulu-Natal',  type: 'private',       level: 'combined',  lat: -29.8230, lng: 30.8550 },
  { id: 'curro-mt-edgecombe',  name: 'Curro Mount Edgecombe',                suburb: 'Mount Edgecombe', province: 'KwaZulu-Natal', type: 'private',       level: 'combined',  lat: -29.7280, lng: 31.0400 },
  { id: 'cambridge-hs',        name: 'Cambridge High School',                suburb: 'East London',   province: 'Eastern Cape',   type: 'public',        level: 'secondary', lat: -33.0150, lng: 27.8930 },
  { id: 'curro-witbank',       name: 'Curro Witbank',                        suburb: 'Emalahleni',    province: 'Mpumalanga',     type: 'private',       level: 'combined',  lat: -25.8520, lng: 29.2480 },
  { id: 'reddam-pretoria',     name: 'Reddam House Pretoria',                suburb: 'Pretoria East', province: 'Gauteng',        type: 'private',       level: 'combined',  lat: -25.7860, lng: 28.3290 },
  { id: 'roedean-prep',        name: 'Roedean Junior School',                suburb: 'Parktown',      province: 'Gauteng',        type: 'private',       level: 'primary',   lat: -26.1795, lng: 28.0420 },
];

export function getSchoolById(id: string): School | undefined {
  return SA_SCHOOLS.find((s) => s.id === id);
}

/** Suburbs that have at least one school in our list. */
export function suburbHasSchools(suburb: string): boolean {
  const lower = suburb.toLowerCase();
  return SA_SCHOOLS.some((s) => s.suburb.toLowerCase() === lower);
}
