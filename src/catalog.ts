import { extendedUnits } from './extended-units';

export type Unit = {
  id: string;
  name: string;
  symbol: string;
  aliases: string[];
  icon: string;
  system: string;
  source: string;
  field: string;
  year: number | null;
  milestone: string;
  measures: string;
  relation: string;
};

// Dates identify the stated formal milestone, not the unit's invention.
// Sources: BIPM SI Brochure and NIST SP 330, Appendix 1 (see SOURCES.md).
export const sources = {
  units: 'https://www.bipm.org/en/publications/si-brochure',
  history: 'https://www.nist.gov/pml/special-publication-330/sp-330-appendix-1',
};

const siUnits: Omit<Unit, 'icon' | 'system' | 'source'>[] = [
  { id: 'metre', name: 'Metre', symbol: 'm', aliases: ['meter', 'metres', 'meters'], field: 'Mechanics', year: 1983, milestone: 'Light-speed definition adopted', measures: 'Length', relation: 'Light travels 1 in 1/299,792,458 s.' },
  { id: 'kilogram', name: 'Kilogram', symbol: 'kg', aliases: ['kilograms', 'kilo'], field: 'Mechanics', year: 1889, milestone: 'International prototype adopted', measures: 'Mass', relation: '1,000 g' },
  { id: 'second', name: 'Second', symbol: 's', aliases: ['seconds', 'sec'], field: 'Time & motion', year: 1967, milestone: 'Atomic definition adopted', measures: 'Time', relation: '9,192,631,770 caesium-133 oscillations.' },
  { id: 'ampere', name: 'Ampere', symbol: 'A', aliases: ['amperes', 'amp', 'amps'], field: 'Electricity', year: 1948, milestone: 'Electrical definition ratified', measures: 'Electric current', relation: '1 C/s' },
  { id: 'kelvin', name: 'Kelvin', symbol: 'K', aliases: ['kelvins'], field: 'Thermodynamics', year: 1967, milestone: 'Current name adopted', measures: 'Thermodynamic temperature', relation: 'An interval of 1 equals an interval of 1 °C.' },
  { id: 'mole', name: 'Mole', symbol: 'mol', aliases: ['moles'], field: 'Chemistry', year: 1971, milestone: 'Added as an SI base unit', measures: 'Amount of substance', relation: 'Exactly 6.02214076 × 10²³ entities.' },
  { id: 'candela', name: 'Candela', symbol: 'cd', aliases: ['candelas'], field: 'Light', year: 1979, milestone: 'Radiometric definition adopted', measures: 'Luminous intensity', relation: '1 lm/sr' },
  { id: 'newton', name: 'Newton', symbol: 'N', aliases: ['newtons'], field: 'Mechanics', year: 1948, milestone: 'Unit name adopted', measures: 'Force', relation: '1 kg·m/s²' },
  { id: 'pascal', name: 'Pascal', symbol: 'Pa', aliases: ['pascals'], field: 'Mechanics', year: 1971, milestone: 'SI name adopted', measures: 'Pressure & stress', relation: '1 N/m²' },
  { id: 'joule', name: 'Joule', symbol: 'J', aliases: ['joules'], field: 'Mechanics', year: 1948, milestone: 'Adopted for quantity of heat', measures: 'Energy & work', relation: '1 N·m' },
  { id: 'watt', name: 'Watt', symbol: 'W', aliases: ['watts'], field: 'Mechanics', year: 1960, milestone: 'Included in the SI', measures: 'Power', relation: '1 J/s' },
  { id: 'coulomb', name: 'Coulomb', symbol: 'C', aliases: ['coulombs'], field: 'Electricity', year: 1960, milestone: 'Included in the SI', measures: 'Electric charge', relation: '1 A·s' },
  { id: 'volt', name: 'Volt', symbol: 'V', aliases: ['volts'], field: 'Electricity', year: 1948, milestone: 'Electrical definition ratified', measures: 'Electric potential difference', relation: '1 W/A' },
  { id: 'farad', name: 'Farad', symbol: 'F', aliases: ['farads'], field: 'Electricity', year: 1948, milestone: 'Electrical definition ratified', measures: 'Capacitance', relation: '1 C/V' },
  { id: 'ohm', name: 'Ohm', symbol: 'Ω', aliases: ['ohms', 'omega'], field: 'Electricity', year: 1948, milestone: 'Electrical definition ratified', measures: 'Electric resistance', relation: '1 V/A' },
  { id: 'siemens', name: 'Siemens', symbol: 'S', aliases: ['mho'], field: 'Electricity', year: 1971, milestone: 'SI name adopted', measures: 'Electric conductance', relation: '1 A/V' },
  { id: 'weber', name: 'Weber', symbol: 'Wb', aliases: ['webers'], field: 'Magnetism', year: 1948, milestone: 'Electrical definition ratified', measures: 'Magnetic flux', relation: '1 V·s' },
  { id: 'tesla', name: 'Tesla', symbol: 'T', aliases: ['teslas'], field: 'Magnetism', year: 1960, milestone: 'Included in the SI', measures: 'Magnetic flux density', relation: '1 Wb/m²' },
  { id: 'henry', name: 'Henry', symbol: 'H', aliases: ['henries', 'henrys'], field: 'Magnetism', year: 1948, milestone: 'Electrical definition ratified', measures: 'Inductance', relation: '1 Wb/A' },
  { id: 'hertz', name: 'Hertz', symbol: 'Hz', aliases: [], field: 'Time & motion', year: 1960, milestone: 'Included in the SI', measures: 'Frequency', relation: '1 cycle/s' },
  { id: 'lumen', name: 'Lumen', symbol: 'lm', aliases: ['lumens'], field: 'Light', year: 1960, milestone: 'Included in the SI', measures: 'Luminous flux', relation: '1 cd·sr' },
  { id: 'lux', name: 'Lux', symbol: 'lx', aliases: [], field: 'Light', year: 1960, milestone: 'Included in the SI', measures: 'Illuminance', relation: '1 lm/m²' },
  { id: 'becquerel', name: 'Becquerel', symbol: 'Bq', aliases: ['becquerels'], field: 'Radiation', year: 1975, milestone: 'SI name adopted', measures: 'Radioactive activity', relation: '1 nuclear decay/s' },
  { id: 'gray', name: 'Gray', symbol: 'Gy', aliases: ['grays', 'grey'], field: 'Radiation', year: 1975, milestone: 'SI name adopted', measures: 'Absorbed radiation dose', relation: '1 J/kg absorbed' },
  { id: 'sievert', name: 'Sievert', symbol: 'Sv', aliases: ['sieverts'], field: 'Radiation', year: 1979, milestone: 'SI name adopted', measures: 'Radiation dose equivalent', relation: '1 J/kg, weighted for radiation effect' },
  { id: 'katal', name: 'Katal', symbol: 'kat', aliases: ['katals'], field: 'Chemistry', year: 1999, milestone: 'SI name adopted', measures: 'Catalytic activity', relation: '1 mol/s' },
  { id: 'celsius', name: 'Degree Celsius', symbol: '°C', aliases: ['celsius', 'degrees celsius', 'centigrade'], field: 'Thermodynamics', year: 1948, milestone: 'Current name adopted', measures: 'Celsius temperature', relation: '0 = 273.15 K' },
  { id: 'radian', name: 'Radian', symbol: 'rad', aliases: ['radians'], field: 'Geometry', year: 1995, milestone: 'Classified as an SI derived unit', measures: 'Plane angle', relation: 'Arc length ÷ radius' },
  { id: 'steradian', name: 'Steradian', symbol: 'sr', aliases: ['steradians'], field: 'Geometry', year: 1995, milestone: 'Classified as an SI derived unit', measures: 'Solid angle', relation: 'Surface area ÷ radius²' },
];

const siIcons: Record<string, string> = {
  metre: '📏', kilogram: '⚖️', second: '⏱️', ampere: '🔌', kelvin: '🧊', mole: '⚗️', candela: '🕯️',
  newton: '🍎', pascal: '🎈', joule: '🔋', watt: '💡', coulomb: '⚡', volt: '🔌', farad: '🪫', ohm: '🚧',
  siemens: '🛤️', weber: '🧲', tesla: '🧭', henry: '🌀', hertz: '📻', lumen: '🔦', lux: '☀️',
  becquerel: '☢️', gray: '🩻', sievert: '🛡️', katal: '🧪', celsius: '🌡️', radian: '📐', steradian: '🔭',
};

const customarySource = 'https://www.nist.gov/pml/owm/si-units-length';
const customaryHistory = 'https://usma.org/laws-and-bills/refinement-of-values-for-the-yard-and-the-pound';
const imperialHistory = 'https://www.nist.gov/system/files/documents/2024/01/14/NIST%20HB%2044%202024%20Appendix%20B%20Units%20and%20Systems%20of%20Measurement.pdf';
const conversions = 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors';
const astronomy = 'https://iau.org/public/themes/measuring';

const otherUnits: Unit[] = [
  { id: 'inch', name: 'Inch', symbol: 'in', aliases: ['inches'], icon: '🤏', system: 'Imperial / US', field: 'Mechanics', year: 1959, milestone: 'International length basis adopted', measures: 'Length', relation: 'Exactly 25.4 mm', source: customaryHistory },
  { id: 'foot', name: 'Foot', symbol: 'ft', aliases: ['feet', 'international foot'], icon: '🦶', system: 'Imperial / US', field: 'Mechanics', year: 1959, milestone: 'International definition adopted', measures: 'Length', relation: 'Exactly 0.3048 m', source: customarySource },
  { id: 'yard', name: 'Yard', symbol: 'yd', aliases: ['yards'], icon: '🧵', system: 'Imperial / US', field: 'Mechanics', year: 1959, milestone: 'International definition adopted', measures: 'Length', relation: 'Exactly 0.9144 m', source: customaryHistory },
  { id: 'mile', name: 'Mile', symbol: 'mi', aliases: ['miles', 'international mile'], icon: '🛣️', system: 'Imperial / US', field: 'Mechanics', year: 1959, milestone: 'International length basis adopted', measures: 'Length', relation: '5,280 ft = 1,609.344 m', source: customaryHistory },
  { id: 'pound', name: 'Pound', symbol: 'lb', aliases: ['pounds', 'lbs', 'avoirdupois pound'], icon: '🏋️', system: 'Imperial / US', field: 'Mechanics', year: 1959, milestone: 'International mass definition adopted', measures: 'Mass', relation: 'Exactly 0.45359237 kg', source: customaryHistory },
  { id: 'ounce', name: 'Ounce', symbol: 'oz', aliases: ['ounces', 'avoirdupois ounce'], icon: '🍫', system: 'Imperial / US', field: 'Mechanics', year: 1959, milestone: 'International mass basis adopted', measures: 'Mass', relation: '1/16 lb ≈ 28.35 g', source: customaryHistory },
  { id: 'short-ton', name: 'Short ton', symbol: 'ton (US)', aliases: ['us ton', 'short tons'], icon: '🚚', system: 'US customary', field: 'Mechanics', year: 1959, milestone: 'International mass basis adopted', measures: 'Mass', relation: '2,000 lb', source: imperialHistory },
  { id: 'long-ton', name: 'Long ton', symbol: 'ton (imp)', aliases: ['imperial ton', 'long tons'], icon: '🚢', system: 'Imperial', field: 'Mechanics', year: 1959, milestone: 'International mass basis adopted', measures: 'Mass', relation: '2,240 lb', source: imperialHistory },
  { id: 'stone', name: 'Stone', symbol: 'st', aliases: ['stones'], icon: '🪨', system: 'Imperial', field: 'Mechanics', year: 1959, milestone: 'International mass basis adopted', measures: 'Mass', relation: '14 lb', source: conversions },
  { id: 'us-gallon', name: 'US gallon', symbol: 'gal (US)', aliases: ['us liquid gallon', 'american gallon'], icon: '🥛', system: 'US customary', field: 'Fluids', year: 1959, milestone: 'International inch basis adopted', measures: 'Liquid volume', relation: '231 in³ ≈ 3.785 L', source: imperialHistory },
  { id: 'imperial-gallon', name: 'Imperial gallon', symbol: 'gal (imp)', aliases: ['uk gallon', 'british gallon'], icon: '🫖', system: 'Imperial', field: 'Fluids', year: 1824, milestone: 'Capacity standard introduced', measures: 'Volume', relation: 'Exactly 4.54609 L', source: imperialHistory },
  { id: 'us-pint', name: 'US pint', symbol: 'pt (US)', aliases: ['us liquid pint', 'american pint'], icon: '🍺', system: 'US customary', field: 'Fluids', year: 1959, milestone: 'International inch basis adopted', measures: 'Liquid volume', relation: '16 US fl oz ≈ 473.176 mL', source: imperialHistory },
  { id: 'imperial-pint', name: 'Imperial pint', symbol: 'pt (imp)', aliases: ['uk pint', 'british pint'], icon: '🍻', system: 'Imperial', field: 'Fluids', year: 1824, milestone: 'Capacity system introduced', measures: 'Volume', relation: '20 imperial fl oz ≈ 568.261 mL', source: imperialHistory },
  { id: 'us-fluid-ounce', name: 'US fluid ounce', symbol: 'fl oz (US)', aliases: ['us fl oz', 'american fluid ounce'], icon: '💧', system: 'US customary', field: 'Fluids', year: 1959, milestone: 'International inch basis adopted', measures: 'Liquid volume', relation: '1/128 US gal ≈ 29.574 mL', source: imperialHistory },
  { id: 'imperial-fluid-ounce', name: 'Imperial fluid ounce', symbol: 'fl oz (imp)', aliases: ['uk fluid ounce', 'imperial fl oz'], icon: '🫗', system: 'Imperial', field: 'Fluids', year: 1824, milestone: 'Capacity system introduced', measures: 'Volume', relation: '1/160 imperial gal ≈ 28.413 mL', source: imperialHistory },
  { id: 'fahrenheit', name: 'Degree Fahrenheit', symbol: '°F', aliases: ['fahrenheit', 'degrees fahrenheit'], icon: '🔥', system: 'Imperial / US', field: 'Thermodynamics', year: 1724, milestone: 'Temperature scale proposed', measures: 'Temperature', relation: '32 = 0 °C; 212 = 100 °C', source: 'https://en.wikipedia.org/wiki/Fahrenheit' },
  { id: 'rankine', name: 'Degree Rankine', symbol: '°R', aliases: ['rankine', 'degrees rankine'], icon: '❄️', system: 'Engineering', field: 'Thermodynamics', year: 1859, milestone: 'Absolute scale proposed', measures: 'Absolute temperature', relation: '1 = 5/9 K', source: 'https://en.wikipedia.org/wiki/Rankine_scale' },
  { id: 'horsepower', name: 'Mechanical horsepower', symbol: 'hp', aliases: ['horsepower', 'imperial horsepower'], icon: '🐎', system: 'Imperial / US', field: 'Mechanics', year: null, milestone: 'Developed in the late 18th century', measures: 'Power', relation: '550 ft·lbf/s ≈ 745.7 W', source: 'https://en.wikipedia.org/wiki/Horsepower' },
  { id: 'psi', name: 'Pound per square inch', symbol: 'psi', aliases: ['pounds per square inch'], icon: '🛞', system: 'Imperial / US', field: 'Mechanics', year: 1959, milestone: 'International mass & length basis adopted', measures: 'Pressure', relation: '≈ 6,894.757 Pa', source: conversions },
  { id: 'nautical-mile', name: 'Nautical mile', symbol: 'nmi', aliases: ['nautical miles', 'international nautical mile'], icon: '⚓', system: 'Navigation', field: 'Mechanics', year: 1929, milestone: 'International definition adopted', measures: 'Length', relation: 'Exactly 1,852 m', source: 'https://usma.org/laws-and-bills/adoption-of-international-nautical-mile' },
  { id: 'knot', name: 'Knot', symbol: 'kn', aliases: ['knots', 'kt'], icon: '⛵', system: 'Navigation', field: 'Time & motion', year: 1929, milestone: 'International distance basis adopted', measures: 'Speed', relation: '1 nmi/h = 1.852 km/h', source: 'https://usma.org/laws-and-bills/adoption-of-international-nautical-mile' },
  { id: 'litre', name: 'Litre', symbol: 'L', aliases: ['liter', 'litres', 'liters'], icon: '🧃', system: 'Metric', field: 'Fluids', year: 1964, milestone: 'Cubic-decimetre definition restored', measures: 'Volume', relation: '1 dm³ = 1,000 mL', source: sources.history },
  { id: 'hectare', name: 'Hectare', symbol: 'ha', aliases: ['hectares'], icon: '🌾', system: 'Metric', field: 'Geometry', year: 1879, milestone: 'Unit and symbol adopted by CIPM', measures: 'Land area', relation: '10,000 m²', source: 'https://www.nist.gov/pml/special-publication-330/sp-330-section-4' },
  { id: 'tonne', name: 'Tonne', symbol: 't', aliases: ['metric ton', 'tonnes', 'metric tonne'], icon: '🐘', system: 'Metric', field: 'Mechanics', year: 1879, milestone: 'Unit and symbol adopted by CIPM', measures: 'Mass', relation: '1,000 kg', source: 'https://www.nist.gov/pml/special-publication-330/sp-330-section-4' },
  { id: 'bar', name: 'Bar', symbol: 'bar', aliases: ['bars'], icon: '🌬️', system: 'Metric', field: 'Mechanics', year: null, milestone: 'Introduced in the early 20th century', measures: 'Pressure', relation: '100,000 Pa', source: 'https://en.wikipedia.org/wiki/Bar_(unit)' },
  { id: 'atmosphere', name: 'Standard atmosphere', symbol: 'atm', aliases: ['atmosphere', 'atmospheres'], icon: '🌍', system: 'Non-SI', field: 'Mechanics', year: 1954, milestone: 'General-use definition adopted', measures: 'Pressure', relation: 'Exactly 101,325 Pa', source: 'https://www.bipm.org/en/committees/cg/cgpm/10-1954/resolution-4' },
  { id: 'dyne', name: 'Dyne', symbol: 'dyn', aliases: ['dynes'], icon: '🪶', system: 'CGS', field: 'Mechanics', year: 1873, milestone: 'Name proposed by BAAS committee', measures: 'Force', relation: '1 g·cm/s² = 10⁻⁵ N', source: 'https://en.wikipedia.org/wiki/Dyne' },
  { id: 'erg', name: 'Erg', symbol: 'erg', aliases: ['ergs'], icon: '🐜', system: 'CGS', field: 'Mechanics', year: 1873, milestone: 'Name recommended by BAAS committee', measures: 'Energy & work', relation: '10⁻⁷ J', source: 'https://en.wikipedia.org/wiki/Erg' },
  { id: 'calorie', name: 'Thermochemical calorie', symbol: 'cal', aliases: ['calorie', 'small calorie'], icon: '🍪', system: 'Non-SI', field: 'Thermodynamics', year: null, milestone: 'Several historical definitions exist', measures: 'Energy', relation: 'Exactly 4.184 J', source: conversions },
  { id: 'astronomical-unit', name: 'Astronomical unit', symbol: 'au', aliases: ['astronomical units'], icon: '🪐', system: 'Astronomy', field: 'Space', year: 2012, milestone: 'Exact length adopted by IAU', measures: 'Distance', relation: 'Exactly 149,597,870,700 m', source: astronomy },
  { id: 'parsec', name: 'Parsec', symbol: 'pc', aliases: ['parsecs'], icon: '🔭', system: 'Astronomy', field: 'Space', year: 2015, milestone: 'Exact relation stated by IAU', measures: 'Distance', relation: '648,000/π au ≈ 3.262 ly', source: 'https://doi.org/10.3847/0004-6256/152/2/41' },
  { id: 'light-year', name: 'Light-year', symbol: 'ly', aliases: ['light year', 'light years', 'lightyear'], icon: '🌠', system: 'Astronomy', field: 'Space', year: null, milestone: 'In use since the 19th century', measures: 'Distance, not time', relation: 'Distance light travels in 365.25 days.', source: astronomy },
  { id: 'bit', name: 'Bit', symbol: 'bit', aliases: ['bits', 'binary digit'], icon: '💾', system: 'Digital', field: 'Information', year: 1948, milestone: 'Name used in Shannon’s paper', measures: 'Information', relation: 'One binary choice: 0 or 1.', source: 'https://www.nature.com/articles/nphys3878' },
  { id: 'byte', name: 'Byte', symbol: 'B', aliases: ['bytes', 'octet'], icon: '👾', system: 'Digital', field: 'Information', year: 1956, milestone: 'Name coined at IBM', measures: 'Data size', relation: '8 bits in modern usage', source: 'https://www.nature.com/articles/nphys3878' },
  { id: 'minute', name: 'Minute', symbol: 'min', aliases: ['minutes'], icon: '⏲️', system: 'Time', field: 'Time & motion', year: null, milestone: 'Ancient sexagesimal origins', measures: 'Time', relation: '60 s', source: sources.units },
  { id: 'hour', name: 'Hour', symbol: 'h', aliases: ['hours', 'hr'], icon: '🕰️', system: 'Time', field: 'Time & motion', year: null, milestone: 'Ancient origins; no single start year', measures: 'Time', relation: '3,600 s', source: sources.units },
  { id: 'day', name: 'Day', symbol: 'd', aliases: ['days'], icon: '🌅', system: 'Time', field: 'Time & motion', year: null, milestone: 'Ancient origins; no single start year', measures: 'Time', relation: '86,400 s as a unit of duration', source: sources.units },
  { id: 'degree', name: 'Degree', symbol: '°', aliases: ['degrees', 'angular degree'], icon: '🧀', system: 'Geometry', field: 'Geometry', year: null, milestone: 'Ancient sexagesimal origins', measures: 'Plane angle', relation: 'π/180 rad', source: sources.units },
  { id: 'electronvolt', name: 'Electronvolt', symbol: 'eV', aliases: ['electron volt', 'electronvolts'], icon: '⚛️', system: 'Atomic', field: 'Particles', year: 2019, milestone: 'SI charge fix made conversion exact', measures: 'Energy', relation: '1.602176634 × 10⁻¹⁹ J', source: sources.units },
  { id: 'dalton', name: 'Dalton', symbol: 'Da', aliases: ['unified atomic mass unit', 'atomic mass unit', 'amu', 'u'], icon: '🧬', system: 'Atomic', field: 'Particles', year: 1961, milestone: 'Unified carbon-12 scale adopted', measures: 'Atomic & molecular mass', relation: '1/12 the mass of a free carbon-12 atom at rest, in its ground state.', source: 'https://en.wikipedia.org/wiki/Dalton_(unit)' },
  { id: 'carat', name: 'Metric carat', symbol: 'ct', aliases: ['carat', 'carats'], icon: '💎', system: 'Metric', field: 'Mechanics', year: 1907, milestone: 'Metric definition adopted by CGPM', measures: 'Gemstone mass', relation: 'Exactly 200 mg', source: sources.history },
];

export const units: Unit[] = [
  ...siUnits.map(unit => ({ ...unit, icon: siIcons[unit.id], system: 'SI', source: sources.history })),
  ...otherUnits,
  ...extendedUnits,
];
