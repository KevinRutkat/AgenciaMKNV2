alter table public.viviendas
add column if not exists eficiencia_energetica text;

comment on column public.viviendas.eficiencia_energetica
is 'Clasificacion energetica de la vivienda: A-G, en-tramite o exento';
