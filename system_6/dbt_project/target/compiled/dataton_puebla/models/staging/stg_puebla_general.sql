with source as (
    select * from '/home/arkade/Documents/github/dataton-2025/PDN_S6/csv_outputs/puebla_general.csv'
),

renamed as (
    select
        -- Identificadores
        ocid,
        id as release_id,
        
        -- Fechas (Casting explícito a TIMESTAMP o DATE)
        try_cast(date as TIMESTAMP) as release_date,
        try_cast(tender_start_date as TIMESTAMP) as tender_start_date,
        try_cast(tender_end_date as TIMESTAMP) as tender_end_date,
        
        -- Detalles de la licitación
        title as tender_title,
        description as tender_description,
        status as tender_status,
        
        -- Categorías y Métodos
        procurementMethod as procurement_method,
        procurementMethodDetails as procurement_method_details,
        mainProcurementCategory as procurement_category,
        
        -- Valores Monetarios (Casting a DECIMAL/DOUBLE)
        try_cast(value_amount as DOUBLE) as tender_amount,
        value_currency as currency,
        
        -- Comprador
        buyer_name,
        buyer_id

    from source
)

select * from renamed