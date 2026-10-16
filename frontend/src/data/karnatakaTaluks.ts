export interface KarnatakaTaluk {
  name: string;
  district: string;
  lat: number;
  lon: number;
}

export const KARNATAKA_TALUKS: KarnatakaTaluk[] = [
  // Bagalkot
  { name: 'Bagalkot', district: 'Bagalkot', lat: 16.1850, lon: 75.6961 },
  { name: 'Badami', district: 'Bagalkot', lat: 15.9189, lon: 75.6766 },
  { name: 'Bilagi', district: 'Bagalkot', lat: 16.3475, lon: 75.6186 },
  { name: 'Hungund', district: 'Bagalkot', lat: 16.0592, lon: 76.0569 },
  { name: 'Jamkhandi', district: 'Bagalkot', lat: 16.5133, lon: 75.2994 },
  { name: 'Mudhol', district: 'Bagalkot', lat: 16.3414, lon: 75.2819 },
  { name: 'Guledgudda', district: 'Bagalkot', lat: 15.9922, lon: 75.8436 },
  { name: 'Ilkal', district: 'Bagalkot', lat: 15.9592, lon: 76.1264 },

  // Ballari
  { name: 'Ballari', district: 'Ballari', lat: 15.1394, lon: 76.9214 },
  { name: 'Sandur', district: 'Ballari', lat: 15.0864, lon: 76.5492 },
  { name: 'Siruguppa', district: 'Ballari', lat: 15.6325, lon: 76.8942 },
  { name: 'Kampli', district: 'Ballari', lat: 15.3942, lon: 76.6028 },
  { name: 'Kurugodu', district: 'Ballari', lat: 15.3417, lon: 76.8375 },

  // Belagavi
  { name: 'Belagavi', district: 'Belagavi', lat: 15.8497, lon: 74.4977 },
  { name: 'Gokak', district: 'Belagavi', lat: 16.1689, lon: 74.8239 },
  { name: 'Chikkodi', district: 'Belagavi', lat: 16.4300, lon: 74.5936 },
  { name: 'Athani', district: 'Belagavi', lat: 16.7328, lon: 75.0594 },
  { name: 'Bailhongal', district: 'Belagavi', lat: 15.8114, lon: 74.8600 },
  { name: 'Hukkeri', district: 'Belagavi', lat: 16.2269, lon: 74.6006 },
  { name: 'Ramdurg', district: 'Belagavi', lat: 15.9469, lon: 75.2975 },
  { name: 'Saundatti', district: 'Belagavi', lat: 15.7675, lon: 75.1169 },
  { name: 'Raybag', district: 'Belagavi', lat: 16.4864, lon: 74.7786 },
  { name: 'Khanapur', district: 'Belagavi', lat: 15.6361, lon: 74.5133 },
  { name: 'Nipani', district: 'Belagavi', lat: 16.3986, lon: 74.3817 },

  // Bengaluru Rural
  { name: 'Devanahalli', district: 'Bengaluru Rural', lat: 13.2483, lon: 77.7125 },
  { name: 'Doddaballapura', district: 'Bengaluru Rural', lat: 13.2978, lon: 77.5375 },
  { name: 'Hosakote', district: 'Bengaluru Rural', lat: 13.0694, lon: 77.7981 },
  { name: 'Nelamangala', district: 'Bengaluru Rural', lat: 13.0983, lon: 77.3886 },

  // Bengaluru Urban
  { name: 'Bengaluru Urban', district: 'Bengaluru Urban', lat: 12.9716, lon: 77.5946 },
  { name: 'Bengaluru North', district: 'Bengaluru Urban', lat: 13.0358, lon: 77.5686 },
  { name: 'Bengaluru South', district: 'Bengaluru Urban', lat: 12.9189, lon: 77.5600 },
  { name: 'Bengaluru East', district: 'Bengaluru Urban', lat: 12.9819, lon: 77.7100 },
  { name: 'Anekal', district: 'Bengaluru Urban', lat: 12.7106, lon: 77.6978 },
  { name: 'Yelahanka', district: 'Bengaluru Urban', lat: 13.1007, lon: 77.5963 },

  // Bidar
  { name: 'Bidar', district: 'Bidar', lat: 17.9133, lon: 77.5300 },
  { name: 'Basavakalyan', district: 'Bidar', lat: 17.8736, lon: 76.9533 },
  { name: 'Bhalki', district: 'Bidar', lat: 18.0400, lon: 77.2142 },
  { name: 'Humnabad', district: 'Bidar', lat: 17.7689, lon: 77.1333 },
  { name: 'Aurad', district: 'Bidar', lat: 18.2486, lon: 77.4300 },

  // Chamarajanagar
  { name: 'Chamarajanagar', district: 'Chamarajanagar', lat: 11.9261, lon: 76.9437 },
  { name: 'Gundlupete', district: 'Chamarajanagar', lat: 11.8086, lon: 76.6894 },
  { name: 'Kollegala', district: 'Chamarajanagar', lat: 12.1558, lon: 77.1172 },
  { name: 'Yelandur', district: 'Chamarajanagar', lat: 12.0600, lon: 77.0319 },
  { name: 'Hanur', district: 'Chamarajanagar', lat: 12.0864, lon: 77.2961 },

  // Chikkaballapur
  { name: 'Chikkaballapur', district: 'Chikkaballapur', lat: 13.4355, lon: 77.7314 },
  { name: 'Bagepalli', district: 'Chikkaballapur', lat: 13.7844, lon: 77.7942 },
  { name: 'Chintamani', district: 'Chikkaballapur', lat: 13.4022, lon: 78.0583 },
  { name: 'Gauribidanur', district: 'Chikkaballapur', lat: 13.6125, lon: 77.5186 },
  { name: 'Sidlaghatta', district: 'Chikkaballapur', lat: 13.3897, lon: 77.8631 },

  // Chikkamagaluru
  { name: 'Chikkamagaluru', district: 'Chikkamagaluru', lat: 13.3153, lon: 75.7754 },
  { name: 'Kadur', district: 'Chikkamagaluru', lat: 13.5519, lon: 76.0125 },
  { name: 'Koppa', district: 'Chikkamagaluru', lat: 13.5289, lon: 75.3619 },
  { name: 'Mudigere', district: 'Chikkamagaluru', lat: 13.1369, lon: 75.6414 },
  { name: 'Narasimharajapura', district: 'Chikkamagaluru', lat: 13.6214, lon: 75.5208 },
  { name: 'Sringeri', district: 'Chikkamagaluru', lat: 13.4219, lon: 75.2536 },
  { name: 'Tarikere', district: 'Chikkamagaluru', lat: 13.7128, lon: 75.8153 },

  // Chitradurga
  { name: 'Chitradurga', district: 'Chitradurga', lat: 14.2265, lon: 76.3980 },
  { name: 'Challakere', district: 'Chitradurga', lat: 14.3142, lon: 76.6508 },
  { name: 'Hiriyur', district: 'Chitradurga', lat: 13.9489, lon: 76.6214 },
  { name: 'Holalkere', district: 'Chitradurga', lat: 14.0375, lon: 76.1869 },
  { name: 'Hosadurga', district: 'Chitradurga', lat: 13.8014, lon: 76.2906 },
  { name: 'Molakalmuru', district: 'Chitradurga', lat: 14.7297, lon: 76.7533 },

  // Dakshina Kannada
  { name: 'Mangaluru', district: 'Dakshina Kannada', lat: 12.9141, lon: 74.8560 },
  { name: 'Dakshina Kannada', district: 'Dakshina Kannada', lat: 12.9141, lon: 74.8560 },
  { name: 'Bantwal', district: 'Dakshina Kannada', lat: 12.8942, lon: 75.0336 },
  { name: 'Belthangady', district: 'Dakshina Kannada', lat: 13.0033, lon: 75.2558 },
  { name: 'Puttur', district: 'Dakshina Kannada', lat: 12.7667, lon: 75.2000 },
  { name: 'Sullia', district: 'Dakshina Kannada', lat: 12.5642, lon: 75.3917 },
  { name: 'Moodabidri', district: 'Dakshina Kannada', lat: 13.0700, lon: 74.9942 },
  { name: 'Kadaba', district: 'Dakshina Kannada', lat: 12.7622, lon: 75.4678 },

  // Davanagere
  { name: 'Davanagere', district: 'Davanagere', lat: 14.4644, lon: 75.9218 },
  { name: 'Harihara', district: 'Davanagere', lat: 14.5125, lon: 75.8036 },
  { name: 'Honnali', district: 'Davanagere', lat: 14.2433, lon: 75.6433 },
  { name: 'Channagiri', district: 'Davanagere', lat: 14.0247, lon: 75.9231 },
  { name: 'Jagalur', district: 'Davanagere', lat: 14.5311, lon: 76.3444 },
  { name: 'Nyamati', district: 'Davanagere', lat: 14.1506, lon: 75.5714 },

  // Dharwad
  { name: 'Dharwad', district: 'Dharwad', lat: 15.4589, lon: 75.0078 },
  { name: 'Hubballi', district: 'Dharwad', lat: 15.3647, lon: 75.1240 },
  { name: 'Kalghatgi', district: 'Dharwad', lat: 15.1783, lon: 74.9722 },
  { name: 'Kundgol', district: 'Dharwad', lat: 15.2575, lon: 75.2533 },
  { name: 'Navalgund', district: 'Dharwad', lat: 15.5606, lon: 75.3622 },

  // Gadag
  { name: 'Gadag', district: 'Gadag', lat: 15.4325, lon: 75.6381 },
  { name: 'Nargund', district: 'Gadag', lat: 15.7172, lon: 75.3886 },
  { name: 'Ron', district: 'Gadag', lat: 15.6989, lon: 75.7333 },
  { name: 'Shirahatti', district: 'Gadag', lat: 15.2319, lon: 75.5806 },
  { name: 'Mundargi', district: 'Gadag', lat: 15.2086, lon: 75.8825 },
  { name: 'Lakshmeshwar', district: 'Gadag', lat: 15.1286, lon: 75.4678 },

  // Hassan
  { name: 'Hassan', district: 'Hassan', lat: 13.0068, lon: 76.0996 },
  { name: 'Alur', district: 'Hassan', lat: 12.9814, lon: 75.9817 },
  { name: 'Arkalgud', district: 'Hassan', lat: 12.7633, lon: 76.0600 },
  { name: 'Arsikere', district: 'Hassan', lat: 13.3131, lon: 76.2572 },
  { name: 'Belur', district: 'Hassan', lat: 13.1633, lon: 75.8617 },
  { name: 'Channarayapatna', district: 'Hassan', lat: 12.9039, lon: 76.3917 },
  { name: 'Holenarasipura', district: 'Hassan', lat: 12.7886, lon: 76.2425 },
  { name: 'Sakleshpur', district: 'Hassan', lat: 12.9439, lon: 75.7839 },

  // Haveri
  { name: 'Haveri', district: 'Haveri', lat: 14.7950, lon: 75.4003 },
  { name: 'Byadgi', district: 'Haveri', lat: 14.6828, lon: 75.4842 },
  { name: 'Hangal', district: 'Haveri', lat: 14.7617, lon: 75.1267 },
  { name: 'Hirekerur', district: 'Haveri', lat: 14.4600, lon: 75.3900 },
  { name: 'Ranebennur', district: 'Haveri', lat: 14.6225, lon: 75.6214 },
  { name: 'Savanur', district: 'Haveri', lat: 14.9706, lon: 75.3400 },
  { name: 'Shiggaon', district: 'Haveri', lat: 14.9942, lon: 75.2289 },

  // Kalaburagi
  { name: 'Kalaburagi', district: 'Kalaburagi', lat: 17.3297, lon: 76.8343 },
  { name: 'Afzalpur', district: 'Kalaburagi', lat: 17.1994, lon: 76.3533 },
  { name: 'Aland', district: 'Kalaburagi', lat: 17.5667, lon: 76.5667 },
  { name: 'Chincholi', district: 'Kalaburagi', lat: 17.4667, lon: 77.4333 },
  { name: 'Chittapur', district: 'Kalaburagi', lat: 17.1189, lon: 77.0833 },
  { name: 'Jevargi', district: 'Kalaburagi', lat: 17.0189, lon: 76.7725 },
  { name: 'Sedam', district: 'Kalaburagi', lat: 17.1783, lon: 77.2917 },

  // Kodagu
  { name: 'Kodagu', district: 'Kodagu', lat: 12.3375, lon: 75.8069 },
  { name: 'Madikeri', district: 'Kodagu', lat: 12.4244, lon: 75.7382 },
  { name: 'Somwarpet', district: 'Kodagu', lat: 12.6000, lon: 75.8667 },
  { name: 'Virajpet', district: 'Kodagu', lat: 12.2000, lon: 75.8000 },
  { name: 'Kushalnagar', district: 'Kodagu', lat: 12.4639, lon: 75.9611 },

  // Kolar
  { name: 'Kolar', district: 'Kolar', lat: 13.1367, lon: 78.1292 },
  { name: 'Bangarapet', district: 'Kolar', lat: 12.9806, lon: 78.2000 },
  { name: 'Malur', district: 'Kolar', lat: 13.0039, lon: 77.9406 },
  { name: 'Mulbagal', district: 'Kolar', lat: 13.1633, lon: 78.3942 },
  { name: 'Srinivaspur', district: 'Kolar', lat: 13.3386, lon: 78.2178 },
  { name: 'KGF', district: 'Kolar', lat: 12.9614, lon: 78.2711 },

  // Koppal
  { name: 'Koppal', district: 'Koppal', lat: 15.3500, lon: 76.1500 },
  { name: 'Gangavathi', district: 'Koppal', lat: 15.4319, lon: 76.5317 },
  { name: 'Kushtagi', district: 'Koppal', lat: 15.7533, lon: 76.2000 },
  { name: 'Yelburga', district: 'Koppal', lat: 15.6186, lon: 75.9819 },

  // Mandya
  { name: 'Mandya', district: 'Mandya', lat: 12.5223, lon: 76.8951 },
  { name: 'Maddur', district: 'Mandya', lat: 12.5842, lon: 77.0425 },
  { name: 'Malavalli', district: 'Mandya', lat: 12.3842, lon: 77.0600 },
  { name: 'Pandavapura', district: 'Mandya', lat: 12.5000, lon: 76.6700 },
  { name: 'Srirangapatna', district: 'Mandya', lat: 12.4181, lon: 76.6847 },
  { name: 'Krishnarajpet', district: 'Mandya', lat: 12.6600, lon: 76.4900 },
  { name: 'Nagamangala', district: 'Mandya', lat: 12.8200, lon: 76.7600 },

  // Mysuru
  { name: 'Mysuru', district: 'Mysuru', lat: 12.2958, lon: 76.6394 },
  { name: 'Hunsur', district: 'Mysuru', lat: 12.3089, lon: 76.2917 },
  { name: 'Nanjangud', district: 'Mysuru', lat: 12.1197, lon: 76.6806 },
  { name: 'Krishnarajanagara', district: 'Mysuru', lat: 12.5800, lon: 76.3800 },
  { name: 'Heggadadevankote', district: 'Mysuru', lat: 11.9200, lon: 76.3300 },
  { name: 'Piriyapatna', district: 'Mysuru', lat: 12.3400, lon: 76.1000 },
  { name: 'T. Narasipura', district: 'Mysuru', lat: 12.2100, lon: 76.9000 },
  { name: 'Saragur', district: 'Mysuru', lat: 11.9700, lon: 76.3800 },

  // Raichur
  { name: 'Raichur', district: 'Raichur', lat: 16.2076, lon: 77.3463 },
  { name: 'Devadurga', district: 'Raichur', lat: 16.4217, lon: 76.9317 },
  { name: 'Lingsugur', district: 'Raichur', lat: 16.1600, lon: 76.5200 },
  { name: 'Manvi', district: 'Raichur', lat: 15.9900, lon: 77.0500 },
  { name: 'Sindhanur', district: 'Raichur', lat: 15.7700, lon: 76.7600 },
  { name: 'Maski', district: 'Raichur', lat: 15.9600, lon: 76.6600 },

  // Ramanagara
  { name: 'Ramanagara', district: 'Ramanagara', lat: 12.7203, lon: 77.2800 },
  { name: 'Channapatna', district: 'Ramanagara', lat: 12.6517, lon: 77.2033 },
  { name: 'Kanakapura', district: 'Ramanagara', lat: 12.5469, lon: 77.4189 },
  { name: 'Magadi', district: 'Ramanagara', lat: 12.9567, lon: 77.2267 },

  // Shivamogga
  { name: 'Sagara', district: 'Shivamogga', lat: 14.1665, lon: 75.0264 },
  { name: 'Shivamogga', district: 'Shivamogga', lat: 13.9299, lon: 75.5681 },
  { name: 'Bhadravathi', district: 'Shivamogga', lat: 13.8415, lon: 75.7032 },
  { name: 'Thirthahalli', district: 'Shivamogga', lat: 13.6943, lon: 75.2415 },
  { name: 'Hosanagara', district: 'Shivamogga', lat: 13.9200, lon: 75.0700 },
  { name: 'Shikaripura', district: 'Shivamogga', lat: 14.2700, lon: 75.3500 },
  { name: 'Soraba', district: 'Shivamogga', lat: 14.3800, lon: 75.0900 },

  // Tumakuru
  { name: 'Tumakuru', district: 'Tumakuru', lat: 13.3409, lon: 77.1011 },
  { name: 'Chikkanayakanahalli', district: 'Tumakuru', lat: 13.4186, lon: 76.6186 },
  { name: 'Gubbi', district: 'Tumakuru', lat: 13.3106, lon: 76.9400 },
  { name: 'Koratagere', district: 'Tumakuru', lat: 13.5233, lon: 77.2372 },
  { name: 'Kunigal', district: 'Tumakuru', lat: 13.0242, lon: 77.0347 },
  { name: 'Madhugiri', district: 'Tumakuru', lat: 13.6606, lon: 77.2100 },
  { name: 'Pavagada', district: 'Tumakuru', lat: 14.1017, lon: 77.2764 },
  { name: 'Sira', district: 'Tumakuru', lat: 13.7439, lon: 76.9039 },
  { name: 'Tiptur', district: 'Tumakuru', lat: 13.2600, lon: 76.4800 },
  { name: 'Turuvekere', district: 'Tumakuru', lat: 13.1611, lon: 76.6667 },

  // Udupi
  { name: 'Udupi', district: 'Udupi', lat: 13.3409, lon: 74.7421 },
  { name: 'Kundapura', district: 'Udupi', lat: 13.6264, lon: 74.6931 },
  { name: 'Karkala', district: 'Udupi', lat: 13.2125, lon: 74.9947 },
  { name: 'Byndoor', district: 'Udupi', lat: 13.8700, lon: 74.6300 },
  { name: 'Brahmavara', district: 'Udupi', lat: 13.4300, lon: 74.7500 },
  { name: 'Kaup', district: 'Udupi', lat: 13.2200, lon: 74.7400 },

  // Uttara Kannada
  { name: 'Sirsi', district: 'Uttara Kannada', lat: 14.6195, lon: 74.8354 },
  { name: 'Karwar', district: 'Uttara Kannada', lat: 14.8139, lon: 74.1300 },
  { name: 'Uttara Kannada', district: 'Uttara Kannada', lat: 14.6667, lon: 74.5000 },
  { name: 'Ankola', district: 'Uttara Kannada', lat: 14.6600, lon: 74.3000 },
  { name: 'Bhatkal', district: 'Uttara Kannada', lat: 13.9800, lon: 74.5500 },
  { name: 'Haliyal', district: 'Uttara Kannada', lat: 15.3300, lon: 74.7600 },
  { name: 'Honnavar', district: 'Uttara Kannada', lat: 14.2800, lon: 74.4500 },
  { name: 'Joida', district: 'Uttara Kannada', lat: 15.1600, lon: 74.4900 },
  { name: 'Kumta', district: 'Uttara Kannada', lat: 14.4200, lon: 74.4100 },
  { name: 'Mundgod', district: 'Uttara Kannada', lat: 14.9700, lon: 75.0300 },
  { name: 'Siddapura', district: 'Uttara Kannada', lat: 14.3400, lon: 74.8900 },
  { name: 'Yellapur', district: 'Uttara Kannada', lat: 14.9600, lon: 74.7100 },
  { name: 'Dandeli', district: 'Uttara Kannada', lat: 15.2400, lon: 74.6200 },

  // Vijayanagara
  { name: 'Hosapete', district: 'Vijayanagara', lat: 15.2711, lon: 76.3900 },
  { name: 'Vijayanagara', district: 'Vijayanagara', lat: 15.3196, lon: 76.4600 },
  { name: 'Harapanahalli', district: 'Vijayanagara', lat: 14.7900, lon: 75.9900 },
  { name: 'Hagaribommanahalli', district: 'Vijayanagara', lat: 15.0800, lon: 76.2000 },
  { name: 'Kudligi', district: 'Vijayanagara', lat: 14.9000, lon: 76.3800 },

  // Vijayapura
  { name: 'Vijayapura', district: 'Vijayapura', lat: 16.8302, lon: 75.7100 },
  { name: 'Basavana Bagewadi', district: 'Vijayapura', lat: 16.5800, lon: 75.9600 },
  { name: 'Indi', district: 'Vijayapura', lat: 17.1800, lon: 75.9600 },
  { name: 'Muddebihal', district: 'Vijayapura', lat: 16.3400, lon: 76.1300 },
  { name: 'Sindagi', district: 'Vijayapura', lat: 16.9200, lon: 76.2400 },
  { name: 'Talikote', district: 'Vijayapura', lat: 16.4800, lon: 76.3100 },

  // Yadgir
  { name: 'Yadgir', district: 'Yadgir', lat: 16.7667, lon: 77.1333 },
  { name: 'Shahapur', district: 'Yadgir', lat: 16.7000, lon: 76.8400 },
  { name: 'Surpur', district: 'Yadgir', lat: 16.3700, lon: 76.7600 },
  { name: 'Gurmitkal', district: 'Yadgir', lat: 16.8700, lon: 77.3900 },
];

/**
 * Checks whether coordinates lie in or reasonably near Karnataka (lat 11.2 - 18.8, lon 74.0 - 78.8)
 */
export function isKarnatakaCoordinate(lat: number, lon: number): boolean {
  return lat >= 11.2 && lat <= 18.8 && lon >= 74.0 && lon <= 78.8;
}

/**
 * Calculates the exact nearest Karnataka taluk / town to any coordinate
 */
export function findNearestTaluk(lat: number, lon: number): { taluk: KarnatakaTaluk; distanceKm: number; isOutlier: boolean } {
  let closest = KARNATAKA_TALUKS[0];
  let minDistance = Infinity;

  for (const t of KARNATAKA_TALUKS) {
    const dLat = (t.lat - lat) * (Math.PI / 180);
    const dLon = (t.lon - lon) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) * Math.cos(t.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = 6371 * c;

    if (distKm < minDistance) {
      minDistance = distKm;
      closest = t;
    }
  }

  const roundedDistance = Math.round(minDistance * 10) / 10;
  // If more than 100km away from any Karnataka taluk, it is an out-of-region anomaly (e.g. laptop Wi-Fi location in Bangladesh)
  const isOutlier = roundedDistance > 100 || !isKarnatakaCoordinate(lat, lon);

  return { taluk: closest, distanceKm: roundedDistance, isOutlier };
}

export function getTaluksByDistrict(district: string): KarnatakaTaluk[] {
  if (!district) return [];
  const clean = district.trim().toLowerCase();
  return KARNATAKA_TALUKS.filter(
    t => t.district.toLowerCase() === clean
  );
}

export function searchTaluks(query: string): KarnatakaTaluk[] {
  if (!query) return [];
  const q = query.trim().toLowerCase();
  return KARNATAKA_TALUKS.filter(
    t => t.name.toLowerCase().includes(q) || t.district.toLowerCase().includes(q)
  ).slice(0, 12);
}
