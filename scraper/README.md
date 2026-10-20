# Krishi Marata Vahini (KMV) Parser & Scraper Subsystem

## 1. Overview

The `scraper` package contains the ingestion pipeline responsible for reading raw report text (e.g. from official APMC reports or OCR text files), normalizing fields, validating prices and dates, attributing markets to verified districts, and outputting canonical JSON records.

---

## 2. Input Formats Supported

The parser handles two standard layout formats:

### Format A: Vertical 8-Line Token Stream
Standard copy-paste output from KMV web forms where each column item occupies a single line per market block:

```text
1] MARKET: Kolar Commodity Variety Grade Arrivals Units Min Max Modal
Tomato
Local
FAQ
450.0
Quintal
1400.0
2200.0
1800.0
```

### Format B: Horizontal Space-Delimited Rows
Tabular rows where commodity, variety, grade, arrivals, unit, min, modal, and max prices are whitespace-delimited:

```text
1] MARKET: Kolar Commodity Variety Grade Arrivals Units Min Max Modal
Tomato Local FAQ 450.0 Quintal 1400.0 2200.0 1800.0
```

---

## 3. Validation Rules Enforced

Every extracted entry must satisfy all of the following rules:

1. **Market & Commodity Presence:** Market name must be extractable from the `MARKET:` header.
2. **Date Sanity:** ISO `YYYY-MM-DD`. Must not exceed today + 1 day (prevents future or corrupted timestamps).
3. **Numeric Integrity:** `arrivals`, `minPrice`, `maxPrice`, `modalPrice` must be valid non-negative floats.
4. **Price Arithmetic:**
   - `minPrice >= 0`, `maxPrice >= 0`, `modalPrice >= 0`
   - `minPrice <= maxPrice`
   - `minPrice <= modalPrice <= maxPrice`
5. **District Attribution:** Mapped via `APMC_DISTRICT_MAP`. Unmapped markets default to `"Karnataka"`.

---

## 4. Running the Parser CLI

```powershell
python scraper/parse_report_text.py <input_file> <output_json> <report_date>
```

Example:
```powershell
python scraper/parse_report_text.py test-data/fixtures/kmv_report_sample_valid.txt krishi_mandi_seed.json 2026-10-19
```

---

## 5. Running Automated Tests

```powershell
python -m unittest discover -s scraper/tests -p "test_*.py" -v
```
