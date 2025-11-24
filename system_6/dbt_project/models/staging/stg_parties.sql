with source as (
    select * from {{ source('raw_data', 'parties') }}
),

renamed as (
    select
        state,
        ocid,
        party_id,
        name as party_name,
        roles,
        identifier_legalName as legal_name,
        contact_name,
        contact_email,
        contact_phone,
        address_region,
        address_locality

    from source
)

select * from renamed
