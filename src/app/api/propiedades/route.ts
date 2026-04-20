import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { imagesBucketName, imagesBucketPrefix } from '@/lib/config';
import { normalizeEnergyEfficiency } from '@/lib/energyEfficiency';
import { normalizeSpecialStatusFlags } from '@/lib/propertySpecialStatus';
import {
  normalizeRentPricePeriod,
  stripRentPriceSuffix,
} from '@/lib/viviendaUtils';

const TEMP_SORT_ORDER_OFFSET = 1000;

type ImageOrderItem = {
  imageId: number;
  sortOrder: number;
};

type SupabaseErrorLike = {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message?: string;
};

type ReorderDebugRow = {
  id: number;
  vivienda_id: number;
  sort_order: number | null;
  inserted_at?: string | null;
  url?: string | null;
};

function formatErrorMessage(prefix: string, error: unknown) {
  if (error instanceof Error) {
    return `${prefix}: ${error.message}`;
  }

  if (error && typeof error === 'object') {
    const candidate = error as SupabaseErrorLike;
    const parts = [prefix];

    if (candidate.message) {
      parts.push(candidate.message);
    }

    if (candidate.details) {
      parts.push(`Detalles: ${candidate.details}`);
    }

    if (candidate.hint) {
      parts.push(`Sugerencia: ${candidate.hint}`);
    }

    if (candidate.code) {
      parts.push(`Codigo: ${candidate.code}`);
    }

    return parts.join('. ');
  }

  return prefix;
}

function summarizeImageRows(rows: ReorderDebugRow[] | null | undefined) {
  return (rows || []).map((row) => ({
    id: row.id,
    vivienda_id: row.vivienda_id,
    sort_order: row.sort_order,
    inserted_at: row.inserted_at ?? null,
    url_tail: row.url ? row.url.split('/').slice(-2).join('/') : null,
  }));
}

async function normalizeImageSortOrder(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  viviendaId: number | string,
) {
  const parsedViviendaId =
    typeof viviendaId === 'number' ? viviendaId : Number(viviendaId);

  if (!Number.isInteger(parsedViviendaId)) {
    return;
  }

  const { error } = await supabase.rpc('normalize_vivienda_images_sort_order', {
    p_vivienda_id: parsedViviendaId,
  });

  if (error) {
    console.error(
      `Error normalizing image sort order for vivienda ${parsedViviendaId}:`,
      error,
    );
  }
}

function parseImageOrderItem(image: unknown): ImageOrderItem | null {
  if (!image || typeof image !== 'object') {
    return null;
  }

  const candidate = image as {
    imageId?: number | string;
    sortOrder?: number | string;
  };
  const parsedImageId =
    typeof candidate.imageId === 'number'
      ? candidate.imageId
      : Number(candidate.imageId);
  const parsedSortOrder =
    typeof candidate.sortOrder === 'number'
      ? candidate.sortOrder
      : Number(candidate.sortOrder);

  if (
    !Number.isInteger(parsedImageId) ||
    !Number.isInteger(parsedSortOrder) ||
    parsedSortOrder < 0
  ) {
    return null;
  }

  return {
    imageId: parsedImageId,
    sortOrder: parsedSortOrder,
  };
}

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
    const supabase = createSupabaseServerClient(token, { useUserToken: true });
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
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

    const supabase = createSupabaseServerClient();

    const formData = await request.formData();

    // Extraer datos del formulario
    const propiedadesString = (formData.get('propiedades') as string) || '';

    // El campo propiedades es text[] en PostgreSQL, así que siempre enviamos un array
    let propiedadesArray: string[] = [];
    if (propiedadesString.trim()) {
      // Si hay contenido, convertir a array
      propiedadesArray = propiedadesString
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p);
    }

    console.log('Propiedades recibidas:', propiedadesString);
    console.log('Propiedades procesadas:', propiedadesArray);

    const isRentRequest = formData.get('is_rent') === 'true';

    const specialStatuses = normalizeSpecialStatusFlags({
      is_featured: formData.get('is_featured') === 'true',
      is_sold: formData.get('is_sold') === 'true',
      is_reserved: formData.get('is_reserved') === 'true',
    });

    const propertyData = {
      name: formData.get('name') as string,
      descripcion: formData.get('descripcion') as string,
      price: isRentRequest
        ? stripRentPriceSuffix(formData.get('price') as string)
        : ((formData.get('price') as string) || '').trim(),
      oldprice: ((formData.get('oldprice') as string) || '').trim()
        ? isRentRequest
          ? stripRentPriceSuffix(formData.get('oldprice') as string)
          : ((formData.get('oldprice') as string) || '').trim()
        : null,
      rent_price_period:
        isRentRequest
          ? normalizeRentPricePeriod(formData.get('rent_price_period') as string | null)
          : null,
      metros: formData.get('metros') as string,
      habitaciones: parseInt(formData.get('habitaciones') as string),
      bathroom: parseInt(formData.get('bathroom') as string),
      location: formData.get('location') as string,
      lat: parseFloat(formData.get('lat') as string) || 0,
      lng: parseFloat(formData.get('lng') as string) || 0,
      property_type: formData.get('property_type') as string,
      propiedades: propiedadesArray,
      is_rent: isRentRequest,
      plantas: parseInt(formData.get('plantas') as string),
      ...specialStatuses,
      category: formData.get('category') as string,
      eficiencia_energetica: normalizeEnergyEfficiency(
        formData.get('eficiencia_energetica') as string | null,
      ),
      // Estados especiales normalizados: destacada, vendida y reservada
      inserted_at: new Date().toISOString(),
    };

    // Insertar la propiedad en la base de datos
    const { data: vivienda, error: viviendaError } = await supabase
      .from('viviendas')
      .insert([propertyData])
      .select()
      .single();

    if (viviendaError) {
      console.error('Error creating property:', viviendaError);
      return NextResponse.json(
        { error: 'Error al crear la propiedad' },
        { status: 500 },
      );
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
      return NextResponse.json(
        {
          error: 'No se pueden subir más de 20 imágenes por propiedad',
        },
        { status: 400 },
      );
    }

    // Validar tamaño y formato de cada imagen
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFormats = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    for (const file of imageFiles) {
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            error: `La imagen "${file.name}" supera el tamaño máximo de 5MB`,
          },
          { status: 400 },
        );
      }

      if (!validFormats.includes(file.type)) {
        return NextResponse.json(
          {
            error: `La imagen "${file.name}" no tiene un formato válido. Solo se permiten JPG, PNG y WebP`,
          },
          { status: 400 },
        );
      }
    }

    // Subir imágenes si existen
    if (imageFiles.length > 0 && vivienda) {
      console.log(
        `Subiendo ${imageFiles.length} imágenes para la propiedad ${vivienda.id}`,
      );

      // Preflight: verificar que el bucket existe
      try {
        const { data: bucket, error: bucketError } =
          await supabase.storage.getBucket(imagesBucketName);
        if (bucketError || !bucket) {
          console.error(
            'Bucket de imágenes no encontrado:',
            imagesBucketName,
            bucketError,
          );
          return NextResponse.json(
            {
              message:
                'Propiedad creada pero no se pudieron subir imágenes',
              vivienda,
              warning: `El bucket de Storage "${imagesBucketName}" no existe. Créalo en Supabase > Storage, o ajusta SUPABASE_IMAGES_BUCKET.`,
            },
            { status: 201 },
          );
        }
      } catch (e) {
        console.error('Error verificando bucket:', e);
      }

      const imagePromises = imageFiles.map(async (file, index) => {
        try {
          // Crear nombre único para el archivo
          const fileExtension = file.name.split('.').pop();
          const keyName = `${vivienda.id}_${index + 1}.${fileExtension}`;
          const filePath = imagesBucketPrefix
            ? `${imagesBucketPrefix}/${keyName}`
            : keyName;

          // Convertir File a ArrayBuffer y luego a Buffer
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Subir archivo a Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from(imagesBucketName)
            .upload(filePath, buffer, {
              contentType: file.type,
              upsert: true,
            });

          if (uploadError) {
            console.warn(
              `Upload falló para ${filePath}, intentando update():`,
              uploadError,
            );
            // Si ya existe, intentar update (overwrite)
            const msg =
              (
                (uploadError as { message?: string } | undefined)
                  ?.message || ''
              ).toLowerCase();
            if (
              msg.includes('already exists') ||
              msg.includes('resource exists')
            ) {
              const { error: updateError } = await supabase.storage
                .from(imagesBucketName)
                .update(filePath, buffer, { contentType: file.type });
              if (updateError) {
                console.error(
                  `Error overwriting image ${filePath}:`,
                  updateError,
                );
                throw new Error(
                  `Error al sobreescribir la imagen ${file.name}: ${
                    updateError.message || 'desconocido'
                  }`,
                );
              }
            } else {
              console.error(
                `Error uploading image ${filePath}:`,
                uploadError,
              );
              throw new Error(
                `Error al subir la imagen ${file.name}: ${
                  uploadError.message || 'desconocido'
                }`,
              );
            }
          }

          // Obtener URL pública
          const {
            data: { publicUrl },
          } = supabase.storage.from(imagesBucketName).getPublicUrl(filePath);

          // Insertar referencia de imagen en la tabla
          const { error: imageError } = await supabase
            .from('vivienda_images')
            .insert([
              {
                vivienda_id: vivienda.id,
                url: publicUrl,
                inserted_at: new Date().toISOString(),
                sort_order: index,
              },
            ]);

          if (imageError) {
            console.error(
              `Error inserting image reference for ${filePath}:`,
              imageError,
            );
            throw new Error(
              `Error al guardar la referencia de la imagen ${file.name}`,
            );
          }

          console.log(`Imagen ${filePath} subida exitosamente`);
          return publicUrl;
        } catch (error) {
          console.error(`Error processing image ${file.name}:`, error);
          throw error;
        }
      });

      try {
        const uploadResults = await Promise.allSettled(imagePromises);
        const uploadedUrls = uploadResults
          .filter(
            (result): result is PromiseFulfilledResult<string> =>
              result.status === 'fulfilled',
          )
          .map((result) => result.value);
        const failedUploads = uploadResults.filter(
          (result) => result.status === 'rejected',
        );

        if (failedUploads.length > 0) {
          console.error('Error uploading images:', failedUploads);
          await normalizeImageSortOrder(supabase, vivienda.id);

          return NextResponse.json(
            {
              message:
                'Propiedad creada pero hubo un error al subir algunas imágenes',
              vivienda,
              warning: 'Algunas imágenes no se pudieron subir',
              uploadedImages: uploadedUrls.length,
              failedImages: failedUploads.length,
            },
            { status: 201 },
          );
        }
        console.log(
          `${
            uploadedUrls.filter((url) => url).length
          } imágenes subidas exitosamente`,
        );
      } catch (error) {
        console.error('Error uploading images:', error);
        await normalizeImageSortOrder(supabase, vivienda.id);
        // En caso de error, podrías decidir si eliminar la propiedad creada o continuar sin imágenes
        return NextResponse.json(
          {
            message:
              'Propiedad creada pero hubo un error al subir algunas imágenes',
            vivienda,
            warning: 'Algunas imágenes no se pudieron subir',
          },
          { status: 201 },
        );
      }
    }

    return NextResponse.json(
      {
        message: `Propiedad creada exitosamente${
          imageFiles.length > 0
            ? ` con ${imageFiles.length} imagen${
                imageFiles.length === 1 ? '' : 'es'
              }`
            : ''
        }`,
        vivienda,
        imagesCount: imageFiles.length,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error in POST /api/propiedades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}

// PUT - Actualizar propiedad existente
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = createSupabaseServerClient();

    const body = await request.json();
    const {
      id,
      propiedades,
      eficiencia_energetica,
      image_order,
      rent_price_period,
      ...rest
    } = body;

    // Normalizar propiedades (puede venir como string CSV, arreglo, null, etc.)
    let propiedadesArray: string[] = [];
    if (Array.isArray(propiedades)) {
      propiedadesArray = propiedades.filter(
        (p: unknown) => typeof p === 'string' && p.trim() !== '',
      );
    } else if (typeof propiedades === 'string') {
      if (propiedades.trim()) {
        propiedadesArray = propiedades
          .split(',')
          .map((p: string) => p.trim())
          .filter(Boolean);
      }
    }

    const specialStatuses = normalizeSpecialStatusFlags({
      is_featured: rest.is_featured,
      is_sold: rest.is_sold,
      is_reserved: rest.is_reserved,
    });

    const updateData = {
      ...rest,
      ...specialStatuses,
      price:
        rest.is_rent === true
          ? stripRentPriceSuffix(rest.price)
          : typeof rest.price === 'string'
            ? rest.price.trim()
            : rest.price,
      oldprice:
        typeof rest.oldprice === 'string' && rest.oldprice.trim()
          ? rest.is_rent === true
            ? stripRentPriceSuffix(rest.oldprice)
            : rest.oldprice.trim()
          : null,
      propiedades: propiedadesArray,
      eficiencia_energetica: normalizeEnergyEfficiency(eficiencia_energetica),
      rent_price_period:
        rest.is_rent === true
          ? normalizeRentPricePeriod(rent_price_period)
          : null,
    };

    if (!id) {
      return NextResponse.json(
        { error: 'ID de propiedad requerido' },
        { status: 400 },
      );
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
      return NextResponse.json(
        { error: 'Error al actualizar la propiedad' },
        { status: 500 },
      );
    }

    if (Array.isArray(image_order) && image_order.length > 0) {
      const reorderTraceId = `reorder-vivienda-${id}-${Date.now()}`;
      const normalizedImageOrder = image_order
        .map((image) => parseImageOrderItem(image))
        .filter((image): image is ImageOrderItem => image !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      console.info('[PUT /api/propiedades] image reorder payload received', {
        reorderTraceId,
        viviendaId: id,
        totalItemsReceived: image_order.length,
        normalizedImageOrder,
        usingServiceRoleByDefault: Boolean(
          process.env.SUPABASE_SERVICE_ROLE_KEY,
        ),
      });

      if (normalizedImageOrder.length !== image_order.length) {
        return NextResponse.json(
          {
            error:
              'image_order contiene elementos invalidos. Cada imagen debe incluir imageId entero y sortOrder entero mayor o igual a 0.',
          },
          { status: 400 },
        );
      }

      const duplicatedImageIds = normalizedImageOrder.filter(
        (image, index, images) =>
          images.findIndex((candidate) => candidate.imageId === image.imageId) !==
          index,
      );

      if (duplicatedImageIds.length > 0) {
        return NextResponse.json(
          {
            error: `image_order contiene imageId duplicados: ${[
              ...new Set(duplicatedImageIds.map((image) => image.imageId)),
            ].join(', ')}`,
          },
          { status: 400 },
        );
      }

      const duplicatedSortOrders = normalizedImageOrder.filter(
        (image, index, images) =>
          images.findIndex(
            (candidate) => candidate.sortOrder === image.sortOrder,
          ) !== index,
      );

      if (duplicatedSortOrders.length > 0) {
        return NextResponse.json(
          {
            error: `image_order contiene posiciones repetidas: ${[
              ...new Set(duplicatedSortOrders.map((image) => image.sortOrder)),
            ].join(', ')}`,
          },
          { status: 400 },
        );
      }

      const { data: existingImages, error: existingImagesError } = await supabase
        .from('vivienda_images')
        .select('id, vivienda_id, sort_order, inserted_at, url')
        .eq('vivienda_id', id);

      if (existingImagesError) {
        console.error(
          'Error loading existing images before reorder:',
          existingImagesError,
        );
        return NextResponse.json(
          {
            error: formatErrorMessage(
              'Error al cargar las imagenes actuales antes de reordenar',
              existingImagesError,
            ),
          },
          { status: 500 },
        );
      }

      console.info('[PUT /api/propiedades] image reorder current db state', {
        reorderTraceId,
        viviendaId: id,
        existingImages: summarizeImageRows(
          (existingImages as ReorderDebugRow[] | null | undefined) || [],
        ),
      });

      const existingImageIds = new Set(
        (existingImages || []).map((image) => image.id),
      );
      const requestedImageIds = new Set(
        normalizedImageOrder.map((image) => image.imageId),
      );
      const missingImageIds = (existingImages || [])
        .map((image) => image.id)
        .filter((imageId) => !requestedImageIds.has(imageId));
      const foreignImageIds = normalizedImageOrder
        .map((image) => image.imageId)
        .filter((imageId) => !existingImageIds.has(imageId));

      if (missingImageIds.length > 0 || foreignImageIds.length > 0) {
        const details: string[] = [];

        if (missingImageIds.length > 0) {
          details.push(`faltan imageId actuales: ${missingImageIds.join(', ')}`);
        }

        if (foreignImageIds.length > 0) {
          details.push(
            `hay imageId que no pertenecen a la vivienda ${id}: ${foreignImageIds.join(', ')}`,
          );
        }

        return NextResponse.json(
          {
            error: `image_order no coincide con las imagenes reales de la vivienda; ${details.join('; ')}`,
          },
          { status: 400 },
        );
      }

      for (const [index, image] of normalizedImageOrder.entries()) {
        const { data: prepRows, error: prepError } = await supabase
          .from('vivienda_images')
          .update({ sort_order: TEMP_SORT_ORDER_OFFSET + index })
          .eq('id', image.imageId)
          .eq('vivienda_id', id)
          .select('id, vivienda_id, sort_order');

        if (prepError) {
          console.error('Error preparing image reorder:', prepError);
          await normalizeImageSortOrder(supabase, id);
          return NextResponse.json(
            {
              error: formatErrorMessage(
                'Error al preparar el reordenado de imagenes',
                prepError,
              ),
            },
            { status: 500 },
          );
        }

        if (!prepRows || prepRows.length !== 1) {
          console.error(
            '[PUT /api/propiedades] image reorder prep updated an unexpected number of rows',
            {
              reorderTraceId,
              viviendaId: id,
              imageId: image.imageId,
              expectedRows: 1,
              actualRows: prepRows?.length ?? 0,
              requestedTempSortOrder: TEMP_SORT_ORDER_OFFSET + index,
              hint: 'Esto suele indicar RLS/politicas, filtros que no casan o IDs incorrectos.',
            },
          );
          await normalizeImageSortOrder(supabase, id);
          return NextResponse.json(
            {
              error:
                'El reordenado de imagenes no modifico ninguna fila en la fase temporal. Revisa la consola del servidor para el trace ID.',
              reorderTraceId,
            },
            { status: 500 },
          );
        }
      }

      for (const image of normalizedImageOrder) {
        const { data: reorderRows, error: reorderError } = await supabase
          .from('vivienda_images')
          .update({ sort_order: image.sortOrder })
          .eq('id', image.imageId)
          .eq('vivienda_id', id)
          .select('id, vivienda_id, sort_order');

        if (reorderError) {
          console.error('Error saving image order:', reorderError);
          await normalizeImageSortOrder(supabase, id);
          return NextResponse.json(
            {
              error: formatErrorMessage(
                `Error al guardar el nuevo orden de imagenes para imageId ${image.imageId} en sort_order ${image.sortOrder}`,
                reorderError,
              ),
            },
            { status: 500 },
          );
        }

        if (!reorderRows || reorderRows.length !== 1) {
          console.error(
            '[PUT /api/propiedades] image reorder final update changed an unexpected number of rows',
            {
              reorderTraceId,
              viviendaId: id,
              imageId: image.imageId,
              expectedRows: 1,
              actualRows: reorderRows?.length ?? 0,
              requestedSortOrder: image.sortOrder,
              hint: 'Esto suele indicar RLS/politicas, filtros que no casan o IDs incorrectos.',
            },
          );
          await normalizeImageSortOrder(supabase, id);
          return NextResponse.json(
            {
              error:
                'El reordenado de imagenes no modifico ninguna fila en la fase final. Revisa la consola del servidor para el trace ID.',
              reorderTraceId,
            },
            { status: 500 },
          );
        }
      }

      const { data: updatedImages, error: updatedImagesError } = await supabase
        .from('vivienda_images')
        .select('id, vivienda_id, sort_order, inserted_at, url')
        .eq('vivienda_id', id)
        .order('sort_order', { ascending: true })
        .order('inserted_at', { ascending: true });

      if (updatedImagesError) {
        console.error(
          '[PUT /api/propiedades] image reorder could not load post-update state',
          {
            reorderTraceId,
            viviendaId: id,
            error: updatedImagesError,
          },
        );
      } else {
        console.info('[PUT /api/propiedades] image reorder db state after save', {
          reorderTraceId,
          viviendaId: id,
          updatedImages: summarizeImageRows(
            (updatedImages as ReorderDebugRow[] | null | undefined) || [],
          ),
        });
      }
    }

    return NextResponse.json({
      message: 'Propiedad actualizada exitosamente',
      vivienda: data,
    });
  } catch (error) {
    console.error('Error in PUT /api/propiedades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}

// DELETE - Eliminar propiedad
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = createSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de propiedad requerido' },
        { status: 400 },
      );
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
      return NextResponse.json(
        { error: 'Error al eliminar la propiedad' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: 'Propiedad eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error in DELETE /api/propiedades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
