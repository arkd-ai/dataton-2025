

with __dbt__cte__int_s1_ingresos_clasificados as (


with source as (
    select * from "dataton_s1"."main"."stg_s1_ingresos"
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
) select 
    id,
    filename as archivo_origen,
    ingreso_mensual_neto,
    ingreso_anual_neto,
    remuneracion_mensual_cargo,
    otros_ingresos_mensuales,
    calidad_status as motivo_rechazo
from __dbt__cte__int_s1_ingresos_clasificados
where calidad_status != 'OK'