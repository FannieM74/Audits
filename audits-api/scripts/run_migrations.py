#!/usr/bin/env python3
"""Run SQL migrations 014-017 on Neon."""
import os

DB_URL = "postgresql://neondb_owner:npg_WsOq1Ncv3bxe@ep-ancient-wildflower-aiytsam0-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

import psycopg2

def split_sql_stmts(text):
    """Split SQL text into individual statements, respecting string literals with doubled quotes."""
    statements = []
    current = []
    in_string = False
    i = 0
    while i < len(text):
        ch = text[i]
        if in_string:
            current.append(ch)
            if ch == "'":
                if i + 1 < len(text) and text[i+1] == "'":
                    current.append(text[i+1])
                    i += 1
                else:
                    in_string = False
        elif ch == "'":
            in_string = True
            current.append(ch)
        elif ch == ';':
            stmt = ''.join(current).strip()
            if stmt:
                statements.append(stmt)
            current = []
        else:
            current.append(ch)
        i += 1
    stmt = ''.join(current).strip()
    if stmt:
        statements.append(stmt)
    return statements

base = os.path.join(os.path.dirname(__file__), "..", "internal", "db", "migrations")

conn = psycopg2.connect(DB_URL)
conn.autocommit = True
cur = conn.cursor()

# Migration 014 - DDL only, no semicolons in data
print("=== Running 014_section_descriptions.sql ===")
sql = open(os.path.join(base, "014_section_descriptions.sql")).read()
def run_sql(sql):
    for stmt in split_sql_stmts(sql):
        if stmt and not stmt.startswith('--'):
            try:
                cur.execute(stmt)
            except Exception as e:
                err = str(e)
                if 'already exists' in err or 'duplicate' in err.lower() or 'does not exist' in err or 'already exists' in err.lower():
                    print(f"  Skip (exists): {err[:80]}")
                else:
                    raise

run_sql(sql)
print("  Done")

# Migration 015 - rebuild procedure_items
print("=== Running 015_rebuild_procedure_items.sql ===")
cur.execute("SELECT COUNT(*) FROM procedure_items")
if cur.fetchone()[0] > 0:
    print("  Skipped (procedure_items already populated - would destroy existing data)")
else:
    run_sql(open(os.path.join(base, "015_rebuild_procedure_items.sql")).read())
    print("  Done")

# Migration 016 - seed data
print("=== Running 016_seed_sections_and_evidence.sql ===")
# Execute as a single statement (not split_sql_stmts) because evidence text
# contains semicolons inside string literals that break the split function.
try:
    cur.execute(open(os.path.join(base, "016_seed_sections_and_evidence.sql")).read())
    print("  Done")
except Exception as e:
    err = str(e)
    if 'already exists' in err or 'duplicate' in err.lower():
        print(f"  Skip (exists): {err[:80]}")
    else:
        raise

# Migration 019 - drop_ncr_ref
print("=== Running 019_drop_ncr_ref.sql ===")
run_sql(open(os.path.join(base, "019_drop_ncr_ref.sql")).read())
print("  Done")

# Migration 020 - add raised_by_business_id to audits
print("=== Running 020_add_audit_raised_by_business_id.sql ===")
run_sql(open(os.path.join(base, "020_add_audit_raised_by_business_id.sql")).read())
print("  Done")

# Migration 021 - snapshot business details on audits
print("=== Running 021_audit_business_details.sql ===")
run_sql(open(os.path.join(base, "021_audit_business_details.sql")).read())
print("  Done")

cur.close()
conn.close()
print("\nAll migrations completed.")
