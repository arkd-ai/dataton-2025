# Resumen de hallazgos en los datos

## Completitud de datos básicos

- No encontramos ninguna institución ni cargo en valores NULL; todas las filas traen esos campos completos.

- Solo 46 declaraciones no registran el año, lo cual representa un porcentaje mínimo del total.

## Identificación de posibles servidores públicos únicos
Para intentar identificar individuos únicos, construimos una llave compuesta utilizando los siguientes campos:
CURP, NOMBRE, PRIMER_APELLIDO, SEGUNDO_APELLIDO, RFC_COMPLETO, CORREO_INSTITUCIONAL, CORREO_PERSONAL, INSTITUCION, EMPLEO_CARGO_COMISION.
Esta combinación permite agrupar registros que aparentemente corresponden a la misma persona.

Instituciones donde es posible o no identificar individuos (por año)
Se hizo una clasificación por año para ver en qué casos la llave permite reconocer individuos únicos.
Resultados:


| Anio | Sin individuos | Con Individuos |
|--|--|--
| 2014 |  |1
| 2020 |  |10
| 2021 | 21 | 4207
| 2022 | 317 | 5996
| 2023 | 1232 | 3779
| 2024 | 330 | 3426

## Regla aplicada para detectar declaraciones duplicadas por actualizacion

Se definió una regla con window functions basada en:

PARTITION BY bi.DECLARACION_ID
ORDER BY d.FECHA_ACTUALIZACION DESC,
         d.TIPO_DECLARACION,
         bi.REMUNERACION_ANUAL_CARGO_PUBLICO DESC


Con esto se selecciona, por cada DECLARACION_ID, la versión más reciente y completa.

## Conteo de declaraciones con un mismo ID con diferentes Estado, Municipio e Institucion

Declaraciones no repetidas: 4,966,213
Declaraciones repetidas: 242,283

## Registros descartados

Aquellas declaraciones que presentaban un mismo ID con diferentes Estado, Municipio e Institucion fueron ignoradas para evitar mezclar registros inconsistentes.