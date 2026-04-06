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
    "Venta de viviendas, gestión de alquileres y acompañamiento real",
    "Somos una empresa cercana: vendemos viviendas, gestionamos alquileres para propietarios y acompañamos en español, alemán e inglés cuando un trámite importante no debería hacerse en soledad.",

    // Títulos de secciones
    "Servicios inmobiliarios",
    "Acompañamiento personal en venta de viviendas y gestión de alquileres para propietarios",
    "Servicios de traducción",
    "No solo traducimos: acompañamos de verdad en documentos, citas y gestiones importantes",

    // Call to action
    "¿Necesitas asesoramiento?",
    "Cuéntanos tu caso y lo trabajamos contigo de forma personal, cercana y profesional.",
    "Contactar",
    "Llamar ahora",

    // Servicios inmobiliarios
    "Venta de viviendas",
    "Acompañamos personalmente a propietarios y compradores desde el primer paso hasta la firma",
    "Valoración realista y honesta de la vivienda",
    "Preparación de la salida al mercado",
    "Promoción y presentación cuidada de la propiedad",
    "Atención directa a compradores interesados",
    "Seguimiento continuo hasta cerrar la operación",

    "Gestión de alquileres para propietarios",
    "No alquilamos por cuenta propia: gestionamos el alquiler de tu vivienda con seguimiento completo",
    "Promoción de la vivienda y difusión del alquiler",
    "Atención, filtro y respuesta a consultas",
    "Coordinación de visitas y documentación",
    "Acompañamiento al propietario durante todo el proceso",

    "Visitas, negociación y acompañamiento",
    "Un trato cercano en cada visita, conversación y decisión importante",
    "Coordinación de horarios y visitas",
    "Acompañamiento presencial durante las visitas",
    "Presentación clara de la vivienda y su historia",
    "Respuesta directa y cercana a cada duda",
    "Seguimiento después de cada visita o reunión",
    "Apoyo en la negociación y en los siguientes pasos",

    "Documentación y seguimiento completo",
    "Nos ocupamos del seguimiento real del proceso para que no te sientas solo ante el papeleo",
    "Revisión de documentación de la vivienda y del proceso",
    "Apoyo con certificados y documentación necesaria",
    "Comprobación de pasos previos y situación documental",
    "Preparación, revisión y explicación de contratos",
    "Coordinación con notarías y demás partes implicadas",

    // Servicios de traducción
    "Español y alemán, nuestro trabajo más cercano",
    "Trabajamos principalmente entre español y alemán, y también en inglés, siempre con cercanía y presencia real",
    "Interpretación y traducción en compra, venta y alquiler de vivienda",
    "Apoyo en lenguaje médico, hospitalario, administrativo y notarial",
    "Presencia cercana en momentos importantes",
    "Atención personal y trato humano",
    "Confidencialidad y seguimiento completo",

    "Traducción e interpretación de documentos y gestiones",
    "No nos quedamos en el papel: explicamos, contextualizamos y acompañamos durante todo el trámite",
    "Contratos, escrituras y documentación de compraventa o alquiler",
    "Documentación médica y hospitalaria",
    "Documentos administrativos y trámites con organismos oficiales",
    "Gestiones bancarias y documentación financiera",
    "Apoyo en formularios, citas y comunicaciones importantes",

    "Acompañamiento presencial",
    "Estamos contigo donde de verdad importa: cerca, presentes y profesionales",
    "Médicos, consultas y seguimiento sanitario",
    "Hospitales, pruebas e ingresos",
    "Notarías, firmas y poderes",
    "Bancos y gestiones financieras",
    "Organismos oficiales y administraciones",
    "Aeropuerto y desplazamientos importantes",
    "Compra y venta de vivienda con interpretación presencial",

    "Seguimiento completo del proceso",
    "Lo que nos diferencia es la forma de estar: personalmente, de cerca y hasta el final",
    "Organización y seguimiento de citas y gestiones",
    "Explicación clara de documentos y de cada paso",
    "Comunicación con profesionales, entidades y oficinas",
    "Apoyo en documentación de vivienda, contratos y trámites",
    "Acompañamiento en gestiones personales complejas",
    "Presencia cercana hasta cerrar cada proceso",
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
