import pandas as pd
import glob
import os
import numpy as np

def load_data(base_path):
    # Pattern to match all s1_ingresos.csv files in the subdirectories
    pattern = os.path.join(base_path, "*/s1_ingresos.csv")
    files = glob.glob(pattern)
    
    if not files:
        print("No se encontraron archivos s1_ingresos.csv")
        return None
        
    print(f"Se encontraron {len(files)} archivos.")
    
    # Read and concatenate all files
    dfs = []
    for f in files:
        try:
            df = pd.read_csv(f)
            dfs.append(df)
        except Exception as e:
            print(f"Error leyendo {f}: {e}")
            
    if not dfs:
        return None
        
    return pd.concat(dfs, ignore_index=True)

def analyze_anomalies(df):
    print("\n" + "="*50)
    print("ANÁLISIS DE DECLARACIONES DE INGRESOS")
    print("="*50)
    
    # Columns of interest based on the file header we saw
    numeric_cols = [
        'remuneracion_mensual_cargo', 
        'otros_ingresos_mensuales', 
        'ingreso_mensual_neto', 
        'ingreso_anual_neto'
    ]
    
    # Convert to numeric, coercing errors to NaN
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # 1. Basic Statistics
    print("\n--- Estadísticas Descriptivas ---")
    print(df[numeric_cols].describe())
    
    # 2. Check for Negative Values
    print("\n--- Revisión de Valores Negativos ---")
    for col in numeric_cols:
        if col in df.columns:
            neg_count = (df[col] < 0).sum()
            if neg_count > 0:
                print(f"ALERTA: {neg_count} filas con valor negativo en '{col}'")
                print(df[df[col] < 0][['id', 'state', col]].head())
            else:
                print(f"OK: No se encontraron valores negativos en '{col}'")

    # 3. High Value Outliers (using IQR)
    print("\n--- Posibles Outliers (Valores muy altos) ---")
    # We use a higher threshold multiplier for income as distribution is often skewed
    multiplier = 3.0 
    
    for col in numeric_cols:
        if col in df.columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            upper_bound = Q3 + (multiplier * IQR)
            
            outliers = df[df[col] > upper_bound]
            count = len(outliers)
            
            if count > 0:
                print(f"\nColumna: {col}")
                print(f"Umbral calculado (Q3 + {multiplier}*IQR): {upper_bound:,.2f}")
                print(f"Cantidad de anomalías potenciales: {count} ({count/len(df)*100:.2f}%)")
                print("Top 5 valores más altos:")
                print(outliers.nlargest(5, col)[['id', 'state', col]])

    # 4. Check Logical Inconsistency
    # ingreso_mensual_neto vs Annual (Rough check if annual is < monthly, which is weird unless worked < 1 month)
    print("\n--- Inconsistencias Lógicas ---")
    if 'ingreso_mensual_neto' in df.columns and 'ingreso_anual_neto' in df.columns:
        # Check if annual is significantly less than monthly (allowing for some margin)
        inconsistent = df[
            (df['ingreso_anual_neto'] < df['ingreso_mensual_neto']) & 
            (df['ingreso_anual_neto'] > 0) # Ignore 0s as they might be missing data
        ]
        
        if not inconsistent.empty:
            print(f"ALERTA: {len(inconsistent)} registros donde ingreso anual < ingreso mensual")
            print(inconsistent[['id', 'state', 'ingreso_mensual_neto', 'ingreso_anual_neto']].head())
        else:
            print("OK: No hay casos obvios donde anual < mensual")

if __name__ == "__main__":
    # Path to the system_1 csv_outputs folder
    path = "./system_1/csv_outputs"
    
    df = load_data(path)
    
    if df is not None:
        print(f"\nTotal de registros cargados: {len(df)}")
        analyze_anomalies(df)
