# Cambios necesarios en base de datos

Para soportar alquileres con precio por `mes` o por `día`, hace falta guardar esa periodicidad en `public.viviendas`.

## SQL recomendado

```sql
alter table public.viviendas
add column if not exists rent_price_period text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'viviendas_rent_price_period_check'
      and conrelid = 'public.viviendas'::regclass
  ) then
    alter table public.viviendas
    add constraint viviendas_rent_price_period_check
    check (rent_price_period is null or rent_price_period in ('month', 'day'));
  end if;
end $$;

update public.viviendas
set rent_price_period = 'month'
where rent_price_period is null
  and (
    is_rent = true
    or lower(coalesce(category, '')) like '%alquiler%'
  );

comment on column public.viviendas.rent_price_period
is 'Periodicidad del precio para alquileres: month o day. Null para ventas.';
```

## Notas

- No hace falta crear tablas nuevas.
- No hace falta cambiar `vivienda_images`.
- La app tolera alquileres antiguos sin este campo, pero para guardar y editar esta opción correctamente conviene ejecutar esta migración.
