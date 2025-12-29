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
    "Servicios inmobiliarios y de traducción",
    "Gestión de viviendas y traducciones profesionales en español, alemán e inglés para todo tipo de trámites.",

    // Títulos de secciones
    "Servicios inmobiliarios",
    "Gestión integral para venta, compra y alquiler",
    "Servicios de traducción",
    "Traducción e interpretación para particulares y empresas",

    // Call to action
    "¿Necesitas asesoramiento?",
    "Cuéntanos tu caso y te ayudamos con una propuesta personalizada",
    "Contactar",
    "Llamar ahora",

    // Servicios inmobiliarios
    "Análisis del cliente objetivo",
    "Definimos el perfil ideal y el mejor enfoque para tu propiedad",
    "Estudio demográfico del mercado local",
    "Preferencias y necesidades del comprador",
    "Estrategia de marketing personalizada",
    "Segmentación de audiencias potenciales",
    "Optimización del precio según el perfil del cliente",

    "Marketing de la vivienda",
    "Tu propiedad destaca con contenido y difusión profesional",
    "Fotografía de alta calidad",
    "Descripción atractiva y clara de la vivienda",
    "Integración con portales y redes",
    "Atención a clientes en oficina",

    "Gestión de visitas presenciales",
    "Nos encargamos de mostrar la vivienda a interesados",
    "Coordinación de horarios",
    "Acompañamiento profesional durante las visitas",
    "Presentación de las mejores características",
    "Respuesta ágil a consultas",
    "Seguimiento post-visita con feedback",
    "Negociación inicial de condiciones",

    "Asesoramiento en documentos",
    "Te ayudamos con la documentación de compraventa",
    "Verificación de documentos de la vivienda",
    "Certificado de eficiencia energética",
    "Comprobación de cargas y deudas",
    "Preparación del contrato de compraventa",
    "Coordinación con notarías y registros",

    // Servicios de traducción
    "Idiomas principales",
    "Traducción profesional en español, alemán e inglés",
    "Traducción para trámites inmobiliarios",
    "Especialización en terminología técnica",
    "Traductores nativos y experimentados",
    "Servicios urgentes disponibles",
    "Confidencialidad garantizada",

    "Traducción de documentos",
    "Documentos legales, médicos, administrativos y financieros",
    "Contratos y escrituras",
    "Documentación médica y hospitalaria",
    "Documentos administrativos",
    "Documentos comerciales y financieros",
    "Entrega en formato digital o físico",

    "Traducción presencial",
    "Acompañamiento profesional en gestiones importantes",
    "Traducción médica y hospitalaria",
    "Servicios notariales y firma de contratos",
    "Gestiones bancarias",
    "Citas médicas con traducción simultánea",
    "Notarías para escrituras y poderes",
    "Acompañamiento en bancos",
    "Trámites en ayuntamientos",

    "Gestiones administrativas",
    "Te acompañamos en trámites oficiales",
    "Gestiones con ayuntamientos",
    "Gestiones con Hacienda",
    "Renovación y obtención de DNI/NIE",
    "Empadronamiento y certificados",
    "Trámites de extranjería",
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

    traduccionPresTitle,
    traduccionPresDesc,
    traduccionPresDetail1,
    traduccionPresDetail2,
    traduccionPresDetail3,
    traduccionPresDetail4,
    traduccionPresDetail5,
    traduccionPresDetail6,
    traduccionPresDetail7,

    gestionesTitle,
    gestionesDesc,
    gestionesDetail1,
    gestionesDetail2,
    gestionesDetail3,
    gestionesDetail4,
    gestionesDetail5,
    gestionesDetail6,
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
      className="bg-white rounded-2xl border border-neutral-gray shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 p-6 bg-neutral-light border-b border-neutral-gray">
        <Icon className="h-6 w-6 text-primary-blue" />
        <div>
          <h2 className="text-xl font-semibold text-neutral-dark">{title}</h2>
          <p className="text-neutral-muted mt-1 text-sm">{description}</p>
        </div>
      </div>

      <div className="divide-y divide-neutral-gray">
        {services.map((service) => (
          <div key={service.id} className="border-b border-neutral-gray last:border-b-0">
            <button
              onClick={() => toggleItem(service.id)}
              className="w-full px-6 py-4 text-left hover-bg-neutral-gray focus:outline-none focus:bg-white transition-colors"
              aria-expanded={openItems.has(service.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-neutral-dark mb-1">
                    {service.title}
                  </h3>
                  <p className="text-neutral-muted text-sm">
                    {service.description}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {openItems.has(service.id) ? (
                    <ChevronUpIcon className="h-5 w-5 text-neutral-muted" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-neutral-muted" />
                  )}
                </div>
              </div>
            </button>

            {openItems.has(service.id) && (
              <div className="px-6 pb-4 bg-white">
                <ul className="space-y-2">
                  {service.details.map((detail, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm">
                      <span className="text-primary-blue flex-shrink-0 w-2 h-2 bg-primary-blue rounded-full mt-2" />
                      <span className="text-neutral-muted">{detail}</span>
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
    <div className="min-h-screen bg-kehre-gradient-light">
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
        <section className="mt-16 bg-white/80 rounded-2xl p-8 text-center border border-neutral-gray shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-neutral-dark">{ctaTitle}</h2>
          <p className="text-lg mb-6 text-neutral-muted">{ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contacto"
              className="bg-primary-blue text-white px-6 py-3 rounded-full font-semibold hover-bg-primary-blue-dark transition-colors"
            >
              {contactButton}
            </Link>
            <a
              href="tel:+34634737949"
              className="border border-neutral-gray text-neutral-dark px-6 py-3 rounded-full font-semibold hover-bg-neutral-gray transition-colors"
            >
              {callButton}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
