import duckdb

def explore_db(db_path):
    try:
        # Conectar a la base de datos en modo lectura
        con = duckdb.connect(db_path, read_only=True)
        
        print(f"Conexión exitosa a: {db_path}\n")
        
        # Listar tablas
        print("--- Tablas en la Base de Datos ---")
        tables = con.execute("SHOW TABLES").fetchall()
        
        if not tables:
            print("No se encontraron tablas.")
            return

        for table in tables:
            table_name = table[0]
            print(f"- {table_name}")
            
            # Obtener esquema de cada tabla (primeras columnas)
            print(f"  Esquema (primeras 5 columnas):")
            schema = con.execute(f"DESCRIBE {table_name}").fetchall()
            for col in schema[:5]:
                print(f"    {col[0]} ({col[1]})")
            print("")
            
            # Contar registros
            count = con.execute(f"SELECT count(*) FROM {table_name}").fetchone()[0]
            print(f"  Total de registros: {count:,}\n")
            
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")

if __name__ == "__main__":
    path = "system_1/csv_outputs/dataton_s1.duckdb"
    explore_db(path)
