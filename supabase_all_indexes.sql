-- Consolidated Indexes for Dataton 2025 Dashboard Optimization

-- 1. Base Index for Main Filtering (Valid Name/CURP)
-- Optimized for listing declarations by Entidad/Institucion where the person is identified.
CREATE INDEX IF NOT EXISTS idx_declaracion_identified
ON declaracion_individual ("ENTIDAD_CD", "INSTITUCION", "TOTAL_INGRESOS_MENSUALES_NETOS" DESC)
WHERE "CURP" IS NOT NULL AND "NOMBRE" IS NOT NULL;

-- 2. Numeric Indexes (Values > 0)
-- These partial indexes optimize queries that filter for specific non-zero financial data.

-- A. Total Net Monthly Income > 0
CREATE INDEX IF NOT EXISTS idx_declaracion_valid_income
ON declaracion_individual ("ENTIDAD_CD", "INSTITUCION", "TOTAL_INGRESOS_MENSUALES_NETOS" DESC)
WHERE "TOTAL_INGRESOS_MENSUALES_NETOS" > 0;

-- B. Public Cargo Remuneration > 0
CREATE INDEX IF NOT EXISTS idx_remuneracion_nonzero
ON declaracion_individual ("ENTIDAD_CD", "INSTITUCION", "REMUNERACION_ANUAL_CARGO_PUBLICO")
WHERE "REMUNERACION_ANUAL_CARGO_PUBLICO" > 0;

-- C. Vehicle Value > 0
CREATE INDEX IF NOT EXISTS idx_vehiculo_nonzero
ON declaracion_individual ("ENTIDAD_CD", "INSTITUCION", "VEHICULO_VALOR")
WHERE "VEHICULO_VALOR" > 0;

-- D. Furniture Value > 0
CREATE INDEX IF NOT EXISTS idx_mueble_nonzero
ON declaracion_individual ("ENTIDAD_CD", "INSTITUCION", "BIEN_MUEBLE_VALOR")
WHERE "BIEN_MUEBLE_VALOR" > 0;

-- E. Real Estate Value > 0
CREATE INDEX IF NOT EXISTS idx_inmueble_nonzero
ON declaracion_individual ("ENTIDAD_CD", "INSTITUCION", "BIEN_INMUEBLE_VALOR")
WHERE "BIEN_INMUEBLE_VALOR" > 0;

-- F. Acquisition Sum > 0
CREATE INDEX IF NOT EXISTS idx_adquisicion_nonzero
ON declaracion_individual ("ENTIDAD_CD", "INSTITUCION", "SUMA_VALOR_ADQUISICION")
WHERE "SUMA_VALOR_ADQUISICION" > 0;

-- 3. Sorting Indexes
-- Optimized for sorting by Remuneration within an Institution
CREATE INDEX IF NOT EXISTS idx_declaracion_remuneracion_sort
ON declaracion_individual ("ENTIDAD_CD", "INSTITUCION", "REMUNERACION_ANUAL_CARGO_PUBLICO" DESC);

-- Optimized for sorting by Total Monthly Net Income within an Institution
CREATE INDEX IF NOT EXISTS idx_declaracion_ingresos_sort
ON declaracion_individual ("ENTIDAD_CD", "INSTITUCION", "TOTAL_INGRESOS_MENSUALES_NETOS" DESC);

-- Optimized for sorting by Declarant Annual Net Income within an Institution
CREATE INDEX IF NOT EXISTS idx_declaracion_ingreso_anual_sort
ON declaracion_individual ("ENTIDAD_CD", "INSTITUCION", "INGRESO_ANUAL_NETO_DECLARANTE" DESC);

-- 4. PERFECT MATCH INDEX for the Dashboard Query
-- This index perfectly matches the current query in views.py:
-- .eq('ENTIDAD_CD', ...) .eq('INSTITUCION', ...)
-- .gt('REMUNERACION...', 0) .gt('TOTAL_INGRESOS...', 0) .gt('INGRESO...', 0)
-- .order('REMUNERACION...', desc=True)
CREATE INDEX IF NOT EXISTS idx_declaracion_dashboard_optimized
ON declaracion_individual ("ENTIDAD_CD", "INSTITUCION", "REMUNERACION_ANUAL_CARGO_PUBLICO" DESC)
WHERE "REMUNERACION_ANUAL_CARGO_PUBLICO" > 0 
  AND "TOTAL_INGRESOS_MENSUALES_NETOS" > 0 
  AND "INGRESO_ANUAL_NETO_DECLARANTE" > 0;
