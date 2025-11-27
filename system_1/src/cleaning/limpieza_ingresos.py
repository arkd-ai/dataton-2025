import duckdb
import os

def clean_data_with_audit(base_path, output_dir):
    print(f"Iniciando proceso de limpieza y auditoría...")
    
    # Asegurar que exista el directorio de salida
    os.makedirs(output_dir, exist_ok=True)
    
    # Conexión en memoria
    con = duckdb.connect(database=':memory:')
    
    # Cargar todos los archivos raw
    csv_pattern = os.path.join(base_path, "*/s1_ingresos.csv")
    print("1. Cargando datos crudos...")
    con.execute(f"""
        CREATE TABLE raw_ingresos AS 
        SELECT * FROM read_csv_auto('{csv_pattern}', union_by_name=True, filename=True)
    """)
    
    total_rows = con.execute("SELECT count(*) FROM raw_ingresos").fetchone()[0]
    print(f"   Total de registros procesados: {total_rows:,}")

    # Definimos las REGLAS DE CALIDAD en una tabla temporal
    # Usamos una lógica de prioridades para la razón de rechazo
    print("2. Identificando anomalías...")
    con.execute("""
        CREATE TABLE auditoria AS
        SELECT 
            *,
            CASE 
                WHEN ingreso_anual_neto < 0 THEN 'Valor Negativo: Ingreso Anual'
                WHEN ingreso_mensual_neto < 0 THEN 'Valor Negativo: Ingreso Mensual'
                WHEN remuneracion_mensual_cargo < 0 THEN 'Valor Negativo: Remuneración'
                WHEN otros_ingresos_mensuales < 0 THEN 'Valor Negativo: Otros Ingresos'
                WHEN ingreso_anual_neto > 500000000 THEN 'Outlier Extremo: Anual > 500M'
                WHEN ingreso_mensual_neto > 50000000 THEN 'Outlier Extremo: Mensual > 50M'
                ELSE 'OK'
            END as calidad_status
        FROM raw_ingresos
    """)

    # Separar en dos tablas
    
    # A) BITÁCORA DE RECHAZOS (Audit Log)
    print(f"3. Generando Bitácora de Rechazos en: {output_dir}/audit_log_ingresos.csv")
    con.execute(f"""
        COPY (
            SELECT 
                id, 
                filename as archivo_origen,
                ingreso_mensual_neto,
                ingreso_anual_neto,
                calidad_status as motivo_rechazo
            FROM auditoria 
            WHERE calidad_status != 'OK'
        ) TO '{output_dir}/audit_log_ingresos.csv' (HEADER, DELIMITER ',')
    """)
    
    rejected_count = con.execute("SELECT count(*) FROM auditoria WHERE calidad_status != 'OK'").fetchone()[0]
    
    # B) DATASET LIMPIO
    print(f"4. Generando Dataset Limpio en: {output_dir}/s1_ingresos_clean.csv")
    # Seleccionamos todas las columnas originales, excluyendo las filas malas
    # Excluimos la columna temporal 'calidad_status' seleccionando columnas de la tabla raw original
    con.execute(f"""
        COPY (
            SELECT * EXCLUDE (filename)
            FROM auditoria 
            WHERE calidad_status = 'OK'
        ) TO '{output_dir}/s1_ingresos_clean.csv' (HEADER, DELIMITER ',')
    """)
    
    clean_count = con.execute("SELECT count(*) FROM auditoria WHERE calidad_status = 'OK'").fetchone()[0]

    print("\n" + "="*50)
    print("RESUMEN DE LIMPIEZA")
    print("="*50)
    print(f"Total Original:      {total_rows:,}")
    print(f"Registros Limpios:   {clean_count:,} ({(clean_count/total_rows)*100:.2f}%)")
    print(f"Registros Rechazados:{rejected_count:,} ({(rejected_count/total_rows)*100:.2f}%)")
    print("-" * 30)
    print("Desglose de Rechazos:")
    reasons = con.execute("""
        SELECT calidad_status, count(*) 
        FROM auditoria 
        WHERE calidad_status != 'OK' 
        GROUP BY calidad_status 
        ORDER BY 2 DESC
    """).fetchall()
    
    for r in reasons:
        print(f"  - {r[0]}: {r[1]:,}")

if __name__ == "__main__":
    # Rutas relativas a este script (system_1/src/cleaning/limpieza_ingresos.py)
    # Queremos llegar a: system_1/
    # cleaning -> src -> system_1 (3 niveles)
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    input_path = os.path.join(base_dir, "csv_outputs")
    output_path = os.path.join(base_dir, "clean_data")
    
    print(f"Ruta Base: {base_dir}")
    clean_data_with_audit(input_path, output_path)
