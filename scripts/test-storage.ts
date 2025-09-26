// Test script para verificar la configuración del storage
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { imagesBucketName } from '@/lib/config';

export async function testStorageConfiguration() {
  const supabase = createSupabaseServerClient();
  
  console.log('🔍 Verificando configuración de storage...');
  console.log('📦 Bucket name:', imagesBucketName);
  
  try {
    // Verificar que el bucket existe
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket(imagesBucketName);
    
    if (bucketError) {
      console.error('❌ Error accediendo al bucket:', bucketError);
      console.log('💡 Solución: Crea el bucket manualmente en Supabase Dashboard o ejecuta el script setup-storage.ts');
      return false;
    }
    
    console.log('✅ Bucket encontrado:', bucket);
    
    // Verificar permisos listando objetos
    const { data: objects, error: listError } = await supabase.storage
      .from(imagesBucketName)
      .list('', { limit: 1 });
    
    if (listError) {
      console.error('❌ Error listando objetos:', listError);
      console.log('💡 Verifica las políticas RLS del bucket');
      return false;
    }
    
    console.log('✅ Permisos de lectura funcionando');
    console.log('📊 Objetos en bucket:', objects?.length || 0);
    
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
}

// Si ejecutas este archivo directamente
if (require.main === module) {
  testStorageConfiguration().then((success) => {
    console.log(success ? '🎉 Configuración correcta' : '🚨 Hay problemas de configuración');
    process.exit(success ? 0 : 1);
  });
}
