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

// POST - Crear nueva propiedad
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
    
    // Extraer datos del formulario
    const propiedadesString = formData.get('propiedades') as string || '';
    
    // El campo propiedades es text[] en PostgreSQL, así que siempre enviamos un array
    let propiedadesArray: string[] = [];
    if (propiedadesString.trim()) {
      // Si hay contenido, convertir a array
      propiedadesArray = propiedadesString.split(',').map(p => p.trim()).filter(p => p);
    }
    
    console.log('Propiedades recibidas:', propiedadesString);
    console.log('Propiedades procesadas:', propiedadesArray);
    
    const propertyData = {
      name: formData.get('name') as string,
      descripcion: formData.get('descripcion') as string,
      price: formData.get('price') as string,
      oldprice: formData.get('oldprice') as string || null,
      metros: formData.get('metros') as string,
      habitaciones: parseInt(formData.get('habitaciones') as string),
      bathroom: parseInt(formData.get('bathroom') as string),
      location: formData.get('location') as string,
      lat: parseFloat(formData.get('lat') as string) || 0,
      lng: parseFloat(formData.get('lng') as string) || 0,
      property_type: formData.get('property_type') as string,
      propiedades: propiedadesArray,
      is_rent: formData.get('is_rent') === 'true',
      plantas: parseInt(formData.get('plantas') as string),
      is_featured: formData.get('is_featured') === 'true',
      category: formData.get('category') as string,
      inserted_at: new Date().toISOString()
    };

    // Insertar la propiedad en la base de datos
  const { data: vivienda, error: viviendaError } = await supabase
      .from('viviendas')
      .insert([propertyData])
      .select()
      .single();

    if (viviendaError) {
      console.error('Error creating property:', viviendaError);
      return NextResponse.json({ error: 'Error al crear la propiedad' }, { status: 500 });
    }

    // Procesar imágenes si existen
    const imageFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        imageFiles.push(value);
      }
    }

    // Validaciones de imágenes
    if (imageFiles.length > 20) {
      return NextResponse.json({ 
        error: 'No se pueden subir más de 20 imágenes por propiedad' 
      }, { status: 400 });
    }

    // Validar tamaño y formato de cada imagen
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

    // Subir imágenes si existen
    if (imageFiles.length > 0 && vivienda) {
      console.log(`Subiendo ${imageFiles.length} imágenes para la propiedad ${vivienda.id}`);

      // Preflight: verificar que el bucket existe
      try {
        const { data: bucket, error: bucketError } = await supabase.storage.getBucket(imagesBucketName);
        if (bucketError || !bucket) {
          console.error('Bucket de imágenes no encontrado:', imagesBucketName, bucketError);
          return NextResponse.json({ 
            message: 'Propiedad creada pero no se pudieron subir imágenes',
            vivienda,
            warning: `El bucket de Storage "${imagesBucketName}" no existe. Créalo en Supabase > Storage, o ajusta SUPABASE_IMAGES_BUCKET.`
          }, { status: 201 });
        }
      } catch (e) {
        console.error('Error verificando bucket:', e);
      }
      
      const imagePromises = imageFiles.map(async (file, index) => {
        try {
          // Crear nombre único para el archivo
          const fileExtension = file.name.split('.').pop();
          const keyName = `${vivienda.id}_${index + 1}.${fileExtension}`;
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
            console.warn(`Upload falló para ${filePath}, intentando update():`, uploadError);
            // Si ya existe, intentar update (overwrite)
            const msg = (uploadError as { message?: string } | undefined)?.message?.toLowerCase() || '';
      if (msg.includes('already exists') || msg.includes('resource exists')) {
              const { error: updateError } = await supabase.storage
                .from(imagesBucketName)
        .update(filePath, buffer, { contentType: file.type });
              if (updateError) {
                console.error(`Error overwriting image ${filePath}:`, updateError);
                throw new Error(`Error al sobreescribir la imagen ${file.name}: ${updateError.message || 'desconocido'}`);
              }
            } else {
              console.error(`Error uploading image ${filePath}:`, uploadError);
              throw new Error(`Error al subir la imagen ${file.name}: ${uploadError.message || 'desconocido'}`);
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
              vivienda_id: vivienda.id,
              url: publicUrl,
              inserted_at: new Date().toISOString()
            }]);

          if (imageError) {
            console.error(`Error inserting image reference for ${filePath}:`, imageError);
            throw new Error(`Error al guardar la referencia de la imagen ${file.name}`);
          }

          console.log(`Imagen ${filePath} subida exitosamente`);
          return publicUrl;
        } catch (error) {
          console.error(`Error processing image ${file.name}:`, error);
          throw error;
        }
      });

      try {
        const uploadedUrls = await Promise.all(imagePromises);
        console.log(`${uploadedUrls.filter(url => url).length} imágenes subidas exitosamente`);
      } catch (error) {
        console.error('Error uploading images:', error);
        // En caso de error, podrías decidir si eliminar la propiedad creada o continuar sin imágenes
        return NextResponse.json({ 
          message: 'Propiedad creada pero hubo un error al subir algunas imágenes',
          vivienda,
          warning: 'Algunas imágenes no se pudieron subir'
        }, { status: 201 });
      }
    }

    return NextResponse.json({ 
      message: `Propiedad creada exitosamente${imageFiles.length > 0 ? ` con ${imageFiles.length} imagen${imageFiles.length === 1 ? '' : 'es'}` : ''}`,
      vivienda,
      imagesCount: imageFiles.length
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/propiedades:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar propiedad existente
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const supabase = createSupabaseServerClient(token);

    const body = await request.json();
    const { id, propiedades, ...rest } = body;
    // Normalizar propiedades (puede venir como string CSV, arreglo, null, etc.)
    let propiedadesArray: string[] = [];
    if (Array.isArray(propiedades)) {
      propiedadesArray = propiedades.filter((p: unknown) => typeof p === 'string' && p.trim() !== '');
    } else if (typeof propiedades === 'string') {
      if (propiedades.trim()) {
        propiedadesArray = propiedades.split(',').map((p: string) => p.trim()).filter(Boolean);
      }
    }

    const updateData = {
      ...rest,
      propiedades: propiedadesArray,
    };

    if (!id) {
      return NextResponse.json({ error: 'ID de propiedad requerido' }, { status: 400 });
    }

    // Actualizar la propiedad
  const { data, error } = await supabase
      .from('viviendas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating property:', error);
      return NextResponse.json({ error: 'Error al actualizar la propiedad' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Propiedad actualizada exitosamente',
      vivienda: data 
    });

  } catch (error) {
    console.error('Error in PUT /api/propiedades:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar propiedad
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const supabase = createSupabaseServerClient(token);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de propiedad requerido' }, { status: 400 });
    }

    // Eliminar imágenes asociadas primero
  const { error: imagesError } = await supabase
      .from('vivienda_images')
      .delete()
      .eq('vivienda_id', id);

    if (imagesError) {
      console.error('Error deleting images:', imagesError);
    }

    // Eliminar la propiedad
  const { error } = await supabase
      .from('viviendas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting property:', error);
      return NextResponse.json({ error: 'Error al eliminar la propiedad' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Propiedad eliminada exitosamente' });

  } catch (error) {
    console.error('Error in DELETE /api/propiedades:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
