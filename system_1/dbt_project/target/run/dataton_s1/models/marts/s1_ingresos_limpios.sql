
  
    
    

    create  table
      "dataton_s1"."main"."s1_ingresos_limpios__dbt_tmp"
  
    as (
      

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
    * exclude (filename, calidad_status)
from __dbt__cte__int_s1_ingresos_clasificados
where calidad_status = 'OK'
    );
  
  