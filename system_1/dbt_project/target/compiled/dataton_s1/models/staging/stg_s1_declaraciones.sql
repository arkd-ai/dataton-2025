

select * 
from read_csv_auto('/home/arkade/Documents/github/dataton-2025/system_1/csv_outputs/*/s1_resumen.csv', union_by_name=True, filename=True, ignore_errors=True)