# Sistema 1: Declaraciones Patrimoniales

Este módulo contiene el pipeline de extracción, transformación y análisis de las declaraciones patrimoniales del Sistema 1 (S1) de la Plataforma Digital Nacional (PDN).

## Estructura del Proyecto

```
system_1/
├── src/
│   ├── extraction/       # Scripts de Python para descarga y descompresión
│   ├── cleaning/         # Scripts legacy de limpieza (reemplazados por DBT)
│   └── analysis/         # Scripts de análisis exploratorio y validación
├── dbt_project/          # Proyecto DBT para transformación y limpieza SQL
└── csv_outputs/          # (Gitignored) Datos crudos extraídos en CSV
```

## 1. Extracción de Datos (Python)

El proceso comienza con la obtención de los datos crudos desde los archivos comprimidos de la PDN.

### `src/extraction/unzip_files.py`
Descomprime los archivos descargados de la PDN, organizándolos por estado.
- **Entrada**: Archivos `.zip` o `.json.gz` en la carpeta de descargas.
- **Salida**: Archivos JSON crudos organizados en carpetas.

### `src/extraction/procesar_masivo_s1.py`
Procesa los archivos JSON masivos y los aplana a formato CSV para facilitar su ingesta.
- **Entrada**: Archivos JSON por estado.
- **Salida**: CSVs normalizados en `csv_outputs/{Estado}/`:
    - `s1_ingresos.csv`: Datos financieros.
    - `s1_resumen.csv`: Datos de perfil del funcionario (Institución, Puesto).
    - `s1_bienes_inmuebles.csv`, etc.

## 2. Transformación y Calidad de Datos (DBT + DuckDB)

Utilizamos **DBT (Data Build Tool)** con **DuckDB** para procesar los millones de registros de manera eficiente, asegurando trazabilidad y calidad.

### Modelos DBT (`dbt_project/models/`)

#### Staging (`staging/`)
Lectura directa de los CSVs generados por Python.
- `stg_s1_ingresos`: Carga los datos financieros con trazabilidad de archivo origen (`filename`).
- `stg_s1_declaraciones`: Carga los perfiles, manejando errores de formato en CSVs corruptos (`ignore_errors=True`).

#### Intermediate (`intermediate/`)
Lógica de negocio y normalización.
- `int_s1_ingresos_clasificados`: Aplica reglas de calidad para detectar anomalías:
    - Valores negativos en ingresos.
    - Outliers extremos (Ingresos Anuales > $500M MXN).
- `int_s1_declaraciones_normalizadas`: Limpieza de texto en nombres de Instituciones y Estados (Mayúsculas, eliminación de acentos y espacios extra).

#### Marts (`marts/`)
Tablas finales listas para consumo.
- **`s1_ingresos_limpios`**: Tabla financiera depurada (solo registros válidos).
- **`audit_s1_ingresos_rechazados`**: Bitácora de auditoría con los registros descartados y su motivo.
- **`s1_declaraciones_perfil`**: Catálogo único de funcionarios e instituciones normalizadas.
- **`s1_dataset_maestro`**: **Tabla Principal**. Une Ingresos Limpios + Perfiles Normalizados.

## 3. Instrucciones de Ejecución

### Prerrequisitos
- Python 3.10+
- Entorno virtual activado con `dbt-duckdb` instalado.

### Paso a Paso

1. **Extracción (Si se tienen nuevos zips):**
   ```bash
   python system_1/src/extraction/unzip_files.py
   python system_1/src/extraction/procesar_masivo_s1.py
   ```

2. **Ejecutar Pipeline DBT:**
   Navegar al directorio del proyecto DBT:
   ```bash
   cd system_1/dbt_project
   dbt run
   ```
   
   Esto generará el archivo `csv_outputs/dataton_s1.duckdb` con todas las tablas.

3. **Consultar Resultados:**
   Puedes usar cualquier cliente compatible con DuckDB o scripts de Python.
   
   Ejemplo de análisis de top instituciones:
   ```bash
   python system_1/src/analysis/top_instituciones.py
   ```

## Reglas de Calidad Aplicadas

1. **Ingresos**:
   - Se rechazan valores negativos.
   - Se rechazan ingresos anuales netos superiores a **$500,000,000 MXN** (considerados errores de captura).
   
2. **Texto**:
   - Se normalizan nombres de instituciones a mayúsculas y sin acentos para mejorar la agrupación.
