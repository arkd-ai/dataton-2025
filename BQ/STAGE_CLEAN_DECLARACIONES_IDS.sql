create table nice-opus-462200-h0.ydata.C_IDS as
with counts as (
  select DECLARACION_ID,
  count(distinct INSTITUCION) instituciones,
  count(distinct ENTIDAD) entidades,
  count(distinct MUNICIPIO) municipios,
  from nice-opus-462200-h0.ydata.S1_EMPLEO_CARGO_COMISION ecc
  group by 1
)
select DECLARACION_ID
from counts
where instituciones = 1
and entidades = 1
and municipios = 1;
---------------------------------------------------------------------------------------
create table nice-opus-462200-h0.ydata.C_S1_BIEN_INMUEBLE as
select *
from nice-opus-462200-h0.ydata.S1_BIEN_INMUEBLE
where DECLARACION_ID in (
  select DECLARACION_ID
  from nice-opus-462200-h0.ydata.C_IDS
);
---------------------------------------------------------------------------------------
create table nice-opus-462200-h0.ydata.C_S1_EMPLEO_CARGO_COMISION as
select *
from nice-opus-462200-h0.ydata.S1_EMPLEO_CARGO_COMISION
where DECLARACION_ID in (
  select DECLARACION_ID
  from nice-opus-462200-h0.ydata.C_IDS
);
---------------------------------------------------------------------------------------
create table nice-opus-462200-h0.ydata.C_S1_BIEN_MUEBLE as
select *
from nice-opus-462200-h0.ydata.S1_BIEN_MUEBLE
where DECLARACION_ID in (
  select DECLARACION_ID
  from nice-opus-462200-h0.ydata.C_IDS
);
---------------------------------------------------------------------------------------
create table nice-opus-462200-h0.ydata.C_S1_DECLARACION as
select *
from nice-opus-462200-h0.ydata.S1_DECLARACION
where DECLARACION_ID in (
  select DECLARACION_ID
  from nice-opus-462200-h0.ydata.C_IDS
);
---------------------------------------------------------------------------------------
create table nice-opus-462200-h0.ydata.C_S1_INGRESOS as
select *
from nice-opus-462200-h0.ydata.S1_INGRESOS
where DECLARACION_ID in (
  select DECLARACION_ID
  from nice-opus-462200-h0.ydata.C_IDS
);
---------------------------------------------------------------------------------------
create table nice-opus-462200-h0.ydata.C_S1_SERVIDOR_PUBLICO as
select *
from nice-opus-462200-h0.ydata.S1_SERVIDOR_PUBLICO 
where DECLARACION_ID in (
  select DECLARACION_ID
  from nice-opus-462200-h0.ydata.C_IDS
);
---------------------------------------------------------------------------------------
create table nice-opus-462200-h0.ydata.C_S1_VEHICULO as
select *
from nice-opus-462200-h0.ydata.S1_VEHICULO
where DECLARACION_ID in (
  select DECLARACION_ID
  from nice-opus-462200-h0.ydata.C_IDS
);
