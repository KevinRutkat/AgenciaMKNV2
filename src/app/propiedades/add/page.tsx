'use client';

import { DragEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
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
  MAX_SOURCE_IMAGE_SIZE,
  VALID_IMAGE_FORMATS,
  prepareImagesForStorage,
} from '@/lib/clientImageProcessing';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  PhotoIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface ViviendaInsert {
  is_rent: boolean;
  category: string;
  name: string;
  descripcion: string;
  location: string;
  price: string;
  rent_price_period: RentPricePeriod | null;
  metros: string;
  habitaciones: number;
  bathroom: number;
  plantas: number;
  propiedades: string[];
  property_type: string;
  reference_code: string;
  lat?: number;
  lng?: number;
  is_featured: boolean;
  is_sold: boolean;
  is_reserved: boolean;
  inserted_at: string;
  oldprice?: string;
  eficiencia_energetica?: string | null;
}

interface PendingImage {
  clientId: string;
  file: File;
  previewUrl: string;
}

const MAX_IMAGES = 20;

export default function AddPropertyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Google Maps desde contexto global
  const { isLoaded, loadError } = useGoogleMaps();

  const [autocompleteObj, setAutocompleteObj] = useState<google.maps.places.Autocomplete | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
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
    is_sold: false,
    is_reserved: false,
    category: 'usada',
    eficiencia_energetica: ''
  });

  // Lista de características desde constantes compartidas
  const caracteristicasDisponibles = FEATURES.map((f) => f.label);

  // Estado para las imágenes
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [dragOverImageId, setDragOverImageId] = useState<string | null>(null);
  const [recentlyMovedImageId, setRecentlyMovedImageId] = useState<string | null>(null);
  const pendingImagesRef = useRef<PendingImage[]>([]);
  
  // Estado para el envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const normalizedCategory = normalizeCategory(formData.category);
  const isRentPrice = formData.is_rent || normalizedCategory.includes('alquiler');
  const rentPricePeriod = normalizeRentPricePeriod(formData.rent_price_period);
  const rentPriceSuffix = getRentPriceSuffix(rentPricePeriod);
  const rentPriceLabel = rentPricePeriod === 'day' ? 'diario' : 'mensual';
  const availabilityStatus = getPropertyAvailabilityStatus(formData);

  // Estado para buscador de características
  const [searchCaracteristicas, setSearchCaracteristicas] = useState('');

  // Estado para drag & drop
  const [isDragOver, setIsDragOver] = useState(false);
  const isSubmitError = submitMessage.toLowerCase().includes('error');

  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);

  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, []);

  // Redirigir si no está autenticado
  if (!loading && !user) {
    router.push('/session');
    return null;
  }

  // Mostrar loading si Google Maps no está cargado o hay error
  if (!isLoaded || loadError) {
    return (
      <div className="min-h-screen bg-kehre-gradient-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-primary-blue">{loadError ? 'Error cargando Google Maps' : 'Cargando...'}</p>
        </div>
      </div>
    );
  }

  // Manejar cambio de lugar en Google Places
  const handlePlaceChanged = () => {
    if (!autocompleteObj) return;
    const place = autocompleteObj.getPlace();
    if (!place.geometry?.location) return;
    
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setCoordinates({ lat, lng });
    
    setFormData(prev => ({
      ...prev,
      location: place.formatted_address || prev.location,
      lat: lat,
      lng: lng
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Igual que en EditProperty: categoría "alquiler" marca is_rent
    if (name === 'category') {
      const normalizedValue = normalizeCategory(value);
      const isRentCategory = normalizedValue.includes('alquiler');
      setFormData(prev => ({
        ...prev,
        category: normalizedValue || value,
        is_rent: isRentCategory
      }));
      return;
    }
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Si se está limpiando el campo de ubicación, resetear coordenadas
      if (name === 'location' && !value.trim()) {
        setCoordinates(null);
        setFormData(prev => ({
          ...prev,
          lat: 0,
          lng: 0
        }));
      }
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

  // Manejar selección de características múltiples
  const handleCaracteristicaChange = (caracteristica: string) => {
    const label = caracteristica.trim();
    setFormData(prev => ({
      ...prev,
      propiedades: prev.propiedades.some(p => normalizeFeature(p) === normalizeFeature(label))
        ? prev.propiedades.filter(p => normalizeFeature(p) !== normalizeFeature(label))
        : [...prev.propiedades, label]
    }));
  };

  // Filtrar características según búsqueda
  const caracteristicasFiltradas = caracteristicasDisponibles.filter(caracteristica =>
    normalizeFeature(caracteristica).includes(normalizeFeature(searchCaracteristicas))
  );

  const createPendingImages = (files: File[]) =>
    files.map((file, index) => ({
      clientId: `new-${Date.now()}-${index}-${file.name}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

  const validateImageFiles = (files: File[]) => {
    const totalFiles = pendingImages.length + files.length;

    if (totalFiles > MAX_IMAGES) {
      return `Error: Solo se pueden tener m?ximo ${MAX_IMAGES} im?genes en total. Ya tienes ${pendingImages.length}, intentas agregar ${files.length}`;
    }

    const oversizedFiles = files.filter((file) => file.size > MAX_SOURCE_IMAGE_SIZE);
    if (oversizedFiles.length > 0) {
      return 'Error: Algunas imagenes superan los 20MB. Por favor, reduce el tamano';
    }

    const invalidFiles = files.filter((file) => !VALID_IMAGE_FORMATS.includes(file.type));
    if (invalidFiles.length > 0) {
      return 'Error: Solo se permiten im?genes en formato JPG, PNG o WebP';
    }

    return null;
  };

  const appendImages = async (files: File[]) => {
    if (files.length === 0) return;

    const validationError = validateImageFiles(files);
    if (validationError) {
      setSubmitMessage(validationError);
      return;
    }

    try {
      setSubmitMessage('Optimizando imagenes para guardarlas con mejor calidad...');
      const preparedFiles = await prepareImagesForStorage(files);
      setPendingImages((prev) => [...prev, ...createPendingImages(preparedFiles)]);
      setSubmitMessage('');
    } catch (error) {
      setSubmitMessage(
        `Error: ${error instanceof Error ? error.message : 'No se pudieron preparar las imagenes'}`,
      );
    }
  };

  const movePendingImage = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    setPendingImages((prev) => {
      const sourceIndex = prev.findIndex((image) => image.clientId === sourceId);
      const targetIndex = prev.findIndex((image) => image.clientId === targetId);

      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const nextImages = [...prev];
      const [movedImage] = nextImages.splice(sourceIndex, 1);
      nextImages.splice(targetIndex, 0, movedImage);
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

  const removeImage = (clientId: string) => {
    setPendingImages((prev) => {
      const imageToRemove = prev.find((image) => image.clientId == clientId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      return prev.filter((image) => image.clientId !== clientId);
    });
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
    movePendingImage(draggedImageId, targetId);
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
      // Generar código de referencia único
      const generateRefCode = () => {
        const t = Date.now().toString(36).toUpperCase();
        const r = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `VH-${t}-${r}`;
      };

      // Preparar datos para insertar
      const normalizedCategoryValue = normalizeCategory(formData.category);
      const isRentCategory = normalizedCategoryValue.includes('alquiler');
      const eficienciaEnergetica = normalizeEnergyEfficiency(
        formData.eficiencia_energetica,
      );
      const specialStatuses = normalizeSpecialStatusFlags(formData);

      const toInsert: ViviendaInsert = {
        is_rent: isRentCategory,
        category: normalizedCategoryValue || formData.category,
        name: formData.name,
        descripcion: formData.descripcion,
        location: formData.location,
        price: isRentCategory
          ? stripRentPriceSuffix(formData.price)
          : formData.price.trim(),
        rent_price_period: isRentCategory
          ? normalizeRentPricePeriod(formData.rent_price_period)
          : null,
        metros: formData.metros,
        habitaciones: formData.habitaciones,
        bathroom: formData.bathroom,
        plantas: formData.plantas,
        propiedades: formData.propiedades,
        property_type: formData.property_type,
        reference_code: generateRefCode(),
        lat: coordinates?.lat || formData.lat,
        lng: coordinates?.lng || formData.lng,
        ...specialStatuses,
        inserted_at: new Date().toISOString(),
        eficiencia_energetica: eficienciaEnergetica
      };

      // Añadir precio anterior si existe  
      if (formData.oldprice.trim()) {
        toInsert.oldprice = isRentCategory
          ? stripRentPriceSuffix(formData.oldprice)
          : formData.oldprice.trim();
      }

      // Insertar la vivienda directamente en Supabase
      const { data: vivienda, error: insertError } = await supabase
        .from('viviendas')
        .insert(toInsert)
        .select('id')
        .single();

      if (insertError || !vivienda) {
        setSubmitMessage(`Error al crear la vivienda: ${insertError?.message}`);
        setIsSubmitting(false);
        return;
      }

      // Subir imágenes si existen
      if (pendingImages.length > 0) {
        try {
          for (const [index, image] of pendingImages.entries()) {
            const safeFileName = image.file.name.replace(/\s+/g, '-');
            const path = `viviendas/${vivienda.id}/${String(index + 1).padStart(2, '0')}-${safeFileName}`;
            
            const { error: uploadError } = await supabase.storage
              .from('propiedades-images')
              .upload(path, image.file);
            
            if (uploadError) throw uploadError;
            
            const { data } = supabase.storage
              .from('propiedades-images')
              .getPublicUrl(path);
            
            if (!data) throw new Error('No se pudo obtener la URL p?blica');
            
            const { error: imgError } = await supabase
              .from('vivienda_images')
              .insert({
                vivienda_id: vivienda.id,
                url: data.publicUrl,
                inserted_at: new Date().toISOString(),
                sort_order: index,
              });
            
            if (imgError) throw imgError;
          }
          
          setSubmitMessage(' Propiedad e imágenes creadas exitosamente');
        } catch (err) {
          setSubmitMessage(` Propiedad creada, pero error subiendo imágenes: ${(err as Error).message}`);
        }
      } else {
        setSubmitMessage('Propiedad creada exitosamente');
      }

      // Redirigir después de éxito
      setTimeout(() => {
        router.push('/propiedades');
      }, 2000);

    } catch (error) {
      console.error('Error en handleSubmit:', error);
      setSubmitMessage(`Error inesperado: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-kehre-gradient-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-primary-blue">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kehre-gradient-light">
      <Banner 
        title="Añadir Nueva Propiedad"
        subtitle="Completa la información para añadir una nueva propiedad al catálogo"
        height="small"
        showCarousel={false}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-gray/40 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-7">
            
            {/* Información básica */}
            <div className="flex items-center gap-3 pt-2">
              <span className="h-4 w-0.5 rounded-full bg-primary-blue shrink-0"></span>
              <span className="text-[11px] font-bold text-neutral-muted uppercase tracking-widest">Información básica</span>
              <span className="flex-1 h-px bg-neutral-gray/60"></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-dark mb-2">Nombre de la propiedad *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                  placeholder="Ej: Villa Mediterránea con vistas al mar"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="flex items-center gap-3 pt-2">
              <span className="h-4 w-0.5 rounded-full bg-primary-blue shrink-0"></span>
              <span className="text-[11px] font-bold text-neutral-muted uppercase tracking-widest">Descripción</span>
              <span className="flex-1 h-px bg-neutral-gray/60"></span>
            </div>
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-neutral-dark mb-2">Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2.5 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue resize-none transition-colors"
                placeholder="Describe las características principales de la propiedad..."
              />
            </div>

            {/* Precios y detalles técnicos */}
            <div className="flex items-center gap-3 pt-2">
              <span className="h-4 w-0.5 rounded-full bg-primary-blue shrink-0"></span>
              <span className="text-[11px] font-bold text-neutral-muted uppercase tracking-widest">Precios y medidas</span>
              <span className="flex-1 h-px bg-neutral-gray/60"></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {isRentPrice && (
                <div className="flex flex-col">
                  <label htmlFor="rent_price_period" className="flex min-h-[2.75rem] items-end text-sm font-medium text-neutral-dark mb-2">Periodicidad del alquiler *</label>
                  <select
                    id="rent_price_period"
                    name="rent_price_period"
                    value={formData.rent_price_period}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                  >
                    <option value="month">Por mes</option>
                    <option value="day">Por día</option>
                  </select>
                </div>
              )}
              <div className="flex flex-col">
                <label htmlFor="price" className="flex min-h-[2.75rem] items-end text-sm font-medium text-neutral-dark mb-2">Precio{isRentPrice ? ` ${rentPriceSuffix}` : ''} *
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                  placeholder={isRentPrice ? `Ej: ${rentPricePeriod === 'day' ? '120' : '750'}€ ${rentPriceSuffix}` : "Ej: 450,000€"}
                  title={isRentPrice ? `Precio ${rentPriceLabel}` : "Precio de venta"}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="oldprice" className="flex min-h-[2.75rem] items-end text-sm font-medium text-neutral-dark mb-2">Precio anterior{isRentPrice ? ` ${rentPriceSuffix}` : ''} (opcional)
                </label>
                <input
                  type="text"
                  id="oldprice"
                  name="oldprice"
                  value={formData.oldprice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                  placeholder={isRentPrice ? `Ej: ${rentPricePeriod === 'day' ? '150' : '900'}€ ${rentPriceSuffix}` : "Ej: 500,000€"}
                  title={isRentPrice ? `Precio ${rentPriceLabel} anterior` : "Precio de venta anterior"}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="metros" className="flex min-h-[2.75rem] items-end text-sm font-medium text-neutral-dark mb-2">Metros cuadrados *
                </label>
                <input
                  type="text"
                  id="metros"
                  name="metros"
                  value={formData.metros}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                  placeholder="Ej: 120 m²"
                />
              </div>
            </div>

            {/* Habitaciones y baños */}
            <div className="flex items-center gap-3 pt-2">
              <span className="h-4 w-0.5 rounded-full bg-primary-blue shrink-0"></span>
              <span className="text-[11px] font-bold text-neutral-muted uppercase tracking-widest">Datos físicos</span>
              <span className="flex-1 h-px bg-neutral-gray/60"></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <div>
                <label htmlFor="habitaciones" className="block text-sm font-medium text-neutral-dark mb-2">Habitaciones *
                </label>
                <input
                  type="number"
                  id="habitaciones"
                  name="habitaciones"
                  value={formData.habitaciones}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2.5 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                />
              </div>

              <div>
                <label htmlFor="bathroom" className="block text-sm font-medium text-neutral-dark mb-2">Baños *
                </label>
                <input
                  type="number"
                  id="bathroom"
                  name="bathroom"
                  value={formData.bathroom}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2.5 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                />
              </div>

              <div>
                <label htmlFor="plantas" className="block text-sm font-medium text-neutral-dark mb-2">Plantas *
                </label>
                <input
                  type="number"
                  id="plantas"
                  name="plantas"
                  value={formData.plantas}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2.5 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                />
              </div>

              <div>
                <label htmlFor="property_type" className="block text-sm font-medium text-neutral-dark mb-2">Tipo de vivienda *
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
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
                <label htmlFor="eficiencia_energetica" className="block text-sm font-medium text-neutral-dark mb-2">Eficiencia energetica
                </label>
                <select
                  id="eficiencia_energetica"
                  name="eficiencia_energetica"
                  value={formData.eficiencia_energetica}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
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
            <div className="flex items-center gap-3 pt-2">
              <span className="h-4 w-0.5 rounded-full bg-primary-blue shrink-0"></span>
              <span className="text-[11px] font-bold text-neutral-muted uppercase tracking-widest">Ubicación</span>
              <span className="flex-1 h-px bg-neutral-gray/60"></span>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-neutral-dark mb-2">Ubicación *
                </label>
                <Autocomplete
                  onLoad={(autocomplete) => setAutocompleteObj(autocomplete)}
                  onPlaceChanged={handlePlaceChanged}
                  options={{
                    componentRestrictions: { country: 'es' },
                    fields: ['formatted_address', 'geometry'],
                    types: ['address']
                  }}
                >
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                    placeholder="Escribe la dirección completa..."
                  />
                </Autocomplete>
              </div>

              {/* Vista previa del mapa */}
              {coordinates && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-2">Vista previa de la ubicación
                    </label>
                    <div className="h-64 rounded-xl overflow-hidden border border-neutral-gray">
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
                      <label htmlFor="lat" className="block text-sm font-medium text-neutral-dark mb-2">Latitud
                      </label>
                      <input
                        type="number"
                        step="any"
                        id="lat"
                        name="lat"
                        value={formData.lat}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue bg-neutral-light"
                        placeholder="36.6169"
                        readOnly
                      />
                    </div>

                    <div>
                      <label htmlFor="lng" className="block text-sm font-medium text-neutral-dark mb-2">Longitud
                      </label>
                      <input
                        type="number"
                        step="any"
                        id="lng"
                        name="lng"
                        value={formData.lng}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue bg-neutral-light"
                        placeholder="-4.4999"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Características y categoría */}
            <div className="flex items-center gap-3 pt-2">
              <span className="h-4 w-0.5 rounded-full bg-primary-blue shrink-0"></span>
              <span className="text-[11px] font-bold text-neutral-muted uppercase tracking-widest">Categoría y estado</span>
              <span className="flex-1 h-px bg-neutral-gray/60"></span>
            </div>
            <div className="space-y-7">
              {/* Categoría y propiedades destacadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-neutral-dark mb-2">Categoría *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                  >
                    <option value="alquiler">Alquiler</option>
                    <option value="usada">Usada</option>
                    <option value="sin-estrenar">Sin estrenar</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-neutral-dark">
                    <span className="inline-flex items-center gap-2">
                      <StarIcon className="h-4 w-4 text-neutral-muted" />
                      Propiedades especiales
                    </span>
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center"><input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={(e) => handleFeaturedChange(e.target.checked)}
                        className="mr-3 h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                      />
                      <span className="inline-flex items-center gap-2 text-sm text-neutral-dark">
                        <StarIcon className="h-4 w-4 text-primary-blue" />
                        Propiedad destacada
                      </span>
                    </label>
                    <div className="space-y-2">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-muted">
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
                          className="mr-3 h-4 w-4 border-gray-300 text-neutral-dark focus:ring-gray-500"
                        />
                        <span className="text-sm text-neutral-dark">
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
                <label className="block text-sm font-medium text-neutral-dark mb-3">Características de la propiedad
                </label>
                
                {/* Buscador de características */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchCaracteristicas}
                      onChange={(e) => setSearchCaracteristicas(e.target.value)}
                      placeholder=" Buscar características... (ej: piscina, terraza, garaje)"
                      className="w-full pl-9 pr-3 py-2 border border-neutral-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue text-sm"
                    />
                    <span className="absolute left-3 top-2.5 text-neutral-muted">
                      <MagnifyingGlassIcon className="h-4 w-4" />
                    </span>
                  </div>
                  {searchCaracteristicas && (
                    <p className="text-xs text-neutral-muted mt-1">
                      Mostrando {caracteristicasFiltradas.length} de {caracteristicasDisponibles.length} características
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto border border-neutral-gray/60 rounded-xl p-4 bg-neutral-light">
                  {caracteristicasFiltradas.map((caracteristica, index) => (
                    <label key={index} className="flex items-center cursor-pointer hover:bg-white p-2 rounded transition-colors"><input
                        type="checkbox"
                        checked={formData.propiedades.some(
                          p => normalizeFeature(p) === normalizeFeature(caracteristica)
                        )}
                        onChange={() => handleCaracteristicaChange(caracteristica)}
                        className="mr-2 h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                      />
                      <span className="text-xs text-neutral-dark">{caracteristica}</span>
                    </label>
                  ))}
                  
                  {caracteristicasFiltradas.length === 0 && searchCaracteristicas && (
                    <div className="col-span-full text-center py-4">
                      <p className="text-sm text-neutral-muted">
                        No se encontraron características que coincidan con &quot;{searchCaracteristicas}&quot;
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Mostrar características seleccionadas */}
                {formData.propiedades.length > 0 && (
                  <div className="mt-3 p-3 bg-primary-blue-light rounded-xl">
                    <p className="text-sm font-medium text-primary-blue-dark mb-2">
                      Características seleccionadas ({formData.propiedades.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.propiedades.map((prop, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-blue/10 text-primary-blue-dark">
                          {prop}
                          <button
                            type="button"
                            onClick={() => handleCaracteristicaChange(prop)}
                            className="ml-1 text-primary-blue hover:text-primary-blue-dark"
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
            <div className="flex items-center gap-3 pt-2">
              <span className="h-4 w-0.5 rounded-full bg-primary-blue shrink-0"></span>
              <span className="text-[11px] font-bold text-neutral-muted uppercase tracking-widest">Imágenes</span>
              <span className="flex-1 h-px bg-neutral-gray/60"></span>
            </div>
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-neutral-dark mb-2">
                <span className="inline-flex items-center gap-2">
                  <PhotoIcon className="h-4 w-4 text-neutral-muted" />
                  Imagenes de la propiedad (maximo 20)
                </span>
              </label>

              <div className="space-y-4">
                <div className="space-y-3">
                  <label htmlFor="images" className="cursor-pointer"><div
                      className={`w-full p-6 border-2 border-dashed rounded-xl transition-all text-center ${
                        isDragOver
                          ? 'border-primary-blue bg-primary-blue/10'
                          : 'border-primary-blue/30 bg-primary-blue-light hover:bg-primary-blue/10'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <ArrowUpTrayIcon className="h-8 w-8 text-primary-blue" />
                        <div className="text-neutral-dark font-medium">
                          {isDragOver 
                            ? 'Suelta las imagenes aqui' 
                            : pendingImages.length === 0 
                              ? 'Seleccionar imagenes' 
                              : `Agregar mas imagenes (${pendingImages.length}/${MAX_IMAGES})`
                          }
                        </div>
                        <div className="text-sm text-primary-blue">
                          {isDragOver 
                            ? 'Puedes soltar multiples imagenes a la vez' 
                            : pendingImages.length === 0
                              ? 'Haz clic aqui para seleccionar multiples imagenes a la vez'
                              : 'Selecciona mas imagenes para agregarlas al orden actual'
                          }
                        </div>
                        <div className="text-xs text-neutral-muted">
                          {isDragOver ? '' : 'o arrastra y suelta las imagenes aqui'}
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
                
                <div className="bg-primary-blue-light p-3 rounded-xl border border-primary-blue/20">
                  <p className="inline-flex items-center gap-2 text-sm text-primary-blue-dark font-medium mb-1">
                    <InformationCircleIcon className="h-4 w-4" />
                    Orden manual de imagenes
                  </p>
                  <p className="text-xs text-primary-blue">
                    Arrastra las miniaturas para fijar portada y orden final.
                  </p>
                </div>
                
                <div className="text-xs text-neutral-muted">
                  <p>· Formatos aceptados: JPG, PNG, WebP</p>
                  <p>· Tamaño maximo por imagen: 20MB (se optimizan al guardar)</p>
                  <p>· Máximo 20 imagenes por propiedad</p>
                </div>
                
                {pendingImages.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-neutral-muted">
                      <span className={`font-medium ${pendingImages.length === MAX_IMAGES ? 'text-amber-600' : 'text-primary-blue'}`}>
                        {pendingImages.length} de {MAX_IMAGES} imagenes seleccionadas
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
                        setPendingImages([]);
                        setSubmitMessage('');
                      }}
                      className="text-xs px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      title="Eliminar todas las imagenes"
                    >
                      <span className="inline-flex items-center gap-2">
                        <TrashIcon className="h-4 w-4" />
                        Limpiar todas
                      </span>
                    </button>
                  </div>
                )}
              </div>
              
              {pendingImages.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-neutral-dark">
                      Orden de visualizacion ({pendingImages.length}):
                    </h4>
                    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-muted">
                      <Bars3Icon className="h-3 w-3" />
                      Arrastra para reordenar
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {pendingImages.map((image, index) => (
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
                            ? 'border-primary-blue opacity-70 scale-[0.98] rotate-1 shadow-xl'
                            : dragOverImageId === image.clientId
                              ? 'border-primary-blue/50 -translate-y-1 scale-[1.03] shadow-lg ring-2 ring-primary-blue/20'
                              : recentlyMovedImageId === image.clientId
                                ? 'border-primary-blue/30 shadow-md ring-2 ring-primary-blue/10'
                                : 'border-neutral-gray/50 hover:border-primary-blue/30 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
                          <Bars3Icon className="h-3 w-3" />
                          {index + 1}
                        </div>
                        {index === 0 && (
                          <div className="absolute right-3 top-3 z-10 rounded-full bg-primary-blue px-2 py-1 text-[11px] font-semibold text-white">
                            Portada
                          </div>
                        )}
                        <NextImage
                          src={image.previewUrl}
                          alt={`Preview ${index + 1}`}
                          width={320}
                          height={205}
                          quality={95}
                          className="w-full h-32 object-cover rounded-xl border border-neutral-gray/50"
                        />
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-neutral-muted" title={image.file.name}>
                            {image.file.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeImage(image.clientId)}
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
                className={`p-4 rounded-xl text-center border ${
                  isSubmitError
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-primary-green-light text-primary-green-dark border-primary-green/30'
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

            {/* Botones */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-white text-neutral-dark py-3 px-6 rounded-xl font-semibold border border-neutral-gray hover-bg-neutral-light transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowLeftIcon className="h-4 w-4" />
                  Cancelar
                </span>
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary-blue text-white py-3 px-6 rounded-xl font-semibold hover-bg-primary-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Creando...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <ArrowUpTrayIcon className="h-4 w-4" />
                    Crear Propiedad
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
