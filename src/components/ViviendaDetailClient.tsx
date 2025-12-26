"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Vivienda, ViviendaImage } from "@/lib/supabase";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { HomeIcon, MapPinIcon } from "@heroicons/react/24/solid";
import { GoogleMap, Marker } from "@react-google-maps/api";
import {
  useMultipleTranslations,
  useTranslation,
} from "@/hooks/useTranslation";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
import ContactPopup from "@/components/ContactPopup";
import { FEATURES, normalizeFeature } from "@/lib/features";

type Props = {
  vivienda: Vivienda;
  images: ViviendaImage[];
};

export default function ViviendaDetailClient({ vivienda, images }: Props) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContact, setShowContact] = useState(false);

  const { isLoaded, loadError } = useGoogleMaps();

  const textsToTranslate = [
    "Volver a propiedades",
    "Alquiler",
    "Venta",
    "No Aplicable",
    "Habitaciones",
    "Baños",
    "Plantas",
    "📞 Contactar",
    "✨ Características",
    "📝 Descripción",
    "📍 Ubicación",
    "Error cargando Google Maps",
    "Cargando mapa...",
    "Coordenadas no disponibles",
    "Esta propiedad no tiene ubicación registrada",
    "Coordenadas:",
    "Dirección:",
    "Vendido",
  ];

  const [
    volverText,
    alquilerText,
    ventaText,
    noAplicableText,
    habitacionesText,
    bañosText,
    plantasText,
    contactarText,
    caracteristicasText,
    descripcionText,
    ubicacionText,
    errorMapaText,
    cargandoMapaText,
    coordenadasNoDisponiblesText,
    propiedadSinUbicacionText,
    coordenadasLabel,
    direccionLabel,
    soldText,
  ] = useMultipleTranslations(textsToTranslate);

  const translatedDescription = useTranslation(vivienda.descripcion || "");

  // ⚡ MEJORA DE RENDIMIENTO: useMemo en lugar de useState + useEffect
  const propiedades = useMemo(() => {
    if (Array.isArray(vivienda.propiedades)) {
      return vivienda.propiedades;
    } else if (
      vivienda.propiedades &&
      typeof vivienda.propiedades === "string" &&
      vivienda.propiedades.trim().length > 0
    ) {
      return vivienda.propiedades
        .split(",")
        .map((prop: string) => prop.trim())
        .filter((prop: string) => prop.length > 0);
    }
    return [];
  }, [vivienda.propiedades]);

  // Sincronizar scroll del preview
  useEffect(() => {
    if (images.length > 1) {
      scrollToPreview(currentImageIndex);
    }
  }, [currentImageIndex, images.length]);

  const nextImage = useCallback(() => {
    const newIndex =
      currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(newIndex);
    scrollToPreview(newIndex);
  }, [currentImageIndex, images.length]);

  const prevImage = useCallback(() => {
    const newIndex =
      currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
    scrollToPreview(newIndex);
  }, [currentImageIndex, images.length]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (images.length <= 1) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevImage();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, prevImage, nextImage]);

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    scrollToPreview(index);
  };

  const scrollToPreview = (index: number) => {
    const container = document.getElementById("preview-container");
    if (!container) return;

    const previewItem = container.children[index] as HTMLElement;
    if (!previewItem) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = previewItem.getBoundingClientRect();

    const isVisible =
      itemRect.left >= containerRect.left &&
      itemRect.right <= containerRect.right;

    if (!isVisible) {
      const scrollLeft =
        previewItem.offsetLeft -
        container.offsetWidth / 2 +
        previewItem.offsetWidth / 2;
      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  };

  const getFeatureDisplay = (
    property: string,
  ): { emoji: string; label: string } => {
    const normalized = normalizeFeature(property);
    const match = FEATURES.find(
      (f) => f.key === normalized || normalizeFeature(f.label) === normalized,
    );

    if (match) {
      return {
        emoji: match.emoji ?? "✨",
        label: match.label,
      };
    }

    return {
      emoji: "✨",
      label: property,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con botón de volver */}
      <div className="bg-white shadow-sm border-b ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            {volverText}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        {/* Título y ubicación */}
        <div className="mb-8 ">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center flex-wrap gap-3 relative z-10">
            {vivienda.name}
            {vivienda.is_sold && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-600 text-white text-xs sm:text-sm font-semibold">
                🔴 {soldText}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-2 text-gray-600 relative z-10">
            <MapPinIcon className="h-5 w-5" />
            <span>{vivienda.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="relative bg-gray-200 rounded-lg overflow-hidden aspect-[4/3]">
              {images.length > 0 ? (
                <>
                  <Image
                    src={images[currentImageIndex].url}
                    alt={`${vivienda.name} - Imagen ${currentImageIndex + 1}`}
                    fill
                    // ⚡ MEJORA: Prioridad en la imagen principal para LCP
                    priority={true} 
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                    className={`object-cover ${
                      vivienda.is_sold ? "opacity-70" : ""
                    }`}
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 gallery-nav-button rounded-full p-2 shadow-lg gallery-transition cursor-pointer"
                      >
                        <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
                      </button>

                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 gallery-nav-button rounded-full p-2 shadow-lg gallery-transition cursor-pointer"
                      >
                        <ChevronRightIcon className="h-6 w-6 text-gray-700" />
                      </button>

                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <HomeIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Preview de imágenes */}
            {images.length > 1 && (
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none rounded-l-lg" />
                <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none rounded-r-lg" />

                <button
                  onClick={() => {
                    const container =
                      document.getElementById("preview-container");
                    if (container) {
                      container.scrollBy({
                        left: -160,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-lg border border-gray-200 transition-all duration-200 cursor-pointer hover:scale-110"
                  style={{ marginLeft: "-12px" }}
                >
                  <ChevronLeftIcon className="h-4 w-4 text-gray-700" />
                </button>

                <button
                  onClick={() => {
                    const container =
                      document.getElementById("preview-container");
                    if (container) {
                      container.scrollBy({ left: 160, behavior: "smooth" });
                    }
                  }}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-lg border border-gray-200 transition-all duration-200 cursor-pointer hover:scale-110"
                  style={{ marginRight: "-12px" }}
                >
                  <ChevronRightIcon className="h-4 w-4 text-gray-700" />
                </button>

                <div
                  id="preview-container"
                  className="flex gap-3 overflow-x-auto pb-2 scroll-smooth px-6"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#6B7280 #F3F4F6",
                  }}
                >
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => goToImage(index)}
                      className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                        index === currentImageIndex
                          ? "border-blue-600 scale-110 shadow-lg ring-2 ring-blue-200"
                          : "border-gray-300 hover:border-gray-500 hover:scale-105"
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={`${vivienda.name} - Vista previa ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 64px, 80px"
                        className="object-cover"
                      />
                      <div
                        className={`absolute top-0.5 left-0.5 text-xs font-bold px-1 rounded text-white ${
                          index === currentImageIndex
                            ? "bg-blue-600"
                            : "bg-black/60"
                        }`}
                      >
                        {index + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Información de la vivienda */}
          <div className="space-y-6 ">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  💰 {vivienda.price}€
                  {vivienda.oldprice && (
                    <span className="text-xl text-gray-500 line-through ml-3">
                      {vivienda.oldprice}€
                    </span>
                  )}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      vivienda.is_rent ? "bg-gray-600" : "bg-gray-800"
                    }`}
                  />
                  {vivienda.is_rent ? alquilerText : ventaText} •{" "}
                  {vivienda.property_type}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    🛏️{" "}
                    {Number(vivienda.habitaciones) === 0
                      ? "N/A"
                      : vivienda.habitaciones}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {Number(vivienda.habitaciones) === 0
                      ? noAplicableText
                      : habitacionesText}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    🚿{" "}
                    {Number(vivienda.bathroom) === 0
                      ? "N/A"
                      : vivienda.bathroom}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {Number(vivienda.bathroom) === 0
                      ? noAplicableText
                      : bañosText}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    📐 {vivienda.metros}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">m²</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    🏢 {vivienda.plantas}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {plantasText}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowContact(true)}
                className="w-full bg-gray-900 text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              >
                {contactarText}
              </button>
            </div>
          </div>
        </div>

        {/* Características */}
        {propiedades.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              {caracteristicasText}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {propiedades.map((propiedad: string, index: number) => {
                const { emoji, label } = getFeatureDisplay(propiedad);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-gray-700 p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 text-sm"
                  >
                    <span className="text-sm flex-shrink-0">{emoji}</span>
                    <span className="capitalize font-medium text-xs leading-tight">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Descripción */}
        {vivienda.descripcion && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100 relative z-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {descripcionText}
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {translatedDescription}
            </p>
          </div>
        )}

        {/* Ubicación */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100 relative z-10">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {ubicacionText}
          </h3>

          {loadError && (
            <div className="bg-red-50 rounded-xl h-64 flex items-center justify-center border border-red-200">
              <div className="text-center text-red-500">
                <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
                <p>{errorMapaText}</p>
              </div>
            </div>
          )}

          {!isLoaded && !loadError && (
            <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center border border-gray-200">
              <div className="text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2" />
                <p>{cargandoMapaText}</p>
              </div>
            </div>
          )}

          {isLoaded && !loadError && vivienda.lat && vivienda.lng && (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <GoogleMap
                mapContainerStyle={{ height: "300px", width: "100%" }}
                zoom={15}
                center={{ lat: vivienda.lat, lng: vivienda.lng }}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                  streetViewControl: true,
                  mapTypeControl: true,
                  fullscreenControl: true,
                }}
              >
                <Marker
                  position={{ lat: vivienda.lat, lng: vivienda.lng }}
                  title={vivienda.name}
                />
              </GoogleMap>
            </div>
          )}

          {isLoaded && (!vivienda.lat || !vivienda.lng) && (
            <div className="bg-yellow-50 rounded-xl h-64 flex items-center justify-center border border-yellow-200">
              <div className="text-center text-yellow-600">
                <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
                <p>{coordenadasNoDisponiblesText}</p>
                <p className="text-sm">{propiedadSinUbicacionText}</p>
              </div>
            </div>
          )}

          {vivienda.lat && vivienda.lng && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                📍 <span className="font-medium">{coordenadasLabel}</span>{" "}
                {vivienda.lat.toFixed(6)}, {vivienda.lng.toFixed(6)}
              </p>
              {vivienda.location && (
                <p className="text-sm text-gray-600 mt-1">
                  🏠 <span className="font-medium">{direccionLabel}</span>{" "}
                  {vivienda.location}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {showContact && <ContactPopup onClose={() => setShowContact(false)} />}
    </div>
  );
}
