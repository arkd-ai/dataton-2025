{{ config(materialized='view') }}

select * 
from read_csv_auto('/home/arkade/Documents/github/dataton-2025/system_1/csv_outputs/*/s1_bienes_inmuebles.csv', union_by_name=True)
