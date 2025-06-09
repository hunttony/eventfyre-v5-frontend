// Common US states with their abbreviations
export const US_STATES = [
  { name: 'Alabama', abbreviation: 'AL' },
  { name: 'Alaska', abbreviation: 'AK' },
  { name: 'Arizona', abbreviation: 'AZ' },
  { name: 'Arkansas', abbreviation: 'AR' },
  { name: 'California', abbreviation: 'CA' },
  { name: 'Colorado', abbreviation: 'CO' },
  { name: 'Connecticut', abbreviation: 'CT' },
  { name: 'Delaware', abbreviation: 'DE' },
  { name: 'Florida', abbreviation: 'FL' },
  { name: 'Georgia', abbreviation: 'GA' },
  { name: 'Hawaii', abbreviation: 'HI' },
  { name: 'Idaho', abbreviation: 'ID' },
  { name: 'Illinois', abbreviation: 'IL' },
  { name: 'Indiana', abbreviation: 'IN' },
  { name: 'Iowa', abbreviation: 'IA' },
  { name: 'Kansas', abbreviation: 'KS' },
  { name: 'Kentucky', abbreviation: 'KY' },
  { name: 'Louisiana', abbreviation: 'LA' },
  { name: 'Maine', abbreviation: 'ME' },
  { name: 'Maryland', abbreviation: 'MD' },
  { name: 'Massachusetts', abbreviation: 'MA' },
  { name: 'Michigan', abbreviation: 'MI' },
  { name: 'Minnesota', abbreviation: 'MN' },
  { name: 'Mississippi', abbreviation: 'MS' },
  { name: 'Missouri', abbreviation: 'MO' },
  { name: 'Montana', abbreviation: 'MT' },
  { name: 'Nebraska', abbreviation: 'NE' },
  { name: 'Nevada', abbreviation: 'NV' },
  { name: 'New Hampshire', abbreviation: 'NH' },
  { name: 'New Jersey', abbreviation: 'NJ' },
  { name: 'New Mexico', abbreviation: 'NM' },
  { name: 'New York', abbreviation: 'NY' },
  { name: 'North Carolina', abbreviation: 'NC' },
  { name: 'North Dakota', abbreviation: 'ND' },
  { name: 'Ohio', abbreviation: 'OH' },
  { name: 'Oklahoma', abbreviation: 'OK' },
  { name: 'Oregon', abbreviation: 'OR' },
  { name: 'Pennsylvania', abbreviation: 'PA' },
  { name: 'Rhode Island', abbreviation: 'RI' },
  { name: 'South Carolina', abbreviation: 'SC' },
  { name: 'South Dakota', abbreviation: 'SD' },
  { name: 'Tennessee', abbreviation: 'TN' },
  { name: 'Texas', abbreviation: 'TX' },
  { name: 'Utah', abbreviation: 'UT' },
  { name: 'Vermont', abbreviation: 'VT' },
  { name: 'Virginia', abbreviation: 'VA' },
  { name: 'Washington', abbreviation: 'WA' },
  { name: 'West Virginia', abbreviation: 'WV' },
  { name: 'Wisconsin', abbreviation: 'WI' },
  { name: 'Wyoming', abbreviation: 'WY' }
];

// Function to get cities for a state (mock implementation - in a real app, you'd use a proper API)
export const getCitiesForState = async (stateAbbr) => {
  // This is a mock implementation
  // In a real app, you would call an API like the Google Places API or similar
  const mockCities = {
    'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'],
    'NY': ['New York', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse'],
    'TX': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth'],
    'FL': ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg'],
    'IL': ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford']
  };
  
  // Return mock cities for the state, or an empty array if no cities found
  return mockCities[stateAbbr] || [];
};

// Function to get zip codes for a city (mock implementation)
export const getZipCodesForCity = async (stateAbbr, city) => {
  // This is a mock implementation
  // In a real app, you would call an API like the USPS API or similar
  const mockZipCodes = {
    'CA': {
      'Los Angeles': ['90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008', '90009', '90010'],
      'San Francisco': ['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110', '94111', '94112'],
      'San Diego': ['92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109', '92110'],
      'San Jose': ['95101', '95102', '95103', '95106', '95108', '95109', '95110', '95111', '95112', '95113'],
      'Sacramento': ['95811', '95812', '95813', '95814', '95815', '95816', '95817', '95818', '95819', '95820']
    },
    'NY': {
      'New York': ['10001', '10002', '10003', '10004', '10005', '10006', '10007', '10009', '10010', '10011'],
      'Buffalo': ['14201', '14202', '14203', '14204', '14206', '14207', '14208', '14209', '14210', '14211'],
      'Rochester': ['14602', '14603', '14604', '14605', '14606', '14607', '14608', '14609', '14610', '14611'],
      'Yonkers': ['10701', '10702', '10703', '10704', '10705', '10706', '10707', '10708', '10710'],
      'Syracuse': ['13202', '13203', '13204', '13205', '13206', '13207', '13208', '13210', '13212', '13214']
    },
    'TX': {
      'Houston': ['77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008', '77009', '77010'],
      'San Antonio': ['78201', '78202', '78203', '78204', '78205', '78207', '78208', '78209', '78210', '78211'],
      'Dallas': ['75201', '75202', '75203', '75204', '75205', '75206', '75207', '75208', '75209', '75210'],
      'Austin': ['73301', '73344', '73301', '73344', '73301', '73344', '73301', '73344', '73301', '73344'],
      'Fort Worth': ['76101', '76102', '76103', '76104', '76105', '76106', '76107', '76108', '76109', '76110']
    },
    'FL': {
      'Jacksonville': ['32099', '32201', '32202', '32203', '32204', '32205', '32206', '32207', '32208', '32209'],
      'Miami': ['33101', '33102', '33106', '33107', '33109', '33111', '33112', '33114', '33116', '33119'],
      'Tampa': ['33601', '33602', '33603', '33604', '33605', '33606', '33607', '33608', '33609', '33610'],
      'Orlando': ['32801', '32803', '32804', '32805', '32806', '32807', '32808', '32809', '32810', '32811'],
      'St. Petersburg': ['33701', '33702', '33703', '33704', '33705', '33706', '33707', '33708', '33709', '33710']
    },
    'IL': {
      'Chicago': ['60601', '60602', '60603', '60604', '60605', '60606', '60607', '60608', '60609', '60610'],
      'Aurora': ['60502', '60503', '60504', '60505', '60506'],
      'Naperville': ['60540', '60563', '60564', '60565', '60566', '60567'],
      'Joliet': ['60403', '60404', '60431', '60432', '60433', '60434', '60435', '60436'],
      'Rockford': ['61101', '61102', '61103', '61104', '61105', '61106', '61107', '61108', '61109', '61110']
    }
  };
  
  // Return mock zip codes for the city, or an empty array if no zip codes found
  return mockZipCodes[stateAbbr]?.[city] || [];
};
