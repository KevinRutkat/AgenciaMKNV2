"use client";

import { useLanguage, SupportedLanguage } from "@/contexts/LanguageContext";

// Mensajes localizados para evitar gastar tokens en el indicador
const LOCALE_MESSAGES: Record<string, string> = {
  es: "Traduciendo contenido…",
  en: "Translating content…",
  fr: "Traduction du contenu…",
  de: "Inhalte werden übersetzt…",
  it: "Traduzione del contenuto…",
  pt: "Traduzindo conteúdo…",
  ca: "Traduïnt contingut…",
  zh: "正在翻译内容…",
};

// Map de idioma -> código de bandera (flag-icons)
const flagCodeByLang: Record<SupportedLanguage, string> = {
  es: "es",
  en: "gb",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
  ca: "ad",
  zh: "cn",
};

const Flag = ({ code }: { code: SupportedLanguage }) => (
  <span className={`fi fis fi-${flagCodeByLang[code]}`} aria-hidden="true" />
);

export default function TranslationLoadingIndicator() {
  const { isTranslating, currentLanguage } = useLanguage();

  if (!isTranslating) return null;

  const message = LOCALE_MESSAGES[currentLanguage] || LOCALE_MESSAGES.es;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-gray text-neutral-dark py-1 px-4 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
        <div className="animate-spin h-3 w-3 border-2 border-neutral-dark border-t-transparent rounded-full"></div>
        <span className="text-xs font-medium opacity-90 flex items-center space-x-1">
          <Flag code={currentLanguage} />
          <span>{message}</span>
        </span>
      </div>
    </div>
  );
}
