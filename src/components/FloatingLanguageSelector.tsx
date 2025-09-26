'use client'

import { useMemo, useState, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '@/contexts/LanguageContext';

interface FloatingLanguageSelectorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function FloatingLanguageSelector({ 
  position = 'bottom-left' 
}: FloatingLanguageSelectorProps) {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Map de idioma -> código de bandera (flag-icons)
  const flagCodeByLang: Record<SupportedLanguage, string> = useMemo(() => ({
    es: 'es',
    en: 'gb',
    fr: 'fr',
    de: 'de',
    it: 'it',
    pt: 'pt',
    ca: 'ad',
    zh: 'cn',
  }), []);

  const Flag = ({ code }: { code: SupportedLanguage }) => (
    <span 
      className={`fi fis fi-${flagCodeByLang[code]}`} 
      aria-hidden="true" 
    />
  );

  // Don't render during SSR to prevent hydration issues
  if (!mounted) {
    return null;
  }

  const handleLanguageChange = (language: SupportedLanguage) => {
    setLanguage(language);
    setIsOpen(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 left-4';
    }
  };

  const getDropdownPosition = () => {
    switch (position) {
      case 'top-left':
        return 'top-full mt-2 left-0';
      case 'top-right':
        return 'top-full mt-2 right-0';
      case 'bottom-left':
        return 'bottom-full mb-2 left-0';
      case 'bottom-right':
        return 'bottom-full mb-2 right-0';
      default:
        return 'top-full mt-2 left-0';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 floating-language-selector`}>
      {/* Botón flotante principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 overflow-hidden bg-white/80 backdrop-blur"
        aria-label="Cambiar idioma"
        title={`Idioma actual: ${SUPPORTED_LANGUAGES[currentLanguage].name}`}
      >
        {/* Bandera que ocupa todo el círculo */}
        <span className="absolute inset-0 flex items-center justify-center text-[32px] sm:text-[36px] leading-[0]">
          <Flag code={currentLanguage} />
        </span>
      </button>

      {/* Dropdown de idiomas */}
      {isOpen && (
        <>
          {/* Overlay para cerrar el dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Lista de idiomas */}
          <div className={`absolute ${getDropdownPosition()} w-56 bg-white/95 backdrop-blur border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto`}> 
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2 border-b border-gray-100">
                🌍 Seleccionar idioma
              </div>
              
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, language]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code as SupportedLanguage)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm text-left rounded-md transition-all duration-150 mt-1 ${
                    currentLanguage === code
                      ? 'bg-primary-blue text-white font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-blue'
                  }`}
                >
                  <span className="text-base dropdown-flag"><Flag code={code as SupportedLanguage} /></span>
          <span className="flex-1">{language.name}</span>
          {currentLanguage === code && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* Indicador de carga cuando se está traduciendo */}
      {/* Puedes expandir esto para mostrar un spinner durante las traducciones */}
    </div>
  );
}
