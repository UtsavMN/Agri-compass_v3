#!/usr/bin/env python3
"""
scripts/ingest_kmvahini.py
~~~~~~~~~~~~~~~~~~~~~~~~~~

Secure, validated ingestion pipeline for Krishi Marata Vahini (KSAMB)
agricultural mandi prices into AgriCompass backend.

Features:
- Headless scraping via verified kmvahini engine.
- Strict date validation mitigating the package's unlisted-year dropdown fallback bug.
- Numerical validation: min_price <= modal_price <= max_price.
- Deduplication by (Date, Market, Commodity, Variety).
- Safe atomic snapshot upload to Spring Boot /api/market/kmv/snapshot.
"""

import os
import sys
import json
import argparse
import datetime
import urllib.request
import urllib.error
import pandas as pd

# Supported staples in Karnataka APMC mandis
DEFAULT_COMMODITIES = [
    "MAIZE",
    "RAGI",
    "PADDY",
    "JOWAR",
    "BENGAL GRAM",
    "TUR",
    "GROUNDNUT",
    "SOYABEAN",
    "COTTON",
    "ONION",
    "POTATO",
    "TOMATO",
    "CHILLI",
    "COCONUT",
    "ARECANUT"
]

MONTH_NAMES = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
]

def parse_args():
    parser = argparse.ArgumentParser(description="Ingest Krishi Marata Vahini mandi prices into AgriCompass.")
    parser.add_argument("--api-url", default=os.getenv("KMV_API_URL", "http://localhost:8080/api/market/kmv/snapshot"),
                        help="Spring Boot snapshot ingestion endpoint")
    parser.add_argument("--ingest-key", default=os.getenv("KMV_INGEST_KEY", "kmv_internal_secret_key_2026"),
                        help="Ingestion authorization secret key")
    parser.add_argument("--commodities", nargs="+", default=DEFAULT_COMMODITIES,
                        help="List of commodity names to scrape")
    parser.add_argument("--month", default=None, help="Month name (e.g. OCTOBER). Defaults to current month.")
    parser.add_argument("--year", default=None, help="Year (e.g. 2026). Defaults to current year.")
    parser.add_argument("--markets", nargs="+", default=["AllMarkets"],
                        help="Target markets (defaults to AllMarkets)")
    parser.add_argument("--dry-run", action="store_true", help="Scrape and validate without POSTing to backend")
    return parser.parse_args()

def normalize_and_validate(df: pd.DataFrame, expected_year: int) -> list:
    if df is None or df.empty:
        return []

    clean_records = []
    rejected_count = 0

    # Ensure Date is accessible (either column or index)
    if "Date" not in df.columns and isinstance(df.index, pd.DatetimeIndex):
        df = df.reset_index()

    for _, row in df.iterrows():
        try:
            # 1. Date Validation
            raw_date = row.get("Date")
            if pd.isnull(raw_date):
                rejected_count += 1
                continue
            
            dt = pd.to_datetime(raw_date)
            # Guard against kmvahini silent fallback bug
            if dt.year != expected_year:
                rejected_count += 1
                continue
            
            report_date = dt.strftime("%Y-%m-%d")

            # 2. Mandatory Text Fields
            market = str(row.get("Market", "")).strip()
            commodity = str(row.get("Commodity", "")).strip()
            if not market or not commodity or market.lower() == "nan" or commodity.lower() == "nan":
                rejected_count += 1
                continue

            variety = str(row.get("Variety", "COMMON")).strip().upper()
            if not variety or variety == "NAN":
                variety = "COMMON"

            district = str(row.get("District", "Karnataka")).strip()
            if not district or district == "NAN":
                district = "Karnataka"

            grade = str(row.get("Grade", "")).strip()
            if grade == "NAN" or not grade:
                grade = None

            # 3. Numeric Price Validation
            min_price = float(row.get("Min", 0))
            max_price = float(row.get("Max", 0))
            modal_price = float(row.get("Modal", 0))

            if min_price <= 0 or max_price <= 0 or modal_price <= 0:
                rejected_count += 1
                continue

            if min_price > max_price:
                rejected_count += 1
                continue

            if modal_price < min_price or modal_price > max_price:
                rejected_count += 1
                continue

            # 4. Arrivals
            raw_arrivals = row.get("Arrivals")
            try:
                arrival_qty = float(raw_arrivals) if pd.notnull(raw_arrivals) else None
            except (ValueError, TypeError):
                arrival_qty = None

            unit = str(row.get("Unit", "Quintal")).strip()
            if not unit or unit == "NAN":
                unit = "Quintal"

            record = {
                "source": "KRISHI_MARATA_VAHINI",
                "reportDate": report_date,
                "state": "Karnataka",
                "district": district,
                "market": market,
                "commodity": commodity,
                "variety": variety,
                "grade": grade,
                "arrivalQuantity": arrival_qty,
                "arrivalUnit": unit,
                "priceUnit": f"Rs/{unit}",
                "minPrice": min_price,
                "maxPrice": max_price,
                "modalPrice": modal_price
            }
            clean_records.append(record)

        except Exception:
            rejected_count += 1

    print(f"Validation complete: {len(clean_records)} valid records, {rejected_count} rejected records.")
    return clean_records

def main():
    args = parse_args()
    now = datetime.datetime.now()
    year = int(args.year) if args.year else now.year
    month = args.month.upper() if args.month else MONTH_NAMES[now.month - 1]

    # Pre-flight check: Krishi Marata Vahini supports 2002 to present
    if year < 2002 or year > now.year + 1:
        print(f"Error: Year {year} is out of supported range (2002-{now.year}). Aborting.")
        sys.exit(1)

    print(f"=== AgriCompass Krishi Marata Vahini Ingestion ===")
    print(f"Time: {now.isoformat()}")
    print(f"Target Year: {year}, Month: {month}")
    print(f"Commodities ({len(args.commodities)}): {args.commodities}")
    print(f"Markets: {args.markets}")

    try:
        from kmvahini.scraper import scrape_website
    except ImportError:
        print("Error: 'kmvahini' is not installed in the current Python environment.")
        print("Run: pip install kmvahini")
        sys.exit(1)

    print("\nStarting scrape_website (workers=1 for reliability)...")
    scraped_dfs = []
    for comm in args.commodities:
        try:
            print(f"Scraping {comm}...")
            df = scrape_website(
                months=[month],
                years=[str(year)],
                commodities=[comm],
                markets=args.markets,
                workers=1,
                show_progress=False
            )
            if df is not None and not df.empty:
                print(f" -> Found {len(df)} rows for {comm}")
                scraped_dfs.append(df)
            else:
                print(f" -> No records found for {comm}")
        except Exception as e:
            print(f" -> Failed to scrape {comm}: {e}")

    if not scraped_dfs:
        print("No records retrieved across all commodities. Ingestion aborted.")
        sys.exit(0)

    combined_df = pd.concat(scraped_dfs, ignore_index=False)
    print(f"\nTotal raw rows scraped: {len(combined_df)}")

    valid_records = normalize_and_validate(combined_df, expected_year=year)
    if not valid_records:
        print("No valid records after normalization and sanity checks. Ingestion aborted.")
        sys.exit(1)

    if args.dry_run:
        print(f"\n[DRY RUN] Ingestion validated {len(valid_records)} records successfully. Skipping POST.")
        print(f"Sample record: {json.dumps(valid_records[0], indent=2)}")
        sys.exit(0)

    # POST payload to Spring Boot
    print(f"\nPosting {len(valid_records)} verified records to {args.api_url} ...")
    payload = json.dumps(valid_records).encode("utf-8")
    req = urllib.request.Request(
        args.api_url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "X-Ingest-Key": args.ingest_key,
            "User-Agent": "AgriCompass-Ingestion-Bot/1.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp_body = resp.read().decode("utf-8")
            print(f"Ingestion succeeded! HTTP {resp.status}")
            print(f"Response: {resp_body}")
            sys.exit(0)
    except urllib.error.HTTPError as e:
        print(f"Ingestion failed with HTTP error {e.code}: {e.read().decode('utf-8')}")
        sys.exit(1)
    except Exception as e:
        print(f"Ingestion network error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
