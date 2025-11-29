with source as (
    select * from '/home/arkade/Documents/github/dataton-2025/system_6/csv_outputs/*/contracts.csv'
),

renamed as (
    select
        state,
        ocid,
        contract_id,
        awardID as award_id,
        title as contract_title,
        status as contract_status,
        try_cast(value_amount as DOUBLE) as contract_amount,
        value_currency as currency,
        try_cast(dateSigned as TIMESTAMP) as date_signed,
        try_cast(period_startDate as TIMESTAMP) as start_date,
        try_cast(period_endDate as TIMESTAMP) as end_date

    from source
)

select * from renamed