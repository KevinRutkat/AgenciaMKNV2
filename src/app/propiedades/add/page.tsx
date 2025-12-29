'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { Autocomplete, GoogleMap, Marker } from '@react-google-maps/api';
import Banner from '@/components/Banner';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { supabase } from '@/lib/supabase';
import { FEATURES, normalizeFeature } from '@/lib/features';
import {
  MagnifyingGlassIcon,
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
  inserted_at: string;
  oldprice?: string;
}

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
    plantas: 1,
    is_featured: false,
    category: 'usada'
  });

  // Lista de características desde constantes compartidas
  const caracteristicasDisponibles = FEATURES.map((f) => f.label);

  // Estado para las imágenes
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Estado para el envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Estado para buscador de características
  const [searchCaracteristicas, setSearchCaracteristicas] = useState('');

  // Estado para drag & drop
  const [isDragOver, setIsDragOver] = useState(false);
  const isSubmitError = submitMessage.toLowerCase().includes('error');

  // Redirigir si no está autenticado
  if (!loading && !user) {
    router.push('/session');
    return null;
  }

  // Mostrar loading si Google Maps no está cargado o hay error
  if (!isLoaded || loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-600">{loadError ? 'Error cargando Google Maps' : 'Cargando...'}</p>
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
      setFormData(prev => ({
        ...prev,
        category: value,
        is_rent: value === 'alquiler'
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = images.length + newFiles.length;
      
      // Validar número máximo de imágenes total (20)
      if (totalFiles > 20) {
        setSubmitMessage(`Error: Solo se pueden tener máximo 20 imágenes en total. Ya tienes ${images.length}, intentas agregar ${newFiles.length}`);
        return;
      }
      
      // Validar tamaño de archivos (máximo 5MB por imagen)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = newFiles.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        setSubmitMessage('Error: Algunas imágenes superan los 5MB. Por favor, reduce el tamaño');
        return;
      }
      
      // Validar formato de imágenes
      const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const invalidFiles = newFiles.filter(file => !validFormats.includes(file.type));
      if (invalidFiles.length > 0) {
        setSubmitMessage('Error: Solo se permiten imágenes en formato JPG, PNG o WebP');
        return;
      }
      
      // Si no hay imágenes previas, usar las nuevas. Si ya hay, combinarlas
      const allImages = images.length === 0 ? newFiles : [...images, ...newFiles];
      setImages(allImages);
      setSubmitMessage(''); // Limpiar mensaje de error anterior
      
      // Crear URLs de preview
      if (images.length === 0) {
        // Si no hay imágenes previas, crear todas las URLs
        const urls = newFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
      } else {
        // Si ya hay imágenes, agregar las nuevas URLs
        const newUrls = newFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newUrls]);
      }
    }
    
    // Limpiar el input para permitir seleccionar los mismos archivos otra vez
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // Liberar la URL del objeto
    URL.revokeObjectURL(previewUrls[index]);
    
    setImages(newImages);
    setPreviewUrls(newUrls);
  };

  // Funciones para drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    // Filtrar solo archivos de imagen
    const imageFiles = files.filter(file => {
      const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      return validFormats.includes(file.type);
    });
    
    if (imageFiles.length === 0) {
      setSubmitMessage('Error: Solo se permiten imágenes en formato JPG, PNG o WebP');
      return;
    }
    
    // Usar la misma lógica que handleImageChange
    const totalFiles = images.length + imageFiles.length;
    
    if (totalFiles > 20) {
      setSubmitMessage(`Error: Solo se pueden tener máximo 20 imágenes en total. Ya tienes ${images.length}, intentas agregar ${imageFiles.length}`);
      return;
    }
    
    // Validar tamaño de archivos
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = imageFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setSubmitMessage('Error: Algunas imágenes superan los 5MB. Por favor, reduce el tamaño');
      return;
    }
    
    // Si no hay imágenes previas, reemplazar todas
    if (images.length === 0) {
      setImages(imageFiles);
      setSubmitMessage('');
      
      // Crear URLs de preview
      const urls = imageFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    } else {
      // Si ya hay imágenes, agregarlas
      const allImages = [...images, ...imageFiles];
      setImages(allImages);
      setSubmitMessage('');
      
      // Crear nuevas URLs de preview
      const newUrls = imageFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newUrls]);
    }
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
      const toInsert: ViviendaInsert = {
        is_rent: formData.category === 'alquiler',
        category: formData.category,
        name: formData.name,
        descripcion: formData.descripcion,
        location: formData.location,
        price: formData.price,
        metros: formData.metros,
        habitaciones: formData.habitaciones,
        bathroom: formData.bathroom,
        plantas: formData.plantas,
        propiedades: formData.propiedades,
        property_type: formData.property_type,
        reference_code: generateRefCode(),
        lat: coordinates?.lat || formData.lat,
        lng: coordinates?.lng || formData.lng,
        is_featured: formData.is_featured,
        inserted_at: new Date().toISOString()
      };

      // Añadir precio anterior si existe  
      if (formData.oldprice.trim()) {
        toInsert.oldprice = formData.oldprice.trim();
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
      if (images.length > 0) {
        try {
          await Promise.all(
            images.map(async (file) => {
              const path = `viviendas/${vivienda.id}/${file.name}`;
              
              // Subir archivo a Supabase Storage
              const { error: uploadError } = await supabase.storage
                .from('propiedades-images')
                .upload(path, file);
              
              if (uploadError) throw uploadError;
              
              // Obtener URL pública
              const { data } = supabase.storage
                .from('propiedades-images')
                .getPublicUrl(path);
              
              if (!data) throw new Error('No se pudo obtener la URL pública');
              
              // Insertar referencia en la tabla de imágenes
              const { error: imgError } = await supabase
                .from('vivienda_images')
                .insert({
                  vivienda_id: vivienda.id,
                  url: data.publicUrl,
                  inserted_at: new Date().toISOString()
                });
              
              if (imgError) throw imgError;
            })
          );
          
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
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <Banner 
        title="Añadir Nueva Propiedad"
        subtitle="Completa la información para añadir una nueva propiedad al catálogo"
        height="small"
        showCarousel={false}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nombre de la propiedad *
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
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">Descripción *
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Precio *
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Ej: €450,000"
                />
              </div>

              <div>
                <label htmlFor="oldprice" className="block text-sm font-medium text-gray-700 mb-2">Precio anterior (opcional)
                </label>
                <input
                  type="text"
                  id="oldprice"
                  name="oldprice"
                  value={formData.oldprice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Ej: €500,000"
                />
              </div>

              <div>
                <label htmlFor="metros" className="block text-sm font-medium text-gray-700 mb-2">Metros cuadrados *
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="habitaciones" className="block text-sm font-medium text-gray-700 mb-2">Habitaciones *
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
                <label htmlFor="bathroom" className="block text-sm font-medium text-gray-700 mb-2">Baños *
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
                <label htmlFor="plantas" className="block text-sm font-medium text-gray-700 mb-2">Plantas *
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
                <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-2">Tipo de vivienda *
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
            </div>

            {/* Ubicación con Google Maps */}
            <div className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Ubicación *
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Escribe la dirección completa..."
                  />
                </Autocomplete>
              </div>

              {/* Vista previa del mapa */}
              {coordinates && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vista previa de la ubicación
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
                      <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-2">Latitud
                      </label>
                      <input
                        type="number"
                        step="any"
                        id="lat"
                        name="lat"
                        value={formData.lat}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
                        placeholder="36.6169"
                        readOnly
                      />
                    </div>

                    <div>
                      <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-2">Longitud
                      </label>
                      <input
                        type="number"
                        step="any"
                        id="lng"
                        name="lng"
                        value={formData.lng}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
                        placeholder="-4.4999"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Características y categoría */}
            <div className="space-y-6">
              {/* Categoría y propiedades destacadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Categoría *
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
                    <span className="inline-flex items-center gap-2">
                      <StarIcon className="h-4 w-4 text-gray-500" />
                      Propiedades especiales
                    </span>
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center"><input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                        className="mr-3 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <StarIcon className="h-4 w-4 text-teal-600" />
                        Propiedad destacada
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Características de la propiedad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Características de la propiedad
                </label>
                
                {/* Buscador de características */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchCaracteristicas}
                      onChange={(e) => setSearchCaracteristicas(e.target.value)}
                      placeholder=" Buscar características... (ej: piscina, terraza, garaje)"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">
                      <MagnifyingGlassIcon className="h-4 w-4" />
                    </span>
                  </div>
                  {searchCaracteristicas && (
                    <p className="text-xs text-gray-500 mt-1">
                      Mostrando {caracteristicasFiltradas.length} de {caracteristicasDisponibles.length} características
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {caracteristicasFiltradas.map((caracteristica, index) => (
                    <label key={index} className="flex items-center cursor-pointer hover:bg-white p-2 rounded transition-colors"><input
                        type="checkbox"
                        checked={formData.propiedades.some(
                          p => normalizeFeature(p) === normalizeFeature(caracteristica)
                        )}
                        onChange={() => handleCaracteristicaChange(caracteristica)}
                        className="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <span className="text-xs text-gray-700">{caracteristica}</span>
                    </label>
                  ))}
                  
                  {caracteristicasFiltradas.length === 0 && searchCaracteristicas && (
                    <div className="col-span-full text-center py-4">
                      <p className="text-sm text-gray-500">
                        No se encontraron características que coincidan con &quot;{searchCaracteristicas}&quot;
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Mostrar características seleccionadas */}
                {formData.propiedades.length > 0 && (
                  <div className="mt-3 p-3 bg-teal-50 rounded-lg">
                    <p className="text-sm font-medium text-teal-800 mb-2">
                      Características seleccionadas ({formData.propiedades.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.propiedades.map((prop, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                          {prop}
                          <button
                            type="button"
                            onClick={() => handleCaracteristicaChange(prop)}
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

            {/* Imágenes */}
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="inline-flex items-center gap-2">
                  <PhotoIcon className="h-4 w-4 text-gray-500" />
                  Imágenes de la propiedad (máximo 20)
                </span>
              </label>
              
              <div className="space-y-4">
                {/* Input principal para seleccionar múltiples imágenes */}
                <div className="space-y-3">
                  {/* Botón estilizado para seleccionar imágenes con drag & drop */}
                  <label htmlFor="images" className="cursor-pointer"><div 
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
                            ? 'Suelta las imágenes aquí' 
                            : images.length === 0 
                              ? 'Seleccionar imágenes' 
                              : `Agregar más imágenes (${images.length}/20)`
                          }
                        </div>
                        <div className="text-sm text-teal-600">
                          {isDragOver 
                            ? 'Puedes soltar múltiples imágenes a la vez' 
                            : images.length === 0
                              ? 'Haz clic aquí para seleccionar múltiples imágenes a la vez'
                              : 'Selecciona más imágenes para agregar a las existentes'
                          }
                        </div>
                        <div className="text-xs text-teal-500">
                          {isDragOver ? '' : 'o arrastra y suelta las imágenes aquí'}
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
                    Funcionalidad mejorada de selección de imágenes
                  </p>
                  <p className="text-xs text-blue-600">
                    • Selecciona múltiples imágenes manteniendo <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Ctrl</kbd> (Windows) o <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Cmd</kbd> (Mac)<br/>
                    • Arrastra y suelta varias imágenes a la vez<br/>
                    • Puedes volver a seleccionar más imágenes cuando quieras agregar adicionales
                  </p>
                </div>
                
                <div className="text-xs text-gray-500">
                  <p>• Formatos aceptados: JPG, PNG, WebP</p>
                  <p>• Tamaño máximo por imagen: 5MB</p>
                  <p>• Máximo 20 imágenes por propiedad</p>
                  <p>• <strong>Siempre puedes agregar más imágenes usando el área de selección</strong></p>
                </div>
                
                {/* Contador de imágenes y botón de limpiar */}
                {images.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className={`font-medium ${images.length === 20 ? 'text-amber-600' : 'text-teal-600'}`}>
                        {images.length} de 20 imágenes seleccionadas
                      </span>
                      {images.length === 20 && (
                        <span className="text-amber-600 ml-2"> Límite máximo alcanzado</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        // Liberar todas las URLs
                        previewUrls.forEach(url => URL.revokeObjectURL(url));
                        setImages([]);
                        setPreviewUrls([]);
                        setSubmitMessage('');
                      }}
                      className="text-xs px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      title="Eliminar todas las imágenes"
                    >
                      <span className="inline-flex items-center gap-2">
                        <TrashIcon className="h-4 w-4" />
                        Limpiar todas
                      </span>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Preview de imágenes */}
              {previewUrls.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Vista previa de imágenes ({images.length}):
                    </h4>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                      <XMarkIcon className="h-3 w-3" />
                      Haz clic en el icono para eliminar una imagen individual
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <NextImage
                          src={url}
                          alt={`Preview ${index + 1}`}
                          width={200}
                          height={128}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar imagen"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mensaje de estado */}
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

            {/* Botones */}
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
