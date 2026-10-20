"""Official Automated Scraper for Karnataka Krishi Marata Vahini (KMV) Portal.

Executes direct 3-step ASP.NET WebForms session negotiation against
https://krama.karnataka.gov.in to fetch the complete statewide
commodity-wise daily market price report.

Usage:
    python scraper/scrape_unified_kmv.py [YYYY-MM-DD] [output.json] [--ingest]
"""

from __future__ import annotations

import argparse
from datetime import datetime
import json
from pathlib import Path
import re
import sys
from typing import Any, Dict, List, Optional, Tuple
import urllib3
import requests

# Disable insecure HTTPS warnings for government portal certificates
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Ensure local kmv_scraper module is on python path
sys.path.insert(0, str(Path(__file__).parent / "src"))
from kmv_scraper.parser import resolve_apmc_district

KMV_BASE_URL = "https://krama.karnataka.gov.in"
MAIN_REP_URL = f"{KMV_BASE_URL}/Reports/Main_rep"


def extract_hiddens(html: str) -> Dict[str, str]:
    """Extract all ASP.NET hidden form input fields."""
    hidden_inputs = re.findall(r'<input[^>]*type=["\']hidden["\'][^>]*>', html, re.IGNORECASE)
    payload: Dict[str, str] = {}
    for tag in hidden_inputs:
        name_m = re.search(r'name=["\']([^"\']*)["\']', tag)
        val_m = re.search(r'value=["\']([^"\']*)["\']', tag)
        if name_m:
            payload[name_m.group(1)] = val_m.group(1) if val_m else ""
    return payload


def fetch_live_kmv_html(report_date_str: str) -> str:
    """Fetch complete statewide commodity HTML report for the given date (DD/MM/YYYY)."""
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    })

    print(f"[KMV Live] Step 1: Connecting to {MAIN_REP_URL} ...")
    r1 = session.get(MAIN_REP_URL, verify=False, timeout=20)
    if r1.status_code != 200:
        raise RuntimeError(f"Step 1 failed with status {r1.status_code}")

    p1 = extract_hiddens(r1.text)
    p1["_ctl0:txtSiteSearch"] = ""
    p1["_ctl0:MainContent:TxtDate"] = report_date_str
    p1["_ctl0:MainContent:RadBtnSel"] = "C"  # Commoditywise Daily Report
    p1["_ctl0:MainContent:BtnRep"] = "View Report"

    print(f"[KMV Live] Step 2: Requesting Commodity List for {report_date_str} ...")
    r2 = session.post(
        MAIN_REP_URL,
        data=p1,
        headers={
            "Origin": KMV_BASE_URL,
            "Referer": MAIN_REP_URL,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        verify=False,
        timeout=35,
    )
    if r2.status_code != 200:
        raise RuntimeError(f"Step 2 failed with status {r2.status_code}")

    p2 = extract_hiddens(r2.text)
    p2["_ctl0:txtSiteSearch"] = ""

    # Check all commodities to get full statewide coverage
    cbs = re.findall(r'<input[^>]*type=["\']checkbox["\'][^>]*name=["\']([^"\']*)["\']', r2.text, re.IGNORECASE)
    if not cbs:
        if "No Commodities Reported" in r2.text or "not available" in r2.text.lower():
            print(f"[KMV Live] Krishi Marata Vahini reports: No commodities reported yet for {report_date_str} (APMC morning arrivals / auctions in progress).")
            return ""
        raise RuntimeError("No commodity checkboxes found in Step 2 response.")

    print(f"[KMV Live] Step 3: Selecting all {len(cbs)} commodities across Karnataka ...")
    for cb in cbs:
        p2[cb] = "on"
    p2["_ctl0:MainContent:BtnRep"] = "View Report"

    comm_url = r2.url
    r3 = session.post(
        comm_url,
        data=p2,
        headers={
            "Origin": KMV_BASE_URL,
            "Referer": comm_url,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        verify=False,
        timeout=60,
    )
    if r3.status_code != 200:
        raise RuntimeError(f"Step 3 failed with status {r3.status_code}")

    print(f"[KMV Live] Successfully received {len(r3.text):,} bytes of official market data.")
    return r3.text


def parse_kmv_html_report(html: str, iso_date: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Parse raw KMV HTML tables into structured canonical records."""
    if not html or not html.strip():
        return [], []

    commodity_sections = re.findall(
        r'<span[^>]*style="color:Red;[^>]*>\s*COMMODITY:\s*([^<]+)</span>(.*?)(?=<span[^>]*style="color:Red;|$)',
        html,
        re.DOTALL | re.IGNORECASE,
    )

    valid_records: List[Dict[str, Any]] = []
    rejections: List[Dict[str, Any]] = []

    for comm_name, section_html in commodity_sections:
        commodity = comm_name.strip().title()
        rows = re.findall(r'<tr>(.*?)</tr>', section_html, re.DOTALL | re.IGNORECASE)

        for r in rows:
            cells = re.findall(r'<td[^>]*>(.*?)</td>', r, re.DOTALL | re.IGNORECASE)
            if len(cells) < 8:
                continue

            clean_cells = [re.sub(r'<[^>]+>', '', c).strip() for c in cells]
            raw_market = clean_cells[0].replace("&amp;", "&").strip()
            variety = clean_cells[1] or "Common"
            grade = clean_cells[2] or "Average"

            try:
                arrivals = float(clean_cells[3].replace(",", ""))
                min_p = float(clean_cells[5].replace(",", ""))
                max_p = float(clean_cells[6].replace(",", ""))
                modal_p = float(clean_cells[7].replace(",", ""))
            except ValueError as ex:
                rejections.append({
                    "market": raw_market,
                    "commodity": commodity,
                    "reason": f"Non-numeric prices/arrivals: {ex}",
                })
                continue

            units = clean_cells[4].strip() or "Quintal"

            # Cross-field sanity validation
            if min_p > max_p:
                rejections.append({
                    "market": raw_market,
                    "commodity": commodity,
                    "reason": f"minPrice ({min_p}) > maxPrice ({max_p})",
                })
                continue

            # Clamp modal if slightly outside min/max due to reporting entry error
            modal_p = max(min_p, min(modal_p, max_p))

            district = resolve_apmc_district(raw_market)

            # Normalise market name
            market_display = raw_market.title()
            if "Binny Mill" in market_display:
                market_display = "Binny Mill (F&V)"

            valid_records.append({
                "market": market_display,
                "district": district,
                "commodity": commodity,
                "variety": variety,
                "grade": grade,
                "arrivals": arrivals,
                "arrivalQuantity": arrivals,
                "units": units,
                "arrivalUnit": units,
                "priceUnit": f"Rs/{units}",
                "minPrice": min_p,
                "modalPrice": modal_p,
                "maxPrice": max_p,
                "reportDate": iso_date,
                "source": "KRISHI_MARATA_VAHINI",
            })

    return valid_records, rejections


def main():
    parser = argparse.ArgumentParser(description="Live scraper for Karnataka Krishi Marata Vahini (KMV).")
    parser.add_argument("date", nargs="?", default=None, help="Report date (YYYY-MM-DD or DD/MM/YYYY)")
    parser.add_argument("--date", dest="opt_date", default=None, help="Report date flag (YYYY-MM-DD or DD/MM/YYYY)")
    parser.add_argument("output", nargs="?", default=None, help="Output JSON path")
    parser.add_argument("--output", dest="opt_output", default=None, help="Output JSON path flag")
    parser.add_argument("--ingest", action="store_true", help="Post directly to backend /api/market/snapshot")
    parser.add_argument("--backend-url", default="http://localhost:8080", help="Backend API base URL")
    parser.add_argument("--ingest-key", default="internal_dev_secret_key", help="Ingest authentication key")

    args = parser.parse_args()

    date_str = args.opt_date or args.date or "2026-10-19"
    out_file = args.opt_output or args.output

    # Parse date
    if "/" in date_str:
        d_obj = datetime.strptime(date_str, "%d/%m/%Y")
    else:
        d_obj = datetime.strptime(date_str, "%Y-%m-%d")

    report_date_kmv = d_obj.strftime("%d/%m/%Y")
    iso_date = d_obj.strftime("%Y-%m-%d")

    print(f"=== KMV Statewide Market Scraper ===")
    print(f"Target Date : {iso_date} (KMV query: {report_date_kmv})")

    try:
        raw_html = fetch_live_kmv_html(report_date_kmv)
    except Exception as e:
        print(f"[ERROR] Live fetch failed: {e}")
        sys.exit(1)

    valid_records, rejections = parse_kmv_html_report(raw_html, iso_date)

    if not valid_records:
        print(f"\n=== Extraction Summary ===")
        print(f"Status            : NO_REPORTS_FOR_DATE")
        print(f"Message           : No commodities reported yet on KMV for {iso_date} (APMC auctions in progress).")
        print(f"Action            : Preserving existing active database records (last known prices).")
        if args.ingest:
            print(f"[Ingest] 0 new records to post. Database retains previous active prices.")
        return

    districts = set(r['district'] for r in valid_records)
    markets = set(r['market'] for r in valid_records)
    commodities = set(r['commodity'] for r in valid_records)

    print(f"\n=== Extraction Summary ===")
    print(f"Valid Quotes      : {len(valid_records)}")
    print(f"Rejected Quotes   : {len(rejections)}")
    print(f"Districts Covered : {len(districts)}")
    print(f"APMC Markets      : {len(markets)}")
    print(f"Commodities       : {len(commodities)}")

    seed_paths = [
        Path("agri-compass-api/src/main/resources/dataset/krishi_mandi_seed.json"),
        Path("frontend/src/data/krishi_mandi_seed.json")
    ]
    if out_file:
        seed_paths.append(Path(out_file))

    for p in seed_paths:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(valid_records, indent=2), encoding="utf-8")
        print(f"[OK] Successfully synced {len(valid_records)} records to {p}")

    if args.ingest:
        ingest_url = f"{args.backend_url}/api/market/snapshot"
        print(f"\n[Ingest] Posting {len(valid_records)} records to {ingest_url} ...")
        try:
            resp = requests.post(
                ingest_url,
                json=valid_records,
                headers={"X-Ingest-Key": args.ingest_key},
                timeout=45,
            )
            if resp.status_code == 200:
                print(f"[Ingest OK] Response: {resp.json()}")
            else:
                print(f"[Ingest FAILED] HTTP {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"[Ingest ERROR] Could not reach backend at {ingest_url}: {e}")


if __name__ == "__main__":
    main()
