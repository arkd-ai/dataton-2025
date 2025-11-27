{{ config(materialized='ephemeral') }}

with source as (
    select * from {{ ref('stg_s1_ingresos') }}
),

clasificado as (
    select 
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
    from source
)

select * from clasificado
