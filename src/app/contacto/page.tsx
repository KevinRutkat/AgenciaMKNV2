'use client'

import { useState } from 'react';
import Banner from '@/components/Banner';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useMultipleTranslations } from '@/hooks/useTranslation';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

export default function ContactoPage() {
  // Google Maps desde contexto global
  const { isLoaded, loadError } = useGoogleMaps()

  // Coordenadas de la Agencia MKN en Cabo de Palos
  // Ctra. a Cabo de Palos, Km. 25, 30370 Cabo de Palos, Murcia
  const agencyLocation = {
    lat: 37.627368, // Coordenadas exactas de la Agencia MKN
    lng: -0.710618
  };

  // Estado para manejar los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    motivo: ''
  });

  // Estado para manejar el envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Función para manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitMessage(successMessage);
        setFormData({
          nombre: '',
          correo: '',
          telefono: '',
          motivo: ''
        });
      } else {
        const errorData = await response.json();
        setSubmitMessage(errorData.error || errorMessage);
      }
    } catch {
      setSubmitMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Traducciones de la página de contacto
  const textsToTranslate = [
    // Banner
    "📞 Contáctanos",
    "Estamos aquí para ayudarte a encontrar la propiedad de tus sueños. No dudes en contactarnos para cualquier consulta.",
    
    // Formulario
    "📝 Envíanos un mensaje",
    "👤 Nombre completo *",
    "Ingresa tu nombre completo",
    "📧 Correo electrónico *",
    "tu@email.com",
    "📱 Número de teléfono *",
    "+34 123 456 789",
    "💬 Motivo del contacto *",
    "Describe el motivo de tu contacto (compra, venta, alquiler, valoración, etc.)",
    "📤 Enviando...",
    "📩 Enviar mensaje",
    
    // Mensajes de estado
    "¡Gracias por contactarnos! Tu mensaje ha sido enviado  y te responderemos pronto.",
    "Error al enviar el mensaje. Por favor intenta de nuevo.",
    
    // Información de contacto
    "🏢 Nuestra oficina",
    "Correo electrónico",
    "Teléfono",
    "Dirección",
    "Ctra. a Cabo de Palos, Km. 25",
    "30370 Cabo de Palos",
    "Murcia, España",
    "Horario de atención",
    "Lunes a Sábado: 12:00 - 17:00",
    "Domingos: Cerrado",
    
    // Mapa
    "🗺️ Ubicación",
    "Error cargando el mapa",
    "Cargando mapa...",
    "🔗 Ver en Google Maps"
  ]

  const [
    // Banner
    bannerTitle,
    bannerSubtitle,
    
    // Formulario
    formTitle,
    nombreLabel,
    nombrePlaceholder,
    correoLabel,
    correoPlaceholder,
    telefonoLabel,
    telefonoPlaceholder,
    motivoLabel,
    motivoPlaceholder,
    enviandoText,
    enviarText,
    
    // Mensajes de estado
    successMessage,
    errorMessage,
    
    // Información de contacto
    oficinaTitle,
    correoInfoLabel,
    telefonoInfoLabel,
    direccionLabel,
    direccion1,
    direccion2,
    direccion3,
    horarioLabel,
    horario1,
    horario2,
    
    // Mapa
    ubicacionTitle,
    errorCargandoMapa,
    cargandoMapa,
    mapaLink
  ] = useMultipleTranslations(textsToTranslate)

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Banner Component */}
      <Banner 
        title={bannerTitle}
        subtitle={bannerSubtitle}
        height="medium"
        showCarousel={false}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Formulario de Contacto */}
          <div className="bg-white rounded-2xl shadow-xl p-6 h-fit">
            <h2 className="text-2xl font-bold text-teal-800 mb-4">
              {formTitle}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Campo Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  {nombreLabel}
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder={nombrePlaceholder}
                />
              </div>

              {/* Campo Correo */}
              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                  {correoLabel}
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder={correoPlaceholder}
                />
              </div>

              {/* Campo Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  {telefonoLabel}
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder={telefonoPlaceholder}
                />
              </div>

              {/* Campo Motivo */}
              <div>
                <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
                  {motivoLabel}
                </label>
                <textarea
                  id="motivo"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
                  placeholder={motivoPlaceholder}
                />
              </div>

              {/* Botón de envío */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-2.5 px-6 rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {isSubmitting ? enviandoText : enviarText}
                </button>
              </div>

              {/* Mensaje de estado */}
              {submitMessage && (
                <div className={`p-3 rounded-lg text-center text-sm ${
                  submitMessage.includes('Error') 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {submitMessage}
                </div>
              )}
            </form>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-6">
            {/* Información de la empresa */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-teal-800 mb-4">
                {oficinaTitle}
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 text-xl flex-shrink-0">📧</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{correoInfoLabel}</h3>
                    <p className="text-gray-600 text-sm">marionrutkat@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 text-xl flex-shrink-0">📞</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{telefonoInfoLabel}</h3>
                    <p className="text-gray-600 text-sm">+34 634 73 79 49</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 text-xl flex-shrink-0">📍</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{direccionLabel}</h3>
                    <p className="text-gray-600 text-sm">{direccion1}</p>
                    <p className="text-gray-600 text-sm">{direccion2}</p>
                    <p className="text-gray-600 text-sm">{direccion3}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 text-xl flex-shrink-0">🕒</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{horarioLabel}</h3>
                    <p className="text-gray-600 text-sm">{horario1}</p>
                    <p className="text-gray-600 text-sm">{horario2}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-teal-800 mb-4">
                {ubicacionTitle}
              </h2>
              
              {/* Google Maps */}
              <div className="relative h-64 rounded-lg overflow-hidden shadow-md">
                {isLoaded && !loadError ? (
                  <GoogleMap
                    mapContainerStyle={{ height: '100%', width: '100%' }}
                    zoom={15}
                    center={agencyLocation}
                    options={{
                      disableDefaultUI: false,
                      zoomControl: true,
                      streetViewControl: true,
                      mapTypeControl: true,
                      fullscreenControl: true,
                      gestureHandling: 'cooperative', // Mejor para móviles
                    }}
                  >
                    <Marker 
                      position={agencyLocation}
                      title="Agencia MKN - Inmobiliaria y Servicios de Traducción"
                    />
                  </GoogleMap>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-100 to-blue-200 flex items-center justify-center">
                    <div className="text-center text-teal-700">
                      <div className="text-3xl mb-4">🗺️</div>
                      <p className="text-lg font-semibold">
                        {loadError ? errorCargandoMapa : cargandoMapa}
                      </p>
                      <p className="text-sm opacity-70">Cabo de Palos, Cartagena</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-3 text-center">
                <a 
                  href="https://maps.google.com/?q=Agencia+MKN+Cabo+de+Palos+Murcia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                >
                  {mapaLink}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
