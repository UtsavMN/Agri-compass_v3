"""Automated unit tests for KMV report parser (compatible with standard unittest and pytest)."""

from __future__ import annotations

import json
import unittest
from pathlib import Path

# Add src to sys.path
import sys
src_path = str(Path(__file__).resolve().parent.parent / "src")
if src_path not in sys.path:
    sys.path.insert(0, src_path)

from kmv_scraper.parser import parse_kmv_text, validate_report_date, APMC_DISTRICT_MAP


FIXTURES_DIR = Path(__file__).resolve().parent.parent.parent / "test-data" / "fixtures"
EXPECTED_DIR = Path(__file__).resolve().parent.parent.parent / "test-data" / "expected"


class TestKmvParser(unittest.TestCase):

    def test_parse_valid_fixture(self):
        valid_file = FIXTURES_DIR / "kmv_report_sample_valid.txt"
        expected_file = EXPECTED_DIR / "kmv_report_sample_valid.json"

        raw_text = valid_file.read_text(encoding="utf-8")
        expected_records = json.loads(expected_file.read_text(encoding="utf-8"))

        result = parse_kmv_text(raw_text, report_date="2026-10-19")

        self.assertEqual(result.rejected_count, 0)
        self.assertEqual(result.valid_count, len(expected_records))
        self.assertEqual(result.total_parsed, len(expected_records))
        self.assertEqual(result.valid_records, expected_records)

    def test_parse_corrupted_fixture(self):
        corrupted_file = FIXTURES_DIR / "kmv_report_sample_corrupted.txt"
        raw_text = corrupted_file.read_text(encoding="utf-8")

        result = parse_kmv_text(raw_text, report_date="2026-10-19")

        # The corrupted fixture contains 4 invalid rows and 1 valid row (Doddaballapur Ragi)
        self.assertEqual(result.valid_count, 1)
        self.assertEqual(result.valid_records[0]["commodity"], "Ragi")
        self.assertEqual(result.valid_records[0]["market"], "Doddaballapur")
        self.assertEqual(result.valid_records[0]["modalPrice"], 2400.0)

        # Ensure all corruption types were flagged with reasons
        reasons = [r.reason for r in result.rejections]
        self.assertTrue(any("Inverted price range" in r for r in reasons))
        self.assertTrue(any("Malformed numeric values" in r for r in reasons))
        self.assertTrue(any("Modal price" in r and "outside" in r for r in reasons))
        self.assertTrue(any("Negative prices not permitted" in r for r in reasons))

    def test_parse_truncated_fixture(self):
        partial_file = FIXTURES_DIR / "kmv_report_sample_partial.txt"
        raw_text = partial_file.read_text(encoding="utf-8")

        result = parse_kmv_text(raw_text, report_date="2026-10-19")

        self.assertEqual(result.valid_count, 0)
        self.assertEqual(result.rejected_count, 1)
        self.assertIn("Truncated entry", result.rejections[0].reason)

    def test_empty_input(self):
        result = parse_kmv_text("", report_date="2026-10-19")
        self.assertEqual(result.valid_count, 0)
        self.assertEqual(result.rejected_count, 0)
        self.assertEqual(result.total_parsed, 0)

    def test_future_report_date_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            parse_kmv_text("some text", report_date="2099-01-01")
        self.assertIn("is in the future", str(ctx.exception))

    def test_invalid_date_format_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            parse_kmv_text("some text", report_date="19-10-2026")
        self.assertIn("Invalid date format", str(ctx.exception))

    def test_district_mapping_resolution(self):
        sample = """1] MARKET: Kolar Commodity Variety Grade Arrivals Units Min Max Modal
Tomato Local FAQ 10.0 Quintal 1000.0 2000.0 1500.0
2] MARKET: UnknownAPMC Commodity Variety Grade Arrivals Units Min Max Modal
Tomato Local FAQ 10.0 Quintal 1000.0 2000.0 1500.0
"""
        result = parse_kmv_text(sample, report_date="2026-10-19")
        self.assertEqual(result.valid_count, 2)
        self.assertEqual(result.valid_records[0]["district"], "Kolar")
        self.assertEqual(result.valid_records[1]["district"], "Karnataka")  # Unmapped fallback


if __name__ == "__main__":
    unittest.main()
