
  
  create view "dataton"."main"."stg_items__dbt_tmp" as (
    with source as (
    select * from '/home/arkade/Documents/github/dataton-2025/system_6/csv_outputs/*/items.csv'
),

renamed as (
    select
        state,
        ocid,
        item_id,
        description as item_description,
        try_cast(quantity as DOUBLE) as quantity,
        classification_id,
        classification_desc,
        unit_name,
        try_cast(unit_value_amount as DOUBLE) as unit_price,
        unit_value_currency as currency

    from source
)

select * from renamed
  );
