drop table if exists nice-opus-462200-h0.ydata.AN_1_TOTAL_VALOR_ADQUISICION;

create table if not exists nice-opus-462200-h0.ydata.AN_1_TOTAL_VALOR_ADQUISICION as
with bien_inmueble as (
  select 
  DECLARACION_ID, 
  ifnull(safe_cast(VALOR_ADQUISICION as Numeric), 0) VALOR_ADQUISICION
  from nice-opus-462200-h0.ydata.S1_BIEN_INMUEBLE
  where safe_cast(VALOR_ADQUISICION as Numeric) > 0
),bien_mueble as (
  select 
  DECLARACION_ID, 
  ifnull(safe_cast(VALOR_ADQUISICION as Numeric), 0) VALOR_ADQUISICION
  from nice-opus-462200-h0.ydata.S1_BIEN_MUEBLE
  where safe_cast(VALOR_ADQUISICION as Numeric) > 0
),vehiculo as (
  select 
  DECLARACION_ID, 
  ifnull(safe_cast(VALOR_ADQUISICION as Numeric), 0) VALOR_ADQUISICION
  from nice-opus-462200-h0.ydata.S1_VEHICULO
  where safe_cast(VALOR_ADQUISICION as Numeric) > 0
), valor_adquisisciones as (
  select distinct
  d.DECLARACION_ID,
  d.INSTITUCION,
  ecc.ENTIDAD,
  ecc.MUNICIPIO,
  (
    ifnull(bi.VALOR_ADQUISICION, 0) + 
    ifnull(bm.VALOR_ADQUISICION, 0) + 
    ifnull(v.VALOR_ADQUISICION, 0)
  ) suma_valor_adquisicion,
  ifnull(bi.VALOR_ADQUISICION, 0) bien_inmueble_valor,
  ifnull(bm.VALOR_ADQUISICION, 0) bien_mueble_valor,
  ifnull(v.VALOR_ADQUISICION, 0) vehiculo_valor
  from nice-opus-462200-h0.ydata.S1_DECLARACION d
  left join bien_inmueble bi
  on d.DECLARACION_ID = bi.DECLARACION_ID
  left join bien_mueble bm
  on d.DECLARACION_ID = bm.DECLARACION_ID
  left join vehiculo v
  on d.DECLARACION_ID = v.DECLARACION_ID
  join nice-opus-462200-h0.ydata.S1_EMPLEO_CARGO_COMISION ecc
  on d.DECLARACION_ID = ecc.DECLARACION_ID
), add_percents as (
  select   
    INSTITUCION,
    MUNICIPIO,
    ENTIDAD,
    sum(suma_valor_adquisicion) suma_valor_adquisicion,
    sum(bien_inmueble_valor) bien_inmueble_valor,
    sum(bien_mueble_valor) bien_mueble_valor,
    sum(vehiculo_valor) vehiculo_valor,
    count(distinct DECLARACION_ID) total_declaraciones
  from valor_adquisisciones
  group by 1,2,3
)
select
  INSTITUCION,
  MUNICIPIO,
  ENTIDAD,
  suma_valor_adquisicion,
  bien_inmueble_valor,
  bien_mueble_valor,
  vehiculo_valor,
  total_declaraciones, 
  bien_inmueble_valor/if(suma_valor_adquisicion = 0, 1, suma_valor_adquisicion) percent_inmueble_valor,
  bien_mueble_valor/if(suma_valor_adquisicion = 0, 1, suma_valor_adquisicion) percent_mueble_valor,
  vehiculo_valor/if(suma_valor_adquisicion = 0, 1, suma_valor_adquisicion) percent_vehiculo_valor
from add_percents ad;
----------------------------------------------------------------------------------------------------------------
create table if not exists nice-opus-462200-h0.ydata.AN_2_TOTAL_VALOR_ADQUISICION 
AS
SELECT 
  INSTITUCION,
  UPPER(
    REGEXP_REPLACE(
      NORMALIZE(ENTIDAD, NFD),
      r'\pM',
      ''
    )
  ) AS ENTIDAD_NORMALIZADA,
  MUNICIPIO,
  suma_valor_adquisicion,
  bien_inmueble_valor,
  bien_mueble_valor,
  vehiculo_valor,
  total_declaraciones, 
  percent_inmueble_valor,
  percent_mueble_valor,
  percent_vehiculo_valor
FROM `nice-opus-462200-h0.ydata.AN_1_TOTAL_VALOR_ADQUISICION`;