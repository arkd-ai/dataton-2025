drop table if exists nice-opus-462200-h0.ydata.AN_1_TOTAL_VALOR_ADQUISICION;

create table if not exists nice-opus-462200-h0.ydata.AN_1_TOTAL_VALOR_ADQUISICION as
with bien_inmueble as (
    select distinct
    bi.DECLARACION_ID,
    first_value(ifnull(safe_cast(bi.VALOR_ADQUISICION as Numeric), 0))
        over(
        partition by bi.DECLARACION_ID order by d.FECHA_ACTUALIZACION desc, d.TIPO_DECLARACION, bi.VALOR_ADQUISICION desc) VALOR_ADQUISICION
    from nice-opus-462200-h0.ydata.C_S1_BIEN_INMUEBLE bi
    join nice-opus-462200-h0.ydata.C_S1_DECLARACION d
    on bi.DECLARACION_ID = d.DECLARACION_ID
    where safe_cast(bi.VALOR_ADQUISICION as Numeric) > 0
),bien_mueble as (
  select distinct
  bi.DECLARACION_ID,
  first_value(ifnull(safe_cast(bi.VALOR_ADQUISICION as Numeric), 0))
    over(partition by bi.DECLARACION_ID order by d.FECHA_ACTUALIZACION desc, d.TIPO_DECLARACION, bi.VALOR_ADQUISICION desc) VALOR_ADQUISICION
  from nice-opus-462200-h0.ydata.C_S1_BIEN_MUEBLE bi
  join nice-opus-462200-h0.ydata.C_S1_DECLARACION d
  on bi.DECLARACION_ID = d.DECLARACION_ID
  where safe_cast(bi.VALOR_ADQUISICION as Numeric) > 0
),vehiculo as (
  select distinct
  bi.DECLARACION_ID,
  first_value(ifnull(safe_cast(bi.VALOR_ADQUISICION as Numeric), 0))
    over(partition by bi.DECLARACION_ID order by d.FECHA_ACTUALIZACION desc, d.TIPO_DECLARACION, bi.VALOR_ADQUISICION desc) VALOR_ADQUISICION
  from nice-opus-462200-h0.ydata.C_S1_VEHICULO bi
  join nice-opus-462200-h0.ydata.C_S1_DECLARACION d
  on bi.DECLARACION_ID = d.DECLARACION_ID
  where safe_cast(bi.VALOR_ADQUISICION as Numeric) > 0
), valor_adquisisciones as (
  select distinct
  d.DECLARACION_ID,
  d.INSTITUCION,
  ecc.ENTIDAD,
  ecc.MUNICIPIO,
  extract(YEAR FROM d.FECHA_ACTUALIZACION) DECLARACION_ANIO,
  (
    ifnull(bi.VALOR_ADQUISICION, 0) + 
    ifnull(bm.VALOR_ADQUISICION, 0) + 
    ifnull(v.VALOR_ADQUISICION, 0)
  ) SUMA_VALOR_ADQUISICION,
  ifnull(bi.VALOR_ADQUISICION, 0) BIEN_INMUEBLE_VALOR,
  ifnull(bm.VALOR_ADQUISICION, 0) BIEN_MUEBLE_VALOR,
  ifnull(v.VALOR_ADQUISICION, 0) VEHICULO_VALOR
  from nice-opus-462200-h0.ydata.C_S1_DECLARACION d
  left join bien_inmueble bi
  on d.DECLARACION_ID = bi.DECLARACION_ID
  left join bien_mueble bm
  on d.DECLARACION_ID = bm.DECLARACION_ID
  left join vehiculo v
  on d.DECLARACION_ID = v.DECLARACION_ID
  join nice-opus-462200-h0.ydata.C_S1_EMPLEO_CARGO_COMISION ecc
  on d.DECLARACION_ID = ecc.DECLARACION_ID
), add_percents as (
  select   
    INSTITUCION,
    MUNICIPIO,
    ENTIDAD,
    DECLARACION_ANIO,
    sum(SUMA_VALOR_ADQUISICION) SUMA_VALOR_ADQUISICION,
    sum(BIEN_INMUEBLE_VALOR) BIEN_INMUEBLE_VALOR,
    sum(BIEN_MUEBLE_VALOR) BIEN_MUEBLE_VALOR,
    sum(VEHICULO_VALOR) VEHICULO_VALOR,
    count(distinct DECLARACION_ID) TOTAL_DECLARACIONES
  from valor_adquisisciones
  group by 1,2,3,4
)
select
  INSTITUCION,
  MUNICIPIO,
  ENTIDAD,
  DECLARACION_ANIO,
  SUMA_VALOR_ADQUISICION,
  BIEN_INMUEBLE_VALOR,
  BIEN_MUEBLE_VALOR,
  VEHICULO_VALOR,
  TOTAL_DECLARACIONES, 
  BIEN_INMUEBLE_VALOR/if(SUMA_VALOR_ADQUISICION = 0, 1, SUMA_VALOR_ADQUISICION) PERCENT_INMUEBLE_VALOR,
  BIEN_MUEBLE_VALOR/if(SUMA_VALOR_ADQUISICION = 0, 1, SUMA_VALOR_ADQUISICION) PERCENT_MUEBLE_VALOR,
  VEHICULO_VALOR/if(SUMA_VALOR_ADQUISICION = 0, 1, SUMA_VALOR_ADQUISICION) PERCENT_VEHICULO_VALOR
from add_percents ad;