"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Vivienda, ViviendaImage } from "@/lib/supabase";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  Squares2X2Icon,
  ArrowsPointingOutIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  GlobeAltIcon,
  SparklesIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { HomeIcon, MapPinIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useMultipleTranslations, useTranslation } from "@/hooks/useTranslation";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
import ContactPopup from "@/components/ContactPopup";
import { FEATURES, normalizeFeature } from "@/lib/features";
import { formatMonthlyPrice, isRentListing } from "@/lib/viviendaUtils";

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
    "No aplica",
    "Habitaciones",
    "Baños",
    "Plantas",
    "Contactar",
    "Características",
    "Descripción",
    "Ubicación",
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
    banosText,
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

  const getFeatureLabel = (property: string): string => {
    const normalized = normalizeFeature(property);
    const match = FEATURES.find(
      (f) => f.key === normalized || normalizeFeature(f.label) === normalized,
    );

    if (match) {
      return match.label;
    }

    return property;
  };

  const isRent = isRentListing(vivienda);

  return (
    <div className="min-h-screen bg-kehre-gradient-light">
      <div className="bg-white border-b border-neutral-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-muted hover-text-neutral-dark transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            {volverText}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-dark mb-2 flex items-center flex-wrap gap-3 font-display">
            {vivienda.name}
            {vivienda.is_sold && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-dark text-white text-xs sm:text-sm font-semibold">
                <CheckBadgeIcon className="h-4 w-4" />
                {soldText}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-2 text-neutral-muted">
            <MapPinIcon className="h-5 w-5" />
            <span>{vivienda.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="relative bg-neutral-light rounded-2xl overflow-hidden aspect-[4/3] border border-neutral-gray">
              {images.length > 0 ? (
                <>
                  <Image
                    src={images[currentImageIndex].url}
                    alt={`${vivienda.name} - Imagen ${currentImageIndex + 1}`}
                    fill
                    priority={true}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                    className={`object-cover ${vivienda.is_sold ? "opacity-70" : ""}`}
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-sm border border-neutral-gray"
                      >
                        <ChevronLeftIcon className="h-6 w-6 text-neutral-muted" />
                      </button>

                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-sm border border-neutral-gray"
                      >
                        <ChevronRightIcon className="h-6 w-6 text-neutral-muted" />
                      </button>

                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 text-neutral-dark px-3 py-1 rounded-full text-sm border border-neutral-gray">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <HomeIcon className="h-16 w-16 text-neutral-muted" />
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
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm border border-neutral-gray"
                  style={{ marginLeft: "-12px" }}
                >
                  <ChevronLeftIcon className="h-4 w-4 text-neutral-muted" />
                </button>

                <button
                  onClick={() => {
                    const container =
                      document.getElementById("preview-container");
                    if (container) {
                      container.scrollBy({ left: 160, behavior: "smooth" });
                    }
                  }}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm border border-neutral-gray"
                  style={{ marginRight: "-12px" }}
                >
                  <ChevronRightIcon className="h-4 w-4 text-neutral-muted" />
                </button>

                <div
                  id="preview-container"
                  className="flex gap-3 overflow-x-auto pb-2 scroll-smooth px-6"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#9ca3af #f3f4f6",
                  }}
                >
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => goToImage(index)}
                      className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        index === currentImageIndex
                          ? "border-primary-blue scale-105 shadow-sm"
                          : "border-neutral-gray hover:border-neutral-muted"
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
                            ? "bg-primary-blue"
                            : "bg-black/50"
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
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-neutral-gray shadow-sm">
              <div className="mb-6">
                <div className="text-3xl font-semibold text-neutral-dark mb-2">
                  {formatMonthlyPrice(vivienda.price, isRent)}
                  {vivienda.oldprice && (
                    <span className="text-lg text-accent-coral line-through ml-3">
                      {formatMonthlyPrice(vivienda.oldprice, isRent)}
                    </span>
                  )}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-light text-neutral-muted rounded-full text-sm font-medium border border-neutral-gray">
                  {!isRent && (
                    <TagIcon className="h-4 w-4 text-neutral-muted" />
                  )}
                  <span>{isRent ? alquilerText : ventaText}</span>
                  {vivienda.property_type && (
                    <>
                      <span className="text-neutral-muted">&middot;</span>
                      <span>
                        {`${vivienda.property_type.charAt(0).toUpperCase()}${vivienda.property_type.slice(1)}`}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-neutral-light p-4 rounded-xl text-center border border-neutral-gray">
                  <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-neutral-dark mb-1">
                    <Squares2X2Icon className="h-5 w-5 text-neutral-muted" />
                    <span>{Number(vivienda.habitaciones) === 0 ? "N/A" : vivienda.habitaciones}</span>
                  </div>
                  <div className="text-sm text-neutral-muted font-medium">
                    {Number(vivienda.habitaciones) === 0
                      ? noAplicableText
                      : habitacionesText}
                  </div>
                </div>
                <div className="bg-neutral-light p-4 rounded-xl text-center border border-neutral-gray">
                  <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-neutral-dark mb-1">
                    <SparklesIcon className="h-5 w-5 text-neutral-muted" />
                    <span>{Number(vivienda.bathroom) === 0 ? "N/A" : vivienda.bathroom}</span>
                  </div>
                  <div className="text-sm text-neutral-muted font-medium">
                    {Number(vivienda.bathroom) === 0 ? noAplicableText : banosText}
                  </div>
                </div>
                <div className="bg-neutral-light p-4 rounded-xl text-center border border-neutral-gray">
                  <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-neutral-dark mb-1">
                    <ArrowsPointingOutIcon className="h-5 w-5 text-neutral-muted" />
                    <span>{vivienda.metros}</span>
                  </div>
                  <div className="text-sm text-neutral-muted font-medium">m²</div>
                </div>
                <div className="bg-neutral-light p-4 rounded-xl text-center border border-neutral-gray">
                  <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-neutral-dark mb-1">
                    <BuildingOffice2Icon className="h-5 w-5 text-neutral-muted" />
                    <span>{vivienda.plantas}</span>
                  </div>
                  <div className="text-sm text-neutral-muted font-medium">
                    {plantasText}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowContact(true)}
                className="w-full bg-primary-blue text-white py-3 px-6 rounded-full font-semibold hover-bg-primary-blue-dark transition-all duration-200"
              >
                {contactarText}
              </button>
            </div>
          </div>
        </div>

        {/* Características */}
        {propiedades.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-6 border border-neutral-gray shadow-sm">
            <h3 className="text-2xl font-semibold text-neutral-dark mb-6 font-display">
              {caracteristicasText}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {propiedades.map((propiedad: string, index: number) => {
                const label = getFeatureLabel(propiedad);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-neutral-muted p-2 rounded-md bg-neutral-light border border-neutral-gray text-sm"
                  >
                    <CheckCircleIcon className="h-4 w-4 text-primary-blue flex-shrink-0" />
                    <span className="capitalize font-medium text-xs leading-tight text-neutral-dark">
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
          <div className="mt-8 bg-white rounded-2xl p-6 border border-neutral-gray shadow-sm">
            <h3 className="text-xl font-semibold text-neutral-dark mb-4">
              {descripcionText}
            </h3>
            <p className="text-neutral-muted leading-relaxed whitespace-pre-line">
              {translatedDescription}
            </p>
          </div>
        )}

        {/* Ubicación */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-neutral-gray shadow-sm">
          <h3 className="text-xl font-semibold text-neutral-dark mb-4">
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
            <div className="bg-neutral-light rounded-xl h-64 flex items-center justify-center border border-neutral-gray">
              <div className="text-center text-neutral-muted">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-dark mx-auto mb-2" />
                <p>{cargandoMapaText}</p>
              </div>
            </div>
          )}

          {isLoaded && !loadError && vivienda.lat && vivienda.lng && (
            <div className="rounded-xl overflow-hidden border border-neutral-gray">
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
            <div className="mt-4 p-3 bg-neutral-light rounded-lg border border-neutral-gray">
              <p className="text-sm text-neutral-muted flex items-center gap-2">
                <GlobeAltIcon className="h-4 w-4 text-neutral-muted" />
                <span className="font-medium text-neutral-dark">{coordenadasLabel}</span>
                <span>{vivienda.lat.toFixed(6)}, {vivienda.lng.toFixed(6)}</span>
              </p>
              {vivienda.location && (
                <p className="text-sm text-neutral-muted mt-1 flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-neutral-muted" />
                  <span className="font-medium text-neutral-dark">{direccionLabel}</span>
                  <span>{vivienda.location}</span>
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
