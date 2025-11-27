{{ config(materialized='table') }}

select 
    * exclude (filename, calidad_status)
from {{ ref('int_s1_ingresos_clasificados') }}
where calidad_status = 'OK'
