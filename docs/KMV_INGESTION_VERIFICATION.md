# KMV Mandi Ingestion Pipeline — Evidence-Based Verification Report

**Date:** 2026-10-19  
**Audit Target:** Krishi Marata Vahini (KSAMB) APMC Ingestion Pipeline  
**Repository Branch:** `main` (Local working tree; zero remote pushes)  
**Evaluator:** Principal Software Architect & QA Lead  
**Overall Verdict:** **PARTIALLY VERIFIED**

---

## 1. Executive Summary & Verdict Explanation

| Layer / Component | Claimed Status | Verified Status | Evidence |
| :--- | :--- | :--- | :--- |
| **Data Schema & Entity** | Production-ready | **VERIFIED** | Strict unique composite index `(market, commodity, variety, grade)` prevents multi-grade collisions. ISO-8601 date enforcement. |
| **Ingestion Endpoint** | Atomic, secured | **VERIFIED** | `POST /api/market/kmv/snapshot` strictly enforces `X-Ingest-Key`. Validates min <= modal <= max. Rolls back on error. |
| **Database Semantics** | Snapshot replacement | **PARTIALLY VERIFIED** | It is an **Upsert**, not a full table replacement. Stale rows from unrepresented mandis persist until 30-day cutoff. |
| **Displayed Data** | KMV Government Data | **VERIFIED** | 199 authentic records from the official 19/10/2026 report are loaded in the database. Zero mock records. |
| **GitHub Actions Pipeline** | Automated daily updater | **NOT VERIFIED** | Workflow YAML exists in repository but has never run in CI; uses an iterative per-commodity scraper, not a unified scraper. |
| **Scraper Script (`ingest_kmvahini.py`)** | Automated state scraper | **PARTIALLY VERIFIED** | Successfully scrapes individual staples via Selenium/Chrome, but takes ~30s per crop and cannot scrape all 55 crops within GitHub Actions timeouts. |

### Verdict: PARTIALLY VERIFIED
- **What is Verified:** The backend ingestion engine, validation rules, transaction atomicity, duplicate prevention (idempotency), 30-day automated expiry purge, API endpoints, frontend display, and the 199 verified records currently loaded in the database.
- **What is NOT Verified:** The claim that `.github/workflows/kmv_mandi_ingest.yml` automatically scrapes the unified Karnataka KMV report daily. The existing script does NOT use the unified `Main_rep` table, but rather queries crops iteratively via an external third-party package (`kmvahini`).

---

## 2. Step 1 — Inspection of `.github/workflows/kmv_mandi_ingest.yml`

A thorough inspection of `.github/workflows/kmv_mandi_ingest.yml` revealed the following exact configuration:

### Trigger & Schedule
- **Cron Trigger:** `cron: '30 13 * * *'`
  - **Timezone:** Standard GitHub Actions cron **strictly operates in UTC**. There is no timezone parameter.
  - `13:30 UTC` corresponds to `19:00 IST` (7:00 PM Indian Standard Time), designed to execute after evening APMC market auctions close.
- **Manual Trigger:** `workflow_dispatch` with an optional input `commodities` (default: `'MAIZE RAGI PADDY JOWAR BENGAL_GRAM TUR'`).

### Runner & Environment Setup
- **OS Runner:** `ubuntu-latest`
- **Execution Timeout:** `timeout-minutes: 20`
- **Runtimes:** Python 3.11 (`actions/setup-python@v5`), Google Chrome Stable (`browser-actions/setup-chrome@latest`).
- **Dependencies:** Installed via `pip install -r scripts/requirements-scraper.txt` (`kmvahini==1.2.0`, `selenium==4.51.0`, `pandas==3.0.6`, `lxml==6.1.3`).

### Script Invocation Bug Identified in Workflow
Lines 49–51 invoke:
```bash
python scripts/ingest_kmvahini.py \
  --api-url "$KMV_API_URL" \
  --ingest-key "$KMV_INGEST_KEY"
```
> [!WARNING]
> **Workflow Parameter Gap:** The workflow does **not** pass `--commodities "${{ github.event.inputs.commodities }}"` to `ingest_kmvahini.py`. Therefore, even if a user specifies custom commodities in the GitHub Actions UI, the script will always fall back to the 15 staples defined in `DEFAULT_COMMODITIES` in `scripts/ingest_kmvahini.py`.

### Secret Handling & Hosted Database Access
- The workflow reads secrets `KMV_API_URL` and `KMV_INGEST_KEY` as environment variables.
- If either variable is empty, the job halts immediately:
  ```bash
  if [ -z "$KMV_API_URL" ] || [ -z "$KMV_INGEST_KEY" ]; then
    echo "::error::Missing KMV_API_URL or KMV_INGEST_KEY secret in repository settings."
    exit 1
  fi
  ```
- **Database Access:** The workflow has **no direct database credentials** and cannot directly write to PostgreSQL. It relies entirely on the HTTP contract with the Spring Boot endpoint at `$KMV_API_URL`.

---

## 3. Step 2 — Complete Data Flow Trace

```
[KMV Government Web Portal]
           │
           ▼
[Scraper / Ingestion Client (scripts/ingest_kmvahini.py)]
  ├── 1. Normalizes fields: Market, Commodity, Variety, Grade, Units, Prices
  ├── 2. Strict validation: minPrice <= modalPrice <= maxPrice, all >= 0
  ├── 3. Strict Date validation: reportDate must match expected target year
  └── 4. Assembles JSON payload array
           │ (HTTP POST with X-Ingest-Key)
           ▼
[Spring Boot Controller (KrishiMandiController.java)]
  ├── Path: POST /api/market/kmv/snapshot
  ├── Authentication: Header X-Ingest-Key == @Value("${kmv.ingest.key}")
  └── Delegator: krishiMandiService.ingestSnapshot(records)
           │
           ▼
[Service Layer (KrishiMandiService.java)]
  ├── Transaction: @Transactional (Atomic rollback on any runtime error)
  ├── Date check: Rejects reportDate > today + 1 day
  ├── Numerical check: Rejects negative prices, min > max, modal outside [min, max]
  └── Entity Resolution:
        repository.findByMarketIgnoreCaseAndCommodityIgnoreCaseAndVarietyIgnoreCaseAndGradeIgnoreCase(...)
           │
           ├── IF RECORD EXISTS:
           │     Checks reportDate. If existing record is newer, keeps existing record.
           │     Otherwise updates existing entity fields (UPSERT).
           │
           └── IF RECORD IS NEW:
                 Instantiates new KrishiMandiPrice entity (INSERT).
           │
           ▼
[JPA Repository & Database (KrishiMandiPriceRepository.java -> krishi_mandi_prices)]
  └── Unique constraint: (market, commodity, variety, grade)
           │
           ▼
[Public Consumer API (MarketController.java)]
  ├── Path: GET /api/market/prices?district=...&commodity=...&limit=500
  ├── Returns local Krishi Marata Vahini prices if present
  └── Falls back to api.data.gov.in if district/commodity has no KMV snapshot
```

### Snapshot Replacement vs. Upsert Analysis
1. **It is an UPSERT, not a table wipe:**
   `KrishiMandiService.ingestSnapshot()` does **not** execute `deleteAll()` before saving. It searches for existing records matching `(market, commodity, variety, grade)` and updates them in-place.
2. **Handling of Partial Scrapes:**
   - If an automated scrape only fetches 6 commodities (e.g., Maize, Ragi, Paddy, Jowar, Bengal Gram, Tur), those 6 commodities are updated.
   - Any other commodities already in the database (e.g., Tomato, Beans, Onion) **remain intact**. A partial scrape **does not destroy** previously stored commodities.
   - Older records are only removed when they exceed the 30-day cutoff handled by the daily `@Scheduled` job: `purgeExpiredRecords(30)`.
3. **Transaction Rollback:**
   If a payload is malformed, has negative numbers, has min > max, or contains zero valid rows, the entire `@Transactional` boundary aborts. No partial state is committed.

---

## 4. Step 3 — Scraper Implementation Inspection (`scripts/ingest_kmvahini.py`)

### Scraper Architecture
- **Does it use the unified report?** **NO.**
- The scraper does not access `https://krama.karnataka.gov.in/Reports/Main_rep` ("Commoditywise Daily Report").
- Instead, it imports `from kmvahini.scraper import scrape_website` and loops over commodities individually:
  ```python
  for comm in args.commodities:
      df = scrape_website(
          months=[month],
          years=[str(year)],
          commodities=[comm],
          markets=args.markets,
          workers=1,
          show_progress=False
      )
  ```
- Each query navigates to `https://krama.karnataka.gov.in/reports/DateWiseReport` using headless Selenium/Chrome, selects dropdowns via ASP.NET postbacks, and extracts the resulting HTML table.

### Performance & Timeout Constraints
- As measured during the pre-implementation audit (`docs/KMVAHINI_VALIDATION_REPORT.md`), a single commodity query takes between **24.04s and 33.98s**.
- Scraping the 15 staples in `DEFAULT_COMMODITIES` sequentially requires ~**7 to 8 minutes**.
- Scraping all 55 commodities reporting across Karnataka would require `55 * 30s ≈ 1650s` (**27.5 minutes**), exceeding the GitHub Actions job limit (`timeout-minutes: 20`).
- **Conclusion:** `scripts/ingest_kmvahini.py` was designed for selective staple commodity monitoring, not for full statewide daily bulletin capture.

---

## 5. Step 4 — Safe Testing & Local Verification Evidence

All verification was conducted using local test suites, existing fixtures, and running local instances. No remote or production endpoints were invoked.

### Test 1: 7-Step End-to-End Integration Suite
Command:
```powershell
.\mvnw.cmd test "-Dtest=KrishiMandiEndToEndIntegrationTest"
```
Outcome: **BUILD SUCCESS (6/6 tests passed in 19.40s)**
- `testStep1And2_ImportAndConfirmInDbAndApi`: Verified snapshot ingestion and retrieval via `/api/market/prices`.
- `testStep3_ReImportNoDuplicates`: Verified idempotency — re-ingesting the identical report resulted in 0 duplicates (`count` remained exactly 1).
- `testStep4_SimulateFailedImportSnapshotPreserved`: Verified transaction rollback — malformed payload was rejected and existing records remained untouched.
- `testStep5_VerifySourceAndReportDate`: Verified strict ISO date preservation (`2026-10-05`) and source tagging (`KRISHI_MARATA_VAHINI`).
- `testStep6_ExpiryAt30DaysAndReappearance`: Verified 30-day cutoff purge and automatic recovery when a new snapshot arrives.
- `testStep7_FallbackBehavior`: Verified clean fallback for unrepresented districts.

### Test 2: Market Controller & Unit Tests
Command:
```powershell
.\mvnw.cmd test "-Dtest=MarketControllerTest,KrishiMandiServiceTest"
```
Outcome: **BUILD SUCCESS (15/15 tests passed in 10.86s)**
- All parameter mappings, district sanitizations, summary aggregations, and validation rejections passed.

### Test 3: Frontend Component & Hook Tests
Command:
```powershell
npm run test -- --run
```
Outcome: **125/125 tests passed across 24 test suites**
- `MarketPricesSection.test.tsx`: Verified rendering of APMC cards, badges, modal prices, and source tags.
- `FarmerDashboardBrief.test.tsx`: Verified farm dashboard carousel and mandi integrations.

---

## 6. Step 5 — Data Provenance & Completeness

To avoid any ambiguity between theoretical capability and actual stored data:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CURRENT DATA PROVENANCE                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Active Local Database Records:       199 records                                │
│ Report Date:                         2026-10-19                                 │
│ Source Identifier:                   KRISHI_MARATA_VAHINI                       │
│ Data Origin:                         Official KSAMB Daily Market Report         │
│ Parser:                              scripts/parse_kmv_official.py              │
│ Seed Artifact:                       dataset/krishi_mandi_seed.json             │
│ Mandis Represented:                  33 APMCs                                   │
│ Districts Represented:               18 Karnataka Districts                     │
│ Commodities Covered:                 55 unique agricultural commodities         │
│ Mock / Synthetic Records in DB:      0 (Zero)                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                         AUTOMATED SCRAPER COVERAGE                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Live Tested Scraper Targets:         MAIZE (Haveri), RAGI (AllMarkets)          │
│ Scraper Script Target Range:         15 commodities (scripts/ingest_kmvahini.py)│
│ Unified State Scraper Status:        Not implemented in ingest_kmvahini.py      │
│ GitHub Actions Cron Status:          Configured in YAML, not executed in CI     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Step 6 — Failure Modes & Partial-Snapshot Risks

1. **GitHub Actions Timeout Risk:**
   If more than 25 commodities are added to the scraper's target list, the sequential Selenium execution will exceed the 20-minute workflow timeout and fail.
2. **ASP.NET ViewState MAC Cluster Desynchronization:**
   Direct HTTP clients (like `urllib` or `requests`) fail with HTTP 500 when communicating with `krama.karnataka.gov.in` because the NIC cluster requires browser-maintained session stickiness. Any future scraper must use headless Chrome or a browser engine.
3. **Partial Scrape Staleness:**
   Because ingestion uses Upsert semantics, scraping only 6 staple commodities leaves older vegetable/fruit records in the database with their original `report_date`. While this prevents data loss, it means different commodities can have different report dates until the 30-day cutoff purges them.

---

## 8. Remaining Unknowns & Recommended Next Steps

### Unknowns
1. **GitHub Secrets Deployment:** It is unknown whether `KMV_API_URL` and `KMV_INGEST_KEY` have been added to the GitHub repository secrets.
2. **NIC Weekend Publishing Frequency:** It is unknown whether all 33 mandis publish on Sundays and public holidays, though the 30-day retention window buffers against missing days.

### Recommended Next Steps
1. **Upgrade `ingest_kmvahini.py` to Unified Scraping:**
   Instead of looping through commodities on `DateWiseReport`, configure the Selenium script to navigate to `https://krama.karnataka.gov.in/Reports/Main_rep`, select radio button `C` ("Commoditywise Daily Report"), and fetch all ~200 statewide records in a single 15-second browser session.
2. **Align GitHub Workflow Parameters:**
   Update `.github/workflows/kmv_mandi_ingest.yml` to pass the commodities input or call the unified daily scraper directly.
