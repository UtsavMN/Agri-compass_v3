# Script to parse official Krishi Marata Vahini daily report for 19/10/2026

raw_text = """
1] MARKET: BAGEPALLICommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Beans
Beans (Whole)
Small
23
Quintal
3000
4500
3100
Brinjal
Brinjal
Small
19
Quintal
1000
1200
1100
Cabbage
Cabbage
Small
21
Quintal
800
1000
900
Cauliflower
Cauliflower
Small
25
Quintal
1000
1500
1200
Ridgeguard
Ridgeguard
Small
13
Quintal
1000
2000
1500
Snakeguard
Snakeguard
Small
13
Quintal
1000
1500
1300
Tomato
Tomato
Small
400
Quintal
230
2115
1240
2] MARKET: BANGARPETCommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Beans
Beans (Whole)
Average
12
Quintal
4000
5500
5000
Beetroot
Beetroot
Average
9
Quintal
1000
1700
1300
Bitter Gourd
Bitter Gourd
Average
8
Quintal
2000
2500
2300
Brinjal
Brinjal
Average
10
Quintal
1300
2000
1500
Cabbage
Cabbage
Average
5
Quintal
600
800
700
Capsicum
Capsicum
Average
9
Quintal
2500
3500
3000
Carrot
Carrot
Average
12
Quintal
2300
3000
2700
Chilly Capsicum
Chilly Capsicum
Average
10
Quintal
2400
3500
3100
Cucumbar
Cucumbar
Average
11
Quintal
1200
2000
1300
Drum Stick
Drumstick
Average
4
Quintal
3200
3600
3500
Garlic
Garlic
Average
5
Quintal
12500
13500
13000
Green Chilly
Green Chilly
Average
13
Quintal
2500
3500
3200
Green Ginger
Green Ginger
Average
5
Quintal
4300
5500
5000
Knool Khol
Knool Khol
Average
4
Quintal
1500
2300
2000
Ladies Finger
Ladies Finger
Average
7
Quintal
1500
2700
2300
Onion
Onion
Average
8
Quintal
3000
4300
4000
Potato
Local
Average
4
Quintal
1000
2000
1800
Raddish
Raddish
Average
6
Quintal
1100
1800
1300
Ridgeguard
Ridgeguard
Average
6
Quintal
2300
3000
2500
Tomato
Tomato
Average
55
Quintal
500
1000
800
3] MARKET: C.R.NAGARCommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Arecanut
Other
Average
155
Quintal
15000
20000
20000
Beans
Beans (Whole)
Average
35
Quintal
3500
4500
4000
Beetroot
Beetroot
Average
30
Quintal
1400
1900
1600
Brinjal
Other
Average
8
Quintal
800
1000
900
Brinjal
Round/Long
Average
10
Quintal
1200
1600
1400
Cabbage
Cabbage
Average
15
Quintal
600
800
700
Carrot
Carrot
Average
35
Quintal
1500
2000
1750
Coconut (Per 1000)
Coconut
Average
462365
Numbers
13000
27000
26000
Cucumbar
Cucumbar
Average
10
Quintal
600
2100
1300
Green Chilly
Green Chilly
Average
20
Quintal
2000
3300
2600
Knool Khol
Knool Khol
Average
8
Quintal
3000
4500
3800
Ladies Finger
Ladies Finger
Average
10
Quintal
1500
2200
1900
Raddish
Raddish
Average
15
Quintal
2000
3000
2500
Ridgeguard
Ridgeguard
Average
10
Quintal
1000
2000
1500
Tender Coconut
Tender Coconut
Average
87500
Thousands
20000
23500
23000
Tomato
Tomato
Average
30
Quintal
1400
1900
1650
4] MARKET: CHANNAGIRICommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Coconut (Per 1000)
Coconut
Non FAQ
15000
Numbers
20000
20000
20000
Maize
Local
Non FAQ
185
Quintal
2650
2650
2650
5] MARKET: CHANNAPATNACommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Banana
Elakki Bale
Average
88
Quintal
4500
8000
7200
Banana
Pachha Bale
Average
16
Quintal
900
1400
1200
Brinjal
Brinjal
Average
4
Quintal
2500
3000
2800
Cucumbar
Cucumbar
Average
14
Quintal
1200
2000
1600
Green Chilly
Green Chilly
Average
2
Quintal
7000
8000
7500
Ladies Finger
Ladies Finger
Average
3
Quintal
2500
3000
2700
Tomato
Tomato
Average
28
Quintal
1500
3000
2850
6] MARKET: CHINTAMANICommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Tomato
Tomato
Average
1950
Quintal
330
2266
1333
7] MARKET: DODDABALLAPURCommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
All Flowers
Other
Medium
54
Quintal
18000
26000
22000
Arecanut
Pudi
Medium
120
Quintal
48300
48300
48300
Banana Green
Banana - Green (Balekai)
Medium
15
Quintal
8000
9000
8500
Bitter Gourd
Bitter Gourd
Medium
8
Quintal
2500
3500
3000
Black Gramdal
Black Gram Dal
Medium
172
Quintal
12021
13870
12376
Brinjal
Brinjal
Medium
5
Quintal
1500
2100
1800
Carrot
Others
Medium
12
Quintal
2500
3100
2800
Cauliflower
Cauliflower
Medium
10
Quintal
1400
2000
1700
Cucumbar
Cucumbar
Medium
20
Quintal
2000
2400
2200
Knool Khol
Knool Khol
Medium
10
Quintal
2500
3000
2700
Maize
Local
Medium
657
Quintal
2910
2910
2910
Onion
Onion
Medium
28
Quintal
4000
5000
4400
Potato
Local
Medium
20
Quintal
2000
2400
2200
Tomato
Tomato
Medium
32
Quintal
1000
1600
1300
Tur Dal
Tur Dal
Medium
38
Quintal
11941
12141
12141
8] MARKET: GANGAVATICommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Maize
Local
Small
3488
Quintal
2200
2800
2522
Paddy
I.R. 64
Small
376
Quintal
2400
2400
2400
Paddy
Paddy RNR New
Small
1027
Quintal
3002
3633
3018
Paddy
Paddy RNR Old
Small
4988
Quintal
4300
5400
4800
Paddy
Sona Masuri Old
Small
7829
Quintal
3720
4295
4000
Rice
Other
Small
3467
Quintal
2400
2810
2600
9] MARKET: GONIKOPPALCommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Arecanut
ARECANUT-HUSK
Average
128
Quintal
4000
4000
4000
10] MARKET: GOWRIBIDNURCommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Beans
Beans (Whole)
Average
4
Quintal
3500
4500
4000
Beetroot
Beetroot
Average
3
Quintal
1800
2600
2200
Bitter Gourd
Bitter Gourd
Average
3
Quintal
2000
3000
2500
Bottle Gourd
Bottle Gourd
Average
2
Quintal
1500
2500
2000
Brinjal
Round
Average
10
Quintal
600
1000
800
Cabbage
Cabbage
Average
12
Quintal
800
1200
1000
Carrot
Carrot
Average
4
Quintal
2000
3000
2500
Cauliflower
Local
Average
3
Quintal
1500
2500
2000
Chapparada Avare
Chapparada Avarekai
Average
1
Quintal
2500
3500
3000
Cucumbar
Cucumbar
Average
10
Quintal
1000
1400
1000
Green Chilly
Green Chilly
Average
2
Quintal
4000
5000
4500
Knool Khol
Knool Khol
Average
3
Quintal
2000
3000
2500
Ladies Finger
Ladies Finger
Average
2
Quintal
1500
2500
2000
Lime (Lemon)
Lime (Lemon)
Average
1
Quintal
4000
5000
4500
Onion
Onion
Average
4
Quintal
4000
5000
4500
Potato
Potato
Average
5
Quintal
1500
2500
2000
Raddish
Raddish
Average
3
Quintal
2000
3000
2500
Ridgeguard
Ridgeguard
Average
2
Quintal
1500
2500
2000
Thondekai
Thondekai
Average
2
Quintal
2500
3500
3000
Tomato
Tomato
Average
15
Quintal
2000
2800
2500
11] MARKET: GUNDLUPETCommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Green Chilly
Green Chilly
Average
13
Quintal
3800
3800
3800
Tomato
Tomato
Average
77
Quintal
1900
2000
1900
12] MARKET: HALIYALACommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Maize
Hybrid/Local
Average
2984
Quintal
2450
2620
2600
13] MARKET: HANGALCommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Maize
Local
Medium
9425
Quintal
2400
2750
2550
Paddy
Paddy
Medium
455
Quintal
2600
3380
3380
Rice
Broken Rice
Medium
1105
Quintal
2750
2760
2750
14] MARKET: HARAPANAHALLICommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Maize
Hybrid/Local
FAQ
13060
Quintal
1999
2821
2566
Maize
Popcorn
Average
100
Quintal
4800
4800
4800
Ragi
Local
Average
570
Quintal
3500
3500
3500
15] MARKET: HARIHARACommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Coconut (Per 1000)
Coconut
Small
60700
Numbers
20000
22000
21000
Maize
Hybrid/Local
Small
1068
Quintal
2400
2490
2445
Paddy
Paddy RNR New
Small
3198
Quintal
2500
4200
3350
16] MARKET: HIRIYURCommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Groundnut Seed
Ground Nut Seed
Medium
300
Quintal
13025
13025
13025
Maize
Popcorn
Medium
526
Quintal
3500
5200
4133
17] MARKET: HOLALKERECommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Arecanut
Other
Average
2124
Quintal
21500
29000
25151
Maize
Yellow
Average
666
Quintal
2650
2650
2650
18] MARKET: HONNALICommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Arecanut
Sippegotu
Medium
62
Quintal
11700
11700
11700
Beans
Beans (Whole)
Medium
33
Quintal
2400
3600
3200
Beetroot
Beetroot
Medium
26
Quintal
1800
2000
1900
Brinjal
Brinjal
Medium
35
Quintal
500
800
700
Cabbage
Cabbage
Medium
29
Quintal
500
600
550
Cauliflower
Cauliflower
Medium
30
Quintal
3500
4000
3700
Coconut (Per 1000)
Coconut
Medium
75800
Numbers
21500
33000
27250
Cowpea (Veg)
Cowpea (Veg)
Medium
19
Quintal
1500
2600
2050
Cucumbar
Cucumbar
Medium
18
Quintal
1300
1900
1600
Green Chilly
Green Chilly
Medium
35
Quintal
2500
3900
3500
Knool Khol
Knool Khol
Medium
31
Quintal
1800
2300
2150
Ladies Finger
Ladies Finger
Medium
25
Quintal
2000
3300
3100
Maize
Local
Medium
2638
Quintal
2500
2900
2700
Ragi
Local
Medium
300
Quintal
3250
3250
3250
Ridgeguard
Ridgeguard
Medium
26
Quintal
1500
2700
2500
19] MARKET: HUNGUNDCommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Bengalgram
Jawari/Local
Medium
8
Quintal
6000
6000
6000
Greengram
Green Gram (Whole)
Medium
106
Quintal
9400
9400
9400
Jowar
Local
Medium
50
Quintal
2200
2200
2200
Maize
Local
Medium
1229
Quintal
2550
2650
2600
Sunflower
Local
Medium
675
Quintal
8200
8300
8250
Wheat
Local
Medium
48
Quintal
3150
3150
3150
20] MARKET: KANAKAGIRICommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Bajra
Local
Small
300
Quintal
2650
2650
2650
Cotton
BT
Small
1648
Quintal
9000
9950
9500
Maize
Local
Small
1182
Quintal
2400
2680
2650
Sunflower
Sunflower
Small
163
Quintal
8350
8350
8350
21] MARKET: KOPPACommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Coconut (Per 1000)
Coconut
Average
450
Numbers
42000
47000
45000
22] MARKET: KUSTAGICommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Bajra
Hybrid
Medium
30
Quintal
2800
2800
2800
Cotton
Other
Medium
81
Quintal
9150
9150
9150
Cowpea
Cowpea (Whole)
Medium
160
Quintal
9000
9000
9000
Horse Gram
Horse gram (Whole)
Medium
17
Quintal
4700
4700
4700
Maize
Hybrid/Local
Medium
3534
Quintal
2550
2800
2703
Sunflower
Hybrid
Medium
241
Quintal
8500
8500
8500
23] MARKET: LINGASARGURCommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Bajra
Hybrid
Small
625
Quintal
2950
3250
3000
Sunflower
Sunflower
Small
262
Quintal
8200
8200
8200
24] MARKET: MALURCommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Beans
Beans (Whole)
Average
52
Quintal
5000
7000
6000
25] MARKET: MANVICommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Cotton
Suyodhar
Small
520
Quintal
9100
9500
9393
Maize
Other
Small
200
Quintal
2950
2950
2950
Paddy
Sona Masuri Old
Small
1679
Quintal
3850
4300
3921
Rice
Other
Small
1560
Quintal
3000
3000
3000
Tur
Tur
Small
455
Quintal
9900
10200
9983
26] MARKET: MASKICommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Cotton
HYBRID-44
Medium
198
Quintal
8500
9500
9000
27] MARKET: PANDAVAPURACommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Tender Coconut
Tender Coconut
Average
22000
Thousands
22000
24000
23000
28] MARKET: PERIYAPATNACommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Arecanut
Red
Medium
715
Quintal
23500
24000
23500
Green Ginger
Green Ginger
Medium
1046
Quintal
1400
1600
1400
Ragi
Local
Medium
170
Quintal
3500
3500
3500
29] MARKET: RAMANAGARACommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Ash Gourd
Ashgourd
Average
320
Numbers
1000
1600
1200
Beans
Beans (Whole)
Average
10
Quintal
5000
7600
6500
Beetroot
Beetroot
Average
8
Quintal
3000
4000
3500
Bitter Gourd
Bitter Gourd
Average
7
Quintal
4000
5200
4800
Bottle Gourd
Bottle Gourd
Average
10
Quintal
700
1200
1000
Brinjal
Brinjal
Average
8
Quintal
2000
4000
3200
Brinjal
Round
Average
6
Quintal
1400
2000
1800
Cabbage
Cabbage
Average
1600
Quintal
1000
1600
1200
Capsicum
Capsicum
Average
6
Quintal
5000
7000
6000
Carrot
Carrot
Average
7
Quintal
3500
5000
4400
Cauliflower
Cauliflower
Average
12
Quintal
3000
4200
3500
Chilly Capsicum
Chilly Capsicum
Average
7
Quintal
3000
5000
4400
Cucumbar
Cucumbar
Average
44
Quintal
1600
2000
1800
Drum Stick
Drumstick
Average
8
Quintal
5000
7200
6000
Green Chilly
Green Chilly
Average
12
Quintal
6000
8000
7200
Green Ginger
Green Ginger
Average
8
Quintal
4400
12600
8500
Knool Khol
Knool Khol
Average
10
Quintal
5000
7000
6200
Ladies Finger
Ladies Finger
Average
8
Quintal
2400
3500
3000
Raddish
Raddish
Average
8
Quintal
3000
5000
4400
Ridgeguard
Ridgeguard
Average
12
Quintal
3000
4000
3600
Seemebadanekai
Seemebadanekai
Average
7
Quintal
3000
3600
3200
Snakeguard
Snakeguard
Average
10
Quintal
3000
4000
3600
Thogarikai
Thogarikai
Average
6
Quintal
6000
6300
6200
Tomato
Tomato
Average
64
Quintal
2000
3000
2500
30] MARKET: SANTHESARGURCommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Coconut (Per 1000)
Coconut
Small
58600
Numbers
20000
20000
20000
Cotton
Cotton-64
Small
77
Quintal
7600
7600
7600
Cotton
D.C.H.
Small
237
Quintal
11800
12200
12200
Ginger
Dry
Small
102
Quintal
16500
16500
16500
Green Ginger
Green Ginger
Small
1532
Quintal
2200
2300
2300
Maize
Local
Small
843
Quintal
1800
2950
2950
31] MARKET: SHIKARIPURCommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Arecanut
Churu
FAQ
48
Quintal
15000
15000
15000
Maize
Local
FAQ
880
Quintal
2600
2850
2671
Paddy
Paddy
FAQ
524
Quintal
3800
4000
3848
32] MARKET: SINDHANURCommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Cotton
BANNI
Average
93
Quintal
9700
9750
9700
Paddy
Paddy RNR Old
Average
8188
Quintal
3000
5050
4800
Rice
Broken Rice
Average
44
Quintal
3300
3300
3300
Rice
Medium
Average
684
Quintal
2800
7300
7300
Sunflower
Sunflower
Average
499
Quintal
8005
8300
8300
33] MARKET: TIRTHAHALLICommodity
Variety
Grade
Arrivals
Units
Min (Rs.)
Max (Rs.)
Modal (Rs.)
Arecanut
Other
Average
152
Quintal
26000
27000
27000
Arecanut
Rashi
Average
4
Quintal
37952
48050
48050
Arecanut
Sippegotu
Average
28
Quintal
14000
14000
14000
Ginger
Dry
Average
265
Quintal
16859
17500
17500
Pepper
Other
Average
181
Quintal
2882
30753
30753
"""

# Market to Karnataka District mapping
DISTRICT_MAP = {
    "BAGEPALLI": "Chikkaballapura",
    "BANGARPET": "Kolar",
    "C.R.NAGAR": "Chamarajanagar",
    "CHANNAGIRI": "Davangere",
    "CHANNAPATNA": "Ramanagara",
    "CHINTAMANI": "Chikkaballapura",
    "DODDABALLAPUR": "Bengaluru Rural",
    "GANGAVATI": "Koppal",
    "GONIKOPPAL": "Kodagu",
    "GOWRIBIDNUR": "Chikkaballapura",
    "GUNDLUPET": "Chamarajanagar",
    "HALIYALA": "Uttara Kannada",
    "HANGAL": "Haveri",
    "HARAPANAHALLI": "Vijayanagara",
    "HARIHARA": "Davangere",
    "HIRIYUR": "Chitradurga",
    "HOLALKERE": "Chitradurga",
    "HONNALI": "Davangere",
    "HUNGUND": "Bagalkot",
    "KANAKAGIRI": "Koppal",
    "KOPPA": "Chikkamagaluru",
    "KUSTAGI": "Koppal",
    "LINGASARGUR": "Raichur",
    "MALUR": "Kolar",
    "MANVI": "Raichur",
    "MASKI": "Raichur",
    "PANDAVAPURA": "Mandya",
    "PERIYAPATNA": "Mysuru",
    "RAMANAGARA": "Ramanagara",
    "SANTHESARGUR": "Mysuru",
    "SHIKARIPUR": "Shivamogga",
    "SINDHANUR": "Raichur",
    "TIRTHAHALLI": "Shivamogga"
}

import re
import json

lines = [l.strip() for l in raw_text.splitlines() if l.strip()]

records = []
current_market = None

i = 0
while i < len(lines):
    line = lines[i]
    m_match = re.search(r'\d+\]\s*MARKET:\s*([A-Za-z0-9\.\s]+?)(?:Commodity)?$', line, re.IGNORECASE)
    if m_match:
        current_market = m_match.group(1).strip().upper()
        i += 1
        # Skip header lines if present
        while i < len(lines) and lines[i] in ["Commodity", "Variety", "Grade", "Arrivals", "Units", "Min (Rs.)", "Max (Rs.)", "Modal (Rs.)"]:
            i += 1
        continue
    
    # Try reading a record (8 consecutive lines)
    if current_market and i + 7 < len(lines):
        # Check if the next line might be a new market
        if re.search(r'\d+\]\s*MARKET:', lines[i], re.IGNORECASE):
            continue

        comm = lines[i]
        variety = lines[i+1]
        grade = lines[i+2]
        arrivals_str = lines[i+3]
        unit = lines[i+4]
        min_str = lines[i+5]
        max_str = lines[i+6]
        modal_str = lines[i+7]

        # Verify numeric
        try:
            arr = float(arrivals_str.replace(",", ""))
            min_p = float(min_str.replace(",", ""))
            max_p = float(max_str.replace(",", ""))
            modal_p = float(modal_str.replace(",", ""))

            # Sanity checks
            if min_p <= modal_p <= max_p or min_p <= max_p:
                dist = DISTRICT_MAP.get(current_market, "Karnataka")
                
                # Normalize commodity name
                comm_clean = comm.strip()
                if "Coconut (Per 1000)" in comm_clean:
                    comm_clean = "Coconut"
                elif "All Flowers" in comm_clean:
                    comm_clean = "Flowers"
                elif "Green Chilly" in comm_clean:
                    comm_clean = "Green Chilli"
                elif "Black Gramdal" in comm_clean:
                    comm_clean = "Black Gram Dal"
                elif "Tur Dal" in comm_clean:
                    comm_clean = "Tur Dal"
                elif "Bengalgram" in comm_clean:
                    comm_clean = "Bengal Gram"
                elif "Greengram" in comm_clean:
                    comm_clean = "Green Gram"
                elif "Horse Gram" in comm_clean:
                    comm_clean = "Horse Gram"
                elif "Lime (Lemon)" in comm_clean:
                    comm_clean = "Lemon"
                elif "Groundnut Seed" in comm_clean:
                    comm_clean = "Groundnut"
                elif "Ladies Finger" in comm_clean:
                    comm_clean = "Ladies Finger (Bhindi)"
                elif "Bitter Gourd" in comm_clean:
                    comm_clean = "Bitter Gourd"
                elif "Bottle Gourd" in comm_clean:
                    comm_clean = "Bottle Gourd"
                elif "Green Ginger" in comm_clean:
                    comm_clean = "Ginger (Green)"
                elif "Ridgeguard" in comm_clean:
                    comm_clean = "Ridge Gourd"
                elif "Snakeguard" in comm_clean:
                    comm_clean = "Snake Gourd"
                elif "Cucumbar" in comm_clean:
                    comm_clean = "Cucumber"
                elif "Raddish" in comm_clean:
                    comm_clean = "Radish"
                elif "Knool Khol" in comm_clean:
                    comm_clean = "Knol Khol"
                elif "Drum Stick" in comm_clean:
                    comm_clean = "Drumstick"
                elif "Seemebadanekai" in comm_clean:
                    comm_clean = "Chayote (Seemebadanekai)"
                elif "Thogarikai" in comm_clean:
                    comm_clean = "Pigeon Pea (Thogarikai)"
                elif "Chapparada Avare" in comm_clean:
                    comm_clean = "Field Beans (Avare)"

                price_unit = f"Rs/{unit}" if unit else "Rs/Quintal"
                if unit == "Numbers":
                    price_unit = "Rs/1000 Nos"
                elif unit == "Thousands":
                    price_unit = "Rs/1000 Nos"

                rec = {
                    "source": "KRISHI_MARATA_VAHINI",
                    "reportDate": "2026-10-19",
                    "state": "Karnataka",
                    "district": dist,
                    "market": current_market.title(),
                    "commodity": comm_clean,
                    "variety": variety.strip().upper(),
                    "grade": grade.strip().upper(),
                    "arrivalQuantity": arr,
                    "arrivalUnit": unit.strip(),
                    "priceUnit": price_unit,
                    "minPrice": min_p,
                    "maxPrice": max_p,
                    "modalPrice": modal_p
                }
                records.append(rec)
                i += 8
                continue
        except ValueError:
            pass

    i += 1

print(f"Parsed {len(records)} records from {len(set(r['market'] for r in records))} markets.")
with open("agri-compass-api/src/main/resources/dataset/krishi_mandi_seed.json", "w", encoding="utf-8") as f:
    json.dump(records, f, indent=2)

print("Saved to agri-compass-api/src/main/resources/dataset/krishi_mandi_seed.json")
