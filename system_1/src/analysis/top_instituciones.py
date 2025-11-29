import duckdb
import os

def analizar_top_instituciones():
    # Conectar a la DB DuckDB donde DBT guardó los datos
    # Ajustar ruta relativa
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    db_path = os.path.join(base_dir, "csv_outputs/dataton_s1.duckdb")
    
    con = duckdb.connect(db_path, read_only=True)
    
    print("--- Top 10 Instituciones por Ingreso Anual Promedio ---")
    print("(Considerando solo instituciones con > 10 declaraciones para evitar ruido)")
    
    query = """
        SELECT 
            estado,
            institucion,
            COUNT(*) as num_declaraciones,
            AVG(ingreso_anual_neto) as ingreso_promedio,
            MAX(ingreso_anual_neto) as ingreso_maximo
        FROM s1_dataset_maestro
        WHERE ingreso_anual_neto > 0 
          AND institucion != 'DESCONOCIDO'
        GROUP BY estado, institucion
        HAVING COUNT(*) > 10
        ORDER BY ingreso_promedio DESC
        LIMIT 10
    """
    
    results = con.execute(query).fetchall()
    
    print(f"{'ESTADO':<20} | {'INSTITUCIÓN':<40} | {'COUNT':<6} | {'PROM. ANUAL':<15} | {'MAX. ANUAL':<15}")
    print("-" * 110)
    
    for row in results:
        estado = row[0][:19]
        inst = row[1][:39]
        count = row[2]
        avg = f"${row[3]:,.2f}"
        max_val = f"${row[4]:,.2f}"
        print(f"{estado:<20} | {inst:<40} | {count:<6} | {avg:<15} | {max_val:<15}")

if __name__ == "__main__":
    analizar_top_instituciones()
