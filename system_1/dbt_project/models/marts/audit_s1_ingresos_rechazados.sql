{{ config(materialized='table') }}

select 
    id,
    filename as archivo_origen,
    ingreso_mensual_neto,
    ingreso_anual_neto,
    remuneracion_mensual_cargo,
    otros_ingresos_mensuales,
    calidad_status as motivo_rechazo
from {{ ref('int_s1_ingresos_clasificados') }}
where calidad_status != 'OK'
