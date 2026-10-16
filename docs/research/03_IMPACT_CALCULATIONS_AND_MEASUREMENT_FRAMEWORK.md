# AgriCompass Research Study — Module 3
## Potential Impact Calculations & Practical Measurement Framework

---

## 6. Responsible Potential Impact Calculations

To ensure rigorous analysis, all impact estimates in this section adhere to strict academic standards:
- Clear baseline identification and official citations.
- Explicit assumptions and complete mathematical formulas.
- Sensitivity analysis across **Conservative (Low)**, **Moderate (Medium)**, and **Optimistic (High)** scenarios.
- Clear status categorization: **Modeled**, **Observed in External Studies**, or **AgriCompass Field Measured**.

```
+---------------------------------------------------------------------------------------------------------+
|                                  IMPACT MODELING METHODOLOGY OVERVIEW                                   |
+---------------------------------------------------------------------------------------------------------+
|  [Baseline Empirical Data]       +     [AgriCompass Algorithmic Logic]                                  |
|  - Fertilizer Association (FAI)        - DAP/Urea Stoichiometric Balancing                              |
|  - NSO 77th Round Farm Income          - OpenWeather Precipitation Lead Time                            |
|  - Agmarknet Inter-Mandi Spread        - Spatial Mandi Arbitrage Sorting                                |
|  - ICAR Yield Gap Reports              - Gemini Native-Dialect Prompting                                |
|                     \                         /                                                         |
|                      v                       v                                                          |
|             +-------------------------------------------------+                                         |
|             | Transparent Mathematical Sensitivity Modeling    |                                         |
|             | Conservative (Low) | Moderate (Med) | Optimistic |                                         |
|             +-------------------------------------------------+                                         |
|                                      |                                                                  |
|                                      v                                                                  |
|            Clear Status Label: Modeled Agronomic Estimate (Pending Controlled Field Trials)             |
+---------------------------------------------------------------------------------------------------------+
```

---

### Calculation 1: Fertilizer Expenditure Savings via Stoichiometric Balancing
- **Agronomic Focus:** Smallholder Paddy (*Oryza sativa*) and Sugarcane cultivation in the Cauvery Basin (Mysuru and Mandya districts).
- **Baseline Data:**
  - *Current Farmer Practice:* Farmers routinely apply **100 kg to 120 kg Nitrogen per acre** (equivalent to 220–260 kg of Urea/acre, or ~5 to 6 bags) in split applications, driven by low subsidized Urea prices and habit.
  - *Recommended Practice (UAS Bangalore Package of Practices):* 40 kg to 50 kg N/acre, along with 20 kg P₂O₅/acre and 20 kg K₂O/acre.
  - *Input Prices (2023–2024 Market Baseline):* Subsidized Urea = ₹267 / 45 kg bag (₹5.93/kg); DAP = ₹1,350 / 50 kg bag (₹27.00/kg); MOP = ₹1,700 / 50 kg bag (₹34.00/kg). Private complex chemical cocktails often retail at ₹1,200–₹1,600/bag.
- **Source:** UAS Bangalore Package of Practices; Fertilizer Association of India (2023); Mandya District Agriculture Office Survey.
- **AgriCompass Mechanism:**
  `FertilizerService.java` calculates the exact nutrient deficit based on soil test inputs and crop requirements. It deducts the nitrogen already supplied by DAP ($18\%$ of applied DAP), preventing excess urea purchases.
- **Mathematical Formula:**
  $$\Delta \text{Urea Saved (kg/acre)} = U_{\text{baseline}} - \left[ \frac{\max(0, \text{Req}_N - \text{Soil}_N) - (D_{\text{rec}} \times 0.18)}{0.46} \right]$$
  $$\text{Direct Cost Savings} = (\Delta \text{Urea} \times P_{\text{urea}}) + \text{Cost}_{\text{avoided unscientific mixes}}$$
- **Assumptions:**
  1. The farmer enters laboratory soil test values from their Soil Health Card or agricultural portal.
  2. The farmer complies with the recommended application schedule.
  3. No severe flood leaching events wash away topsoil during the vegetative stage.
- **Scenario Analysis (Per Acre per Season):**
  - **Conservative (Low compliance / partial adherence):** 20 kg excess Urea eliminated = 0.44 bags = **₹118** direct urea savings + **₹600** eliminated micronutrient cocktails = **₹718 / acre**.
  - **Moderate (Standard compliance):** 45 kg excess Urea eliminated = 1.0 bag = **₹267** direct urea savings + **₹1,200** avoided duplicate fertilizer products = **₹1,467 / acre**.
  - **Optimistic (Full adoption of balanced NPK + split application):** 70 kg excess Urea eliminated = 1.55 bags = **₹415** urea savings + **₹1,800** avoided private cocktails + **₹550** yield quality premium (reduced lodging) = **₹2,765 / acre**.
- **Evidence Status:** **Modeled Agronomic Estimate** (Derived from stoichiometric algorithms in `FertilizerService.java` benchmarked against ICAR fertilizer response curves).

---

### Calculation 2: Avoidable Pre-Harvest Crop Loss Mitigation via Weather Warnings
- **Agronomic Focus:** Horticultural crops (Tomato, Chilli, French Beans) in Mysuru, Hassan, and Chamarajanagar districts.
- **Baseline Data:**
  - *Average Gross Horticultural Output Value:* Tomato cultivation in Southern Karnataka yields 12–15 tonnes/acre under normal conditions, valued at an average farm-gate realization of ₹10/kg = **₹1,20,000 to ₹1,50,000 / acre**.
  - *Average Preventable Weather/Disease Loss:* Unseasonal rain events during flowering and fruiting cause flower drop, fruit cracking, and fungal outbreaks (Early Blight, Anthracnose), causing **15% to 25% avoidable loss** (₹18,000 to ₹37,500/acre).
  - *Chemical Loss:* Spraying systemic fungicides immediately prior to rain washes off active ingredients, wasting ₹1,500–₹2,500 per chemical spray round.
- **Source:** ICAR-IIHR (Indian Institute of Horticultural Research, Bengaluru); National Horticulture Board (NHB) 2022-23.
- **AgriCompass Mechanism:**
  OpenWeather 3-hour precipitation probability alerts delivered 24 to 48 hours prior to rainfall advise farmers to:
  1. Harvest mature produce early.
  2. Delay scheduled chemical spraying until after rainfall.
  3. Clear drainage furrows to prevent root-zone waterlogging.
- **Mathematical Formula:**
  $$\text{Value Saved} = (\text{Gross Value} \times \text{Loss Rate} \times \text{Mitigation Factor}) + \text{Cost of Saved Spray}$$
- **Assumptions:**
  1. Forecast accuracy for 24–48 hour precipitation events exceeds 75%.
  2. The farmer checks alerts or receives SMS/app notifications and takes timely preventative action.
- **Scenario Analysis (Per Acre for a 90-Day Tomato Cycle):**
  - **Conservative (Low mitigation, 1 avoided wash-off):** 1 cancelled chemical spray = **₹1,500** saved; 3% yield loss prevented on ₹1,20,000 crop = **₹3,600**; **Total = ₹5,100 / acre**.
  - **Moderate (Timely drainage + avoided wash-off + early harvest of ripe fruit):** 1 cancelled spray (₹1,800) + 7% yield loss prevented (₹8,400) = **₹10,200 / acre**.
  - **Optimistic (Full prevention of blight outbreak and waterlogging damage):** 2 cancelled sprays (₹3,600) + 12% yield loss prevented (₹14,400) = **₹18,000 / acre**.
- **Evidence Status:** **Modeled Estimate grounded in Agrometeorological Field Studies** (IMD Gramin Krishi Mausam Sewa empirical impact benchmarks).

---

### Calculation 3: Improved Farm-Gate Price Realization via Mandi Spatial Arbitrage
- **Economic Focus:** Commercial commodities (Tomato, Onion, Ragi, Maize) sold across Karnataka APMCs.
- **Baseline Data:**
  - *Inter-Mandi Price Dispersion:* Agmarknet historical daily logs show modal prices for tomatoes across neighboring markets (e.g., Mysuru Bandipalya, Mandya, Chamarajanagar, Gundlupet, Ramanagara) frequently differ by **₹150 to ₹400 per quintal** (₹1.50 to ₹4.00 per kg) on the exact same morning.
  - *Average Lot Size:* Smallholders bring 15 to 40 quintals (1.5 to 4.0 tonnes) per harvest run.
  - *Transport Cost Baseline:* Hired auto-rickshaw / pickup truck transport over an additional 25 km distance costs approximately **₹40 to ₹70 per quintal**.
- **Source:** Directorate of Marketing & Inspection (DMI / Agmarknet); Karnataka State Agricultural Marketing Board (KSAMB) daily records.
- **AgriCompass Mechanism:**
  `MarketPriceController.java` aggregates real-time data across APMC markets, allowing farmers to compare net returns across nearby mandis after accounting for transport costs.
- **Mathematical Formula:**
  $$\text{Net Arbitrage Gain (₹/quintal)} = (P_{\text{mandi B}} - P_{\text{mandi A}}) - \Delta \text{Transport Cost per quintal}$$
  $$\text{Total Lot Benefit (₹)} = \text{Net Gain} \times Q_{\text{quintals}}$$
- **Assumptions:**
  1. Produce quality meets Fair Average Quality (FAQ) standards across both mandis.
  2. The farmer has transport flexibility to reach an alternate mandi within a 35 km radius.
  3. Market access is not restricted by local trader cartels or non-transparent grading deductions.
- **Scenario Analysis (For a 25-Quintal [2.5-Tonne] Consignment of Produce):**
  - **Conservative (₹100/q gross spread, ₹50/q transport cost = ₹50/q net gain):** 25 quintals × ₹50 = **₹1,250 net gain per consignment**.
  - **Moderate (₹220/q gross spread, ₹60/q transport cost = ₹160/q net gain):** 25 quintals × ₹160 = **₹4,000 net gain per consignment** (representing a ~6.5% increase in gross farm-gate realization).
  - **Optimistic (₹380/q gross spread, ₹70/q transport cost = ₹310/q net gain):** 25 quintals × ₹310 = **₹7,750 net gain per consignment**.
- **Evidence Status:** **Empirical Market Data Model** (Observed in open Agmarknet daily price spreads across Karnataka districts).

---

### Calculation 4: Time and Transaction Cost Savings in Agricultural Advisory
- **Operational Focus:** Smallholders seeking agronomic guidance for pest identification, fertilizer dosages, or government subsidy schemes.
- **Baseline Data:**
  - *Conventional Access Method:* Traveling to the nearest Taluk Raitha Samparka Kendra (RSK) or Krishi Vigyan Kendra (KVK).
  - *Time & Economic Burden:* Round-trip travel time of 3 to 5 hours (often requiring bus transit, lost field labor wages valued at ₹350–₹500/day, plus ₹80–₹150 in bus fare/fuel).
  - *Frequency:* Average smallholder faces 3 to 5 critical agronomic decisions per crop cycle.
- **Source:** NSO 77th Round (Access to Extension Services); Field surveys of Karnataka Raitha Samparka Kendras.
- **AgriCompass Mechanism:**
  KrishiMitra provides immediate, localized agronomic answers in Kannada/English directly via smartphone or voice query (`AirAgent.tsx`), resolving routine questions without travel.
- **Mathematical Formula:**
  $$\text{Cost Saved/Season} = N_{\text{queries resolved}} \times \left( \text{Wage Loss Equivalent} + \text{Transit Fare} \right)$$
- **Scenario Analysis (Per Farmer per Season, 3 Queries Resolved):**
  - **Conservative (Resolves 2 routine queries; partially saves travel):** 2 × (₹200 wage value + ₹80 bus fare) = **₹560 per season**.
  - **Moderate (Resolves 3 queries without travel):** 3 × (₹350 full wage + ₹100 bus fare) = **₹1,350 per season** + **10 hours of saved labor**.
  - **Optimistic (Resolves 4 queries, including government scheme subsidy application guidance):** 4 × (₹400 + ₹120) = **₹2,080 per season** + **16 hours saved**.
- **Evidence Status:** **Modeled Socio-Economic Calculation** (Derived from rural wage standards and public transit costs).

---

## 7. AgriCompass Impact Measurement Framework

A rigorous, phased evaluation framework tailored for a student-built AgriTech platform, establishing clear protocols to transition from prototype metrics to verified field impact.

```
+---------------------------------------------------------------------------------------------------------+
|                               FOUR-TIER IMPACT MEASUREMENT ARCHITECTURE                                 |
+---------------------------------------------------------------------------------------------------------+
|  TIER 1: Product Metrics        | Telemetry, MAU, DAU, Drop-off, Voice Completion                      |
|                                 | [Collection: Automatic server/app access logs]                        |
|                                 +-----------------------------------------------------------------------+
|  TIER 2: Technical Performance  | API Latency, Mandi Freshness, Gemini Grounding, Speech WER            |
|                                 | [Collection: Automated CI/CD test harness & synthetic runs]           |
|                                 +-----------------------------------------------------------------------+
|  TIER 3: Agronomic Outcomes     | Soil Card Compliance, Excess N Reduced, Early Spray Cancellations    |
|                                 | [Collection: Pre- & post-season farmer survey cohorts]                 |
|                                 +-----------------------------------------------------------------------+
|  TIER 4: Economic & Environment | Net Farm Income Variance, Water Productivity, NUE %, Soil Health     |
|                                 | [Collection: Multi-season Quasi-Experimental Treatment vs Control]   |
+---------------------------------------------------------------------------------------------------------+
```

### 7.1 Phased Implementation & Study Design

#### Phase I: Telemetry & Application Log Auditing (Immediate / Automated)
- Collect telemetry automatically from Spring Boot backend endpoints and Vite client events without imposing friction on the user.
- Track feature adoption: daily/monthly active users (DAU/MAU), query frequency for KrishiMitra, voice vs. text usage ratios, and market price commodity searches.

#### Phase II: Agronomic Quality Review (Semi-Automated / Monthly)
- Establish an **Expert Agronomy Advisory Panel** comprising retired faculty or postgraduate researchers from UAS Bangalore or UAS Dharwad.
- Sample 100 randomly selected KrishiMitra conversation logs and 50 fertilizer recommendations each month to audit:
  1. Agronomic correctness against UAS *Package of Practices*.
  2. Dosages for safety and phytotoxicity risks.
  3. LLM hallucination rates and safety guardrail compliance.

#### Phase III: Field Cohort Quasi-Experimental Evaluation (Seasonal / Field Study)
- **Sample Design:** Recruit a cohort of **120 smallholder farmers** across 4 taluks in Mysuru district (e.g., Hunsur, T. Narasipura, Nanjangud, and K.R. Nagar).
- **Comparison Architecture:**
  - *Treatment Group ($n = 60$):* Provided smartphones with AgriCompass, onboarded with voice navigation training, and encouraged to use fertilizer recommendations, weather alerts, and market price tools.
  - *Control Group ($n = 60$):* Matched by holding size (1.0–2.0 ha), soil type (red sandy loam), and cropping pattern (e.g., Ragi or Tomato), relying on conventional practices (input dealer advice, local mandi selling).
- **Measurement Timeline:** Pre-sowing baseline survey $\rightarrow$ Mid-season monitoring survey $\rightarrow$ Post-harvest evaluation.

---

### 7.2 Master Four-Tier Metric Classification Matrix

| Tier | Category | Metric Name | Definition & Measurement Unit | Data Source & Collection Tool | Target Value / Benchmark | Operational Feasibility for Student Team |
|---|---|---|---|---|---|---|
| **Tier 1** | **Product Usage** | **Monthly Active Users (MAU)** | Unique authenticated users accessing the app at least once in 30 days | Clerk Auth logs / PostgreSQL User table | 500+ active farmers in pilot zone | **High** (Immediately available via platform database) |
| **Tier 1** | **Product Usage** | **Voice Feature Adoption Rate** | Percentage of queries initiated via Dvani (`kn-IN`) vs. text keyboard input | Client-side telemetry logs (`AirAgent.tsx`) | >45% of total sessions using voice | **High** (Client analytics event logging) |
| **Tier 1** | **Product Usage** | **Task Completion Rate** | Percentage of users initiating a soil analysis or market search who view final recommendations | Client journey funnel telemetry | >80% completion without premature drop-off | **High** (Frontend funnel analytics) |
| **Tier 2** | **Technical Performance** | **Mandi Price Freshness** | Time delta between official Agmarknet portal update and AgriCompass cache refresh | Automated backend log timestamps | <120 minutes from source publication | **High** (Backend scheduled cron monitoring) |
| **Tier 2** | **Technical Performance** | **KrishiMitra Response Latency** | Time elapsed from user prompt submission to complete AI reply stream | Server-side API latency metrics (`AiController.java`) | <2,500 milliseconds (p95) | **High** (Spring Boot Actuator / log analysis) |
| **Tier 2** | **Technical Performance** | **Speech Word Error Rate (WER)** | Percentage of incorrectly transcribed words in Kannada audio input under field conditions | Ground-truthed audio recording test set (100 samples) | WER <15% in quiet; <25% in ambient farm noise | **Medium** (Requires recorded audio sample benchmark) |
| **Tier 2** | **Technical Performance** | **Agronomic Accuracy Rate** | Percentage of AI recommendations audited and approved by KVK/UAS agronomists | Monthly expert panel rubric scoring (100 blind samples) | >92% verified agronomic accuracy | **Medium** (Requires engagement with agronomist panel) |
| **Tier 3** | **Agricultural Outcomes** | **Reduction in Excess Urea** | Kg of Urea applied per acre compared to baseline and regional control group | Pre- and post-harvest farmer input surveys | 25 kg – 45 kg reduction per acre in paddy/sugarcane | **Medium** (Post-season farmer field survey) |
| **Tier 3** | **Agricultural Outcomes** | **Weather Alert Compliance** | Percentage of farmers who postponed pesticide spraying following an AgriCompass heavy-rain alert | In-app confirmation prompt or follow-up phone survey | >65% compliance with high-confidence alerts | **Medium** (In-app micro-survey) |
| **Tier 3** | **Agricultural Outcomes** | **Market Arbitrage Rate** | Proportion of produce consignments routed to an alternative APMC based on displayed price spread | Post-harvest sales receipt validation survey | >20% of commercial vegetable trips redirected | **Medium** (Farmer sales receipt collection) |
| **Tier 4** | **Economic & Environmental** | **Net Farm Income Variance** | Difference in net cultivation returns (₹/acre) between AgriCompass treatment and control cohort | Formal econometric difference-in-differences (DiD) analysis | +8% to +15% higher net returns in treatment group | **High Research Effort** (Requires 2 full cropping seasons) |
| **Tier 4** | **Economic & Environmental** | **Fertilizer Expenditure Reduction** | Percentage change in total chemical input expenditure per hectare per crop cycle | Input purchase voucher audit and post-harvest survey | 12% – 20% lower input expenditure | **High Research Effort** (Requires seasonal financial audits) |
| **Tier 4** | **Economic & Environmental** | **Apparent Nitrogen Recovery (NUE %)** | Nitrogen absorbed by harvest biomass relative to total applied nitrogen | Destructive plant tissue and soil sampling in sample plots | Increase from baseline 32% to 45% NUE | **Specialized** (Requires partnership with university soil laboratory) |
