import duckdb

def validar_resultados(db_path):
    con = duckdb.connect(db_path, read_only=True)
    
    print("--- Resultados del Proceso DBT ---")
    
    # Contar limpios
    clean_count = con.execute("SELECT count(*) FROM s1_ingresos_limpios").fetchone()[0]
    print(f"Registros Limpios:    {clean_count:,}")
    
    # Contar rechazados
    rejected_count = con.execute("SELECT count(*) FROM audit_s1_ingresos_rechazados").fetchone()[0]
    print(f"Registros Rechazados: {rejected_count:,}")
    
    total = clean_count + rejected_count
    print(f"Total Procesado:      {total:,}")
    print(f"Tasa de Rechazo:      {(rejected_count/total)*100:.2f}%")
    
    print("\n--- Top Motivos de Rechazo ---")
    reasons = con.execute("""
        SELECT motivo_rechazo, count(*) 
        FROM audit_s1_ingresos_rechazados 
        GROUP BY motivo_rechazo 
        ORDER BY 2 DESC
    """).fetchall()
    
    for r in reasons:
        print(f"- {r[0]}: {r[1]:,}")

if __name__ == "__main__":
    path = "../../csv_outputs/dataton_s1.duckdb"
    validar_resultados(path)
