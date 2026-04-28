import sqlite3
conn = sqlite3.connect('analysis.db')
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print('TABLES:', tables)
for t in tables:
    name = t[0]
    print(f'--- {name} ---')
    try:
        rows = conn.execute(f'SELECT * FROM "{name}" LIMIT 5').fetchall()
        print(rows)
    except Exception as e:
        print(f'Error: {e}')
conn.close()
