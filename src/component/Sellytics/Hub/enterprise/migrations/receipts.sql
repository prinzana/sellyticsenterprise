

create table public.receipts (
  id serial not null,
  store_receipt_id integer null,
  product_id integer null,
  sales_amount numeric(10, 2) not null,
  sales_qty integer not null,
  product_name character varying(255) not null,
  device_id text null,
  customer_address text null,
  phone_number character varying(20) null,
  warranty text null,
  created_at timestamp with time zone null default now(),
  receipt_id text not null,
  customer_name text null,
  sale_group_id integer null,
  payment_method character varying null,
  signature text null,
  public_url text null,
  sale_groups text null,
  store_id bigint null,
  date timestamp with time zone null,
  constraint receipts_pkey primary key (id),
  constraint receipts_product_id_fkey foreign KEY (product_id) references dynamic_product (id) on delete CASCADE,
  constraint receipts_sale_group_id_fkey foreign KEY (sale_group_id) references sale_groups (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;