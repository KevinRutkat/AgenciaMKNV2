"use client";

import Link from "next/link";
import { useMultipleTranslations } from "@/hooks/useTranslation";
import { useState, useEffect } from "react";

export default function Footer() {
  const [mounted, setMounted] = useState(false);

  const textsToTranslate = [
    "Agencia MKN",
    "Tu agencia inmobiliaria de confianza cerca del mar. Especialistas en propiedades costeras, villas frente al mar y inversiones inmobiliarias.",
    "También ofrecemos servicios profesionales de traducción e interpretación para clientes internacionales, garantizando comunicación fluida en múltiples idiomas para todas tus necesidades inmobiliarias.",
    "Enlaces rápidos",
    "🏠 Inicio",
    "🏖️ Propiedades",
    "👥 Servicios",
    "📞 Contacto",
    "Contacto",
    "📧 marionrutkat@gmail.com",
    "📞 +34 634 73 79 49",
  ];

  const translations = useMultipleTranslations(textsToTranslate);

  const [
    tituloAgencia,
    descripcionInmobiliaria,
    descripcionTraduccion,
    enlacesRapidosTitle,
    inicioText,
    propiedadesText,
    serviciosText,
    contactoText,
    contactoTitle,
    emailText,
    telefonoText,
  ] = mounted ? translations : textsToTranslate;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-gradient-to-r from-teal-800 to-teal-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Info de Agencia MKN */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-orange-300">
              {tituloAgencia}
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <p className="text-sm sm:text-base text-teal-100 leading-relaxed">
                {descripcionInmobiliaria}
              </p>
              <p className="text-sm sm:text-base text-teal-100 leading-relaxed">
                {descripcionTraduccion}
              </p>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-orange-300">
              {enlacesRapidosTitle}
            </h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm sm:text-base text-teal-100 hover:text-orange-300 transition-colors block py-1"
                >
                  {inicioText}
                </Link>
              </li>
              <li>
                <Link
                  href="/propiedades"
                  className="text-sm sm:text-base text-teal-100 hover:text-orange-300 transition-colors block py-1"
                >
                  {propiedadesText}
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios"
                  className="text-sm sm:text-base text-teal-100 hover:text-orange-300 transition-colors block py-1"
                >
                  {serviciosText}
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-sm sm:text-base text-teal-100 hover:text-orange-300 transition-colors block py-1"
                >
                  {contactoText}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-orange-300">
              {contactoTitle}
            </h4>
            <div className="space-y-1.5 sm:space-y-2 text-teal-100">
              <p className="text-sm sm:text-base break-all">
                <a
                  href="mailto:marionrutkat@gmail.com"
                  className="hover:text-orange-300 transition-colors"
                >
                  {emailText}
                </a>
              </p>
              <p className="text-sm sm:text-base">
                <a
                  href="tel:+34634737949"
                  className="hover:text-orange-300 transition-colors"
                >
                  {telefonoText}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-teal-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-teal-200">
          <p className="text-xs sm:text-sm">
            &copy; 2025 Agencia Inmobiliaria MKN. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
