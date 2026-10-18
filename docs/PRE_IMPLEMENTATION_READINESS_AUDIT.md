# AgriCompass — Final Pre-Implementation Audit & Readiness Assessment

**Audit Date:** 2026-10-18  
**Auditor Roles:** Principal Software Architect, Senior Security Engineer, Backend & Database Engineer, QA Lead  
**Target Repository:** `Agri-compass_v3` (`d:\My projects\agri`)  
**Commit Audited:** `a31339d` (`test(market): add 7-step E2E validation suite for live PostgreSQL and Spring Boot`)  
**Readiness Classification:** **NOT READY** (Blocked by Critical Credential Exposure & Deployment Scheduling Deficits)

---

## 1. Repository State & Verified Commit

- **Current Git Branch:** `main`
- **Remote Tracking:** `origin/main` (`https://github.com/UtsavMN/Agri-compass_v3.git`), up to date.
- **Latest Commit Hash:** `a31339dd4bf2256498e493437b2cf99459046bf0`
- **Working Tree Status:** Clean (no unstaged or untracked changes at start of audit).
- **Commit History Verification:**
  - `a31339d`: Contains Spring Boot E2E test suite (`KrishiMandiEndToEndIntegrationTest.java`) and live PostgreSQL script (`scripts/verify_e2e_live_postgres.py`).
  - `6b6a904`: Contains core Krishi Marata Vahini entity, repository, service, controller, Python ingestion pipeline, and frontend updates.
- **Verified Repository Structure:**
  - `agri-compass-api`: Java 17, Spring Boot 3.4.3, Spring Security (OAuth2/Clerk JWT), Hibernate/JPA, HikariCP.
  - `frontend`: React 18, Vite 5.4.21, TypeScript, Tailwind CSS, Zustand, React Router v7.
  - `scripts`: Standalone Python 3 ingestion and testing scripts (`ingest_kmvahini.py`, `verify_e2e_live_postgres.py`).

---

## 2. Existing Architecture & Krishi Mitra Reuse Assets

AgriCompass has extensive existing infrastructure that Krishi Mitra must directly reuse rather than reinventing:

1. **Authentication & Session Identity:**
   - Managed via Clerk OAuth2 JWT (`CLERK_ISSUER_URI`).
   - Authenticated backend endpoints receive user identity via JWT claims and `@AuthenticationPrincipal Jwt jwt` or `X-User-Id` header.
   - Frontend provides `useUser()` and `useAuth()` from `@clerk/clerk-react`.
2. **Existing AI & LLM Infrastructure:**
   - [`AiController.java`](file:///d:/My%20projects/agri/agri-compass-api/src/main/java/com/agricompass/controller/AiController.java) (`/api/ai/**`):
     - `POST /api/ai/chat`: Multi-turn conversational endpoint already identified as **KrishiMitra**. Supports Gemini with dual-key rotation (`gemini.api.key.primary`, `gemini.api.key.secondary`), token capping (800 tokens), and history truncation (last 6 turns).
     - Automated Fallback: When external LLM APIs fail or exceed quota (HTTP 429), `AiController` automatically switches to an in-memory regional agricultural rule-based response engine.
     - `POST /api/ai/soil-recommendation`: Anthropic Claude 3.5 Sonnet / Gemini diagnostic engine with Karnataka-specific agronomic fallback.
     - `POST /api/ai/analyze-crop`: Crop disease diagnostic engine.
3. **Frontend Conversational Interfaces:**
   - [`VoiceChatbot.tsx`](file:///d:/My%20projects/agri/frontend/src/components/VoiceChatbot.tsx): Floating voice assistant supporting Web Speech API in Kannada (`lang = "kn-IN"`) with text-to-speech feedback and automatic route navigation (e.g. `/market-prices`, `/weather`, `/schemes`).
   - [`AIChatInterface.tsx`](file:///d:/My%20projects/agri/frontend/src/components/AIChatInterface.tsx): Full-page conversation UI with farm selector, message bubbles, timestamps, typing indicators, and error resilience.
   - [`ai.ts`](file:///d:/My%20projects/agri/frontend/src/lib/api/ai.ts): Client service with Kannada language detection (`/[\u0C80-\u0CFF]/`) and localized error fallback strings.
4. **Data Services to Ground Krishi Mitra:**
   - Mandi Prices: `KrishiMandiService` (Karnataka APMC benchmarks) and `MarketController` (`/api/market/prices`).
   - Weather Intelligence: `WeatherController` (`/api/weather/forecast`) providing real-time conditions, rainfall, humidity, and agro-advisories.
   - Schemes: `SchemeController` (`/api/schemes`) providing central and state agricultural welfare programs.
   - Soil Diagnostics: `SoilAnalysis` and `CropService` providing NPK and pH tolerance guidelines.

---

## 3. Critical Security Audit Findings

| Finding ID | Security Check | Status | Evidence & Severity |
| :--- | :--- | :--- | :--- |
| **SEC-01** | Production Database Password Committed to Git | **BLOCKED** | **CRITICAL:** `scripts/verify_e2e_live_postgres.py` (lines 19–22) was committed in `a31339d` and pushed to GitHub with hardcoded host, user, and plaintext password `DB_PASS = "[REDACTED]"`. |
| **SEC-02** | Hardcoded Fallback Ingest Secret Key | **FAIL** | **HIGH:** `KrishiMandiController.java` (line 17) and `scripts/ingest_kmvahini.py` (line 54) define `@Value("${kmv.ingest.key:kmv_internal_secret_key_2026}")`. If unconfigured on the server, an attacker who reads the source code can send this key to mutate or purge records. |
| **SEC-03** | Overly Permissive SecurityConfig on `/api/market/**` | **FAIL** | **HIGH:** `SecurityConfig.java` (line 41) permits all HTTP methods to `/api/market/**` without Spring Security authentication. Unauthenticated clients can directly reach snapshot and purge endpoints. |
| **SEC-04** | Ingestion Key Exposure to Public Endpoints / Frontend | **PASS** | Verified: Neither `X-Ingest-Key` nor backend database secrets are exposed in frontend bundles, build artifacts (`dist/`), or public GET responses. |
| **SEC-05** | Unauthorized Snapshot Rejection | **PASS** | Verified: `POST /api/market/kmv/snapshot` returns HTTP 401 Unauthorized when `X-Ingest-Key` is missing or mismatched (tested in `KrishiMandiControllerTest.java`). |
| **SEC-06** | CORS and Sensitive Headers | **PASS** | Verified: `cors.allowed-origins` restricts access to localhost and `https://agri-compass-v3.vercel.app`. Credentials mode is enforced. |

### SEC-01 Immediate Remediation Instructions (Credential Rotation)
> [!CAUTION]
> The database credential committed in commit `a31339d` must be considered **compromised**.
> 1. Log in to the Neon Console (`https://console.neon.tech`).
> 2. Select the database project containing `neondb` -> Roles -> `neondb_owner`.
> 3. Click **Reset Password** to revoke the exposed credential immediately.
> 4. Update the `SPRING_DATASOURCE_PASSWORD` environment variable in your production hosting dashboards (Render / Railway).
> 5. **DO NOT** paste the new password into the agent conversation.
> 6. Remove the hardcoded credentials from `scripts/verify_e2e_live_postgres.py` and replace them with `os.getenv("DB_PASSWORD")`.

---

## 4. Krishi Marata Vahini Integration Findings

| Check | Criterion | Status | Verified Evidence |
| :--- | :--- | :--- | :--- |
| **KMV-01** | Live Source Retrieval (`kmvahini`) | **PASS** | Live retrieval from `https://krama.karnataka.gov.in/` confirmed. 866 rows for Maize across 93 APMCs; 194 rows for Ragi across 28 APMCs. |
| **KMV-02** | Source-of-Truth Cross-Check | **PASS** | 100% exact match between raw ASP.NET HTML grid (`_ctl0_MainContent_pnlgrd`) and scraped data for Haveri Maize (1 Oct 2026): Date `01/10/2026`, Variety `LOCAL`, Grade `MEDIUM`, Arrivals `8832`, Min `2350`, Max `2600`, Modal `2500`. |
| **KMV-03** | Date Extraction Integrity | **PASS** | Dates parsed strictly using `dayfirst=True` (`DD/MM/YYYY`). Dates represent source report date, not scraper execution timestamp. |
| **KMV-04** | Dropdown Fallback Bug Guard | **PASS** | `kmvahini` v1.2.0 silent fallback bug guarded in `scripts/ingest_kmvahini.py` (line 86) and `KrishiMandiService.java` (line 72). Unlisted years and mismatched dates are rejected. |
| **KMV-05** | Import Idempotency (Zero Duplicates) | **PASS** | Tested in both Spring Boot integration test and live PostgreSQL script. Re-importing identical payloads updates in-place via upsert; row count does not increase. |
| **KMV-06** | Incomplete / Malformed Snapshot Preservation | **PASS** | Tested: Missing mandatory fields, negative prices, and `minPrice > maxPrice` trigger transaction rollback (`IllegalStateException`). Existing valid snapshots remain 100% preserved. |
| **KMV-07** | Atomic Snapshot Replacement | **PASS** | Transactional boundary (`@Transactional`) ensures snapshot is either committed completely or rolled back with 0 corruption. |
| **KMV-08** | Data.gov.in Fallback Behavior | **PASS** | Districts without KMV data fall back cleanly to Data.gov.in upstream client. Response does not label fallback data as KMV. |
| **KMV-09** | Frontend Source & Date Display | **PASS** | `MarketPricesSection.tsx` displays official badge *"Krishi Marata Vahini (Govt of Karnataka APMC)"* and exact date (`Reported: 1 Oct 2026`). Never mislabels past reports as today. |
| **KMV-10** | Coverage & Freshness Communication | **PASS** | When no reports exist within 30 days, clear empty state renders: *"No recent mandi price is available for this crop or district. Please check again when a new report is published."* |

---

## 5. Database Integrity & Retention Findings

| Area | Audit Item | Status | Finding & Analysis |
| :--- | :--- | :--- | :--- |
| **DB-01** | Uniqueness Constraint Scope | **FAIL** | `idx_kmv_unique_market_crop` is defined on `(market, commodity, variety)`. **`grade` is omitted from the unique constraint.** If an APMC reports multiple grades (e.g. `MEDIUM` and `FAQ`) for the same variety, the second grade overwrites the first, or causes collision on batch insert. |
| **DB-02** | Market Name Normalization | **PASS** | Names are trimmed and indexed; case-insensitive lookups (`findByMarketIgnoreCaseAndCommodityIgnoreCaseAndVarietyIgnoreCase`) are enforced. |
| **DB-03** | Retention Policy (30-Day Cutoff) | **PASS** | Purge logic runs independently via `@Scheduled(cron = "0 0 2 * * ?", zone = "Asia/Kolkata")` using `deleteByReportDateBefore(cutoffDate)` where `cutoffDate = today - 30 days`. |
| **DB-04** | Independence from Frontend Activity | **PASS** | Purge runs as a backend cron job and does not rely on a user opening the application. |
| **DB-05** | Production Test Artifact Cleanup | **PASS** | All test records inserted during live verification (`Haveri`, `Shimoga_Test`, `Bangalore_Test`) were cleaned up via `DELETE` statements at script conclusion. |

---

## 6. Production Execution & Scheduling Findings

| Infrastructure Area | Requirement | Current State | Status |
| :--- | :--- | :--- | :--- |
| **Scraper Runtime** | Python 3.13, Selenium, Chrome, ChromeDriver | Installed locally in `kmv_env`, but **absent** from production hosting containers (Render/Railway backend is a standard Java 17 image; Vercel is Node.js/edge). | **FAIL** |
| **Scheduled Ingestion** | Daily cron scraping execution | **NOT CONFIGURED:** No GitHub Actions workflow (`.github/workflows` does not exist), no Docker scraper worker, and no cron trigger configured to call `ingest_kmvahini.py`. | **FAIL** |
| **Live Production Ingestion** | Scraper execution in deployed environment | The scraper has **never run on a schedule in production**. Ingestion has only been executed via manual CLI and automated test scripts. | **INCONCLUSIVE** |

---

## 7. Test and Build Evidence

All tests were executed and independently verified on 2026-10-18:

1. **Backend Test Suite (Maven Surefire):**
   - Command: `.\mvnw.cmd test`
   - Outcome: **117 tests run, 0 failures, 0 errors, 0 skipped** (Duration: 39.49s).
   - Key Suites:
     - `KrishiMandiEndToEndIntegrationTest`: 6 tests covering all 7 integration criteria — **PASS**.
     - `KrishiMandiServiceTest`: 7 tests covering validation, upsert, and purge — **PASS**.
     - `KrishiMandiControllerTest`: 4 tests covering auth key checks and parameter routing — **PASS**.
     - `MarketControllerTest`: 3 tests covering upstream fallback and error handling — **PASS**.
2. **Frontend Test Suite (Vitest):**
   - Command: `npm run test`
   - Outcome: **96 tests run across 20 test files, 0 failures** (Duration: 90.46s).
   - Key Suite: `MarketPricesSection.test.tsx` (2 tests verifying badge, empty state, and report dates) — **PASS**.
3. **Frontend Production Build (Vite):**
   - Command: `npm run build`
   - Outcome: **Success (36.47s)**. Generated clean production bundle in `dist/` with 0 TypeScript or packaging errors.
4. **Live PostgreSQL Verification:**
   - Command: `.\kmv_env\Scripts\python scripts/verify_e2e_live_postgres.py`
   - Outcome: All 7 live database checks executed and passed against Neon PostgreSQL.

---

## 8. Prioritized Remediation Plan

To advance from **NOT READY** to **READY**, the following remediation steps must be completed in order:

### Priority 1: Security Remediations (Immediate)
1. **Rotate Compromised Database Credential (SEC-01):**
   - Reset the password for `neondb_owner` in the Neon console.
   - Update `SPRING_DATASOURCE_PASSWORD` in the Render/Railway hosting dashboard.
   - In `scripts/verify_e2e_live_postgres.py`, replace plaintext credentials with `os.getenv("DB_PASSWORD")`.
2. **Remove Hardcoded Ingestion Key Fallback (SEC-02):**
   - In `KrishiMandiController.java`, change `@Value("${kmv.ingest.key:kmv_internal_secret_key_2026}")` to `@Value("${kmv.ingest.key:}")`. If the key is blank, reject ingest requests.
   - In `scripts/ingest_kmvahini.py`, remove the hardcoded default fallback string.
3. **Harden `SecurityConfig.java` (SEC-03):**
   - Restrict public market access to `GET` only:
     ```java
     .requestMatchers(HttpMethod.GET, "/api/market/**").permitAll()
     ```
   - Do not permit unrestricted `POST` access to `/api/market/kmv/**`.

### Priority 2: Database Integrity Remediations
4. **Expand Unique Constraint to Include `grade` (DB-01):**
   - Update `KrishiMandiPrice.java`:
     ```java
     @Index(name = "idx_kmv_unique_market_crop", columnList = "market, commodity, variety, grade", unique = true)
     ```
   - Update `KrishiMandiPriceRepository` and `KrishiMandiService` to match on `(market, commodity, variety, grade)`.

### Priority 3: Operational Scheduling Setup
5. **Establish Scheduled Scraper Execution:**
   - Create a GitHub Actions workflow (`.github/workflows/kmv_scraper.yml`) with headless Chrome to run `scripts/ingest_kmvahini.py` daily at 18:30 IST (after Karnataka APMC evening publish) and POST snapshots using GitHub Secrets (`KMV_INGEST_KEY`, `KMV_API_URL`).

---

## Final Decision Gate

**Classification:** **NOT READY**

**Rationale:**  
While the core functional implementation, date extraction, data normalization, frontend presentation, and automated test suites (117 backend + 96 frontend tests) are robust and verified, **the application cannot be declared ready because:**
1. A live production database password was committed to Git in commit `a31339d` and pushed to GitHub. This credential must be rotated and scrubbed before new work begins.
2. Ingestion authorization contains a hardcoded fallback string accessible via publicly unauthenticated HTTP POST routes.
3. Scheduled production execution has not been configured in the actual deployment infrastructure.

**Next Action:** Complete Priority 1 and Priority 2 remediations. Once database credentials are confirmed rotated and security configs are hardened, the status will move to **READY**, unlocking the **Krishi Mitra** build.
