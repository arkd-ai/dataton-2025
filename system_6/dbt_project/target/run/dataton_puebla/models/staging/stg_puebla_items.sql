
  
  create view "dataton"."main"."stg_puebla_items__dbt_tmp" as (
    with source as (
    select * from '/home/arkade/Documents/github/dataton-2025/PDN_S6/csv_outputs/puebla_items.csv'
),

renamed as (
    select
        ocid,
        item_id,
        description as item_description,
        
        -- Numéricos
        try_cast(quantity as DOUBLE) as quantity,
        
        -- Clasificación
        classification_id,
        classification_desc,
        
        -- Unidad y Precio
        unit_name,
        try_cast(unit_value_amount as DOUBLE) as unit_price,
        unit_value_currency as currency

    from source
)

select * from renamed
  );
