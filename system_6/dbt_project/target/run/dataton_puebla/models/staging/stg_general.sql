
  
  create view "dataton"."main"."stg_general__dbt_tmp" as (
    with source as (
    select * from '/home/arkade/Documents/github/dataton-2025/system_6/csv_outputs/*/general.csv'
),

renamed as (
    select
        -- Metadatos
        state,
        ocid,
        id as release_id,
        
        -- Fechas
        try_cast(date as TIMESTAMP) as release_date,
        try_cast(tender_start_date as TIMESTAMP) as tender_start_date,
        try_cast(tender_end_date as TIMESTAMP) as tender_end_date,
        
        -- Detalles
        title as tender_title,
        description as tender_description,
        status as tender_status,
        procurementMethod as procurement_method,
        procurementMethodDetails as procurement_method_details,
        mainProcurementCategory as procurement_category,
        
        -- Montos
        try_cast(value_amount as DOUBLE) as tender_amount,
        value_currency as currency,
        
        -- Comprador
        buyer_name,
        buyer_id

    from source
)

select * from renamed
  );
