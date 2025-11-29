
  
  create view "dataton_s1"."main"."stg_s1_bienes_muebles__dbt_tmp" as (
    

select * 
from read_csv_auto('/home/arkade/Documents/github/dataton-2025/system_1/csv_outputs/*/s1_bienes_muebles.csv', union_by_name=True, filename=True, ignore_errors=True)
  );
