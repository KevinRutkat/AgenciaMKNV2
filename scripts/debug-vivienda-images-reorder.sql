-- Diagnostico para reordenado de imagenes desde /propiedades/edit/[id]
-- Cambia el valor del CTE params.target_vivienda_id antes de ejecutar.

with params as (
  select 82::integer as target_vivienda_id
)
select target_vivienda_id
from params;

select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('vivienda_images', 'viviendas')
order by tablename, policyname;

with params as (
  select 82::integer as target_vivienda_id
)
select
  id,
  vivienda_id,
  sort_order,
  inserted_at,
  url
from public.vivienda_images
where vivienda_id = (select target_vivienda_id from params)
order by sort_order, id;

with params as (
  select 82::integer as target_vivienda_id
)
select *
from public.vivienda_images_sort_diagnostics(
  (select target_vivienda_id from params),
);

with params as (
  select 82::integer as target_vivienda_id
)
select
  vivienda_id,
  count(*) as total_images,
  min(sort_order) as min_sort_order,
  max(sort_order) as max_sort_order,
  count(distinct sort_order) as distinct_sort_orders
from public.vivienda_images
where vivienda_id = (select target_vivienda_id from params)
group by vivienda_id;
