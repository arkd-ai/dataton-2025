import duckdb
import os

def analyze_with_duckdb(base_path):
    print(f"Iniciando análisis con DuckDB en: {base_path}")
    
    # Conectamos a una DB en memoria para velocidad y evitar bloqueos
    con = duckdb.connect(database=':memory:')
    
    # Patrón para encontrar todos los archivos
    csv_pattern = os.path.join(base_path, "*/s1_ingresos.csv")
    
    try:
        # Creamos una vista unificada de todos los CSVs
        # union_by_name=True permite que si el orden de columnas varía, se ajuste
        # filename=True nos agrega una columna con la ruta del archivo fuente
        print("Cargando datos desde CSVs...")
        con.execute(f"""
            CREATE TABLE ingresos AS 
            SELECT * FROM read_csv_auto('{csv_pattern}', union_by_name=True, filename=True)
        """)
        
        total_rows = con.execute("SELECT count(*) FROM ingresos").fetchone()[0]
        print(f"Datos cargados exitosamente. Total de registros: {total_rows:,}")
        
        print("\n" + "="*50)
        print("ANÁLISIS DE ANOMALÍAS (SQL)")
        print("="*50)

        # 1. Valores Negativos
        print("\n--- Valores Negativos ---")
        neg_sql = """
            SELECT 
                count(*) as total_negativos,
                COUNT(CASE WHEN remuneracion_mensual_cargo < 0 THEN 1 END) as neg_remuneracion,
                COUNT(CASE WHEN otros_ingresos_mensuales < 0 THEN 1 END) as neg_otros,
                COUNT(CASE WHEN ingreso_mensual_neto < 0 THEN 1 END) as neg_mensual_neto,
                COUNT(CASE WHEN ingreso_anual_neto < 0 THEN 1 END) as neg_anual_neto
            FROM ingresos
            WHERE remuneracion_mensual_cargo < 0 
               OR otros_ingresos_mensuales < 0 
               OR ingreso_mensual_neto < 0 
               OR ingreso_anual_neto < 0
        """
        neg_res = con.execute(neg_sql).fetchone()
        if neg_res[0] > 0:
            print(f"ALERTA: {neg_res[0]} registros con algún valor negativo.")
            print(f"  - Remuneración Mensual < 0: {neg_res[1]}")
            print(f"  - Otros Ingresos < 0: {neg_res[2]}")
            print(f"  - Mensual Neto < 0: {neg_res[3]}")
            print(f"  - Anual Neto < 0: {neg_res[4]}")
        else:
            print("OK: No se encontraron valores negativos.")

        # 2. Outliers (Top 10 absoluto)
        print("\n--- Top 5 Ingresos Anuales Más Altos (Posibles Errores) ---")
        top_sql = """
            SELECT 
                filename,
                ingreso_anual_neto,
                ingreso_mensual_neto
            FROM ingresos 
            WHERE ingreso_anual_neto IS NOT NULL
            ORDER BY ingreso_anual_neto DESC 
            LIMIT 5
        """
        top_res = con.execute(top_sql).fetchall()
        for row in top_res:
            # filename suele ser largo, tomamos solo la parte del estado/archivo
            fname = row[0].split('/')[-2] + "/" + row[0].split('/')[-1]
            
            anual_str = f"${row[1]:,.2f}" if row[1] is not None else "N/A"
            mensual_str = f"${row[2]:,.2f}" if row[2] is not None else "N/A"
            
            print(f"Archivo: {fname} | Anual: {anual_str} | Mensual: {mensual_str}")

        # 3. Inconsistencia: Anual < Mensual
        print("\n--- Inconsistencia Lógica: Anual < Mensual ---")
        logic_sql = """
            SELECT count(*) 
            FROM ingresos 
            WHERE ingreso_anual_neto < ingreso_mensual_neto 
              AND ingreso_anual_neto > 0
        """
        logic_count = con.execute(logic_count_sql).fetchone()[0] if 'logic_count_sql' in locals() else con.execute(logic_sql).fetchone()[0]
        
        if logic_count > 0:
            print(f"ALERTA: {logic_count} registros donde el Ingreso Anual es MENOR que el Mensual.")
            print("Ejemplos:")
            example_sql = """
                SELECT 
                    filename, ingreso_mensual_neto, ingreso_anual_neto 
                FROM ingresos 
                WHERE ingreso_anual_neto < ingreso_mensual_neto 
                  AND ingreso_anual_neto > 0
                LIMIT 3
            """
            examples = con.execute(example_sql).fetchall()
            for row in examples:
                fname = row[0].split('/')[-2] 
                print(f"  Estado: {fname} | Mensual: {row[1]:,.2f} > Anual: {row[2]:,.2f}")
        else:
            print("OK: Lógica Anual >= Mensual respetada.")
            
        # 4. Distribución de anomalías por Estado (basado en nombre de archivo)
        print("\n--- Conteo de Registros por Estado ---")
        state_dist = """
            SELECT 
                regexp_extract(filename, '.*/([^/]+)/s1_ingresos.csv', 1) as estado,
                count(*) as total
            FROM ingresos
            GROUP BY estado
            ORDER BY total DESC
            LIMIT 5
        """
        dist_res = con.execute(state_dist).fetchall()
        for row in dist_res:
            print(f"{row[0]}: {row[1]:,} registros")

    except Exception as e:
        print(f"Ocurrió un error: {e}")

if __name__ == "__main__":
    # Rutas relativas a system_1/src/analysis/analisis_duckdb.py
    # Subir 3 niveles para llegar a system_1/
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    path = os.path.join(base_dir, "csv_outputs")
    
    analyze_with_duckdb(path)
