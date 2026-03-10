create table public.store_owners (
  id serial not null,
  full_name character varying(255) not null,
  email text not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint store_owners_pkey primary key (id),
  constraint store_owners_email_key unique (email)
) TABLESPACE pg_default;