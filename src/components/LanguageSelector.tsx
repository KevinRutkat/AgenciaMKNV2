'use client'

import { useState, useMemo, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '@/contexts/LanguageContext';

export default function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mapeo de idioma -> código de país para flag-icons (ISO 3166-1 alpha-2)
  const flagCodeByLang: Record<SupportedLanguage, string> = useMemo(() => ({
    es: 'es',     // España
    en: 'gb',     // Reino Unido (o 'us' si prefieres EE.UU.)
    fr: 'fr',
    de: 'de',
    it: 'it',
    pt: 'pt',     // Portugal (o 'br' si prefieres Brasil)
    ca: 'ad',     // Andorra (alternativa para Català)
    zh: 'cn',
  }), []);

  const Flag = ({ code }: { code: SupportedLanguage }) => (
    <span className={`fi fi-${flagCodeByLang[code]}`} aria-hidden="true" />
  );

  const handleLanguageChange = (language: SupportedLanguage) => {
    setLanguage(language);
    setIsOpen(false);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="relative">
        <button 
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          disabled
        >
          <span className="fi fi-es" aria-hidden="true" />
          <span className="text-sm font-medium">Español</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
        aria-label="Cambiar idioma"
      >
        {/* En móviles mostramos solo la bandera */}
        <span className="sm:hidden text-lg">
          <Flag code={currentLanguage} />
        </span>
        {/* En pantallas sm+ mostramos el nombre + bandera al lado */}
        <span className="text-sm font-medium text-gray-700 hidden sm:flex sm:items-center">
          {SUPPORTED_LANGUAGES[currentLanguage].name}
          <span className="ml-2 text-base leading-none"><Flag code={currentLanguage} /></span>
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown de idiomas */}
      {isOpen && (
        <>
          {/* Overlay para cerrar el dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Lista de idiomas */}
          <div className="absolute top-full mt-2 right-0 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, language]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code as SupportedLanguage)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors duration-150 ${
                  currentLanguage === code
                    ? 'bg-primary-blue-light text-primary-blue-dark font-medium'
                    : 'text-gray-700'
                }`}
              >
                {/* Texto del idioma con la bandera al lado */}
                <span className="flex-1 flex items-center">
                  {language.name}
                  <span className="ml-2 text-base leading-none"><Flag code={code as SupportedLanguage} /></span>
                </span>
                {/* Mostrar la bandera también al final cuando está seleccionado */}
                {currentLanguage === code && (
                  <span className="text-primary-blue">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
