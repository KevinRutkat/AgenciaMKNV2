'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Autocomplete, GoogleMap, Marker } from '@react-google-maps/api';
import Banner from '@/components/Banner';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { supabase } from '@/lib/supabase';
import { FEATURES, normalizeFeature } from '@/lib/features';

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
    plantas: 1,
    is_featured: false,
    category: 'usada',
    is_sold: false, // NUEVO CAMPO
  });

  // Lista de características desde constantes compartidas
  const caracteristicasDisponibles = FEATURES.map((f) =>
    `${f.emoji ?? ''} ${f.label}`.trim(),
  );

  // Estado para las imágenes
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<
    Array<{ id: number; url: string }>
  >([]);

  // Estado para el envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Estado para buscador de características
  const [searchCaracteristicas, setSearchCaracteristicas] = useState('');

  // Estado para drag & drop
  const [isDragOver, setIsDragOver] = useState(false);

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
          '❌ Error al cargar la propiedad: ' + viviendaError.message,
        );
        return;
      }

      if (!vivienda) {
        console.error('Property not found with ID:', propertyId);
        setSubmitMessage(
          '❌ No se encontró la propiedad con ID: ' + propertyId,
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

        const isSoldFromDb = !!vivienda.is_sold;
        const isFeaturedFromDb = !!vivienda.is_featured;

        setFormData({
          name: vivienda.name || '',
          descripcion: vivienda.descripcion || '',
          price: vivienda.price || '',
          oldprice: vivienda.oldprice || '',
          metros: vivienda.metros || '',
          habitaciones: vivienda.habitaciones || 1,
          bathroom: vivienda.bathroom || 1,
          location: vivienda.location || '',
          lat: vivienda.lat || 0,
          lng: vivienda.lng || 0,
          property_type: vivienda.property_type || 'apartamento',
          propiedades: propiedadesCanonicas,
          is_rent: vivienda.is_rent || false,
          plantas: vivienda.plantas || 1,
          // 👇 Si está vendida, forzamos destacado a false
          is_featured: isSoldFromDb ? false : isFeaturedFromDb,
          category: vivienda.category
            ? String(vivienda.category).toLowerCase()
            : 'usada',
          is_sold: isSoldFromDb,
        });

        if (vivienda.lat && vivienda.lng) {
          setCoordinates({ lat: vivienda.lat, lng: vivienda.lng });
        }
      }

      const { data: images, error: imagesError } = await supabase
        .from('vivienda_images')
        .select('*')
        .eq('vivienda_id', propertyId);

      if (!imagesError && images) {
        setExistingImages(images);
      }
    } catch (error) {
      console.error('Error loading property data:', error);
      setSubmitMessage(
        `❌ Error al cargar los datos de la propiedad: ${
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
    const label = caracteristica.replace(/^[^\p{L}\p{N}]\s*/u, '').trim();
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
      setFormData((prev) => ({
        ...prev,
        category: value,
        is_rent: value === 'alquiler',
      }));
      return;
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;

      // 🔁 Mutua exclusión: Destacado vs Vendido
      if (name === 'is_sold') {
        setFormData((prev) => ({
          ...prev,
          is_sold: checked,
          is_featured: checked ? false : prev.is_featured,
        }));
        return;
      }

      if (name === 'is_featured') {
        setFormData((prev) => ({
          ...prev,
          is_featured: checked,
          is_sold: checked ? false : prev.is_sold,
        }));
        return;
      }

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = images.length + newFiles.length;

      if (totalFiles > 20) {
        setSubmitMessage(
          `❌ Error: Solo se pueden tener máximo 20 imágenes en total. Ya tienes ${images.length}, intentas agregar ${newFiles.length}`,
        );
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      const oversizedFiles = newFiles.filter((file) => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        setSubmitMessage(
          '❌ Error: Algunas imágenes superan los 5MB. Por favor, reduce el tamaño',
        );
        return;
      }

      const validFormats = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      const invalidFiles = newFiles.filter(
        (file) => !validFormats.includes(file.type),
      );
      if (invalidFiles.length > 0) {
        setSubmitMessage(
          '❌ Error: Solo se permiten imágenes en formato JPG, PNG o WebP',
        );
        return;
      }

      const allImages =
        images.length === 0 ? newFiles : [...images, ...newFiles];
      setImages(allImages);
      setSubmitMessage('');

      if (images.length === 0) {
        const urls = newFiles.map((file) => URL.createObjectURL(file));
        setPreviewUrls(urls);
      } else {
        const newUrls = newFiles.map((file) => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newUrls]);
      }
    }

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    URL.revokeObjectURL(previewUrls[index]);
    setImages(newImages);
    setPreviewUrls(newUrls);
  };

  const removeExistingImage = async (imageId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vivienda_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        alert('Error al eliminar la imagen');
        return;
      }

      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      alert('Error al eliminar la imagen');
    }
  };

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

    const imageFiles = files.filter((file) => {
      const validFormats = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      return validFormats.includes(file.type);
    });

    if (imageFiles.length === 0) {
      setSubmitMessage(
        '❌ Error: Solo se permiten imágenes en formato JPG, PNG o WebP',
      );
      return;
    }

    const totalFiles = images.length + imageFiles.length;

    if (totalFiles > 20) {
      setSubmitMessage(
        `❌ Error: Solo se pueden tener máximo 20 imágenes en total. Ya tienes ${images.length}, intentas agregar ${imageFiles.length}`,
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = imageFiles.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setSubmitMessage(
        '❌ Error: Algunas imágenes superan los 5MB. Por favor, reduce el tamaño',
      );
      return;
    }

    if (images.length === 0) {
      setImages(imageFiles);
      setSubmitMessage('');
      const urls = imageFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    } else {
      const allImages = [...images, ...imageFiles];
      setImages(allImages);
      setSubmitMessage('');
      const newUrls = imageFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newUrls]);
    }
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
        setSubmitMessage('❌ Error: No hay sesión activa');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/propiedades', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: propertyId,
          ...formData,
          propiedades: formData.propiedades,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSubmitMessage(`❌ Error: ${errorData.error}`);
        return;
      }

      if (images.length > 0) {
        try {
          const viviendaId = Number(propertyId);

          await Promise.all(
            images.map(async (file) => {
              const path = `viviendas/${viviendaId}/${Date.now()}-${file.name}`;

              const { error: uploadError } = await supabase.storage
                .from('propiedades-images')
                .upload(path, file);

              if (uploadError) throw uploadError;

              const { data } = supabase.storage
                .from('propiedades-images')
                .getPublicUrl(path);

              if (!data?.publicUrl) {
                throw new Error('No se pudo obtener la URL pública');
              }

              const { error: imgError } = await supabase
                .from('vivienda_images')
                .insert({
                  vivienda_id: viviendaId,
                  url: data.publicUrl,
                  inserted_at: new Date().toISOString(),
                });

              if (imgError) throw imgError;
            }),
          );

          setExistingImages((prev) => [
            ...prev,
            ...images.map((file, index) => ({
              id: Date.now() + index,
              url: URL.createObjectURL(file),
            })),
          ]);
        } catch (err) {
          console.error('Error subiendo imágenes nuevas', err);
          setSubmitMessage(
            '⚠️ Propiedad actualizada, pero hubo un error subiendo las nuevas imágenes',
          );
        }
      }

      setSubmitMessage('✅ Propiedad actualizada exitosamente');

      setTimeout(() => {
        router.push('/propiedades');
      }, 2000);
    } catch (error) {
      setSubmitMessage(`❌ Error al actualizar la propiedad: ${error}`);
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
        title="✏️ Editar Propiedad"
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
                  🏠 Nombre de la propiedad *
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
                📝 Descripción *
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
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  💰 Precio *
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
                <label
                  htmlFor="oldprice"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  💸 Precio anterior (opcional)
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
                <label
                  htmlFor="metros"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  📐 Metros cuadrados *
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
                <label
                  htmlFor="habitaciones"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  🛏️ Habitaciones *
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
                  🚿 Baños *
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
                  🏗️ Plantas *
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
                  🏠 Tipo de vivienda *
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
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  📍 Ubicación *
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
                      🗺️ Vista previa de la ubicación
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
                        🌐 Latitud
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
                        🌐 Longitud
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
                    🏷️ Categoría *
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
                    ⭐ Propiedades especiales
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                        className="mr-3 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        🌟 Propiedad destacada
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_sold"
                        checked={formData.is_sold}
                        onChange={handleInputChange}
                        className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        🔴 Vendido
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Características de la propiedad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🏡 Características de la propiedad
                </label>

                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchCaracteristicas}
                      onChange={(e) =>
                        setSearchCaracteristicas(e.target.value)
                      }
                      placeholder="🔍 Buscar características... (ej: piscina, terraza, garaje)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
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
                            ✕
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📸 Gestión de imágenes
              </label>

              {existingImages.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Imágenes actuales ({existingImages.length}):
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {existingImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <Image
                          src={image.url}
                          alt="Imagen de la propiedad"
                          width={200}
                          height={128}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(image.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar imagen"
                        >
                          ✕
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          Actual
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                        <div className="text-3xl">📸</div>
                        <div className="text-teal-700 font-medium">
                          {isDragOver
                            ? 'Suelta las imágenes aquí'
                            : images.length === 0
                            ? 'Añadir nuevas imágenes'
                            : `Agregar más imágenes (${images.length}/20)`}
                        </div>
                        <div className="text-sm text-teal-600">
                          {isDragOver
                            ? 'Puedes soltar múltiples imágenes a la vez'
                            : images.length === 0
                            ? 'Haz clic aquí para seleccionar múltiples imágenes a la vez'
                            : 'Selecciona más imágenes para agregar a las nuevas'}
                        </div>
                        <div className="text-xs text-teal-500">
                          {isDragOver
                            ? ''
                            : 'o arrastra y suelta las imágenes aquí'}
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
                  <p className="text-sm text-blue-700 font-medium mb-1">
                    💡 Funcionalidad mejorada de selección de imágenes
                  </p>
                  <p className="text-xs text-blue-600">
                    • Selecciona múltiples imágenes manteniendo{' '}
                    <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">
                      Ctrl
                    </kbd>{' '}
                    (Windows) o{' '}
                    <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">
                      Cmd
                    </kbd>{' '}
                    (Mac)
                    <br />
                    • Arrastra y suelta varias imágenes a la vez
                    <br />
                    • Puedes volver a seleccionar más imágenes cuando
                    quieras agregar adicionales
                    <br />
                    • Las imágenes existentes se mantienen, solo agregas
                    nuevas
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  <p>• Formatos aceptados: JPG, PNG, WebP</p>
                  <p>• Tamaño máximo por imagen: 5MB</p>
                  <p>• Máximo 20 imágenes por propiedad (incluyendo existentes)</p>
                  <p>
                    • <strong>Siempre puedes agregar más imágenes usando el área de selección</strong>
                  </p>
                </div>

                {images.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span
                        className={`font-medium ${
                          images.length === 20
                            ? 'text-amber-600'
                            : 'text-teal-600'
                        }`}
                      >
                        {images.length} nuevas imágenes seleccionadas
                      </span>
                      {existingImages.length + images.length === 20 && (
                        <span className="text-amber-600 ml-2">
                          ⚠️ Límite máximo alcanzado
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        previewUrls.forEach((url) => URL.revokeObjectURL(url));
                        setImages([]);
                        setPreviewUrls([]);
                        setSubmitMessage('');
                      }}
                      className="text-xs px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      title="Eliminar todas las imágenes nuevas"
                    >
                      🗑️ Limpiar nuevas
                    </button>
                  </div>
                )}
              </div>

              {previewUrls.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Vista previa de nuevas imágenes ({images.length}):
                    </h4>
                    <span className="text-xs text-gray-500">
                      Haz clic en ✕ para eliminar una imagen individual
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={url}
                          alt={`Nueva imagen ${index + 1}`}
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
                          ✕
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          Nueva {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {submitMessage && (
              <div
                className={`p-4 rounded-lg text-center ${
                  submitMessage.includes('Error') ||
                  submitMessage.includes('❌')
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}
              >
                {submitMessage}
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                ⬅️ Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? '📤 Actualizando...' : '✅ Actualizar Propiedad'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
