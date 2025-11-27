{{ config(materialized='table') }}

select 
    id,
    institucion_clean as institucion,
    state_clean as estado,
    tipo_declaracion,
    archivo_origen
from {{ ref('int_s1_declaraciones_normalizadas') }}
where institucion_clean IS NOT NULL
