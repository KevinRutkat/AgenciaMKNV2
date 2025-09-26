// Script para crear el bucket de imágenes en Supabase
// Ejecuta este script una vez para configurar el storage

import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function createImagesBucket() {
  const supabase = createSupabaseServerClient();
  
  try {
    // Crear el bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('propiedades-images', {
      public: true, // Hacer el bucket público para acceso a las imágenes
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (bucketError) {
      console.error('Error creando bucket:', bucketError);
      return false;
    }

    console.log('Bucket creado exitosamente:', bucket);

    // Crear política RLS para lectura pública
    const { error: selectPolicyError } = await supabase.rpc('create_storage_policy', {
      policy_name: 'Public Access',
      bucket_name: 'propiedades-images',
      policy_definition: `
        CREATE POLICY "Public Access" ON storage.objects 
        FOR SELECT USING (bucket_id = 'propiedades-images');
      `
    });

    if (selectPolicyError) {
      console.warn('Error creando política de lectura:', selectPolicyError);
    }

    // Crear política RLS para escritura autenticada
    const { error: insertPolicyError } = await supabase.rpc('create_storage_policy', {
      policy_name: 'Authenticated Upload',
      bucket_name: 'propiedades-images',
      policy_definition: `
        CREATE POLICY "Authenticated users can upload" ON storage.objects 
        FOR INSERT WITH CHECK (bucket_id = 'propiedades-images' AND auth.role() = 'authenticated');
      `
    });

    if (insertPolicyError) {
      console.warn('Error creando política de escritura:', insertPolicyError);
    }

    return true;
  } catch (error) {
    console.error('Error configurando storage:', error);
    return false;
  }
}

// Si ejecutas este archivo directamente
if (require.main === module) {
  createImagesBucket().then((success) => {
    console.log(success ? 'Storage configurado correctamente' : 'Error configurando storage');
    process.exit(success ? 0 : 1);
  });
}
