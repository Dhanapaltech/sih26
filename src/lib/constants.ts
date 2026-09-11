/**
 * Static reference constants for the Jharkhand Innovation Hub.
 * These are real geographic/domain constants, not demo/mock data.
 * District population data is from Census of India 2011.
 */

export interface JharkhandDistrictRef {
  id: string;
  name: string;
  lat: number;
  lng: number;
  population: number;
}

export const JHARKHAND_DISTRICTS: JharkhandDistrictRef[] = [
  { id: 'ranchi', name: 'Ranchi', lat: 23.3441, lng: 85.3096, population: 1072731 },
  { id: 'dhanbad', name: 'Dhanbad', lat: 23.7957, lng: 86.4304, population: 2684487 },
  { id: 'jamshedpur', name: 'Jamshedpur', lat: 22.8046, lng: 86.2029, population: 1337131 },
  { id: 'bokaro', name: 'Bokaro', lat: 23.6693, lng: 86.1511, population: 2062330 },
  { id: 'deoghar', name: 'Deoghar', lat: 24.4855, lng: 86.6945, population: 1491879 },
  { id: 'dumka', name: 'Dumka', lat: 24.2668, lng: 87.2491, population: 1321442 },
  { id: 'hazaribagh', name: 'Hazaribagh', lat: 23.9925, lng: 85.3637, population: 1734005 },
  { id: 'giridih', name: 'Giridih', lat: 24.1884, lng: 86.3003, population: 2445203 },
  { id: 'ramgarh', name: 'Ramgarh', lat: 23.6298, lng: 85.5122, population: 949443 },
  { id: 'palamu', name: 'Palamu', lat: 24.0292, lng: 84.0634, population: 1939869 },
  { id: 'latehar', name: 'Latehar', lat: 23.7453, lng: 84.5024, population: 726978 },
  { id: 'gumla', name: 'Gumla', lat: 23.0453, lng: 84.5374, population: 1025656 },
  { id: 'simdega', name: 'Simdega', lat: 22.6153, lng: 84.5022, population: 599813 },
  { id: 'khunti', name: 'Khunti', lat: 23.0723, lng: 85.2763, population: 531885 },
  { id: 'chaibasa', name: 'Chaibasa', lat: 22.5588, lng: 85.8087, population: 1500000 },
];

export const JHARKHAND_DISTRICT_NAMES: string[] = JHARKHAND_DISTRICTS.map((d) => d.name);

export interface ChallengeCategoryRef {
  id: string;
  name: string;
  icon: string;
}

export const CHALLENGE_CATEGORIES: ChallengeCategoryRef[] = [
  { id: 'water', name: 'Water Management', icon: '💧' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'agriculture', name: 'Agriculture', icon: '🌾' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'environment', name: 'Environment', icon: '🌿' },
  { id: 'energy', name: 'Energy', icon: '⚡' },
  { id: 'urban', name: 'Urban Development', icon: '🏙️' },
  { id: 'rural', name: 'Rural Livelihoods', icon: '🏘️' },
  { id: 'accessibility', name: 'Accessibility', icon: '♿' },
  { id: 'admin', name: 'Public Administration', icon: '🏛️' },
];

export const CHALLENGE_CATEGORY_NAMES: string[] = CHALLENGE_CATEGORIES.map((c) => c.name);

/** Innovation lifecycle steps — static UI description of platform workflow */
export const INNOVATION_LIFECYCLE_STEPS = [
  { label: 'Citizen', role: 'Reports grassroots issue' },
  { label: 'Problem', role: 'Geolocated & evidence backed' },
  { label: 'AI Engine', role: 'Categorized & priority scored' },
  { label: 'Government', role: 'Validated & allocated' },
  { label: 'University', role: 'MOU & labs assigned' },
  { label: 'Faculty', role: 'Principal Investigator leads' },
  { label: 'Students', role: 'Engineering cells build' },
  { label: 'Industry', role: 'CSR hardware & funding' },
  { label: 'Prototype', role: 'Lab calibrated' },
  { label: 'Field Pilot', role: 'Tested in villages' },
  { label: 'Deployment', role: 'Statewide scaling' },
  { label: 'Impact', role: 'Citizens benefited' },
];
