import sqlite3
conn = sqlite3.connect('agri.db')
info = conn.execute("PRAGMA table_info(farm_updates);").fetchall()
print(info)
