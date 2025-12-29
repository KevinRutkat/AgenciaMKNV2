"use client";

import Image from "next/image";
import Link from "next/link";
import MapSection from "@/components/MapSection";
import Banner from "@/components/Banner";
import { useMultipleTranslations } from "@/hooks/useTranslation";
import {
  HomeModernIcon,
  MapPinIcon,
  BriefcaseIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  LanguageIcon,
} from "@heroicons/react/24/outline";

export default function HomePageClient() {
  const textsToTranslate = [
    // Banner
    "Gestión de viviendas y traducciones profesionales en Cabo de Palos",
    "Inmobiliaria y agencia de traducción en español, alemán e inglés. Te acompañamos en compra, venta, alquiler y trámites de todo tipo.",
    "Ver propiedades",
    "Ver servicios",

    // Sección: Sobre Agencia MKN
    "Sobre Agencia MKN",
    "Somos una agencia especializada en gestión de viviendas y terrenos en Cabo de Palos, Cartagena y Alicante.",
    "Nos ocupamos de todo el proceso inmobiliario: valoración, promoción, visitas, documentación y acompañamiento hasta la firma.",
    "También ofrecemos traducción profesional en español, alemán e inglés para trámites inmobiliarios, administrativos y médicos, tanto presenciales como documentales.",
    "Foto de Agencia MKN - Oficina en Cabo de Palos",

    // Sección: Nuestra ubicación
    "Nuestra ubicación",
    "Cabo de Palos, Cartagena",
    "Ubicados en un enclave privilegiado frente al mar, conectamos propiedades y personas en La Manga, Cartagena y la costa de Alicante.",
    "La confianza es nuestro valor central: ofrecemos un trato cercano, transparente y profesional en cada gestión.",
    "Trabajamos con viviendas en Cabo de Palos, La Manga del Mar Menor, Cartagena y la Costa Calida.",
    "Atendemos clientes nacionales e internacionales en la Region de Murcia y Alicante.",
    "Dirección:",
    "Teléfono:",
    "Email:",

    // Sección: Nuestros servicios
    "Nuestros servicios",
    "Gestión inmobiliaria",
    "Venta, alquiler y asesoramiento legal con seguimiento completo y personalizado.",
    "Traducción e interpretación",
    "Traducciones de todo tipo en español, alemán e inglés: inmobiliarias, médicas, administrativas y legales.",
    "¿Necesitas más información sobre nuestros servicios?",
    "Ver servicios",

    // CTA final
    "¿Hablamos?",
    "Estamos aquí para ayudarte con viviendas, terrenos o traducciones profesionales.",
    "Contactar",
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
    locationP3,
    locationP4,
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
      <main className="px-4 sm:px-6 md:px-8 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto">
          {/* Sección: Quiénes somos */}
          <section className="mb-16 sm:mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-dark mb-4 font-display">
                  <span className="inline-flex items-center gap-2">
                    <HomeModernIcon className="h-6 w-6 text-primary-blue" />
                    {aboutTitle}
                  </span>
                </h2>
                <p className="text-base sm:text-lg text-neutral-muted mb-3 leading-relaxed">
                  {aboutP1}
                </p>
                <p className="text-base sm:text-lg text-neutral-muted mb-3 leading-relaxed">
                  {aboutP2}
                </p>
                <p className="text-base sm:text-lg text-neutral-muted leading-relaxed">
                  {aboutP3}
                </p>
              </div>
              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-neutral-gray shadow-sm">
                <Image
                  src="/FotoLocal.png"
                  alt={officeAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          </section>

          {/* Sección: Nuestra ubicación */}
          <section className="mb-16 sm:mb-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-neutral-gray shadow-sm">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-dark mb-6 sm:mb-8 text-center font-display">
                <span className="inline-flex items-center gap-2">
                  <MapPinIcon className="h-7 w-7 text-primary-blue" />
                  {locationSectionTitle}
                </span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Texto de ubicación */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-neutral-dark mb-4">
                    {locationSubtitle}
                  </h3>
                  <p className="text-neutral-muted mb-4 leading-relaxed">
                    {locationP1}
                  </p>
                  <p className="text-neutral-muted mb-4 leading-relaxed">
                    {locationP2}
                  </p>
                  <p className="text-neutral-muted mb-4 leading-relaxed">
                    {locationP3}
                  </p>
                  <p className="text-neutral-muted mb-4 leading-relaxed">
                    {locationP4}
                  </p>
                  <div className="space-y-2 text-neutral-muted">
                    <p className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-primary-blue mr-3" />
                      <strong className="mr-2 text-neutral-dark">{addressLabel}</strong>
                      Ctra. a Cabo de Palos, Km. 25, 30370 Cabo de Palos, Murcia
                    </p>
                    <p className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-primary-blue mr-3" />
                      <strong className="mr-2 text-neutral-dark">{phoneLabel}</strong>
                      <a
                        href="tel:+34634737949"
                        className="text-primary-blue hover-text-primary-blue-dark transition-colors"
                      >
                        +34 634 73 79 49
                      </a>
                    </p>
                    <p className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-primary-blue mr-3" />
                      <strong className="mr-2 text-neutral-dark">{emailLabel}</strong>
                      <a
                        href="mailto:marionrutkat@gmail.com"
                        className="text-primary-blue hover-text-primary-blue-dark transition-colors"
                      >
                        marionrutkat@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                {/* Mapa (cargado solo en cliente) */}
                <MapSection />
              </div>
            </div>
          </section>

          {/* Sección: Nuestros servicios */}
          <section className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-dark mb-8 text-center font-display">
              <span className="inline-flex items-center gap-2">
                <BriefcaseIcon className="h-7 w-7 text-primary-blue" />
                {servicesSectionTitle}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-neutral-gray shadow-sm text-center">
                <BuildingOffice2Icon className="h-10 w-10 text-primary-blue mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-dark mb-3">
                  {servicesCard1Title}
                </h3>
                <p className="text-neutral-muted">{servicesCard1Desc}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-neutral-gray shadow-sm text-center">
                <LanguageIcon className="h-10 w-10 text-primary-blue mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-dark mb-3">
                  {servicesCard2Title}
                </h3>
                <p className="text-neutral-muted">{servicesCard2Desc}</p>
              </div>
            </div>

            {/* Call to action Servicios */}
            <div className="bg-white/80 rounded-2xl p-6 text-center border border-neutral-gray shadow-sm">
              <p className="text-neutral-muted mb-4 text-lg">
                {servicesCtaText}
              </p>
              <Link
                href="/servicios"
                className="inline-flex items-center px-6 py-3 bg-primary-blue text-white rounded-full font-semibold transition-all duration-300 hover-bg-primary-blue-dark"
              >
                {servicesCtaButtonText}
              </Link>
            </div>
          </section>

          {/* Call to Action final */}
          <section className="text-center">
            <div className="bg-primary-blue rounded-2xl p-8 text-white shadow-sm">
              <h2 className="text-3xl font-semibold mb-4 font-display">
                {finalCtaTitle}
              </h2>
              <p className="text-lg mb-6 opacity-90">
                {finalCtaText}
              </p>
              <Link
                href="/contacto"
                className="inline-block bg-white text-primary-blue px-8 py-3 rounded-full font-semibold transition-all duration-300 hover-bg-neutral-gray"
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
