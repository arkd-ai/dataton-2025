
  
  create view "dataton_s1"."main"."stg_s1_experiencia_laboral__dbt_tmp" as (
    

select * 
from read_csv_auto('/home/arkade/Documents/github/dataton-2025/system_1/csv_outputs/*/s1_experiencia_laboral.csv', union_by_name=True, filename=True, ignore_errors=True)
  );
