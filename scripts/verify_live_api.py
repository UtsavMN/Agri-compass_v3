import urllib.request
import json

def verify():
    url = "http://localhost:8080/api/market/summary"
    with urllib.request.urlopen(url) as resp:
        summary = json.loads(resp.read())
        print("=== MANDI SUMMARY ===")
        print(f"Total Records: {summary['totalRecords']}")
        print(f"Total Mandis: {summary['totalMandis']}")
        print(f"Total Districts: {summary['totalDistricts']}")
        print(f"Total Commodities: {summary['totalCommodities']}")
        print(f"Source: {summary['source']}")
        print(f"Latest Report Date: {summary['latestReportDate']}")
        print(f"Average Modal Price: Rs. {summary['avgModalPrice']}")

    print("\n=== TOMATO SPREAD ACROSS KARNATAKA ===")
    with urllib.request.urlopen("http://localhost:8080/api/market/prices?commodity=Tomato") as resp:
        tomatoes = json.loads(resp.read())['prices']
        for t in tomatoes:
            print(f"  * {t['market']} ({t['district']}): Min Rs. {t['minPrice']}, Modal Rs. {t['modalPrice']}, Max Rs. {t['maxPrice']} | Arrivals: {t['arrivalQuantity']} {t['arrivalUnit']}")

    print("\n=== KOLAR DISTRICT MANDI PRICES ===")
    with urllib.request.urlopen("http://localhost:8080/api/market/prices?district=Kolar") as resp:
        kolar = json.loads(resp.read())['prices']
        for k in kolar:
            print(f"  * {k['commodity']} [{k['market']}]: Modal Rs. {k['modalPrice']} (Spread: Rs. {k['minPrice']} - Rs. {k['maxPrice']})")

    print("\n=== ARECANUT SPREAD ===")
    with urllib.request.urlopen("http://localhost:8080/api/market/prices?commodity=Arecanut") as resp:
        areca = json.loads(resp.read())['prices']
        for a in areca:
            print(f"  * {a['market']} ({a['district']}) [{a['variety']} - {a['grade']}]: Modal Rs. {a['modalPrice']} (Spread: Rs. {a['minPrice']} - Rs. {a['maxPrice']})")

if __name__ == '__main__':
    verify()
