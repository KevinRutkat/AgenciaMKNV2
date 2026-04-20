# Cambios BDD

Ejecuta este SQL en Supabase/PostgreSQL para anadir el nuevo estado `reservado`:

```sql
alter table public.viviendas
add column if not exists is_reserved boolean not null default false;
```
