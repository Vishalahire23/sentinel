// ==========================================================================
// Comprehensive Indian Geographic Dataset: All 28 States & 8 Union Territories
// ==========================================================================

export interface IndianState {
  code: string;
  name: string;
  type: 'State' | 'Union Territory';
  capital: string;
  cities: string[];
}

export const INDIA_STATES_AND_CITIES: IndianState[] = [
  {
    code: 'MH',
    name: 'Maharashtra',
    type: 'State',
    capital: 'Mumbai',
    cities: [
      'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Chhatrapati Sambhajinagar',
      'Solapur', 'Amravati', 'Kolhapur', 'Navi Mumbai', 'Akola', 'Latur',
      'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Jalgaon', 'Nanded', 'Satara'
    ]
  },
  {
    code: 'DL',
    name: 'Delhi (NCT)',
    type: 'Union Territory',
    capital: 'New Delhi',
    cities: [
      'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi',
      'Central Delhi', 'Dwarka', 'Rohini', 'Saket', 'Connaught Place', 'Vasant Kunj'
    ]
  },
  {
    code: 'KA',
    name: 'Karnataka',
    type: 'State',
    capital: 'Bengaluru',
    cities: [
      'Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi',
      'Davanagere', 'Ballari', 'Kalaburagi', 'Shivamogga', 'Tumakuru',
      'Udupi', 'Hassan', 'Bidar', 'Hospet', 'Raichur'
    ]
  },
  {
    code: 'TN',
    name: 'Tamil Nadu',
    type: 'State',
    capital: 'Chennai',
    cities: [
      'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
      'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul',
      'Thanjavur', 'Ranipet', 'Kanchipuram', 'Nagercoil', 'Hosur'
    ]
  },
  {
    code: 'TG',
    name: 'Telangana',
    type: 'State',
    capital: 'Hyderabad',
    cities: [
      'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam',
      'Khammam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Siddipet'
    ]
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    type: 'State',
    capital: 'Gandhinagar',
    cities: [
      'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
      'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Navsari',
      'Morbi', 'Nadiad', 'Surendranagar', 'Bharuch', 'Vapi'
    ]
  },
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    type: 'State',
    capital: 'Lucknow',
    cities: [
      'Lucknow', 'Kanpur', 'Varanasi', 'Noida', 'Greater Noida', 'Ghaziabad',
      'Agra', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Moradabad',
      'Saharanpur', 'Gorakhpur', 'Faizabad (Ayodhya)', 'Jhansi', 'Mathura'
    ]
  },
  {
    code: 'WB',
    name: 'West Bengal',
    type: 'State',
    capital: 'Kolkata',
    cities: [
      'Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol',
      'Bardhaman', 'Malda', 'Kharagpur', 'Haldia', 'Darjeeling', 'Baharampur'
    ]
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    type: 'State',
    capital: 'Jaipur',
    cities: [
      'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer',
      'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar'
    ]
  },
  {
    code: 'KL',
    name: 'Kerala',
    type: 'State',
    capital: 'Thiruvananthapuram',
    cities: [
      'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam',
      'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram'
    ]
  },
  {
    code: 'AP',
    name: 'Andhra Pradesh',
    type: 'State',
    capital: 'Amaravati',
    cities: [
      'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool',
      'Kakinada', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Anantapur', 'Eluru'
    ]
  },
  {
    code: 'MP',
    name: 'Madhya Pradesh',
    type: 'State',
    capital: 'Bhopal',
    cities: [
      'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain',
      'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Singrauli'
    ]
  },
  {
    code: 'PB',
    name: 'Punjab',
    type: 'State',
    capital: 'Chandigarh',
    cities: [
      'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda',
      'Mohali', 'Hoshiarpur', 'Pathankot', 'Moga', 'Abohar'
    ]
  },
  {
    code: 'HR',
    name: 'Haryana',
    type: 'State',
    capital: 'Chandigarh',
    cities: [
      'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar',
      'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'
    ]
  },
  {
    code: 'BR',
    name: 'Bihar',
    type: 'State',
    capital: 'Patna',
    cities: [
      'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia',
      'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar'
    ]
  },
  {
    code: 'OD',
    name: 'Odisha',
    type: 'State',
    capital: 'Bhubaneswar',
    cities: [
      'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur',
      'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda'
    ]
  },
  {
    code: 'AS',
    name: 'Assam',
    type: 'State',
    capital: 'Dispur',
    cities: [
      'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon',
      'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj'
    ]
  },
  {
    code: 'JH',
    name: 'Jharkhand',
    type: 'State',
    capital: 'Ranchi',
    cities: [
      'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar',
      'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar'
    ]
  },
  {
    code: 'CT',
    name: 'Chhattisgarh',
    type: 'State',
    capital: 'Raipur',
    cities: [
      'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon',
      'Durg', 'Jagdalpur', 'Ambikapur', 'Raigarh'
    ]
  },
  {
    code: 'UT',
    name: 'Uttarakhand',
    type: 'State',
    capital: 'Dehradun',
    cities: [
      'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur',
      'Kashipur', 'Rishikesh', 'Nainital', 'Pithoragarh'
    ]
  },
  {
    code: 'HP',
    name: 'Himachal Pradesh',
    type: 'State',
    capital: 'Shimla',
    cities: [
      'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu',
      'Baddi', 'Bilaspur', 'Hamirpur', 'Nahan'
    ]
  },
  {
    code: 'GA',
    name: 'Goa',
    type: 'State',
    capital: 'Panaji',
    cities: [
      'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim'
    ]
  },
  {
    code: 'JK',
    name: 'Jammu and Kashmir',
    type: 'Union Territory',
    capital: 'Srinagar / Jammu',
    cities: [
      'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur',
      'Kathua', 'Sopore', 'Rajouri'
    ]
  },
  {
    code: 'CH',
    name: 'Chandigarh',
    type: 'Union Territory',
    capital: 'Chandigarh',
    cities: ['Chandigarh']
  },
  {
    code: 'PY',
    name: 'Puducherry',
    type: 'Union Territory',
    capital: 'Puducherry',
    cities: ['Puducherry', 'Ozhukarai', 'Karaikal', 'Mahe', 'Yanam']
  },
  {
    code: 'TR',
    name: 'Tripura',
    type: 'State',
    capital: 'Agartala',
    cities: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar']
  },
  {
    code: 'ML',
    name: 'Meghalaya',
    type: 'State',
    capital: 'Shillong',
    cities: ['Shillong', 'Tura', 'Jowai', 'Nongpoh']
  },
  {
    code: 'MN',
    name: 'Manipur',
    type: 'State',
    capital: 'Imphal',
    cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur']
  },
  {
    code: 'NL',
    name: 'Nagaland',
    type: 'State',
    capital: 'Kohima',
    cities: ['Dimapur', 'Kohima', 'Mokokchung', 'Tuensang']
  },
  {
    code: 'MZ',
    name: 'Mizoram',
    type: 'State',
    capital: 'Aizawl',
    cities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip']
  },
  {
    code: 'AR',
    name: 'Arunachal Pradesh',
    type: 'State',
    capital: 'Itanagar',
    cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang']
  },
  {
    code: 'SK',
    name: 'Sikkim',
    type: 'State',
    capital: 'Gangtok',
    cities: ['Gangtok', 'Namchi', 'Geyzing', 'Mangan']
  },
  {
    code: 'LA',
    name: 'Ladakh',
    type: 'Union Territory',
    capital: 'Leh',
    cities: ['Leh', 'Kargil']
  },
  {
    code: 'AN',
    name: 'Andaman and Nicobar Islands',
    type: 'Union Territory',
    capital: 'Port Blair',
    cities: ['Port Blair']
  },
  {
    code: 'DN',
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    type: 'Union Territory',
    capital: 'Daman',
    cities: ['Daman', 'Diu', 'Silvassa']
  },
  {
    code: 'LD',
    name: 'Lakshadweep',
    type: 'Union Territory',
    capital: 'Kavaratti',
    cities: ['Kavaratti', 'Agatti', 'Andrott']
  }
];

export function getCitiesForState(stateName: string): string[] {
  const found = INDIA_STATES_AND_CITIES.find(
    s => s.name.toLowerCase() === stateName.toLowerCase() || s.code.toLowerCase() === stateName.toLowerCase()
  );
  return found ? found.cities : [];
}

export function getAllIndianStates(): string[] {
  return INDIA_STATES_AND_CITIES.map(s => s.name);
}

export interface PincodeHub {
  pincode: string;
  locality: string;
  darkStoreName: string;
  deliveryMins: number;
}

export const METRO_PINCODE_HUBS: Record<string, PincodeHub[]> = {
  'Mumbai': [
    { pincode: '400050', locality: 'Bandra West', darkStoreName: 'Bandra Linking Rd Dark Store', deliveryMins: 8 },
    { pincode: '400001', locality: 'Fort / Colaba', darkStoreName: 'South Mumbai Central Hub', deliveryMins: 11 },
    { pincode: '400053', locality: 'Andheri West', darkStoreName: 'Lokhandwala Express Hub', deliveryMins: 10 },
    { pincode: '400076', locality: 'Powai', darkStoreName: 'Hiranandani Tech Cluster', deliveryMins: 9 },
    { pincode: '400092', locality: 'Borivali West', darkStoreName: 'Shimpoli Dark Store', deliveryMins: 13 }
  ],
  'Bengaluru': [
    { pincode: '560038', locality: 'Indiranagar', darkStoreName: '100 Feet Rd Fast Hub', deliveryMins: 8 },
    { pincode: '560034', locality: 'Koramangala', darkStoreName: '80 Feet Rd Dark Store', deliveryMins: 7 },
    { pincode: '560102', locality: 'HSR Layout', darkStoreName: 'Sector 2 Tech Corridor', deliveryMins: 9 },
    { pincode: '560001', locality: 'MG Road / CBD', darkStoreName: 'Bengaluru Central Node', deliveryMins: 10 },
    { pincode: '560066', locality: 'Whitefield', darkStoreName: 'ITPB Dark Store', deliveryMins: 12 }
  ],
  'New Delhi': [
    { pincode: '110001', locality: 'Connaught Place', darkStoreName: 'Central Delhi Dispatch Hub', deliveryMins: 9 },
    { pincode: '110017', locality: 'Saket', darkStoreName: 'South Delhi Metro Hub', deliveryMins: 8 },
    { pincode: '110075', locality: 'Dwarka', darkStoreName: 'Dwarka Sector 10 Cluster', deliveryMins: 11 },
    { pincode: '110085', locality: 'Rohini', darkStoreName: 'Rohini Sector 7 Dark Store', deliveryMins: 12 },
    { pincode: '110016', locality: 'Hauz Khas', darkStoreName: 'Green Park Fast Hub', deliveryMins: 9 }
  ],
  'Delhi': [
    { pincode: '110001', locality: 'Connaught Place', darkStoreName: 'Central Delhi Dispatch Hub', deliveryMins: 9 },
    { pincode: '110017', locality: 'Saket', darkStoreName: 'South Delhi Metro Hub', deliveryMins: 8 },
    { pincode: '110075', locality: 'Dwarka', darkStoreName: 'Dwarka Sector 10 Cluster', deliveryMins: 11 },
    { pincode: '110085', locality: 'Rohini', darkStoreName: 'Rohini Sector 7 Dark Store', deliveryMins: 12 }
  ],
  'Chennai': [
    { pincode: '600017', locality: 'T. Nagar', darkStoreName: 'Panagal Park Quick Hub', deliveryMins: 8 },
    { pincode: '600041', locality: 'Thiruvanmiyur', darkStoreName: 'ECR Corridor Hub', deliveryMins: 10 },
    { pincode: '600096', locality: 'Perungudi', darkStoreName: 'OMR Tech Park Dark Store', deliveryMins: 9 },
    { pincode: '600028', locality: 'Mylapore', darkStoreName: 'Luz Church Delivery Point', deliveryMins: 11 }
  ],
  'Hyderabad': [
    { pincode: '500081', locality: 'Madhapur', darkStoreName: 'Hitec City Cyber Hub', deliveryMins: 8 },
    { pincode: '500034', locality: 'Banjara Hills', darkStoreName: 'Road No. 12 Dark Store', deliveryMins: 9 },
    { pincode: '500032', locality: 'Gachibowli', darkStoreName: 'Financial District Hub', deliveryMins: 9 },
    { pincode: '500003', locality: 'Secunderabad', darkStoreName: 'Paradise Metro Node', deliveryMins: 12 }
  ],
  'Pune': [
    { pincode: '411001', locality: 'Camp / Station', darkStoreName: 'Central Pune Dark Store', deliveryMins: 10 },
    { pincode: '411004', locality: 'Deccan Gymkhana', darkStoreName: 'FC Road Hub', deliveryMins: 8 },
    { pincode: '411057', locality: 'Hinjawadi', darkStoreName: 'Phase 1 IT Park Dark Store', deliveryMins: 11 },
    { pincode: '411014', locality: 'Viman Nagar', darkStoreName: 'Kalyani Nagar Metro Hub', deliveryMins: 9 }
  ],
  'Kolkata': [
    { pincode: '700016', locality: 'Park Street', darkStoreName: 'South Kolkata Fast Hub', deliveryMins: 9 },
    { pincode: '700091', locality: 'Salt Lake Sector V', darkStoreName: 'Bidhannagar IT Cluster', deliveryMins: 8 },
    { pincode: '700029', locality: 'Ballygunge', darkStoreName: 'Southern Avenue Dark Store', deliveryMins: 10 }
  ],
  'Ahmedabad': [
    { pincode: '380015', locality: 'Satellite / Bodakdev', darkStoreName: 'SG Highway Dark Store', deliveryMins: 8 },
    { pincode: '380009', locality: 'Navrangpura', darkStoreName: 'CG Road Commercial Hub', deliveryMins: 9 },
    { pincode: '382350', locality: 'GIFT City', darkStoreName: 'GIFT City Tech Node', deliveryMins: 11 }
  ]
};

export function getPincodesForCity(cityName: string): PincodeHub[] {
  const match = Object.keys(METRO_PINCODE_HUBS).find(
    k => k.toLowerCase() === cityName.toLowerCase() || cityName.toLowerCase().includes(k.toLowerCase())
  );
  if (match) {
    return METRO_PINCODE_HUBS[match];
  }

  // Default synthetic micro-hubs for any Tier-2/Tier-3 city in India
  return [
    { pincode: '400001', locality: `${cityName} Central`, darkStoreName: `${cityName} Main Dark Store`, deliveryMins: 10 },
    { pincode: '400002', locality: `${cityName} North Ext.`, darkStoreName: `${cityName} Express Node`, deliveryMins: 14 }
  ];
}
