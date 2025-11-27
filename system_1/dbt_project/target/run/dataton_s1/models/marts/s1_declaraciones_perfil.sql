
  
    
    

    create  table
      "dataton_s1"."main"."s1_declaraciones_perfil__dbt_tmp"
  
    as (
      

with __dbt__cte__int_s1_declaraciones_normalizadas as (


with source as (
    select * from "dataton_s1"."main"."stg_s1_declaraciones"
),

normalizado as (
    select
        id,
        filename as archivo_origen,
        -- Normalización de Institución
        trim(regexp_replace(
            upper(
                replace(replace(replace(replace(replace(institucion, 
                'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U')
            ), 
            '\s+', ' ', 'g' -- Reemplazar múltiples espacios por uno solo
        )) as institucion_clean,
        
        -- Mantener valor original por si acaso
        institucion as institucion_original,
        
        -- Normalización de Estado (aunque suele venir bien, aseguramos)
        upper(trim(state)) as state_clean,
        
        -- Otros campos útiles
        fecha_actualizacion,
        tipo_declaracion
        
    from source
)

select * from normalizado
) select 
    id,
    institucion_clean as institucion,
    state_clean as estado,
    tipo_declaracion,
    archivo_origen
from __dbt__cte__int_s1_declaraciones_normalizadas
where institucion_clean IS NOT NULL
    );
  
  