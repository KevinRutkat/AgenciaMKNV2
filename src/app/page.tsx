'use client'

import Banner from '@/components/Banner'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useMultipleTranslations } from '@/hooks/useTranslation'
import { useGoogleMaps } from '@/contexts/GoogleMapsContext'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Google Maps desde contexto global
  const { isLoaded, loadError } = useGoogleMaps()

  // Traducciones para el contenido principal  
  const textsToTranslate = [
    "Agencia Inmobiliaria y Servicios de Traducción en Cabo de Palos",
    "Gestión inmobiliaria profesional y servicios de traducción especializada en La Manga, Cartagena y Alicante. Tu agencia de confianza para compra, venta, alquiler de propiedades y traducción de todo tipo.",
    "Ver Propiedades",
    "Ver Servicios",
    "🏡 Sobre Agencia MKN",
    "Agencia MKN es una inmobiliaria especializada en vivienda a lo largo de Cabo de Palos, Cartagena y Alicante. Nos dedicamos a ayudar y apoyar a nuestros clientes en todas sus gestiones inmobiliarias, desde la busqueda de la vivienda hasta la firma del contrato convirtiendonos en una agencia completa y profesional.",
    "Ubicados estratégicamente en Cabo de Palos, ofrecemos gestión inmobiliaria integral: compraventa, alquiler, documentación, asesoramiento legal y acompañamiento personalizado durante todo el proceso.",
    "Como agencia ubicada en una zona multicultural, también destacamos por nuestros servicios de traducción profesional en español, alemán e inglés. Ofrecemos traducción presencial y especializada varios ambitos como pueden ser gestiones administrativas, cuestiones medicas y procedimientos legales.",
    "📍 Nuestra Ubicación",
    "🌊 Cabo de Palos, Cartagena",
    "Ubicados en el privilegiado enclave de Cabo de Palos, conocido por sus aguas cristalinas y su proximidad a la Reserva Marina de Islas Hormigas, ofrecemos las mejores oportunidades inmobiliarias en La Manga del Mar Menor y toda la región de Cartagena.",
    "En Agencia MKN, nuestro mayor valor es la relación de confianza que establecemos con cada cliente. Nos comprometemos a ofrecer una experiencia inequíparable, basada en la transparencia, la profesionalidad y el trato cercano que nos caracteriza, acompañándote durante todo el proceso inmobiliario.",
    "Dirección:",
    "Ctra. a Cabo de Palos, Km. 25, 30370 Cabo de Palos, Murcia",
    "Teléfono:",
    "Email:",
    "Horario:",
    "Error cargando el mapa",
    "Cargando mapa...",
    "🔗 Ver en Google Maps",
    "⭐ Nuestros Servicios",
    "Gestión Inmobiliaria Integral",
    "Gestión completa de compraventa y alquiler. Nos encargamos de todos los trámites, documentación, asesoramiento legal y acompañamiento personalizado durante todo el proceso.",
    "Servicios de Traducción",
    "Traducción profesional en español, alemán e inglés. Ofrecemos traducción en gestiones oficiales como Hacienda o Ayuntamientos, servicios notariales, traducción médica y hospitalaria, así como traducción presencial en reuniones y documentos inmobiliarios.",
    "¿Necesitas más información sobre nuestros servicios?",
    "📞 ¿Quieres contactar con nosotros?",
    "Estamos aquí para ayudarte con tus necesidades inmobiliarias y de traducción",
    "Contáctanos"
  ];

  const translations = useMultipleTranslations(textsToTranslate);

  const [
    bannerTitle,
    bannerSubtitle,
    verPropiedadesText,
    verServiciosText,
    sobreAgenciaTitle,
    aboutText1,
    aboutText2,
    aboutText3,
    ubicacionTitle,
    caboDePolosTitle,
    locationDescription1,
    locationDescription2,
    direccionLabel,
    direccionText,
    telefonoLabel,
    emailLabel,
    horarioLabel,
    errorCargandoMapa,
    cargandoMapa,
    mapaLink,
    nuestrosServiciosTitle,
    gestionInmobiliariaTitle,
    gestionInmobiliariaText,
    serviciosTraduccionTitle,
    serviciosTraduccionText,
    masInformacionText,
    contactarTitle,
    contactarSubtitle,
    contactanosText
  ] = mounted ? translations : [
    "Agencia Inmobiliaria y Servicios de Traducción en Cabo de Palos",
    "Gestión inmobiliaria profesional y servicios de traducción especializada en La Manga, Cartagena y Alicante. Tu agencia de confianza para compra, venta, alquiler de propiedades y traducción de todo tipo.",
    "Ver Propiedades",
    "Ver Servicios",
    "🏡 Sobre Agencia MKN",
    "Agencia MKN es una inmobiliaria especializada en vivienda a lo largo de Cabo de Palos, Cartagena y Alicante. Nos dedicamos a ayudar y apoyar a nuestros clientes en todas sus gestiones inmobiliarias, desde la busqueda de la vivienda hasta la firma del contrato convirtiendonos en una agencia completa y profesional.",
    "Ubicados estratégicamente en Cabo de Palos, ofrecemos gestión inmobiliaria integral: compraventa, alquiler, documentación, asesoramiento legal y acompañamiento personalizado durante todo el proceso.",
    "Como agencia ubicada en una zona multicultural, también destacamos por nuestros servicios de traducción profesional en español, alemán e inglés. Ofrecemos traducción presencial y especializada varios ambitos como pueden ser gestiones administrativas, cuestiones medicas y procedimientos legales.",
    "📍 Nuestra Ubicación",
    "🌊 Cabo de Palos, Cartagena",
    "Ubicados en el privilegiado enclave de Cabo de Palos, conocido por sus aguas cristalinas y su proximidad a la Reserva Marina de Islas Hormigas, ofrecemos las mejores oportunidades inmobiliarias en La Manga del Mar Menor y toda la región de Cartagena.",
    "En Agencia MKN, nuestro mayor valor es la relación de confianza que establecemos con cada cliente. Nos comprometemos a ofrecer una experiencia inequíparable, basada en la transparencia, la profesionalidad y el trato cercano que nos caracteriza, acompañándote durante todo el proceso inmobiliario.",
    "Dirección:",
    "Ctra. a Cabo de Palos, Km. 25, 30370 Cabo de Palos, Murcia",
    "Teléfono:",
    "Email:",
    "Horario:",
    "Error cargando el mapa",
    "Cargando mapa...",
    "🔗 Ver en Google Maps",
    "⭐ Nuestros Servicios",
    "Gestión Inmobiliaria Integral",
    "Gestión completa de compraventa y alquiler. Nos encargamos de todos los trámites, documentación, asesoramiento legal y acompañamiento personalizado durante todo el proceso.",
    "Servicios de Traducción",
    "Traducción profesional en español, alemán e inglés. Ofrecemos traducción en gestiones oficiales como Hacienda o Ayuntamientos, servicios notariales, traducción médica y hospitalaria, así como traducción presencial en reuniones y documentos inmobiliarios.",
    "¿Necesitas más información sobre nuestros servicios?",
    "📞 ¿Quieres contactar con nosotros?",
    "Estamos aquí para ayudarte con tus necesidades inmobiliarias y de traducción",
    "Contáctanos"
  ];

  // Coordenadas de la Agencia MKN en Cabo de Palos
  // Ctra. a Cabo de Palos, Km. 25, 30370 Cabo de Palos, Murcia
  const agencyLocation = {
    lat: 37.627368, // Coordenadas exactas de la Agencia MKN
    lng: -0.710618
  };

  return (
    <div className="min-h-screen bg-kehre-gradient-light">
      {/* Banner del Faro */}
      <Banner
        title={bannerTitle}
        subtitle={bannerSubtitle}
        buttonText={verPropiedadesText}
        buttonLink="/propiedades"
        secondButtonText={verServiciosText}
        secondButtonLink="/servicios"
        showCarousel={true}
      />

      {/* Contenido principal sobre la empresa */}
      <main className="px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Sección: Quiénes somos */}
          <section className="mb-12 sm:mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                  {sobreAgenciaTitle}
                </h2>
                <p className="text-base sm:text-lg text-gray-700 mb-3 leading-relaxed">
                  {aboutText1}
                </p>
                <p className="text-base sm:text-lg text-gray-700 mb-3 leading-relaxed">
                  {aboutText2}
                </p>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  {aboutText3}
                </p>
              </div>
              <div className="relative h-80 sm:h-96 rounded-xl overflow-hidden shadow-xl">
                {/* Foto de la empresa */}
                <Image 
                  src="/FotoLocal.jpg" 
                  alt="Foto de Agencia MKN - Oficina en Cabo de Palos"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          </section>

          {/* Sección: Nuestra ubicación */}
          <section className="mb-12 sm:mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
                {ubicacionTitle}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    {caboDePolosTitle}
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {locationDescription1}
                  </p>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {locationDescription2}
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p className="flex items-center">
                      <span className="mr-3">📍</span>
                      <strong className="mr-2">{direccionLabel}</strong>
                      {direccionText}
                    </p>
                    <p className="flex items-center">
                      <span className="mr-3">📞</span>
                      <strong className="mr-2">{telefonoLabel}</strong>
                      <a href="tel:+34634 73 79 49" className="text-blue-600 hover:text-blue-800 transition-colors">+34 634 73 79 49</a>
                    </p>
                    <p className="flex items-center">
                      <span className="mr-3">📧</span>
                      <strong className="mr-2">{emailLabel}</strong>
                      <a href="mailto:marionrutkat@gmail.com" className="text-blue-600 hover:text-blue-800 transition-colors">marionrutkat@gmail.com</a>
                    </p>
                    <div>
                      <p className="flex items-center mb-2">
                        <span className="mr-3">🕒</span>
                        <strong>{horarioLabel}</strong>
                      </p>
                      <div className="ml-8 space-y-1 text-sm">
                        <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                          <p className="font-semibold text-blue-800 mb-2">Lunes a Viernes</p>
                          <p className="text-gray-700">• Trámites fuera de oficina: <span className="font-medium">9:00 - 12:00</span></p>
                          <p className="text-gray-700">• Horario oficina: <span className="font-medium">12:00 - 16:00</span></p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                          <p className="font-semibold text-green-800 mb-1">Sábados</p>
                          <p className="text-gray-700">• <span className="font-medium">11:00 - 14:00</span></p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-gray-400">
                          <p className="font-semibold text-gray-800">Domingos</p>
                          <p className="text-gray-600">• Descanso</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="relative h-80 lg:h-96 rounded-lg overflow-hidden shadow-md">
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
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-700">
                          <div className="text-5xl mb-4">🗺️</div>
                          <p className="text-lg font-semibold">
                            {loadError ? errorCargandoMapa : cargandoMapa}
                          </p>
                          <p className="text-sm opacity-70">Cabo de Palos, Cartagena</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Enlace a Google Maps - ahora está debajo del mapa */}
                  <div className="mt-4 text-center">
                    <a 
                      href="https://maps.google.com/?q=Agencia+MKN+Cabo+de+Palos+Murcia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {mapaLink}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sección: Nuestros servicios */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
              {nuestrosServiciosTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300 border border-gray-200">
                <div className="text-4xl mb-4">🔑</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{gestionInmobiliariaTitle}</h3>
                <p className="text-gray-700">
                  {gestionInmobiliariaText}
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300 border border-gray-200">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{serviciosTraduccionTitle}</h3>
                <p className="text-gray-700">
                  {serviciosTraduccionText}
                </p>
              </div>
            </div>
            
            {/* Call to action integrado */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-100 shadow-sm">
              <p className="text-gray-700 mb-4 text-lg">
                {masInformacionText}
              </p>
              <Link
                href="/servicios"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <span className="mr-2">📋</span>
                {verServiciosText}
                <span className="ml-2">→</span>
              </Link>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-kehre-gradient rounded-xl p-8 text-white shadow-xl">
              <h2 className="text-3xl font-bold mb-4">
                {contactarTitle}
              </h2>
              <p className="text-xl mb-6 opacity-90">
                {contactarSubtitle}
              </p>
              <Link
                href="/contacto"
                className="inline-block bg-white text-blue-800 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:bg-gray-100"
              >
                {contactanosText}
              </Link>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
