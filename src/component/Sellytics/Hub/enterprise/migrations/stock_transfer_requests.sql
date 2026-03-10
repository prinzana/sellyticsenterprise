create table public.stock_transfer_requests (
  id serial not null,
  source_store_id integer not null,
  destination_store_id integer not null,
  dynamic_product_id integer not null,
  quantity integer not null,
  status character varying(20) not null default 'PENDING'::character varying,
  requested_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  store_owner_id integer not null,
  constraint stock_transfer_requests_pkey primary key (id),
  constraint stock_transfer_requests_source_store_id_fkey foreign KEY (source_store_id) references stores (id) on delete CASCADE,
  constraint stock_transfer_requests_dynamic_product_id_fkey foreign KEY (dynamic_product_id) references dynamic_product (id) on delete CASCADE,
  constraint stock_transfer_requests_store_owner_id_fkey foreign KEY (store_owner_id) references store_owners (id) on delete CASCADE,
  constraint stock_transfer_requests_destination_store_id_fkey foreign KEY (destination_store_id) references stores (id) on delete CASCADE,
  constraint stock_transfer_requests_quantity_check check ((quantity > 0)),
  constraint check_different_stores check ((source_store_id <> destination_store_id)),
  constraint stock_transfer_requests_status_check check (
    (
      (status)::text = any (
        (
          array[
            'PENDING'::character varying,
            'APPROVED'::character varying,
            'REJECTED'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_stock_transfer_requests_status on public.stock_transfer_requests using btree (status) TABLESPACE pg_default;

create index IF not exists idx_stock_transfer_requests_store_owner_id on public.stock_transfer_requests using btree (store_owner_id) TABLESPACE pg_default;

create trigger audit_stock_transfer_requests
after INSERT
or DELETE
or
update on stock_transfer_requests for EACH row
execute FUNCTION log_audit ();