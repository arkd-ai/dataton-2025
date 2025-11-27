

select 
    -- Identificadores
    i.id,
    p.archivo_origen,

    -- Dimensiones Demográficas (Normalizadas)
    COALESCE(p.institucion, 'DESCONOCIDO') as institucion,
    COALESCE(p.estado, i.state) as estado, -- Usar normalizado, fallback al original
    p.tipo_declaracion,

    -- Métricas Financieras (Limpias)
    i.remuneracion_mensual_cargo,
    i.otros_ingresos_mensuales,
    i.ingreso_mensual_neto,
    i.ingreso_anual_neto

from "dataton_s1"."main"."s1_ingresos_limpios" i
left join "dataton_s1"."main"."s1_declaraciones_perfil" p
    on i.id = p.id