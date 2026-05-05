# Cambios Supabase

## Nueva caracteristica: Cocina electrica

Se ha anadido en la app la nueva caracteristica `Cocina eléctrica` para viviendas.

## Que cambiar en Supabase

No hace falta cambiar la estructura de Supabase si tu tabla `public.viviendas` tiene el campo `details` como array de texto (`text[]`) o como JSON/lista sin restriccion de valores. La app guarda las caracteristicas seleccionadas directamente dentro de ese campo, por lo que las nuevas viviendas ya podran guardar `Cocina eléctrica`.

## Comprobacion recomendada

Ejecuta esta consulta en el SQL Editor de Supabase para comprobar el tipo del campo:

```sql
select column_name, data_type, udt_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'viviendas'
  and column_name = 'details';
```

Resultado esperado si es un array de texto:

```text
column_name | data_type | udt_name
details     | ARRAY     | _text
```

## Solo si tienes una restriccion CHECK de valores permitidos

Si en Supabase creaste manualmente una restriccion que limita las caracteristicas permitidas, actualizala para incluir tambien:

```text
Cocina eléctrica
```

Puedes revisar las restricciones actuales con:

```sql
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.viviendas'::regclass;
```

Si no aparece ninguna restriccion relacionada con `details`, no tienes que hacer nada mas en Supabase.
