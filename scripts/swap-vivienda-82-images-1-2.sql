-- Intercambia las dos primeras imagenes segun el orden actual
-- de la vivienda con id 82.
-- Hace commit real y muestra el estado antes y despues.

begin;

select
  'before' as state,
  id,
  vivienda_id,
  sort_order,
  inserted_at,
  url
from public.vivienda_images
where vivienda_id = 82
order by sort_order, id
limit 5;

do $$
declare
  v_first_id integer;
  v_second_id integer;
  v_first_sort integer;
  v_second_sort integer;
begin
  select id, sort_order
    into v_first_id, v_first_sort
  from public.vivienda_images
  where vivienda_id = 82
  order by sort_order, id
  limit 1;

  select id, sort_order
    into v_second_id, v_second_sort
  from public.vivienda_images
  where vivienda_id = 82
  order by sort_order, id
  offset 1
  limit 1;

  if v_first_id is null or v_second_id is null then
    raise exception 'La vivienda 82 no tiene al menos dos imagenes para intercambiar';
  end if;

  update public.vivienda_images
  set sort_order = sort_order + 1000
  where id in (v_first_id, v_second_id);

  update public.vivienda_images
  set sort_order = v_second_sort
  where id = v_first_id;

  update public.vivienda_images
  set sort_order = v_first_sort
  where id = v_second_id;

  perform public.normalize_vivienda_images_sort_order(82);
end;
$$;

select
  'after' as state,
  id,
  vivienda_id,
  sort_order,
  inserted_at,
  url
from public.vivienda_images
where vivienda_id = 82
order by sort_order, id
limit 5;

select *
from public.vivienda_images_sort_diagnostics(82);

commit;
