with source as (
    select * from {{ source('raw_data', 'items') }}
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
