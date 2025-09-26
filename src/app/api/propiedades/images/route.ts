import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { imagesBucketName, imagesBucketPrefix } from '@/lib/config';

// Función para verificar autenticación
async function isAuthenticated(request: NextRequest) {
  try {
    // Obtener el token de autorización del header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.substring(7); // Remover "Bearer "
    
    // Verificar el token con Supabase
  const supabase = createSupabaseServerClient(token);
  const { data: { user }, error } = await supabase.auth.getUser(token);
    return !error && !!user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// POST - Añadir nuevas imágenes a una propiedad existente
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const supabase = createSupabaseServerClient(token);

    const formData = await request.formData();
    const viviendaId = formData.get('vivienda_id') as string;

    if (!viviendaId) {
      return NextResponse.json({ error: 'ID de vivienda requerido' }, { status: 400 });
    }

    // Verificar cuántas imágenes ya tiene la propiedad
  const { data: existingImages, error: countError } = await supabase
      .from('vivienda_images')
      .select('id')
      .eq('vivienda_id', viviendaId);

    if (countError) {
      console.error('Error checking existing images:', countError);
      return NextResponse.json({ error: 'Error al verificar imágenes existentes' }, { status: 500 });
    }

    const currentImageCount = existingImages?.length || 0;

    // Procesar imágenes
    const imageFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        imageFiles.push(value);
      }
    }

    if (imageFiles.length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron imágenes' }, { status: 400 });
    }

    // Validar límite de 20 imágenes total
    if (currentImageCount + imageFiles.length > 20) {
      return NextResponse.json({ 
        error: `No se pueden agregar ${imageFiles.length} imágenes. La propiedad ya tiene ${currentImageCount} imágenes y el límite máximo es 20.` 
      }, { status: 400 });
    }

    // Validaciones de imágenes
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    for (const file of imageFiles) {
      if (file.size > maxSize) {
        return NextResponse.json({ 
          error: `La imagen "${file.name}" supera el tamaño máximo de 5MB` 
        }, { status: 400 });
      }
      
      if (!validFormats.includes(file.type)) {
        return NextResponse.json({ 
          error: `La imagen "${file.name}" no tiene un formato válido. Solo se permiten JPG, PNG y WebP` 
        }, { status: 400 });
      }
    }

    // Preflight: verificar que el bucket existe
    try {
      const { data: bucket, error: bucketError } = await supabase.storage.getBucket(imagesBucketName);
      if (bucketError || !bucket) {
        console.error('Bucket de imágenes no encontrado:', imagesBucketName, bucketError);
        return NextResponse.json({ 
          error: `El bucket de Storage "${imagesBucketName}" no existe. Créalo en Supabase > Storage, o ajusta SUPABASE_IMAGES_BUCKET.`
        }, { status: 400 });
      }
    } catch (e) {
      console.error('Error verificando bucket:', e);
    }

    // Subir imágenes
    const uploadPromises = imageFiles.map(async (file, index) => {
      // Crear nombre único para el archivo
      const fileExtension = file.name.split('.').pop();
  const keyName = `${viviendaId}_${Date.now()}_${index + 1}.${fileExtension}`;
  const filePath = imagesBucketPrefix ? `${imagesBucketPrefix}/${keyName}` : keyName;
      
      // Convertir File a ArrayBuffer y luego a Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Subir archivo a Supabase Storage
  const { error: uploadError } = await supabase.storage
        .from(imagesBucketName)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) {
        console.warn('Upload falló, intentando update():', uploadError);
    const msg = (uploadError as { message?: string } | undefined)?.message?.toLowerCase() || '';
        if (msg.includes('already exists') || msg.includes('resource exists')) {
          const { error: updateError } = await supabase.storage
            .from(imagesBucketName)
      .update(filePath, buffer, { contentType: file.type });
          if (updateError) {
            console.error('Error overwriting image:', updateError);
            throw new Error(`Error al sobreescribir imagen: ${updateError.message}`);
          }
        } else {
          console.error('Error uploading image:', uploadError);
          throw new Error(`Error al subir imagen: ${uploadError.message}`);
        }
      }

      // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
        .from(imagesBucketName)
        .getPublicUrl(filePath);

      // Insertar referencia de imagen en la tabla
  const { error: imageError } = await supabase
        .from('vivienda_images')
        .insert([{
          vivienda_id: parseInt(viviendaId),
          url: publicUrl,
          inserted_at: new Date().toISOString()
        }]);

      if (imageError) {
        console.error('Error inserting image reference:', imageError);
        throw new Error(`Error al guardar referencia de imagen: ${imageError.message}`);
      }

      return publicUrl;
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    return NextResponse.json({ 
      message: `${imageFiles.length} imagen${imageFiles.length === 1 ? '' : 'es'} subida${imageFiles.length === 1 ? '' : 's'} exitosamente`,
      urls: uploadedUrls,
      totalImages: currentImageCount + imageFiles.length
    });

  } catch (error) {
    console.error('Error in POST /api/propiedades/images:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// GET - Obtener imágenes de una propiedad
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const viviendaId = searchParams.get('vivienda_id');

    if (!viviendaId) {
      return NextResponse.json({ error: 'ID de vivienda requerido' }, { status: 400 });
    }

    // Obtener imágenes de la propiedad
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const supabase = createSupabaseServerClient(token);

  const { data: images, error } = await supabase
      .from('vivienda_images')
      .select('*')
      .eq('vivienda_id', viviendaId)
      .order('inserted_at', { ascending: true });

    if (error) {
      console.error('Error fetching images:', error);
      return NextResponse.json({ error: 'Error al obtener las imágenes' }, { status: 500 });
    }

    return NextResponse.json({ 
      images: images || [],
      count: images?.length || 0,
      maxImages: 20
    });

  } catch (error) {
    console.error('Error in GET /api/propiedades/images:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
