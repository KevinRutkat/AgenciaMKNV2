"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { HomeIcon, LanguageIcon } from "@heroicons/react/24/solid";
import Banner from "@/components/Banner";
import { useMultipleTranslations } from "@/hooks/useTranslation";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  details: string[];
}

export default function ServiciosPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const textsToTranslate = [
    // Banner
    "Nuestros Servicios Profesionales",
    "Servicios especializados en gestión inmobiliaria y traducción profesional para satisfacer todas tus necesidades en La Manga y alrededores del Mar Menor",

    // Títulos de secciones
    "Servicios Inmobiliarios",
    "Gestión integral para la venta y alquiler de propiedades",
    "Servicios de Traducción",
    "Personal multilingüe para todas tus necesidades de traducción",

    // Call to action
    "¿Necesitas más información sobre nuestros servicios?",
    "Contacta con nosotros para una consulta personalizada y sin compromiso",
    "Contactar Ahora",
    "Llamar Directamente",

    // Servicios inmobiliarios
    "Análisis del Cliente Objetivo",
    "Identificamos el perfil ideal de comprador para tu propiedad",
    "Estudio demográfico del mercado local",
    "Análisis de preferencias y necesidades del target",
    "Definición de estrategias de marketing personalizadas",
    "Segmentación de audiencias potenciales",
    "Optimización del precio según el perfil del cliente",

    "Marketing de la vivienda",
    "Tu propiedad destacará en nuestra plataforma digital",
    "Fotografía de alta calidad",
    "Descripción detallada y atractiva de la propiedad",
    "Integración con redes sociales y portales inmobiliarios",
    "Mostrar la vivienda a clientes potenciales que acudan a la oficina",

    "Gestión de Visitas Presenciales",
    "Nos encargamos de mostrar tu propiedad a potenciales compradores",
    "Coordinación de horarios con interesados",
    "Acompañamiento profesional durante las visitas",
    "Presentación destacada de las mejores características",
    "Respuesta inmediata a consultas y dudas",
    "Seguimiento post-visita con feedback detallado",
    "Negociación inicial de condiciones",

    "Asesoramiento en Gestión de Documentos",
    "Te ayudamos con toda la documentación necesaria para la compraventa",
    "Verificación de documentos de la vivienda",
    "Certificado de eficiencia energética",
    "Verificación de libertad de cargas y deudas",
    "Preparación del contrato de compraventa",
    "Asesoramiento en aspectos legales y fiscales",
    "Coordinación con notarías y registros",

    // Servicios de traducción
    "Idiomas Principales",
    "Personal multilingüe especializado en español, inglés y alemán",
    "Traduccion en ingles, español y alemán",
    "Especialización en terminología técnica",
    "Traductores nativos y experimentados",
    "Disponibilidad para servicios urgentes",
    "Garantía de confidencialidad absoluta",

    "Traducción de Documentos",
    "Traducción oficial y certificada de todo tipo de documentos o consultas",
    "Documentos legales y contratos",
    "Documentos funerarios",
    "Documentos o consultas medicas",
    "Documentos comerciales y financieros",
    "Entrega en formato digital y físico",

    "Servicios de Traducción Presencial",
    "Acompañamiento profesional en gestiones importantes",
    "Traducción médica y hospitalaria especializada",
    "Servicios notariales y firma de contratos",
    "Gestiones bancarias y financieras",
    "Citas médicas y hospitalarias con traducción simultánea",
    "Traducción en notarías para escrituras y poderes",
    "Acompañamiento en bancos para trámites financieros",
    "Gestiones oficiales en Hacienda y tributarias",
    "Trámites en ayuntamientos y administraciones públicas",

    "Gestiones Administrativas",
    "Te acompañamos en trámites oficiales y administrativos",
    "Trámites en ayuntamientos",
    "Gestiones con Hacienda y tributarias",
    "Renovación y obtención de DNI/NIE",
    "Empadronamiento y certificados",
    "Trámites de extranjería",
    "Solicitudes y permisos oficiales",
    "Gestiones con la Seguridad Social",
  ];

  const [
    // Banner
    bannerTitle,
    bannerSubtitle,

    // Títulos de secciones
    inmobiliaryTitle,
    inmobiliaryDesc,
    translationTitle,
    translationDesc,

    // Call to action
    ctaTitle,
    ctaSubtitle,
    contactButton,
    callButton,

    // Servicios inmobiliarios
    analisisTitle,
    analisisDesc,
    analisisDetail1,
    analisisDetail2,
    analisisDetail3,
    analisisDetail4,
    analisisDetail5,

    publicacionTitle,
    publicacionDesc,
    publicacionDetail1,
    publicacionDetail2,
    publicacionDetail3,
    publicacionDetail4,

    visitasTitle,
    visitasDesc,
    visitasDetail1,
    visitasDetail2,
    visitasDetail3,
    visitasDetail4,
    visitasDetail5,
    visitasDetail6,

    documentosTitle,
    documentosDesc,
    documentosDetail1,
    documentosDetail2,
    documentosDetail3,
    documentosDetail4,
    documentosDetail5,

    // Servicios de traducción
    idiomasTitle,
    idiomasDesc,
    idiomasDetail1,
    idiomasDetail2,
    idiomasDetail3,
    idiomasDetail4,
    idiomasDetail5,

    traduccionDocTitle,
    traduccionDocDesc,
    traduccionDocDetail1,
    traduccionDocDetail2,
    traduccionDocDetail3,
    traduccionDocDetail4,
    traduccionDocDetail5,
    traduccionDocDetail6,

    traduccionPresTitle,
    traduccionPresDesc,
    traduccionPresDetail1,
    traduccionPresDetail2,
    traduccionPresDetail3,
    traduccionPresDetail4,
    traduccionPresDetail5,
    traduccionPresDetail6,
    traduccionPresDetail7,
    traduccionPresDetail8,

    gestionesTitle,
    gestionesDesc,
    gestionesDetail1,
    gestionesDetail2,
    gestionesDetail3,
    gestionesDetail4,
    gestionesDetail5,
    gestionesDetail6,
    gestionesDetail7,
  ] = useMultipleTranslations(textsToTranslate);

  const inmobiliaryServices: ServiceItem[] = [
    {
      id: "analisis-cliente",
      title: analisisTitle,
      description: analisisDesc,
      details: [
        analisisDetail1,
        analisisDetail2,
        analisisDetail3,
        analisisDetail4,
        analisisDetail5,
      ],
    },
    {
      id: "publicacion-web",
      title: publicacionTitle,
      description: publicacionDesc,
      details: [
        publicacionDetail1,
        publicacionDetail2,
        publicacionDetail3,
        publicacionDetail4,
      ],
    },
    {
      id: "visitas-presenciales",
      title: visitasTitle,
      description: visitasDesc,
      details: [
        visitasDetail1,
        visitasDetail2,
        visitasDetail3,
        visitasDetail4,
        visitasDetail5,
        visitasDetail6,
      ],
    },
    {
      id: "gestion-documentos",
      title: documentosTitle,
      description: documentosDesc,
      details: [
        documentosDetail1,
        documentosDetail2,
        documentosDetail3,
        documentosDetail4,
        documentosDetail5,
      ],
    },
  ];

  const translationServices: ServiceItem[] = [
    {
      id: "idiomas-principales",
      title: idiomasTitle,
      description: idiomasDesc,
      details: [
        idiomasDetail1,
        idiomasDetail2,
        idiomasDetail3,
        idiomasDetail4,
        idiomasDetail5,
      ],
    },
    {
      id: "traduccion-documentos",
      title: traduccionDocTitle,
      description: traduccionDocDesc,
      details: [
        traduccionDocDetail1,
        traduccionDocDetail2,
        traduccionDocDetail3,
        traduccionDocDetail4,
        traduccionDocDetail5,
        traduccionDocDetail6,
      ],
    },
    {
      id: "servicios-presenciales",
      title: traduccionPresTitle,
      description: traduccionPresDesc,
      details: [
        traduccionPresDetail1,
        traduccionPresDetail2,
        traduccionPresDetail3,
        traduccionPresDetail4,
        traduccionPresDetail5,
        traduccionPresDetail6,
        traduccionPresDetail7,
        traduccionPresDetail8,
      ],
    },
    {
      id: "gestiones-administrativas",
      title: gestionesTitle,
      description: gestionesDesc,
      details: [
        gestionesDetail1,
        gestionesDetail2,
        gestionesDetail3,
        gestionesDetail4,
        gestionesDetail5,
        gestionesDetail6,
        gestionesDetail7,
      ],
    },
  ];

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const ServiceAccordion = ({
    services,
    icon: Icon,
    title,
    description,
  }: {
    services: ServiceItem[];
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
  }) => (
    <section
      aria-label={title}
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6">
        <div className="flex items-center space-x-3 text-white">
          <Icon className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-teal-100 mt-1">{description}</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {services.map((service) => (
          <div
            key={service.id}
            className="border-b border-gray-200 last:border-b-0"
          >
            <button
              onClick={() => toggleItem(service.id)}
              className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
              aria-expanded={openItems.has(service.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {service.description}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {openItems.has(service.id) ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
            </button>

            {openItems.has(service.id) && (
              <div className="px-6 pb-4 bg-gray-50">
                <ul className="space-y-2">
                  {service.details.map((detail, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-3 text-sm"
                    >
                      <span className="text-teal-600 flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full" />
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-amber-50">
      <Banner
        title={bannerTitle}
        subtitle={bannerSubtitle}
        showCarousel={false}
        customImage="/banner/Fondo_Faro2.webp"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          <ServiceAccordion
            services={inmobiliaryServices}
            icon={HomeIcon}
            title={inmobiliaryTitle}
            description={inmobiliaryDesc}
          />

          <ServiceAccordion
            services={translationServices}
            icon={LanguageIcon}
            title={translationTitle}
            description={translationDesc}
          />
        </div>

        {/* CTA */}
        <section className="mt-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">{ctaTitle}</h2>
          <p className="text-lg mb-6 text-orange-100">{ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contacto"
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {contactButton}
            </Link>
            <a
              href="tel:+34634737949"
              className="bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-800 transition-colors"
            >
              {callButton}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
