"use client";

import Image from "next/image";
import Link from "next/link";
import MapSection from "@/components/MapSection";
import Banner from "@/components/Banner";
import ViviendasCostaSection from "@/components/ViviendasCostaSection";
import { useMultipleTranslations } from "@/hooks/useTranslation";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import {
  HomeModernIcon,
  MapPinIcon,
  BriefcaseIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  LanguageIcon,
} from "@heroicons/react/24/outline";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function HomePageClient() {
  const textsToTranslate = [
    // Banner
    "Gestión de viviendas, acompañamiento y traducción en la Costa Cálida",
    "Gestionamos la compraventa de viviendas, buscamos propiedades para clientes, acompañamos a extranjeros en sus gestiones y ofrecemos traducción e interpretación en español, alemán e inglés.",
    "Ver propiedades",
    "Ver servicios",

    // Sección: Sobre Agencia MKN
    "Sobre Agencia MKN",
    "Somos una agencia de gestión integral en Cabo de Palos, Cartagena y la costa cercana. Gestionamos la compraventa de viviendas y buscamos propiedades para clientes.",
    "No somos una inmobiliaria: acompañamos personalmente en cada proceso, desde la búsqueda de la propiedad hasta la firma, incluyendo gestiones administrativas como NIE, notaría o ayuntamiento.",
    "No solo traducimos, hacemos acompañamiento completo y personalizado a todos nuestros clientes. Ayudamos en medicos, hospitales, notarias, bancos o ayuntamientos.",
    "Foto de Agencia MKN - Oficina en Cabo de Palos",

    // Sección: Nuestra ubicación
    "Nuestra ubicación",
    "Cabo de Palos, Cartagena",
    "Nos encontramos en Cabo de Palos, uno de los corazones del turismo de la costa mediterránea, desde donde ofrecemos nuestros servicios tanto de gestión como de traducción.",
    "Destacamos en llevar a cabo un servicio cercano de principio a fin, con atención directa y seguimiento real en cada proceso, para que cada cliente se sienta acompañado y seguro en cada paso de su compra, venta o gestión de documentos y citas.",
    "Nos movemos por toda la Región de Murcia, llegando también a zonas como Alicante o Almería, con la seguridad de que estaremos ahí donde se nos necesite.",
    "Atendemos a clientes nacionales e internacionales que buscan un servicio profesional, cercano y humano, especialmente en español y alemán.",
    "Dirección:",
    "Teléfono:",
    "Email:",

    // Sección: Nuestros servicios
    "Nuestros servicios",
    "Compraventa y búsqueda de propiedades",
    "Acompañamiento personal en compraventa y búsqueda de propiedades para clientes, con seguimiento completo hasta el final.",
    "Traducción, interpretación y acompañamiento",
    "Español y alemán principalmente, también inglés, para documentos, citas y gestiones donde necesita a alguien a su lado: NIE, notaría, ayuntamiento, médicos y más.",
    "¿Desea que estudiemos su caso?",
    "Ver servicios",

    // CTA final
    "Cuando algo importante ocurre, no debería estar solo.",
    "Somos una agencia de gestión y acompañamiento, no una inmobiliaria. Le ayudamos en compras, ventas, búsqueda de propiedades, traducciones y gestiones administrativas para que cada proceso se viva con claridad y confianza.",
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
          <motion.section
            className="mb-16 sm:mb-20"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl sm:text-3xl font-semibold text-neutral-dark mb-4 font-display"
                >
                  <span className="inline-flex items-center gap-2">
                    <HomeModernIcon className="h-6 w-6 text-primary-blue" />
                    {aboutTitle}
                  </span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-base sm:text-lg text-neutral-muted mb-3 leading-relaxed">
                  {aboutP1}
                </motion.p>
                <motion.p variants={fadeUp} className="text-base sm:text-lg text-neutral-muted mb-3 leading-relaxed">
                  {aboutP2}
                </motion.p>
                <motion.p variants={fadeUp} className="text-base sm:text-lg text-neutral-muted leading-relaxed">
                  {aboutP3}
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.2 }}
                className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-neutral-gray shadow-sm"
              >
                <Image
                  src="/FotoLocal.png"
                  alt={officeAlt}
                  fill
                  loading="lazy"
                  quality={80}
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                />
              </motion.div>
            </div>
          </motion.section>

          {/* Sección: Nuestra ubicación */}
          <motion.section
            className="mb-16 sm:mb-20"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-neutral-gray shadow-sm">
              <motion.h2
                variants={fadeUp}
                className="text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-dark mb-6 sm:mb-8 text-center font-display"
              >
                <span className="inline-flex items-center gap-2">
                  <MapPinIcon className="h-7 w-7 text-primary-blue" />
                  {locationSectionTitle}
                </span>
              </motion.h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Texto de ubicación */}
                <motion.div variants={stagger}>
                  <motion.h3 variants={fadeUp} className="text-xl sm:text-2xl font-semibold text-neutral-dark mb-4">
                    {locationSubtitle}
                  </motion.h3>
                  <motion.p variants={fadeUp} className="text-neutral-muted mb-4 leading-relaxed">
                    {locationP1}
                  </motion.p>
                  <motion.p variants={fadeUp} className="text-neutral-muted mb-4 leading-relaxed">
                    {locationP2}
                  </motion.p>
                  <motion.p variants={fadeUp} className="text-neutral-muted mb-4 leading-relaxed">
                    {locationP3}
                  </motion.p>
                  <motion.p variants={fadeUp} className="text-neutral-muted mb-4 leading-relaxed">
                    {locationP4}
                  </motion.p>
                  <motion.div variants={fadeUp} className="space-y-2 text-neutral-muted">
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
                  </motion.div>
                </motion.div>

                {/* Mapa (cargado solo en cliente) */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 40 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: "easeOut" } },
                  }}
                >
                  <MapSection />
                </motion.div>
              </div>
            </div>
          </motion.section>

          <ViviendasCostaSection />

          {/* Sección: Nuestros servicios */}
          <motion.section
            className="mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-dark mb-8 text-center font-display">
              <span className="inline-flex items-center gap-2">
                <BriefcaseIcon className="h-7 w-7 text-primary-blue" />
                {servicesSectionTitle}
              </span>
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.10)" }}
                className="bg-white rounded-2xl p-6 border border-neutral-gray shadow-sm text-center"
              >
                <BuildingOffice2Icon className="h-10 w-10 text-primary-blue mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-dark mb-3">
                  {servicesCard1Title}
                </h3>
                <p className="text-neutral-muted">{servicesCard1Desc}</p>
              </motion.div>
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.10)" }}
                className="bg-white rounded-2xl p-6 border border-neutral-gray shadow-sm text-center"
              >
                <LanguageIcon className="h-10 w-10 text-primary-blue mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-dark mb-3">
                  {servicesCard2Title}
                </h3>
                <p className="text-neutral-muted">{servicesCard2Desc}</p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mx-auto mb-8 max-w-xl overflow-hidden rounded-2xl border border-neutral-gray bg-white p-3 shadow-sm sm:p-4"
            >
              <div className="relative aspect-[1005/599] w-full">
                <Image
                  src="/imgrecuadro.PNG"
                  alt="Información destacada de Agencia MKN"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
              </div>
            </motion.div>

            {/* Call to action Servicios */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white/80 rounded-2xl p-6 text-center border border-neutral-gray shadow-sm"
            >
              <p className="text-neutral-muted mb-4 text-lg">
                {servicesCtaText}
              </p>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Link
                  href="/servicios"
                  className="inline-flex items-center px-6 py-3 bg-primary-blue text-white rounded-full font-semibold transition-all duration-300 hover-bg-primary-blue-dark"
                >
                  {servicesCtaButtonText}
                </Link>
              </motion.div>
            </motion.div>
          </motion.section>

          {/* Call to Action final */}
          <motion.section
            className="text-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="bg-primary-blue rounded-2xl p-8 text-white shadow-sm">
              <h2 className="text-3xl font-semibold mb-4 font-display">
                {finalCtaTitle}
              </h2>
              <p className="mx-auto mb-6 max-w-5xl px-4 text-lg opacity-90 sm:px-8">
                {finalCtaText}
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Link
                  href="/contacto"
                  className="inline-block bg-white text-primary-blue px-8 py-3 rounded-full font-semibold transition-all duration-300 hover-bg-neutral-gray"
                >
                  {finalCtaButtonText}
                </Link>
              </motion.div>
            </div>
          </motion.section>

        </div>
      </main>
    </div>
  );
}
