# AgriCompass Agricultural Research & Impact Study

Welcome to the comprehensive, evidence-based research and impact validation study for **AgriCompass** — an AI-powered agriculture platform engineered to empower smallholder farmers through soil intelligence, stoichiometric fertilizer guidance, weather resilience, market price transparency, conversational AI assistance, and vernacular voice navigation.

---

## 📚 Modular Study Navigation

The study is modularized into four comprehensive, interconnected documentation modules:

```
docs/research/
├── README.md                                          # Master Navigation, Abstract & Agronomic Framework
├── 01_EXECUTIVE_SUMMARY_AND_STATISTICS.md             # Deliverables 1, 2 & 3: Top 10 Findings, Statistics Table & Regional Assessment
├── 02_PROBLEM_FEATURE_MATRIX_AND_FEATURE_ASSESSMENTS.md # Deliverables 4 & 5: 12-Column Impact Matrix & Features 1–9 Evaluation
├── 03_IMPACT_CALCULATIONS_AND_MEASUREMENT_FRAMEWORK.md   # Deliverables 6 & 7: Transparent Impact Calculations & 4-Tier Evaluation Plan
└── 04_DASHBOARD_SPECS_AND_PRESENTATION_SUMMARY.md       # Deliverables 8, 9 & 10: 7-Group Dashboard Specs, Roadmap & Pitch Summary
```

---

## 🔍 Module Summaries

### [Module 1: Executive Summary, Primary Statistics & Geographic Context](01_EXECUTIVE_SUMMARY_AND_STATISTICS.md)
- **Top 10 Evidence-Backed Findings:** Quantifies smallholder vulnerability (86.2%), distorted N:P:K ratios (7.7:3.1:1), 30–35% NUE, rainfed climate risks in Karnataka (68%), and market price disparities.
- **Comprehensive Agricultural Statistics Table:** 22 verified indicators with exact units, surveyed periods, publication dates, official source organizations, and direct government URLs.
- **Geographic Challenge Assessment:** Deep-dive into national structural bottlenecks, Karnataka's drought vulnerabilities (223 taluks impacted in 2023–24), localized Cauvery Basin agronomy (Mysuru, Mandya, Hassan, Chamarajanagar), and international benchmarks.

### [Module 2: Problem-to-Feature Impact Matrix & Feature Evaluations](02_PROBLEM_FEATURE_MATRIX_AND_FEATURE_ASSESSMENTS.md)
- **Problem-to-Feature Impact Matrix:** Comprehensive 12-column table connecting agricultural challenges to AgriCompass modules, detailing root causes, technical mechanisms, expected outcomes, evaluation metrics, and constraints.
- **Individual Feature Impact Assessments (Features 1 to 9):**
  1. *Soil Intelligence & Crop Recommendation:* Agro-ecological suitability matching based on soil texture, pH, and rainfall.
  2. *Smart Fertilizer Guidance:* Stoichiometric balancing in `FertilizerService.java` accounting for DAP-supplied nitrogen (18%) and pH/fertility modifiers.
  3. *Hyper-Local Weather Intelligence:* OpenWeather 5-day / 3-hour forecasts paired with agricultural threshold alerts in `weatherAdvisor.ts`.
  4. *Live Mandi Price Intelligence:* Real-time REST API integration with Open Government Data (Agmarknet) across Karnataka districts.
  5. *KrishiMitra AI Assistant:* Gemini-powered conversational advisory with safety guardrails and bilingual Kannada/English support.
  6. *Dvani Multilingual Voice Navigation:* Web Speech API integration in `AirAgent.tsx` for hands-free Kannada (`kn-IN`) and English (`en-IN`) interaction.
  7. *Farmer Community & P2P Marketplace:* Spring WebSockets + STOMP real-time chat and peer equipment/seed listings.
  8. *IoT-Based Field Monitoring & Smart Irrigation:* Roadmap architecture (sensor schemas defined in crop guides; physical hardware planned).
  9. *Camera-Based Crop Disease Detection:* Experimental prototype with demo fallback and Hugging Face API integration scaffolding.

### [Module 3: Potential Impact Calculations & Practical Measurement Framework](03_IMPACT_CALCULATIONS_AND_MEASUREMENT_FRAMEWORK.md)
- **Transparent Potential Impact Calculations:** Complete mathematical formulas, baseline citations, assumptions, and sensitivity scenarios (Low, Medium, High) for:
  - Fertilizer expenditure savings (₹1,200 to ₹2,400/acre).
  - Avoidable pre-harvest crop loss mitigation (₹5,100 to ₹18,000/acre in tomato horticulture).
  - Spatial mandi price arbitrage (₹1,250 to ₹7,750 net gain per 25-quintal consignment).
  - Agricultural advisory labor time savings (₹560 to ₹2,080/season; 10–16 hours of saved transit labor).
- **Practical Impact Measurement Framework:** Tailored evaluation plan for a student-built AgriTech platform, separating:
  - *Tier 1: Product Usage Metrics* (MAU, voice adoption, completion funnels).
  - *Tier 2: Technical Performance Metrics* (Mandi price freshness, Gemini latency, speech WER, agronomic audit accuracy).
  - *Tier 3: Agricultural Outcome Metrics* (Reduction in excess urea, weather alert compliance, market arbitrage rate).
  - *Tier 4: Long-Term Economic & Environmental Impact* (Net income variance, input expenditure reductions, NUE improvements).

### [Module 4: Statistics Dashboard Specification, Roadmap & Presentation Pitch](04_DASHBOARD_SPECS_AND_PRESENTATION_SUMMARY.md)
- **Statistics Dashboard Specification:** Production-ready UI cards grouped into 7 thematic categories:
  1. *Agriculture at a Glance* (Smallholder share, farm income breakdown).
  2. *Soil & Fertilizer Intelligence* (N:P:K distortion, SOC deficiency).
  3. *Water & Climate Resilience* (Rainfed land exposure, irrigation efficiency).
  4. *Crop Productivity & Market Intelligence* (Farmer price capture, pre-harvest pest losses).
  5. *Digital Advisory Access & Platform Operational Performance* (Extension access deficit, live platform telemetry).
- **Roadmap & Priorities:** Research gaps, short-term implementation priorities (fine-tuning MobileNetV3 for leaf disease, FRUITS portal integration), and long-term hardware pilots (ESP32 soil sensors).
- **Presentation-Ready Pitch Section:** Executive messaging structured in the **Problem → Verified statistic → AgriCompass intervention → Measurable outcome → Evidence status** format across core pillars.

---

*Authored by the AgriCompass Engineering & Agronomic Research Team.*  
*Current Release: AgriCompass v3.0 | Target Geographic Scope: Karnataka & All-India Smallholder Agriculture.*
