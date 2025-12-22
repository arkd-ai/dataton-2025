import duckdb
import os
import sys

def export_to_parquet(db_path, output_dir, tables=None):
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    os.makedirs(output_dir, exist_ok=True)
    
    con = duckdb.connect(db_path)
    
    if not tables:
        # Get all tables if none specified
        tables_res = con.execute("SHOW TABLES").fetchall()
        tables = [t[0] for t in tables_res]
    
    print(f"Exporting tables from {db_path} to {output_dir}...")
    
    for table in tables:
        output_file = os.path.join(output_dir, f"{table}.parquet")
        print(f"  - Exporting {table} -> {output_file}")
        try:
            con.execute(f"COPY (SELECT * FROM {table}) TO '{output_file}' (FORMAT PARQUET, COMPRESSION 'ZSTD')")
        except Exception as e:
            print(f"    Failed to export {table}: {e}")
    
    con.close()
    print("Export complete.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python export_to_parquet.py <db_path> <output_dir> [table1,table2,...]")
        sys.exit(1)
        
    db_path = sys.argv[1]
    output_dir = sys.argv[2]
    tables = sys.argv[3].split(',') if len(sys.argv) > 3 else None
    
    export_to_parquet(db_path, output_dir, tables)
