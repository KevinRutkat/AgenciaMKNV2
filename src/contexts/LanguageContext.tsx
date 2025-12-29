'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// Idiomas soportados
export const SUPPORTED_LANGUAGES = {
  es: { name: 'Español' },
  en: { name: 'English' },
  fr: { name: 'Français' },
  de: { name: 'Deutsch' },
  it: { name: 'Italiano' },
  pt: { name: 'Português' },
  ca: { name: 'Català' },
  zh: { name: '中文' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Cache para las traducciones
const translationCache = new Map<string, string>();
// Promesas en vuelo para evitar duplicar peticiones de la misma clave
const inFlightTranslations = new Map<string, Promise<string>>();
// Prefijo para cache en sessionStorage (persiste por pestaña/sesión del navegador)
const SS_CACHE_PREFIX = 'translation_cache_v1:';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  translate: (text: string, targetLanguage?: SupportedLanguage) => Promise<string>;
  isTranslating: boolean;
  clearTranslationCache: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('es');
  const [isTranslating, setIsTranslating] = useState(false);
  // Contador de traducciones activas para evitar parpadeos en el estado
  const activeCountRef = useRef(0);

  // Mantener siempre español al abrir por defecto para evitar gastos innecesarios.
  // No restauramos automáticamente el idioma guardado; el usuario deberá elegirlo.
  useEffect(() => {
    // Opcional: si deseas permitir restauración explícita, activa con una flag en sessionStorage
    // const restore = sessionStorage.getItem('restoreLanguage') === '1';
    // if (restore) {
    //   const savedLanguage = localStorage.getItem('selectedLanguage') as SupportedLanguage;
    //   if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
    //     setCurrentLanguage(savedLanguage);
    //   }
    // }
  }, []);

  const clearTranslationCache = useCallback(() => {
    // Limpiar cache en memoria
    translationCache.clear();
    
    // Limpiar cache en sessionStorage
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(SS_CACHE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch {
      // Ignorar si sessionStorage no está disponible
    }
  }, []);

  const setLanguage = useCallback((language: SupportedLanguage) => {
    setCurrentLanguage(language);
    localStorage.setItem('selectedLanguage', language);
    
    // Si cambiamos a español, limpiar cualquier traducción residual del cache
    if (language === 'es') {
      clearTranslationCache();
    }
  // sessionStorage.setItem('restoreLanguage', '1'); // activar si se desea restaurar en recargas
  }, [clearTranslationCache]);

  const translate = useCallback(async (text: string, targetLanguage?: SupportedLanguage): Promise<string> => {
    const target = targetLanguage || currentLanguage;
    
    // Si el idioma objetivo es español, devolver el texto original
    if (target === 'es') {
      return text;
    }

    // Crear clave de cache
    const cacheKey = `${text}_${target}`;
    const ssKey = `${SS_CACHE_PREFIX}${cacheKey}`;
    
    // Verificar cache
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    // Verificar cache de sessionStorage (persistencia por sesión)
    try {
      const ssVal = sessionStorage.getItem(ssKey);
      if (ssVal) {
        translationCache.set(cacheKey, ssVal);
        return ssVal;
      }
    } catch {
      // sessionStorage puede no estar disponible en algunos entornos; continuar sin bloquear
    }

    // Evitar peticiones duplicadas si ya hay una en curso para la misma clave
    if (inFlightTranslations.has(cacheKey)) {
      return inFlightTranslations.get(cacheKey)!;
    }

    // Gestionar contador y estado de carga solo en transiciones 0->1 y 1->0
    const incActive = () => {
      activeCountRef.current += 1;
      if (activeCountRef.current === 1) {
        setIsTranslating(true);
      }
    };
    const decActive = () => {
      activeCountRef.current = Math.max(0, activeCountRef.current - 1);
      if (activeCountRef.current === 0) {
        setIsTranslating(false);
      }
    };

    try {
      incActive();

      // Crear y registrar la promesa en vuelo
      const promise = (async () => {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            targetLanguage: target,
          }),
        });

        if (!response.ok) {
          throw new Error('Error en la traducción');
        }

        const data = await response.json();
        const translatedText = data.translatedText as string;

        // Guardar en cache
        translationCache.set(cacheKey, translatedText);
        try {
          sessionStorage.setItem(ssKey, translatedText);
        } catch {
          // Ignorar si sessionStorage está lleno o no disponible
        }
        return translatedText;
      })();

      inFlightTranslations.set(cacheKey, promise);
      const result = await promise;
      return result;
    } catch (error) {
      console.error('Error traduciendo:', error);
      return text; // Devolver texto original en caso de error
    } finally {
      // Limpiar promesa en vuelo y actualizar estado
      inFlightTranslations.delete(cacheKey);
      decActive();
    }
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage,
      translate,
      isTranslating,
      clearTranslationCache,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
  }
  return context;
}