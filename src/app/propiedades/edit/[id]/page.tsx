'use client';

import { DragEvent, useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Autocomplete, GoogleMap, Marker } from '@react-google-maps/api';
import Banner from '@/components/Banner';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import {
  ENERGY_EFFICIENCY_OPTIONS,
  normalizeEnergyEfficiency,
} from '@/lib/energyEfficiency';
import { supabase } from '@/lib/supabase';
import { FEATURES, normalizeFeature } from '@/lib/features';
import {
  getRentPriceSuffix,
  normalizeCategory,
  normalizeRentPricePeriod,
  stripRentPriceSuffix,
  type RentPricePeriod,
} from '@/lib/viviendaUtils';
import {
  getPropertyAvailabilityStatus,
  normalizeSpecialStatusFlags,
  resolveAvailabilityStatusSelection,
  type PropertyAvailabilityStatus,
} from '@/lib/propertySpecialStatus';
import {
  Bars3Icon,
  PhotoIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface OrderedImageItem {
  clientId: string;
  kind: 'existing' | 'new';
  url: string;
  file?: File;
  imageId?: number;
}

function summarizeOrderedImagesForDebug(images: OrderedImageItem[]) {
  return images.map((image, index) => ({
    index,
    clientId: image.clientId,
    kind: image.kind,
    imageId: image.imageId ?? null,
    fileName: image.file?.name ?? null,
    urlTail: image.url.split('/').slice(-2).join('/'),
  }));
}

const MAX_IMAGES = 20;
const VALID_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const propertyId = params.id as string;

  // Google Maps desde contexto global
  const { isLoaded, loadError } = useGoogleMaps();

  const [autocompleteObj, setAutocompleteObj] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    name: '',
    descripcion: '',
    price: '',
    oldprice: '',
    metros: '',
    habitaciones: 1,
    bathroom: 1,
    location: '',
    lat: 0,
    lng: 0,
    property_type: 'apartamento',
    propiedades: [] as string[],
    is_rent: false,
    rent_price_period: 'month' as RentPricePeriod,
    plantas: 1,
    is_featured: false,
    category: 'usada',
    eficiencia_energetica: '',
    is_sold: false,
    is_reserved: false,
  });

  // Lista de características desde constantes compartidas
  const caracteristicasDisponibles = FEATURES.map((f) => f.label);

  // Estado para las imágenes
  const [orderedImages, setOrderedImages] = useState<OrderedImageItem[]>([]);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [dragOverImageId, setDragOverImageId] = useState<string | null>(null);
  const [recentlyMovedImageId, setRecentlyMovedImageId] = useState<string | null>(null);
  const orderedImagesRef = useRef<OrderedImageItem[]>([]);

  // Estado para el envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const isSubmitError = submitMessage.toLowerCase().includes('error');
  const normalizedCategory = normalizeCategory(formData.category);
  const isRentPrice = formData.is_rent || normalizedCategory.includes('alquiler');
  const rentPricePeriod = normalizeRentPricePeriod(formData.rent_price_period);
  const rentPriceSuffix = getRentPriceSuffix(rentPricePeriod);
  const rentPriceLabel = rentPricePeriod === 'day' ? 'diario' : 'mensual';
  const availabilityStatus = getPropertyAvailabilityStatus(formData);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para buscador de características
  const [searchCaracteristicas, setSearchCaracteristicas] = useState('');

  // Estado para drag & drop
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    orderedImagesRef.current = orderedImages;
  }, [orderedImages]);

  useEffect(() => {
    return () => {
      orderedImagesRef.current.forEach((image) => {
        if (image.kind === 'new') {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, []);

  // Filtrar características según búsqueda
  const caracteristicasFiltradas = caracteristicasDisponibles.filter(
    (caracteristica) =>
      normalizeFeature(caracteristica).includes(
        normalizeFeature(searchCaracteristicas),
      ),
  );

  // Cargar datos de la propiedad
  const loadPropertyData = async () => {
    try {
      const { data: vivienda, error: viviendaError } = await supabase
        .from('viviendas')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (viviendaError) {
        console.error('Error loading property:', viviendaError);
        setSubmitMessage(
          ' Error al cargar la propiedad: ' + viviendaError.message,
        );
        return;
      }

      if (!vivienda) {
        console.error('Property not found with ID:', propertyId);
        setSubmitMessage(
          ' No se encontró la propiedad con ID: ' + propertyId,
        );
        return;
      }

      console.log('Loaded property data:', vivienda);

      if (vivienda) {
        const propiedadesArray: string[] = Array.isArray(vivienda.propiedades)
          ? (vivienda.propiedades as string[])
          : typeof vivienda.propiedades === 'string'
          ? (vivienda.propiedades as string)
              .split(',')
              .map((p: string) => p.trim())
              .filter(Boolean)
          : [];

        const propiedadesCanonicas = propiedadesArray.map((p) => {
          const norm = normalizeFeature(p);
          const match = FEATURES.find(
            (f) => f.key === norm || normalizeFeature(f.label) === norm,
          );
          return match ? match.label : p;
        });

        const specialStatuses = normalizeSpecialStatusFlags({
          is_featured: vivienda.is_featured,
          is_sold: vivienda.is_sold,
          is_reserved: vivienda.is_reserved,
        });
        const normalizedCategoryValue = normalizeCategory(vivienda.category);
        const isRentCategory = normalizedCategoryValue.includes('alquiler');

        setFormData({
          name: vivienda.name || '',
          descripcion: vivienda.descripcion || '',
          price: stripRentPriceSuffix(vivienda.price) || '',
          oldprice: stripRentPriceSuffix(vivienda.oldprice) || '',
          metros: vivienda.metros || '',
          habitaciones: vivienda.habitaciones || 1,
          bathroom: vivienda.bathroom || 1,
          location: vivienda.location || '',
          lat: vivienda.lat || 0,
          lng: vivienda.lng || 0,
          property_type: vivienda.property_type || 'apartamento',
          propiedades: propiedadesCanonicas,
          is_rent: isRentCategory || vivienda.is_rent || false,
          rent_price_period: normalizeRentPricePeriod(vivienda.rent_price_period),
          plantas: vivienda.plantas || 1,
          // Solo vendida y reservada son mutuamente excluyentes
          ...specialStatuses,
          category: normalizedCategoryValue || 'usada',
          eficiencia_energetica:
            normalizeEnergyEfficiency(vivienda.eficiencia_energetica) || '',
        });

        if (vivienda.lat && vivienda.lng) {
          setCoordinates({ lat: vivienda.lat, lng: vivienda.lng });
        }
      }

      let { data: images, error: imagesError } = await supabase
        .from('vivienda_images')
        .select('*')
        .eq('vivienda_id', propertyId)
        .order('sort_order', { ascending: true })
        .order('inserted_at', { ascending: true });

      if (imagesError) {
        const fallbackImagesResponse = await supabase
          .from('vivienda_images')
          .select('*')
          .eq('vivienda_id', propertyId)
          .order('inserted_at', { ascending: true });
        images = fallbackImagesResponse.data;
        imagesError = fallbackImagesResponse.error;
      }

      if (!imagesError && images) {
        console.info('[edit/[id]] loaded ordered images from supabase', {
          viviendaId: propertyId,
          orderedImages: images.map((image) => ({
            id: image.id,
            sort_order: image.sort_order ?? null,
            inserted_at: image.inserted_at ?? null,
            urlTail: String(image.url || '')
              .split('/')
              .slice(-2)
              .join('/'),
          })),
        });
        setOrderedImages(
          images.map((image) => {
            const imageId = Number(image.id);

            return {
              clientId: `existing-${image.id}`,
              kind: 'existing',
              url: image.url,
              imageId: Number.isInteger(imageId) ? imageId : undefined,
            };
          }),
        );
      }
    } catch (error) {
      console.error('Error loading property data:', error);
      setSubmitMessage(
        ` Error al cargar los datos de la propiedad: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      loadPropertyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  // Redirigir si no está autenticado
  if (!loading && !user) {
    router.push('/session');
    return null;
  }

  if (!isLoaded || loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-600">Cargando Google Maps...</p>
        </div>
      </div>
    );
  }

  const handlePlaceChanged = () => {
    if (autocompleteObj) {
      const place = autocompleteObj.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setFormData((prev) => ({
          ...prev,
          location: place.formatted_address || '',
          lat,
          lng,
        }));

        setCoordinates({ lat, lng });
      }
    }
  };

  const handleCaracteristicaChange = (caracteristica: string) => {
    const label = caracteristica.trim();
    setFormData((prev) => ({
      ...prev,
      propiedades: prev.propiedades.includes(label)
        ? prev.propiedades.filter((p) => p !== label)
        : [...prev.propiedades, label],
    }));
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    // Cambiar categoría → sincronizar is_rent
    if (name === 'category') {
      const normalizedValue = normalizeCategory(value);
      const isRentCategory = normalizedValue.includes('alquiler');
      setFormData((prev) => ({
        ...prev,
        category: normalizedValue || value,
        is_rent: isRentCategory,
      }));
      return;
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;

      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFeaturedChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_featured: checked,
    }));
  };

  const handleAvailabilityStatusChange = (
    status: PropertyAvailabilityStatus,
  ) => {
    setFormData((prev) => ({
      ...prev,
      ...resolveAvailabilityStatusSelection(prev, status),
    }));
  };

  const createNewImageItems = (files: File[]) =>
    files.map((file, index) => ({
      clientId: `new-${Date.now()}-${index}-${file.name}`,
      kind: 'new' as const,
      url: URL.createObjectURL(file),
      file,
    }));

  const validateImageFiles = (files: File[]) => {
    const totalFiles = orderedImages.length + files.length;

    if (totalFiles > MAX_IMAGES) {
      return ` Error: Solo se pueden tener m?ximo ${MAX_IMAGES} im?genes en total. Ya tienes ${orderedImages.length}, intentas agregar ${files.length}`;
    }

    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      return ' Error: Algunas im?genes superan los 5MB. Por favor, reduce el tama?o';
    }

    const invalidFiles = files.filter((file) => !VALID_IMAGE_FORMATS.includes(file.type));
    if (invalidFiles.length > 0) {
      return ' Error: Solo se permiten im?genes en formato JPG, PNG o WebP';
    }

    return null;
  };

  const appendImages = (files: File[]) => {
    if (files.length === 0) return;

    const validationError = validateImageFiles(files);
    if (validationError) {
      setSubmitMessage(validationError);
      return;
    }

    setOrderedImages((prev) => [...prev, ...createNewImageItems(files)]);
    setSubmitMessage('');
  };

  const normalizeImageSortOrder = async () => {
    const viviendaId = Number(propertyId);

    if (!Number.isInteger(viviendaId)) {
      return false;
    }

    const { error } = await supabase.rpc('normalize_vivienda_images_sort_order', {
      p_vivienda_id: viviendaId,
    });

    if (error) {
      console.error('Error normalizing image sort order:', error);
      return false;
    }

    return true;
  };

  const moveOrderedImage = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    setOrderedImages((prev) => {
      const sourceIndex = prev.findIndex((image) => image.clientId === sourceId);
      const targetIndex = prev.findIndex((image) => image.clientId === targetId);

      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const nextImages = [...prev];
      const [movedImage] = nextImages.splice(sourceIndex, 1);
      nextImages.splice(targetIndex, 0, movedImage);
      console.info('[edit/[id]] image moved in UI', {
        viviendaId: propertyId,
        sourceId,
        targetId,
        sourceIndex,
        targetIndex,
        nextOrder: summarizeOrderedImagesForDebug(nextImages),
      });
      return nextImages;
    });

    setRecentlyMovedImageId(sourceId);
    setTimeout(() => {
      setRecentlyMovedImageId((current) =>
        current === sourceId ? null : current,
      );
    }, 350);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      appendImages(Array.from(e.target.files));
    }

    e.target.value = '';
  };

  const removeImageItem = async (clientId: string) => {
    const imageToRemove = orderedImages.find((image) => image.clientId === clientId);
    if (!imageToRemove) {
      return;
    }

    if (imageToRemove.kind === 'existing') {
      if (!confirm('¿Está seguro de que desea eliminar esta imagen?')) {
        return;
      }

      try {
        const { error } = await supabase
          .from('vivienda_images')
          .delete()
          .eq('id', imageToRemove.imageId);

        if (error) {
          alert('Error al eliminar la imagen');
          return;
        }

        const normalized = await normalizeImageSortOrder();
        if (!normalized) {
          alert(
            'La imagen se elimino, pero no se pudo renumerar el orden en la base de datos.',
          );
        }
      } catch {
        alert('Error al eliminar la imagen');
        return;
      }
    } else {
      URL.revokeObjectURL(imageToRemove.url);
    }

    setOrderedImages((prev) => prev.filter((image) => image.clientId !== clientId));
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    appendImages(Array.from(e.dataTransfer.files));
  };

  const handlePreviewDragStart = (clientId: string) => {
    setDraggedImageId(clientId);
  };

  const handlePreviewDrop = (targetId: string) => {
    if (!draggedImageId) return;
    moveOrderedImage(draggedImageId, targetId);
    setDraggedImageId(null);
    setDragOverImageId(null);
  };

  const handlePreviewDragEnd = () => {
    setDraggedImageId(null);
    setDragOverImageId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setSubmitMessage('Error: No hay sesión activa');
        setIsSubmitting(false);
        return;
      }

      const normalizedCategoryValue = normalizeCategory(formData.category);
      const isRentCategory = normalizedCategoryValue.includes('alquiler');
      const eficienciaEnergetica = normalizeEnergyEfficiency(
        formData.eficiencia_energetica,
      );
      const specialStatuses = normalizeSpecialStatusFlags(formData);

      const imageOrder = orderedImages.map((image, index) => ({
        ...image,
        sortOrder: index,
      }));

      const existingImageOrderPayload = imageOrder
        .filter(
          (image) =>
            image.kind === 'existing' &&
            Number.isInteger(Number(image.imageId)),
        )
        .map((image) => ({
          imageId: Number(image.imageId),
          sortOrder: image.sortOrder,
        }));

      console.info('[edit/[id]] submitting property update with image order', {
        viviendaId: propertyId,
        orderedImages: summarizeOrderedImagesForDebug(imageOrder),
        existingImageOrderPayload,
      });

      const response = await fetch('/api/propiedades', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: propertyId,
          ...formData,
          ...specialStatuses,
          category: normalizedCategoryValue || formData.category,
          is_rent: isRentCategory,
          rent_price_period: isRentCategory
            ? normalizeRentPricePeriod(formData.rent_price_period)
            : null,
          price: isRentCategory
            ? stripRentPriceSuffix(formData.price)
            : formData.price.trim(),
          oldprice: formData.oldprice.trim()
            ? isRentCategory
              ? stripRentPriceSuffix(formData.oldprice)
              : formData.oldprice.trim()
            : null,
          eficiencia_energetica: eficienciaEnergetica,
          propiedades: formData.propiedades,
          image_order: existingImageOrderPayload,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[edit/[id]] property update failed', {
          viviendaId: propertyId,
          status: response.status,
          errorData,
          existingImageOrderPayload,
        });
        setSubmitMessage(`Error: ${errorData.error}`);
        return;
      }

      console.info('[edit/[id]] property update accepted', {
        viviendaId: propertyId,
        existingImageOrderPayload,
      });

      const newImagesToUpload = imageOrder.filter(
        (image) => image.kind === 'new' && image.file,
      );

      if (newImagesToUpload.length > 0) {
        try {
          const viviendaId = Number(propertyId);

          for (const image of newImagesToUpload) {
            if (!image.file) continue;

            const safeFileName = image.file.name.replace(/\s+/g, '-');
            const path = `viviendas/${viviendaId}/${String(image.sortOrder + 1).padStart(2, '0')}-${Date.now()}-${safeFileName}`;

            const { error: uploadError } = await supabase.storage
              .from('propiedades-images')
              .upload(path, image.file);

            if (uploadError) {
              throw new Error(
                `Error subiendo "${image.file.name}" al storage: ${uploadError.message}`,
              );
            }

            const { data } = supabase.storage
              .from('propiedades-images')
              .getPublicUrl(path);

            if (!data?.publicUrl) {
              throw new Error('No se pudo obtener la URL p?blica');
            }

            const { error: imgError } = await supabase
              .from('vivienda_images')
              .insert({
                vivienda_id: viviendaId,
                url: data.publicUrl,
                inserted_at: new Date().toISOString(),
                sort_order: image.sortOrder,
              });

            if (imgError) {
              throw new Error(
                `Error guardando "${image.file.name}" con sort_order ${image.sortOrder}: ${imgError.message}`,
              );
            }

            console.info('[edit/[id]] new image uploaded and inserted', {
              viviendaId,
              fileName: image.file.name,
              sortOrder: image.sortOrder,
              publicUrlTail: data.publicUrl.split('/').slice(-2).join('/'),
            });
          }
        } catch (err) {
          console.error('Error subiendo im?genes nuevas', err);
          await normalizeImageSortOrder();
          setSubmitMessage(
            `Error: ${
              err instanceof Error
                ? err.message
                : 'Propiedad actualizada, pero hubo un error subiendo o reordenando las imagenes'
            }`,
          );
          return;
        }
      }

      setSubmitMessage('Propiedad actualizada exitosamente');

      setTimeout(() => {
        router.push('/propiedades');
      }, 2000);
    } catch (error) {
      setSubmitMessage(` Error al actualizar la propiedad: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-600">
            Cargando datos de la propiedad...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <Banner
        title="Editar Propiedad"
        subtitle={`Modificando: ${formData.name || 'Propiedad'}`}
        height="small"
        showCarousel={false}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                   Nombre de la propiedad *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Ej: Villa Mediterránea con vistas al mar"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label
                htmlFor="descripcion"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                 Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                placeholder="Describe las características principales de la propiedad..."
              />
            </div>

            {/* Precios y detalles técnicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {isRentPrice && (
                <div className="flex flex-col">
                  <label
                    htmlFor="rent_price_period"
                    className="flex min-h-[2.75rem] items-end text-sm font-medium text-gray-700 mb-2"
                  >
                    Periodicidad del alquiler *
                  </label>
                  <select
                    id="rent_price_period"
                    name="rent_price_period"
                    value={formData.rent_price_period}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="month">Por mes</option>
                    <option value="day">Por día</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col">
                <label
                  htmlFor="price"
                  className="flex min-h-[2.75rem] items-end text-sm font-medium text-gray-700 mb-2"
                >
                   Precio{isRentPrice ? ` ${rentPriceSuffix}` : ''} *
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder={isRentPrice ? `Ej: ${rentPricePeriod === 'day' ? '120' : '750'}€ ${rentPriceSuffix}` : "Ej: 450,000€"}
                  title={isRentPrice ? `Precio ${rentPriceLabel}` : "Precio de venta"}
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="oldprice"
                  className="flex min-h-[2.75rem] items-end text-sm font-medium text-gray-700 mb-2"
                >
                   Precio anterior{isRentPrice ? ` ${rentPriceSuffix}` : ''} (opcional)
                </label>
                <input
                  type="text"
                  id="oldprice"
                  name="oldprice"
                  value={formData.oldprice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder={isRentPrice ? `Ej: ${rentPricePeriod === 'day' ? '150' : '900'}€ ${rentPriceSuffix}` : "Ej: 500,000€"}
                  title={isRentPrice ? `Precio ${rentPriceLabel} anterior` : "Precio de venta anterior"}
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="metros"
                  className="flex min-h-[2.75rem] items-end text-sm font-medium text-gray-700 mb-2"
                >
                   Metros cuadrados *
                </label>
                <input
                  type="text"
                  id="metros"
                  name="metros"
                  value={formData.metros}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Ej: 120 m²"
                />
              </div>
            </div>

            {/* Habitaciones y baños */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <div>
                <label
                  htmlFor="habitaciones"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                   Habitaciones *
                </label>
                <input
                  type="number"
                  id="habitaciones"
                  name="habitaciones"
                  value={formData.habitaciones}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label
                  htmlFor="bathroom"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                   Baños *
                </label>
                <input
                  type="number"
                  id="bathroom"
                  name="bathroom"
                  value={formData.bathroom}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label
                  htmlFor="plantas"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                   Plantas *
                </label>
                <input
                  type="number"
                  id="plantas"
                  name="plantas"
                  value={formData.plantas}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label
                  htmlFor="property_type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                   Tipo de vivienda *
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="casa">Casa</option>
                  <option value="chalet">Chalet</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="aparcamiento">Aparcamiento</option>
                  <option value="garaje">Garaje</option>
                  <option value="local">Local</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="eficiencia_energetica"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                   Eficiencia energetica
                </label>
                <select
                  id="eficiencia_energetica"
                  name="eficiencia_energetica"
                  value={formData.eficiencia_energetica}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  {ENERGY_EFFICIENCY_OPTIONS.map((option) => (
                    <option key={option.value || 'empty'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ubicación con Google Maps */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                   Ubicación *
                </label>
                <Autocomplete
                  onLoad={(autocomplete) => setAutocompleteObj(autocomplete)}
                  onPlaceChanged={handlePlaceChanged}
                  options={{
                    componentRestrictions: { country: 'es' },
                    fields: ['formatted_address', 'geometry'],
                    types: ['address'],
                  }}
                >
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Escribe la dirección completa..."
                  />
                </Autocomplete>
              </div>

              {coordinates && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                       Vista previa de la ubicación
                    </label>
                    <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                      <GoogleMap
                        mapContainerStyle={{ height: '100%', width: '100%' }}
                        zoom={15}
                        center={coordinates}
                        options={{
                          disableDefaultUI: false,
                          zoomControl: true,
                          streetViewControl: false,
                          mapTypeControl: false,
                          fullscreenControl: false,
                        }}
                      >
                        <Marker position={coordinates} />
                      </GoogleMap>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="lat"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                         Latitud
                      </label>
                      <input
                        type="number"
                        step="any"
                        id="lat"
                        name="lat"
                        value={formData.lat}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
                        readOnly
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lng"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                         Longitud
                      </label>
                      <input
                        type="number"
                        step="any"
                        id="lng"
                        name="lng"
                        value={formData.lng}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Características y categoría */}
            <div className="space-y-6">
              {/* Categoría y propiedades especiales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                     Categoría *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="alquiler">Alquiler</option>
                    <option value="usada">Usada</option>
                    <option value="sin-estrenar">Sin estrenar</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                     Propiedades especiales
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={(e) => handleFeaturedChange(e.target.checked)}
                        className="mr-3 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                         Propiedad destacada
                      </span>
                    </label>

                    <div className="space-y-2">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Estado comercial
                      </span>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="availability_status"
                          checked={availabilityStatus === 'available'}
                          onChange={() =>
                            handleAvailabilityStatusChange('available')
                          }
                          className="mr-3 h-4 w-4 border-gray-300 text-gray-700 focus:ring-gray-500"
                        />
                        <span className="text-sm text-gray-700">
                          Disponible
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="availability_status"
                          checked={availabilityStatus === 'reserved'}
                          onChange={() =>
                            handleAvailabilityStatusChange('reserved')
                          }
                          className="mr-3 h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm font-medium text-amber-700">
                          Reservado
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="availability_status"
                          checked={availabilityStatus === 'sold'}
                          onChange={() => handleAvailabilityStatusChange('sold')}
                          className="mr-3 h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm font-medium text-red-700">
                          Vendido
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Características de la propiedad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                   Características de la propiedad
                </label>

                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchCaracteristicas}
                      onChange={(e) =>
                        setSearchCaracteristicas(e.target.value)
                      }
                      placeholder=" Buscar características... (ej: piscina, terraza, garaje)"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                  {searchCaracteristicas && (
                    <p className="text-xs text-gray-500 mt-1">
                      Mostrando {caracteristicasFiltradas.length} de{' '}
                      {caracteristicasDisponibles.length} características
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {caracteristicasFiltradas.map(
                    (caracteristica, index) => (
                      <label
                        key={index}
                        className="flex items-center cursor-pointer hover:bg-white p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.propiedades.some(
                            (p) =>
                              normalizeFeature(p) ===
                              normalizeFeature(caracteristica),
                          )}
                          onChange={() =>
                            handleCaracteristicaChange(caracteristica)
                          }
                          className="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <span className="text-xs text-gray-700">
                          {caracteristica}
                        </span>
                      </label>
                    ),
                  )}

                  {caracteristicasFiltradas.length === 0 &&
                    searchCaracteristicas && (
                      <div className="col-span-full text-center py-4">
                        <p className="text-sm text-gray-500">
                          No se encontraron características que coincidan
                          con &quot;{searchCaracteristicas}&quot;
                        </p>
                      </div>
                    )}
                </div>

                {formData.propiedades.length > 0 && (
                  <div className="mt-3 p-3 bg-teal-50 rounded-lg">
                    <p className="text-sm font-medium text-teal-800 mb-2">
                      Características seleccionadas (
                      {formData.propiedades.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.propiedades.map((prop, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800"
                        >
                          {prop}
                          <button
                            type="button"
                            onClick={() =>
                              handleCaracteristicaChange(prop)
                            }
                            className="ml-1 text-teal-600 hover:text-teal-800"
                            title="Quitar característica"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Imagenes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="inline-flex items-center gap-2">
                  <PhotoIcon className="h-4 w-4 text-gray-500" />
                  Gestion de imagenes
                </span>
              </label>

              <div className="space-y-4">
                <div className="space-y-3">
                  <label htmlFor="images" className="cursor-pointer">
                    <div
                      className={`w-full p-6 border-2 border-dashed rounded-lg transition-all text-center ${
                        isDragOver
                          ? 'border-teal-500 bg-teal-100'
                          : 'border-teal-300 bg-teal-50 hover:bg-teal-100'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <ArrowUpTrayIcon className="h-8 w-8 text-teal-600" />
                        <div className="text-teal-700 font-medium">
                          {isDragOver
                            ? 'Suelta las imagenes aqui'
                            : orderedImages.length === 0
                              ? 'Anadir imagenes'
                              : `Agregar mas imagenes (${orderedImages.length}/${MAX_IMAGES})`}
                        </div>
                        <div className="text-sm text-teal-600">
                          {isDragOver
                            ? 'Puedes soltar multiples imagenes a la vez'
                            : 'Selecciona o arrastra imagenes para mantener el orden visual'}
                        </div>
                        <div className="text-xs text-teal-500">
                          {isDragOver ? '' : 'La primera imagen sera la portada'}
                        </div>
                      </div>
                    </div>
                  </label>

                  <input
                    type="file"
                    id="images"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="inline-flex items-center gap-2 text-sm text-blue-700 font-medium mb-1">
                    <InformationCircleIcon className="h-4 w-4" />
                    Orden manual de imagenes
                  </p>
                  <p className="text-xs text-blue-600">
                    Las imagenes actuales mantienen su orden al cargar. Si arrastras, guardas el nuevo orden.
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  <p>? Formatos aceptados: JPG, PNG, WebP</p>
                  <p>? Tamano maximo por imagen: 5MB</p>
                  <p>? Maximo 20 imagenes por propiedad</p>
                </div>
              </div>

              {orderedImages.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Orden de visualizacion ({orderedImages.length}):
                    </h4>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                      <Bars3Icon className="h-3 w-3" />
                      Arrastra para reordenar
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {orderedImages.map((image, index) => (
                      <div
                        key={image.clientId}
                        draggable
                        onDragStart={() => handlePreviewDragStart(image.clientId)}
                        onDragOver={(event) => event.preventDefault()}
                        onDragEnter={() => setDragOverImageId(image.clientId)}
                        onDrop={() => handlePreviewDrop(image.clientId)}
                        onDragEnd={handlePreviewDragEnd}
                        className={`relative group cursor-grab active:cursor-grabbing rounded-xl border bg-white p-2 shadow-sm transition-all duration-200 ${
                          draggedImageId === image.clientId
                            ? 'border-teal-500 opacity-70 scale-[0.98] rotate-1 shadow-xl'
                            : dragOverImageId === image.clientId
                              ? 'border-teal-400 -translate-y-1 scale-[1.03] shadow-lg ring-2 ring-teal-200'
                              : recentlyMovedImageId === image.clientId
                                ? 'border-teal-300 shadow-md ring-2 ring-teal-100'
                                : 'border-gray-200 hover:border-teal-300 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
                          <Bars3Icon className="h-3 w-3" />
                          {index + 1}
                        </div>
                        {index === 0 && (
                          <div className="absolute right-3 top-3 z-10 rounded-full bg-teal-600 px-2 py-1 text-[11px] font-semibold text-white">
                            Portada
                          </div>
                        )}
                        {image.kind === 'new' && (
                          <div className="absolute bottom-3 left-3 z-10 rounded-full bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white">
                            Nueva
                          </div>
                        )}
                        <Image
                          src={image.url}
                          alt="Imagen de la propiedad"
                          width={200}
                          height={128}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-gray-600" title={image.kind === 'new' && image.file ? image.file.name : 'Imagen actual'}>
                            {image.kind === 'new' && image.file ? image.file.name : 'Imagen actual'}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeImageItem(image.clientId)}
                            className="rounded-full bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100"
                            title="Eliminar imagen"
                          >
                            <XMarkIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {submitMessage && (
              <div
                className={`p-4 rounded-lg text-center border ${
                  isSubmitError
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-green-100 text-green-700 border-green-200'
                }`}
              >
                <div className="inline-flex items-center gap-2">
                  {isSubmitError ? (
                    <ExclamationTriangleIcon className="h-4 w-4" />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4" />
                  )}
                  <span>{submitMessage}</span>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowLeftIcon className="h-4 w-4" />
                  Cancelar
                </span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Actualizando...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <ArrowUpTrayIcon className="h-4 w-4" />
                    Actualizar Propiedad
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
