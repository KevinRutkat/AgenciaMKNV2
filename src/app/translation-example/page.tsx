'use client'

import { CheckIcon } from '@heroicons/react/24/outline';
import { useTranslation, useMultipleTranslations } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TranslationExample() {
  const { currentLanguage, isTranslating } = useLanguage();
  
  // Ejemplo de traduccion de un texto individual
  const welcomeText = useTranslation("Bienvenido a nuestra agencia inmobiliaria");
  const descriptionText = useTranslation("Ofrecemos los mejores servicios de venta y alquiler de propiedades");
  
  // Ejemplo de traduccion de multiples textos
  const navItems = useMultipleTranslations([
    "Inicio",
    "Propiedades", 
    "Servicios",
    "Contacto"
  ]);

  const features = useMultipleTranslations([
    "Asesoramiento personalizado",
    "Gestion integral de documentos",
    "Acompanamiento durante todo el proceso",
    "Experiencia en el mercado local"
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Indicador de estado de traduccion */}
        {isTranslating && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-blue-700 text-sm">Traduciendo contenido...</span>
            </div>
          </div>
        )}

        {/* Informacion del idioma actual */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-2">Estado de traduccion</h2>
          <p className="text-gray-600">
            Idioma actual: <span className="font-medium">{currentLanguage.toUpperCase()}</span>
          </p>
        </div>

        {/* Ejemplo de contenido traducido */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {welcomeText}
          </h1>
          
          <p className="text-lg text-gray-700 mb-8">
            {descriptionText}
          </p>

          {/* Navegacion traducida */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Navegacion traducida:</h3>
            <div className="flex flex-wrap gap-4">
              {navItems.map((item, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Caracteristicas traducidas */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Nuestros servicios:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <li 
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Codigo de ejemplo */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Ejemplo de codigo:</h3>
          <pre className="text-sm overflow-x-auto">
            <code>{`// Traduccion de un texto individual
const welcomeText = useTranslation("Bienvenido a nuestra agencia");

// Traduccion de multiples textos
const navItems = useMultipleTranslations([
  "Inicio",
  "Propiedades", 
  "Servicios",
  "Contacto"
]);

// Usar en JSX
return <h1>{welcomeText}</h1>;`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
