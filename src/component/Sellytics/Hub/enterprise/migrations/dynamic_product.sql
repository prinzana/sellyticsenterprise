create table public.dynamic_product (
  id serial not null,
  name text not null,
  description text null,
  purchase_price numeric(10, 2) null,
  markup_percent numeric(5, 2) null,
  selling_price numeric(10, 2) null,
  created_at timestamp with time zone null default now(),
  store_id integer null,
  purchase_qty integer not null default 1,
  suppliers_name character varying(255) null default ''::character varying,
  device_id text null,
  created_by_store_id integer null,
  owner_id integer null,
  dynamic_product_imeis text null default ''::text,
  device_size text null default ''' '''::text,
  updated_at timestamp with time zone null default now(),
  is_unique boolean null default false,
  imei_array ARRAY GENERATED ALWAYS as (
    case
      when (
        (dynamic_product_imeis is null)
        or (
          TRIM(
            both
            from
              dynamic_product_imeis
          ) = ''::text
        )
      ) then null::text[]
      else string_to_array(
        TRIM(
          both ' ;,'::text
          from
            regexp_replace(
              lower(dynamic_product_imeis),
              '\s+'::text,
              ' '::text,
              'g'::text
            )
        ),
        ';'::text
      )
    end
  ) STORED null,
  updated_by_email text null,
  created_by_email text null,
  constraint dynamic_product_pkey primary key (id),
  constraint unique_store_product_name unique (store_id, name),
  constraint dynamic_product_created_by_store_id_fkey foreign KEY (created_by_store_id) references store_users (id) on update CASCADE on delete CASCADE,
  constraint dynamic_product_store_id_fkey foreign KEY (store_id) references stores (id) on update CASCADE on delete CASCADE,
  constraint dynamic_product_markup_percent_nonnegative check ((markup_percent >= (0)::numeric)),
  constraint dynamic_product_purchase_price_nonnegative check ((purchase_price >= (0)::numeric))
) TABLESPACE pg_default;

create trigger audit_dynamic_product
after INSERT
or DELETE
or
update on dynamic_product for EACH row
execute FUNCTION log_audit ();

create trigger enforce_unique_imei BEFORE INSERT
or
update on dynamic_product for EACH row
execute FUNCTION check_unique_imei_per_store ();

create trigger trg_product_logs
after INSERT
or DELETE
or
update on dynamic_product for EACH row
execute FUNCTION fn_product_logs ();

create trigger update_dynamic_product_timestamp_trigger BEFORE
update on dynamic_product for EACH row
execute FUNCTION update_dynamic_product_timestamp ();