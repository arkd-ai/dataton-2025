with source as (
    select * from {{ source('raw_data', 'awards') }}
),

renamed as (
    select
        state,
        ocid,
        award_id,
        title as award_title,
        status as award_status,
        try_cast(date as TIMESTAMP) as award_date,
        try_cast(value_amount as DOUBLE) as award_amount,
        value_currency as currency,
        suppliers

    from source
)

select * from renamed
