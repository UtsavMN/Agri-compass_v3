"""Krishi Marata Vahini (KMV) Report Text Parser.

Converts raw text/OCR dumps from the Karnataka Krishi Marata Vahini portal
into normalized, validated canonical Mandi Price records.
Supports both vertical field-per-line and horizontal row-per-record formats.
"""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass, field
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple


# Verified APMC Market to Administrative District Mapping
APMC_DISTRICT_MAP: Dict[str, str] = {
    "Bagepalli": "Chikkaballapura",
    "Chintamani": "Chikkaballapura",
    "Gowribidnur": "Chikkaballapura",
    "Sidlaghatta": "Chikkaballapura",
    "Gudibande": "Chikkaballapura",
    "Bangarpet": "Kolar",
    "Kolar": "Kolar",
    "Malur": "Kolar",
    "Srinivaspur": "Kolar",
    "Mulbagal": "Kolar",
    "C.R.Nagar": "Chamarajanagar",
    "Chamarajanagar": "Chamarajanagar",
    "Gundlupet": "Chamarajanagar",
    "Kollegal": "Chamarajanagar",
    "Yelandur": "Chamarajanagar",
    "Channapatna": "Ramanagara",
    "Ramanagara": "Ramanagara",
    "Kanakapura": "Ramanagara",
    "Magadi": "Ramanagara",
    "Doddaballapur": "Bengaluru Rural",
    "Devanahalli": "Bengaluru Rural",
    "Hosakote": "Bengaluru Rural",
    "Nelamangala": "Bengaluru Rural",
    "Binny Mill": "Bengaluru Urban",
    "Yeshwanthpur": "Bengaluru Urban",
    "KR Market": "Bengaluru Urban",
    "Singena Agrahara": "Bengaluru Urban",
    "Haveri": "Haveri",
    "Ranebennur": "Haveri",
    "Byadgi": "Haveri",
    "Hirekerur": "Haveri",
    "Davangere": "Davangere",
    "Honnali": "Davangere",
    "Harihara": "Davangere",
    "Channagiri": "Davangere",
    "Tirthahalli": "Shivamogga",
    "Shivamogga": "Shivamogga",
    "Bhadravathi": "Shivamogga",
    "Sagar": "Shivamogga",
    "Shikaripur": "Shivamogga",
    "Soraba": "Shivamogga",
    "Hosanagara": "Shivamogga",
    "Holalkere": "Chitradurga",
    "Chitradurga": "Chitradurga",
    "Challakere": "Chitradurga",
    "Hiriyur": "Chitradurga",
    "Hosadurga": "Chitradurga",
    "Molakalmuru": "Chitradurga",
    "Periyapatna": "Mysuru",
    "Mysuru": "Mysuru",
    "Nanjangud": "Mysuru",
    "T.Narasipura": "Mysuru",
    "Hunsur": "Mysuru",
    "K.R.Nagar": "Mysuru",
    "H.D.Kote": "Mysuru",
    "Belagavi": "Belagavi",
    "Bailhongal": "Belagavi",
    "Gokak": "Belagavi",
    "Chikkodi": "Belagavi",
    "Athani": "Belagavi",
    "Hubballi": "Dharwad",
    "Dharwad": "Dharwad",
    "Kundgol": "Dharwad",
    "Annigeri": "Dharwad",
    "Kalaburagi": "Kalaburagi",
    "Sedam": "Kalaburagi",
    "Aland": "Kalaburagi",
    "Chittapur": "Kalaburagi",
    "Ballari": "Ballari",
    "Hospet": "Vijayanagara",
    "Kudligi": "Vijayanagara",
    "Siruguppa": "Ballari",
    "Udupi": "Udupi",
    "Kundapura": "Udupi",
    "Karkala": "Udupi",
    "Mangaluru": "Dakshina Kannada",
    "Bantwal": "Dakshina Kannada",
    "Bantwala": "Dakshina Kannada",
    "Belthangady": "Dakshina Kannada",
    "Belthangadi": "Dakshina Kannada",
    "Puttur": "Dakshina Kannada",
    "Sullia": "Dakshina Kannada",
    "Sulya": "Dakshina Kannada",
    "Arsikere": "Hassan",
    "Bagalkot": "Bagalkote",
    "Basavakalyana": "Bidar",
    "Bengaluru": "Bengaluru Urban",
    "Chincoli": "Kalaburagi",
    "Gadag": "Gadag",
    "Gangavati": "Koppal",
    "Gonikoppal": "Kodagu",
    "Gubbi": "Tumakuru",
    "Haliyala": "Uttara Kannada",
    "Hangal": "Haveri",
    "Harapanahalli": "Vijayanagara",
    "Honnavar": "Uttara Kannada",
    "Hungund": "Bagalkote",
    "Kadur": "Chikkamagaluru",
    "Kanakagiri": "Koppal",
    "Koppa": "Chikkamagaluru",
    "Koppal": "Koppal",
    "Kottur": "Vijayanagara",
    "Kumta": "Uttara Kannada",
    "Kundapur": "Udupi",
    "Kustagi": "Koppal",
    "Laxmeshwar": "Gadag",
    "Lingasargur": "Raichur",
    "Mandya": "Mandya",
    "Manvi": "Raichur",
    "Maski": "Raichur",
    "Pandavapura": "Mandya",
    "Raichur": "Raichur",
    "Ramdurga": "Belagavi",
    "Ranibennur": "Haveri",
    "Santhesargur": "Raichur",
    "Savanur": "Haveri",
    "Sindhanur": "Raichur",
    "Srirangapatna": "Mandya",
    "Talikote": "Vijayapura",
    "Tiptur": "Tumakuru",
    "Turuvekere": "Tumakuru",
    "Udipi": "Udupi",
    "Vijayapura": "Vijayapura",
}

_APMC_LOWER_MAP: Dict[str, str] = {k.lower(): v for k, v in APMC_DISTRICT_MAP.items()}


def resolve_apmc_district(market_name: str) -> str:
    """Resolve APMC market name to Karnataka administrative district case-insensitively."""
    if not market_name:
        return "Karnataka"
    clean = market_name.replace("&amp;", "&").strip()
    norm = re.sub(r"\s*\([^)]*\)", "", clean).strip().lower()
    return _APMC_LOWER_MAP.get(norm, _APMC_LOWER_MAP.get(clean.lower(), "Karnataka"))


@dataclass
class RejectionRecord:
    market: str
    commodity: str
    reason: str
    raw_data: List[str] = field(default_factory=list)


@dataclass
class ParseResult:
    valid_records: List[Dict[str, Any]]
    rejections: List[RejectionRecord]
    total_parsed: int
    valid_count: int
    rejected_count: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_parsed": self.total_parsed,
            "valid_count": self.valid_count,
            "rejected_count": self.rejected_count,
            "valid_records": self.valid_records,
            "rejections": [asdict(r) for r in self.rejections],
        }


def validate_report_date(report_date_str: str) -> Tuple[bool, Optional[str]]:
    """Validate report date string (YYYY-MM-DD)."""
    try:
        parsed = datetime.strptime(report_date_str.strip(), "%Y-%m-%d").date()
    except (ValueError, AttributeError):
        return False, f"Invalid date format '{report_date_str}'. Expected YYYY-MM-DD."

    max_allowed = date.today() + timedelta(days=1)
    if parsed > max_allowed:
        return False, f"Date '{report_date_str}' is in the future (max allowed: {max_allowed})."

    return True, None


def _is_number(s: str) -> bool:
    try:
        float(s.replace(",", ""))
        return True
    except ValueError:
        return False


def parse_kmv_text(
    raw_text: str,
    report_date: str = "2026-10-19",
    district_override: Optional[str] = None,
) -> ParseResult:
    """Parse raw KMV text report into structured canonical records."""
    is_valid_date, date_err = validate_report_date(report_date)
    if not is_valid_date:
        raise ValueError(date_err)

    if not raw_text or not raw_text.strip():
        return ParseResult(
            valid_records=[],
            rejections=[],
            total_parsed=0,
            valid_count=0,
            rejected_count=0,
        )

    market_blocks = re.split(r"\d+\]\s*MARKET:\s*", raw_text)
    valid_records: List[Dict[str, Any]] = []
    rejections: List[RejectionRecord] = []

    blocks_to_process = market_blocks[1:] if len(market_blocks) > 1 else market_blocks

    for block in blocks_to_process:
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        if not lines:
            continue

        market_header = lines[0]
        market_name = re.split(r"Commodity", market_header, flags=re.IGNORECASE)[0].strip()
        if not market_name:
            rejections.append(
                RejectionRecord(
                    market="Unknown",
                    commodity="Unknown",
                    reason="Could not extract APMC market name from header line.",
                    raw_data=[market_header],
                )
            )
            continue

        district = district_override or resolve_apmc_district(market_name)

        header_tokens = {"variety", "grade", "arrivals", "units", "min", "max", "modal", "commodity"}
        raw_content_lines = [
            line for line in lines[1:]
            if not any(token in line.lower() for token in header_tokens)
        ]

        # Check if rows are horizontal (space/tab-delimited records on a single line)
        # A horizontal row has at least 8 tokens and ends with 3 numbers (min, max, modal)
        horizontal_rows = []
        vertical_lines = []

        is_all_horizontal = True
        for line in raw_content_lines:
            tokens = line.split()
            if len(tokens) >= 8 and _is_number(tokens[-1]) and _is_number(tokens[-2]) and _is_number(tokens[-3]):
                horizontal_rows.append(tokens)
            else:
                is_all_horizontal = False
                break

        if is_all_horizontal and horizontal_rows:
            # Parse horizontal rows
            for tokens in horizontal_rows:
                modal_raw = tokens[-1]
                max_raw = tokens[-2]
                min_raw = tokens[-3]
                unit_raw = tokens[-4]
                arrivals_raw = tokens[-5]
                grade = tokens[-6].upper()
                variety = tokens[-7].capitalize()
                commodity = " ".join(tokens[:-7])

                _validate_and_append(
                    valid_records, rejections, market_name, district, report_date,
                    commodity, variety, grade, arrivals_raw, unit_raw, min_raw, max_raw, modal_raw,
                    tokens
                )
        else:
            # Parse vertical stream of 8-line chunks
            data_lines = raw_content_lines
            i = 0
            while i < len(data_lines):
                chunk = data_lines[i : i + 8]
                if len(chunk) < 8:
                    rejections.append(
                        RejectionRecord(
                            market=market_name,
                            commodity=chunk[0] if chunk else "Unknown",
                            reason=f"Truncated entry: expected 8 values, found {len(chunk)}.",
                            raw_data=chunk,
                        )
                    )
                    break

                commodity, variety, grade, arrivals_raw, unit_raw, min_raw, max_raw, modal_raw = chunk
                resynced = _validate_and_append(
                    valid_records, rejections, market_name, district, report_date,
                    commodity, variety.capitalize(), grade.upper(), arrivals_raw, unit_raw, min_raw, max_raw, modal_raw,
                    chunk
                )
                if resynced:
                    i += 8
                else:
                    i += 1  # Resynchronize if numeric parsing failed

    total = len(valid_records) + len(rejections)
    return ParseResult(
        valid_records=valid_records,
        rejections=rejections,
        total_parsed=total,
        valid_count=len(valid_records),
        rejected_count=len(rejections),
    )


def _validate_and_append(
    valid_records: List[Dict[str, Any]],
    rejections: List[RejectionRecord],
    market_name: str,
    district: str,
    report_date: str,
    commodity: str,
    variety: str,
    grade: str,
    arrivals_raw: str,
    unit_raw: str,
    min_raw: str,
    max_raw: str,
    modal_raw: str,
    raw_chunk: List[str],
) -> bool:
    """Validate extracted fields and append to valid_records or rejections. Returns False if numeric conversion failed."""
    try:
        arrivals = float(arrivals_raw.replace(",", ""))
        min_price = float(min_raw.replace(",", ""))
        max_price = float(max_raw.replace(",", ""))
        modal_price = float(modal_raw.replace(",", ""))
    except ValueError as ve:
        rejections.append(
            RejectionRecord(
                market=market_name,
                commodity=commodity,
                reason=f"Malformed numeric values: {ve}",
                raw_data=raw_chunk,
            )
        )
        return False

    if min_price < 0 or max_price < 0 or modal_price < 0:
        rejections.append(
            RejectionRecord(
                market=market_name,
                commodity=commodity,
                reason=f"Negative prices not permitted (min={min_price}, modal={modal_price}, max={max_price})",
                raw_data=raw_chunk,
            )
        )
        return True

    if min_price > max_price:
        rejections.append(
            RejectionRecord(
                market=market_name,
                commodity=commodity,
                reason=f"Inverted price range: minPrice ({min_price}) > maxPrice ({max_price})",
                raw_data=raw_chunk,
            )
        )
        return True

    if modal_price < min_price or modal_price > max_price:
        rejections.append(
            RejectionRecord(
                market=market_name,
                commodity=commodity,
                reason=f"Modal price ({modal_price}) outside [min={min_price}, max={max_price}] range",
                raw_data=raw_chunk,
            )
        )
        return True

    if arrivals < 0:
        rejections.append(
            RejectionRecord(
                market=market_name,
                commodity=commodity,
                reason=f"Negative arrival quantity not permitted: {arrivals}",
                raw_data=raw_chunk,
            )
        )
        return True

    unit = unit_raw.strip().capitalize() if unit_raw.strip() else "Quintal"
    price_unit = f"Rs/{unit}" if not unit.lower().startswith("rs") else unit

    valid_records.append({
        "source": "KRISHI_MARATA_VAHINI",
        "reportDate": report_date,
        "state": "Karnataka",
        "district": district,
        "market": market_name,
        "commodity": commodity.strip(),
        "variety": variety.strip().capitalize() if variety.strip() else "Common",
        "grade": grade.strip().upper() if grade.strip() else "STANDARD",
        "arrivalQuantity": arrivals,
        "arrivalUnit": unit,
        "priceUnit": price_unit,
        "minPrice": min_price,
        "maxPrice": max_price,
        "modalPrice": modal_price,
    })
    return True
