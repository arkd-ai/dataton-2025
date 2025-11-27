
  
  create view "dataton_s1"."main"."stg_s1_interes_apoyos__dbt_tmp" as (
    

select * 
from read_csv_auto('/home/arkade/Documents/github/dataton-2025/system_1/csv_outputs/*/interes_apoyos.csv', union_by_name=True)
  );
