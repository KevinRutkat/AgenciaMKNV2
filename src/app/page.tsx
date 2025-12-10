"use client";

import Image from "next/image";
import Link from "next/link";
import MapSection from "@/components/MapSection";
import Banner from "@/components/Banner";
import { useMultipleTranslations } from "@/hooks/useTranslation";

export default function Home() {
  const textsToTranslate = [
    // Banner
    "Agencia Inmobiliaria y Servicios de Traducción en Cabo de Palos",
    "Gestión inmobiliaria profesional y servicios de traducción especializada en La Manga, Cartagena y Alicante. Tu agencia de confianza para compra, venta, alquiler de propiedades y traducción de todo tipo.",
    "Ver Propiedades",
    "Ver Servicios",

    // Sección: Sobre Agencia MKN
    "🏡 Sobre Agencia MKN",
    "Agencia MKN es una inmobiliaria especializada en vivienda a lo largo de Cabo de Palos, Cartagena y Alicante. Nos dedicamos a ayudar y apoyar a nuestros clientes en todas sus gestiones inmobiliarias, desde la búsqueda de la vivienda hasta la firma del contrato, convirtiéndonos en una agencia completa y profesional.",
    "Ubicados estratégicamente en Cabo de Palos, ofrecemos gestión inmobiliaria integral: compraventa, alquiler, documentación, asesoramiento legal y acompañamiento personalizado durante todo el proceso.",
    "Como agencia ubicada en una zona multicultural, también destacamos por nuestros servicios de traducción profesional en español, alemán e inglés. Ofrecemos traducción presencial y especializada en gestiones administrativas, cuestiones médicas y procedimientos legales.",
    "Foto de Agencia MKN - Oficina en Cabo de Palos",

    // Sección: Nuestra ubicación
    "📍 Nuestra Ubicación",
    "🌊 Cabo de Palos, Cartagena",
    "Ubicados en el privilegiado enclave de Cabo de Palos, conocido por sus aguas cristalinas y su proximidad a la Reserva Marina de Islas Hormigas, ofrecemos las mejores oportunidades inmobiliarias en La Manga del Mar Menor y toda la región de Cartagena.",
    "En Agencia MKN, nuestro mayor valor es la relación de confianza que establecemos con cada cliente. Nos comprometemos a ofrecer una experiencia inigualable, basada en la transparencia, la profesionalidad y el trato cercano que nos caracteriza.",
    "Dirección:",
    "Teléfono:",
    "Email:",

    // Sección: Nuestros servicios
    "⭐ Nuestros Servicios",
    "Gestión Inmobiliaria Integral",
    "Gestión completa de compraventa y alquiler. Nos encargamos de todos los trámites, documentación, asesoramiento legal y acompañamiento personalizado durante todo el proceso.",
    "Servicios de Traducción",
    "Traducción profesional en español, alemán e inglés. Ofrecemos traducción en gestiones oficiales como Hacienda o Ayuntamientos, servicios notariales, traducción médica y hospitalaria, así como traducción presencial en reuniones y documentos inmobiliarios.",
    "¿Necesitas más información sobre nuestros servicios?",
    "Ver Servicios",

    // CTA final
    "📞 ¿Quieres contactar con nosotros?",
    "Estamos aquí para ayudarte con tus necesidades inmobiliarias y de traducción.",
    "Contáctanos",
  ];

  const [
    // Banner
    bannerTitle,
    bannerSubtitle,
    bannerButtonText,
    bannerSecondButtonText,

    // Sobre Agencia MKN
    aboutTitle,
    aboutP1,
    aboutP2,
    aboutP3,
    officeAlt,

    // Nuestra ubicación
    locationSectionTitle,
    locationSubtitle,
    locationP1,
    locationP2,
    addressLabel,
    phoneLabel,
    emailLabel,

    // Nuestros servicios
    servicesSectionTitle,
    servicesCard1Title,
    servicesCard1Desc,
    servicesCard2Title,
    servicesCard2Desc,
    servicesCtaText,
    servicesCtaButtonText,

    // CTA final
    finalCtaTitle,
    finalCtaText,
    finalCtaButtonText,
  ] = useMultipleTranslations(textsToTranslate);

  return (
    <div className="min-h-screen bg-kehre-gradient-light">
      {/* Banner del Faro / Hero principal */}
      <Banner
        title={bannerTitle}
        subtitle={bannerSubtitle}
        buttonText={bannerButtonText}
        buttonLink="/propiedades"
        secondButtonText={bannerSecondButtonText}
        secondButtonLink="/servicios"
        showCarousel={true}
      />

      {/* Contenido principal */}
      <main className="px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Sección: Quiénes somos */}
          <section className="mb-12 sm:mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                  {aboutTitle}
                </h2>
                <p className="text-base sm:text-lg text-gray-700 mb-3 leading-relaxed">
                  {aboutP1}
                </p>
                <p className="text-base sm:text-lg text-gray-700 mb-3 leading-relaxed">
                  {aboutP2}
                </p>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  {aboutP3}
                </p>
              </div>
              <div className="relative h-80 sm:h-96 rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/FotoLocal.jpg"
                  alt={officeAlt}
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
                {locationSectionTitle}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Texto de ubicación */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    {locationSubtitle}
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {locationP1}
                  </p>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {locationP2}
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p className="flex items-center">
                      <span className="mr-3">📍</span>
                      <strong className="mr-2">{addressLabel}</strong>
                      Ctra. a Cabo de Palos, Km. 25, 30370 Cabo de Palos, Murcia
                    </p>
                    <p className="flex items-center">
                      <span className="mr-3">📞</span>
                      <strong className="mr-2">{phoneLabel}</strong>
                      <a
                        href="tel:+34634737949"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        +34 634 73 79 49
                      </a>
                    </p>
                    <p className="flex items-center">
                      <span className="mr-3">📧</span>
                      <strong className="mr-2">{emailLabel}</strong>
                      <a
                        href="mailto:marionrutkat@gmail.com"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        marionrutkat@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                {/* Mapa (cargado sólo en cliente) */}
                <MapSection />
              </div>
            </div>
          </section>

          {/* Sección: Nuestros servicios */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
              {servicesSectionTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300 border border-gray-200">
                <div className="text-4xl mb-4">🔑</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {servicesCard1Title}
                </h3>
                <p className="text-gray-700">{servicesCard1Desc}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300 border border-gray-200">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {servicesCard2Title}
                </h3>
                <p className="text-gray-700">{servicesCard2Desc}</p>
              </div>
            </div>

            {/* Call to action Servicios */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-100 shadow-sm">
              <p className="text-gray-700 mb-4 text-lg">
                {servicesCtaText}
              </p>
              <Link
                href="/servicios"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <span className="mr-2">📋</span>
                {servicesCtaButtonText}
                <span className="ml-2">→</span>
              </Link>
            </div>
          </section>

          {/* Call to Action final */}
          <section className="text-center">
            <div className="bg-kehre-gradient rounded-xl p-8 text-white shadow-xl">
              <h2 className="text-3xl font-bold mb-4">
                {finalCtaTitle}
              </h2>
              <p className="text-xl mb-6 opacity-90">
                {finalCtaText}
              </p>
              <Link
                href="/contacto"
                className="inline-block bg-white text-blue-800 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:bg-gray-100"
              >
                {finalCtaButtonText}
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
