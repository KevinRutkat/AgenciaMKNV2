'use client'

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function useTranslation(originalText: string): string {
  const { translate, currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(originalText);
  const prevKeyRef = useRef<string | null>(null);
  // Secuencia para invalidar respuestas antiguas (evita estados obsoletos al cambiar de idioma rápido)
  const seqRef = useRef(0);

  useEffect(() => {
    // Construir clave única para evitar actualizaciones innecesarias
    const key = `${originalText}__${currentLanguage}`;
    const mySeq = ++seqRef.current;

    // Español: actualizar siempre al texto original y cancelar cualquier respuesta antigua
    if (currentLanguage === 'es') {
      setTranslatedText(originalText);
      prevKeyRef.current = key;
      return () => {
        // invalidar cualquier respuesta anterior
        seqRef.current = Math.max(seqRef.current, mySeq);
      };
    }

    let cancelled = false;
    const translateText = async () => {
      try {
        const result = await translate(originalText);
        // Solo aplicar si esta llamada sigue siendo la más reciente y no está cancelada
        if (!cancelled && mySeq === seqRef.current) {
          setTranslatedText(result);
          prevKeyRef.current = key;
        }
      } catch (error) {
        console.error('Error traduciendo texto:', error);
        if (!cancelled && mySeq === seqRef.current) {
          setTranslatedText(originalText); // Fallback al texto original
          prevKeyRef.current = key;
        }
      }
    };

    translateText();

    return () => {
      cancelled = true;
    };
  }, [originalText, translate, currentLanguage]);

  return translatedText;
}

// Hook para traducir múltiples textos de una vez
export function useMultipleTranslations(texts: string[]): string[] {
  const { translate, currentLanguage } = useLanguage();
  const [translatedTexts, setTranslatedTexts] = useState(texts);
  const prevTextsRef = useRef<string[]>(texts);
  const prevLangRef = useRef<string>('es');
  // Secuencia para invalidar respuestas antiguas
  const seqRef = useRef(0);

  useEffect(() => {
    const areArraysEqual = (a: string[], b: string[]) => {
      if (a === b) return true;
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    };

    const mySeq = ++seqRef.current;

    if (currentLanguage === 'es') {
      // Evitar bucles: solo actualizar si cambia el contenido o cambia el idioma
      const contentChanged = !areArraysEqual(prevTextsRef.current, texts);
      const langChanged = prevLangRef.current !== currentLanguage;
      if (contentChanged || langChanged) {
        setTranslatedTexts(texts);
        prevTextsRef.current = texts;
        prevLangRef.current = currentLanguage;
      }
      return () => {
        // invalidar cualquier respuesta anterior
        seqRef.current = Math.max(seqRef.current, mySeq);
      };
    }

    let cancelled = false;
    const translateTexts = async () => {
      try {
        // Evitar retraducir si ni los textos ni el idioma han cambiado (optimización)
        if (areArraysEqual(prevTextsRef.current, texts) && prevLangRef.current === currentLanguage) {
          return;
        }
        const promises = texts.map(text => translate(text));
        const results = await Promise.all(promises);
        if (!cancelled && mySeq === seqRef.current) {
          setTranslatedTexts(results);
          prevTextsRef.current = texts;
          prevLangRef.current = currentLanguage;
        }
      } catch (error) {
        console.error('Error traduciendo textos:', error);
        if (!cancelled && mySeq === seqRef.current) {
          setTranslatedTexts(texts); // Fallback a los textos originales
          prevTextsRef.current = texts;
          prevLangRef.current = currentLanguage;
        }
      }
    };

    translateTexts();

    return () => {
      cancelled = true;
    };
  }, [texts, translate, currentLanguage]);

  return translatedTexts;
}
