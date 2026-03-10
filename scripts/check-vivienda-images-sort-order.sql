-- Validacion rapida de la migracion de sort_order en public.vivienda_images
-- Resultado esperado:
-- - Todos los "ok" deben salir en true
-- - problem_rows debe salir en 0
-- - En diagnostics todas las filas deben tener status = 'ok'

select
  'sort_order_column_exists' as test_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vivienda_images'
      and column_name = 'sort_order'
  ) as ok;

select
  'sort_order_is_not_null' as test_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vivienda_images'
      and column_name = 'sort_order'
      and is_nullable = 'NO'
      and data_type = 'integer'
  ) as ok;

select
  'check_constraint_exists' as test_name,
  exists (
    select 1
    from pg_constraint
    where conname = 'vivienda_images_sort_order_check'
  ) as ok;

select
  'trigger_exists' as test_name,
  exists (
    select 1
    from pg_trigger
    where tgname = 'vivienda_images_ensure_sort_order_tg'
  ) as ok;

select
  'unique_index_exists' as test_name,
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'vivienda_images_vivienda_id_sort_order_uidx'
  ) as ok;

select
  'read_index_exists' as test_name,
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'vivienda_images_vivienda_id_sort_order_idx'
  ) as ok;

select
  'diagnostics_function_exists' as test_name,
  exists (
    select 1
    from pg_proc
    where proname = 'vivienda_images_sort_diagnostics'
  ) as ok;

select
  count(*) as problem_rows
from public.vivienda_images_sort_diagnostics()
where status <> 'ok';

select *
from public.vivienda_images_sort_diagnostics()
order by vivienda_id;

select
  vivienda_id,
  id,
  sort_order,
  inserted_at
from public.vivienda_images
order by vivienda_id, sort_order, id
limit 50;
