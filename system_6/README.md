# Sistema de Procesamiento OCDS - Datatón 2025 (System 6)

Este proyecto implementa un pipeline ETL (Extract, Transform, Load) para procesar datos de contratación pública abierta (OCDS) de diversos estados de México. El sistema normaliza archivos JSON masivos, los convierte a CSV y construye una base de datos analítica utilizando DuckDB y dbt.

## Estructura del Proyecto

```
system_6/
├── PDN_S6/          # Directorio de entrada: Archivos JSON originales (Ignorado por git)
├── csv_outputs/     # Directorio de salida: CSVs procesados y DB (Ignorado por git)
├── src/             # Código fuente Python para extracción
├── dbt_project/     # Proyecto dbt para transformación y modelado
└── venv/            # Entorno virtual Python
```

## Requisitos Previos

*   Python 3.8+
*   pip

## Instalación

1.  **Crear y activar entorno virtual:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

2.  **Instalar dependencias:**
    ```bash
    pip install -r requirements.txt
    ```

## Uso

### 1. Procesamiento de Datos (JSON -> CSV)

Ejecuta el script de Python para leer los archivos JSON de la carpeta `PDN_S6` y generar archivos CSV normalizados en `csv_outputs`. Este script maneja múltiples archivos y crea una subcarpeta por cada estado.

```bash
python3 src/procesar_masivo.py
```

**Salida:** Se generarán archivos `general.csv`, `items.csv`, `parties.csv`, `awards.csv` y `contracts.csv` dentro de `csv_outputs/<estado>/`.

### 2. Transformación y Carga (CSV -> DuckDB)

Utiliza dbt para leer los CSVs generados, limpiar los tipos de datos y crear vistas unificadas en una base de datos DuckDB local.

```bash
# Navegar al directorio del proyecto dbt
dbt deps --project-dir dbt_project
dbt run --project-dir dbt_project
```

**Salida:** Una base de datos `dataton.duckdb` en `csv_outputs/` con las siguientes vistas estandarizadas:
*   `stg_general`
*   `stg_items`
*   `stg_parties`
*   `stg_awards`
*   `stg_contracts`

### 3. Exploración de Datos con Harlequin

Este proyecto incluye **Harlequin**, un IDE SQL para la terminal que permite explorar la base de datos DuckDB generada de forma rápida y visual.

Para iniciar Harlequin y conectarte a la base de datos procesada:

```bash
harlequin system_6/csv_outputs/dataton.duckdb
```

Dentro de Harlequin podrás:
*   Navegar por las tablas y vistas en el panel izquierdo.
*   Ejecutar consultas SQL ad-hoc.
*   Exportar resultados a CSV/JSON.

## Modelo de Datos

El pipeline unifica la estructura de datos de todos los estados procesados, agregando una columna `state` para mantener la trazabilidad del origen.

*   **stg_general:** Información principal de la licitación (título, montos, fechas).
*   **stg_items:** Detalle de bienes y servicios adquiridos.
*   **stg_parties:** Actores involucrados (compradores, proveedores).
*   **stg_awards:** Adjudicaciones realizadas.
*   **stg_contracts:** Contratos firmados.
