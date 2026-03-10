begin;

lock table public.vivienda_images in share row exclusive mode;

alter table public.vivienda_images
add column if not exists sort_order integer;

create or replace function public.normalize_vivienda_images_sort_order(
  p_vivienda_id integer default null
)
returns void
language plpgsql
as $$
begin
  with normalized as (
    select
      id,
      row_number() over (
        partition by vivienda_id
        order by
          case when sort_order is null then 1 else 0 end,
          sort_order asc nulls last,
          inserted_at asc nulls last,
          id asc
      ) - 1 as new_sort_order
    from public.vivienda_images
    where p_vivienda_id is null or vivienda_id = p_vivienda_id
  )
  update public.vivienda_images vi
  set sort_order = normalized.new_sort_order
  from normalized
  where vi.id = normalized.id
    and vi.sort_order is distinct from normalized.new_sort_order;
end;
$$;

create or replace function public.vivienda_images_ensure_sort_order()
returns trigger
language plpgsql
as $$
declare
  next_sort_order integer;
begin
  if new.vivienda_id is null then
    raise exception using
      errcode = '23502',
      message = 'vivienda_id no puede ser null en vivienda_images';
  end if;

  if new.sort_order is null then
    select coalesce(max(sort_order), -1) + 1
      into next_sort_order
    from public.vivienda_images
    where vivienda_id = new.vivienda_id
      and (tg_op = 'INSERT' or id <> new.id);

    new.sort_order := next_sort_order;
  end if;

  if new.sort_order < 0 then
    raise exception using
      errcode = '23514',
      message = format(
        'sort_order invalido (%s) para la imagen %s de la vivienda %s',
        new.sort_order,
        coalesce(new.id::text, 'nueva'),
        new.vivienda_id
      ),
      hint = 'Usa enteros mayores o iguales a 0.';
  end if;

  return new;
end;
$$;

drop trigger if exists vivienda_images_ensure_sort_order_tg
  on public.vivienda_images;

create trigger vivienda_images_ensure_sort_order_tg
before insert or update of vivienda_id, sort_order
on public.vivienda_images
for each row
execute function public.vivienda_images_ensure_sort_order();

select public.normalize_vivienda_images_sort_order();

alter table public.vivienda_images
alter column sort_order set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'vivienda_images_sort_order_check'
  ) then
    alter table public.vivienda_images
    add constraint vivienda_images_sort_order_check
    check (sort_order >= 0);
  end if;
end $$;

create unique index if not exists vivienda_images_vivienda_id_sort_order_uidx
  on public.vivienda_images (vivienda_id, sort_order);

create index if not exists vivienda_images_vivienda_id_sort_order_idx
  on public.vivienda_images (vivienda_id, sort_order, id);

create or replace function public.vivienda_images_sort_diagnostics(
  p_vivienda_id integer default null
)
returns table (
  vivienda_id integer,
  total_images bigint,
  null_sort_orders bigint,
  negative_sort_orders bigint,
  duplicated_sort_orders bigint,
  missing_positions bigint,
  status text
)
language sql
as $$
with base as (
  select
    id,
    vivienda_id,
    sort_order
  from public.vivienda_images
  where p_vivienda_id is null or vivienda_id = p_vivienda_id
),
stats as (
  select
    vivienda_id,
    count(*) as total_images,
    count(*) filter (where sort_order is null) as null_sort_orders,
    count(*) filter (where sort_order < 0) as negative_sort_orders,
    coalesce(max(sort_order), -1) + 1
      - count(distinct sort_order) filter (where sort_order is not null)
      as missing_positions
  from base
  group by vivienda_id
),
duplicates as (
  select
    vivienda_id,
    coalesce(sum(repeated_count - 1), 0) as duplicated_sort_orders
  from (
    select
      vivienda_id,
      sort_order,
      count(*) as repeated_count
    from base
    where sort_order is not null
    group by vivienda_id, sort_order
    having count(*) > 1
  ) dup
  group by vivienda_id
)
select
  stats.vivienda_id,
  stats.total_images,
  stats.null_sort_orders,
  stats.negative_sort_orders,
  coalesce(duplicates.duplicated_sort_orders, 0) as duplicated_sort_orders,
  greatest(stats.missing_positions, 0) as missing_positions,
  case
    when stats.null_sort_orders = 0
      and stats.negative_sort_orders = 0
      and coalesce(duplicates.duplicated_sort_orders, 0) = 0
      and greatest(stats.missing_positions, 0) = 0
    then 'ok'
    else 'repair_required'
  end as status
from stats
left join duplicates
  on duplicates.vivienda_id = stats.vivienda_id
order by stats.vivienda_id;
$$;

do $$
declare
  v_problem_count integer;
begin
  select count(*)
    into v_problem_count
  from public.vivienda_images_sort_diagnostics()
  where status <> 'ok';

  if v_problem_count > 0 then
    raise exception using
      message = 'La migracion termino con inconsistencias en vivienda_images.sort_order',
      detail = 'Ejecuta: select * from public.vivienda_images_sort_diagnostics() where status <> ''ok'';',
      hint = 'Tambien puedes reparar una vivienda concreta con select public.normalize_vivienda_images_sort_order(<vivienda_id>);';
  end if;
end;
$$;

comment on column public.vivienda_images.sort_order
is 'Orden manual de las imagenes por vivienda. sort_order 0 es la portada.';

commit;
