create table public.customer (
  id serial not null,
  store_id integer null,
  fullname text not null,
  phone_number character varying(20) null,
  birthday date null,
  address text null,
  email text null,
  created_by_email text null,
  constraint customer_pkey primary key (id),
  constraint customer_store_id_fkey foreign KEY (store_id) references stores (id) on delete CASCADE
) TABLESPACE pg_default;