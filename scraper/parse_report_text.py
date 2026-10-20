"""Convenience entrypoint for parsing KMV report text files.

Usage:
    python scraper/parse_report_text.py [input_file] [output_file] [report_date]
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from kmv_scraper.parser import parse_kmv_text


def main():
    input_file = sys.argv[1] if len(sys.argv) > 1 else "test-data/fixtures/kmv_report_sample_valid.txt"
    output_file = sys.argv[2] if len(sys.argv) > 2 else "krishi_mandi_seed.json"
    report_date = sys.argv[3] if len(sys.argv) > 3 else "2026-10-19"

    in_path = Path(input_file)
    if not in_path.exists():
        print(f"Error: Input file {input_file} does not exist.")
        sys.exit(1)

    raw_text = in_path.read_text(encoding="utf-8")
    result = parse_kmv_text(raw_text, report_date=report_date)

    print(f"=== KMV Parser Execution Report ===")
    print(f"Report Date   : {report_date}")
    print(f"Input File    : {input_file}")
    print(f"Total Parsed  : {result.total_parsed}")
    print(f"Valid Records : {result.valid_count}")
    print(f"Rejections    : {result.rejected_count}")

    if result.rejections:
        print("\nRejections detail:")
        for rej in result.rejections:
            print(f"  - [{rej.market} / {rej.commodity}] {rej.reason}")

    out_path = Path(output_file)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result.valid_records, indent=2), encoding="utf-8")
    print(f"\nSuccessfully wrote {result.valid_count} validated records to: {output_file}")


if __name__ == "__main__":
    main()
