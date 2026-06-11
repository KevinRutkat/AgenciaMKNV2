/**
 * Script para actualizar el cache-control de imágenes ya subidas a Supabase Storage.
 *
 * Supabase no permite cambiar cacheControl de objetos existentes directamente.
 * La única forma es re-subir los archivos con el nuevo cacheControl.
 *
 * USO: ts-node scripts/update-supabase-cache.ts
 *
 * ALTERNATIVA SIN CÓDIGO: En el dashboard de Supabase no hay UI para modificar
 * cache-control de objetos existentes en masa. Usa la API de Supabase Storage
 * o sube de nuevo las imágenes desde el panel de administración de la web
 * (que ya incluye cacheControl: '31536000' gracias al fix en images/route.ts).
 *
 * NOTA: Las imágenes nuevas ya se suben con 1 año de caché automáticamente.
 * Para las existentes, la única forma de forzar caché largo es re-subirlas.
 */

/*
Instrucciones manuales para forzar 1 año de caché en imágenes ya subidas:

1. Ve al panel de administración de la web (ruta /session → login).
2. Para cada propiedad, entra a editar imágenes.
3. Borra las imágenes existentes y vuelve a subirlas.
   → El upload ya lleva cacheControl: '31536000' (1 año).

ALTERNATIVA VÍA API (requiere service_role key, NO anon key):

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://cbmcapwcbeeorpmlyqbe.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  // Nunca en frontend
)

// Para cada imagen, descarga y re-sube con el nuevo cacheControl:
async function refreshCacheForObject(path: string, contentType: string) {
  const { data } = await supabase.storage.from('viviendas').download(path)
  if (!data) return
  await supabase.storage.from('viviendas').update(path, data, {
    contentType,
    cacheControl: '31536000',
    upsert: true,
  })
  console.log('Updated:', path)
}
*/

export {}
