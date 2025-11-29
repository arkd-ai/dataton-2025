with source as (
    select * from '/home/arkade/Documents/github/dataton-2025/system_6/csv_outputs/*/awards.csv'
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