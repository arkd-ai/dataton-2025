import csv

filename = 'system_1/csv_outputs/Chihuahua/s1_resumen.csv'

def check_csv_integrity():
    print(f"Revisando: {filename}")
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)
            expected_cols = len(header)
            print(f"Columnas esperadas: {expected_cols}")
            
            for i, row in enumerate(reader, 1):
                if len(row) != expected_cols:
                    print(f"\nError en línea {i+1}:")
                    print(f"Columnas encontradas: {len(row)}")
                    print(f"Contenido: {row}")
                    if i > 5: break # Solo mostrar los primeros errores
                    
    except Exception as e:
        print(f"Error de lectura: {e}")

if __name__ == "__main__":
    check_csv_integrity()
