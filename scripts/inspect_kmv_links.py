import urllib.request
import re

url = 'https://krama.karnataka.gov.in/Reports/Main_rep'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=10) as r:
    html = r.read().decode('utf-8', errors='ignore')

# Find table or labels for RadBtnSel
labels = re.findall(r'<label[^>]+for=["\']([^"\']+)["\'][^>]*>(.*?)</label>', html, re.DOTALL)
for l_for, l_text in labels:
    print(f"LABEL for {l_for}: {l_text.strip()}")

# If no label tag, look around the radio inputs
radios = re.findall(r'(<input[^>]+RadBtnSel[^>]+>)([^<]*)', html)
for r_tag, r_text in radios:
    val = re.search(r'value=["\']([^"\']+)["\']', r_tag).group(1)
    print(f"RADIO value={val} text={r_text.strip()}")
