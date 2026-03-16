"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, OverlayView } from "@react-google-maps/api";
import { MapPinIcon as MapPinOutlineIcon } from "@heroicons/react/24/outline";
import { MapPinIcon as MapPinSolidIcon } from "@heroicons/react/24/solid";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
import { supabase, Vivienda, ViviendaImage } from "@/lib/supabase";
import {
  formatEnergyEfficiencyLabel,
  getEnergyEfficiencyBadgeClass,
} from "@/lib/energyEfficiency";
import { formatMonthlyPrice, isRentListing } from "@/lib/viviendaUtils";
import { useMultipleTranslations } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";

const fallbackCenter = {
  lat: 37.627368,
  lng: -0.710618,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  gestureHandling: "cooperative" as const,
};

export default function ViviendasCostaSection() {
  const router = useRouter();
  const { isLoaded, loadError } = useGoogleMaps();
  const [viviendas, setViviendas] = useState<Vivienda[]>([]);
  const [images, setImages] = useState<ViviendaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const isMapInteractingRef = useRef(false);
  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const textsToTranslate = [
    "Viviendas por toda la costa",
    "Pasa el raton o toca un icono para ver detalles. Haz click para abrir la ficha.",
    "Cargando viviendas...",
    "No hay viviendas con ubicacion disponible.",
    "Consultar",
    "Alquiler",
    "Venta",
    "Sin imagen",
    "Error cargando el mapa",
    "Cargando mapa...",
  ];

  const [
    sectionTitle,
    mapHint,
    loadingText,
    noLocationsText,
    priceFallback,
    rentLabel,
    saleLabel,
    noImageLabel,
    mapErrorText,
    mapLoadingText,
  ] = useMultipleTranslations(textsToTranslate);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const imagesPromise = async () => {
          const orderedResponse = await supabase
            .from("vivienda_images")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("inserted_at", { ascending: true });

          if (!orderedResponse.error) {
            return orderedResponse;
          }

          const fallbackResponse = await supabase
            .from("vivienda_images")
            .select("*")
            .order("inserted_at", { ascending: true });

          return fallbackResponse;
        };

        const [viviendasResponse, imagesResponse] = await Promise.all([
          supabase
            .from("viviendas")
            .select("*")
            .order("inserted_at", { ascending: false }),
          imagesPromise(),
        ]);

        if (!isMounted) return;

        if (viviendasResponse.error) {
          console.error("Error fetching viviendas:", viviendasResponse.error);
        } else {
          setViviendas(viviendasResponse.data || []);
        }

        if (imagesResponse.error) {
          console.error("Error fetching images:", imagesResponse.error);
        } else {
          setImages(imagesResponse.data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  const viviendasWithCoords = useMemo(
    () =>
      viviendas.filter(
        (vivienda) =>
          Number.isFinite(vivienda.lat) && Number.isFinite(vivienda.lng),
      ),
    [viviendas],
  );

  const imagesByViviendaId = useMemo(() => {
    const map = new Map<number, ViviendaImage>();
    images.forEach((image) => {
      if (!map.has(image.vivienda_id)) {
        map.set(image.vivienda_id, image);
      }
    });
    return map;
  }, [images]);

  const mapCenter = useMemo(() => {
    if (viviendasWithCoords.length === 0) return fallbackCenter;
    const totals = viviendasWithCoords.reduce(
      (acc, vivienda) => {
        acc.lat += vivienda.lat;
        acc.lng += vivienda.lng;
        return acc;
      },
      { lat: 0, lng: 0 },
    );
    return {
      lat: totals.lat / viviendasWithCoords.length,
      lng: totals.lng / viviendasWithCoords.length,
    };
  }, [viviendasWithCoords]);

  const lockMapInteraction = (duration = 250) => {
    isMapInteractingRef.current = true;
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      isMapInteractingRef.current = false;
    }, duration);
  };

  const handleNavigate = (id: number) => {
    if (isMapInteractingRef.current) return;
    router.push(`/propiedades/${id}`);
  };

  return (
    <section className="mb-16 sm:mb-20">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-neutral-gray shadow-sm">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-dark mb-3 sm:mb-4 text-center font-display">
          <span className="inline-flex items-center gap-2">
            <MapPinOutlineIcon className="h-7 w-7 text-primary-blue" />
            {sectionTitle}
          </span>
        </h2>

        <div className="space-y-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-base text-neutral-muted mb-4">{mapHint}</p>

            {loading && (
              <div className="text-sm text-neutral-muted">{loadingText}</div>
            )}
            {!loading && viviendasWithCoords.length === 0 && (
              <div className="text-sm text-neutral-muted">{noLocationsText}</div>
            )}
          </div>

          <div className="relative h-96 lg:h-[420px] rounded-2xl overflow-hidden border border-neutral-gray shadow-sm">
            {isLoaded && !loadError ? (
              <GoogleMap
                mapContainerStyle={{ height: "100%", width: "100%" }}
                zoom={viviendasWithCoords.length > 0 ? 10 : 12}
                center={mapCenter}
                options={mapOptions}
                onDragStart={() => {
                  isMapInteractingRef.current = true;
                  if (interactionTimeoutRef.current) {
                    clearTimeout(interactionTimeoutRef.current);
                  }
                }}
                onDragEnd={() => lockMapInteraction(250)}
                onZoomChanged={() => {
                  lockMapInteraction(250);
                }}
              >
                {viviendasWithCoords.map((vivienda, index) => {
                  const isRent = isRentListing(vivienda);
                  const formattedPrice = formatMonthlyPrice(
                    vivienda.price,
                    isRent,
                  );
                  const priceLabel = formattedPrice || priceFallback;
                  const markerLabel = formattedPrice
                    ? isRent
                      ? `${rentLabel} ${formattedPrice}`
                      : formattedPrice
                    : priceFallback;
                  const energyEfficiencyLabel = formatEnergyEfficiencyLabel(
                    vivienda.eficiencia_energetica,
                  );
                  const energyEfficiencyBadgeClass =
                    getEnergyEfficiencyBadgeClass(
                      vivienda.eficiencia_energetica,
                    );
                  const primaryImage = imagesByViviendaId.get(vivienda.id);

                  return (
                    <OverlayView
                      key={vivienda.id}
                      position={{ lat: vivienda.lat, lng: vivienda.lng }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                      getPixelPositionOffset={() => ({
                        x: 0,
                        y: 0,
                      })}
                    >
                      <div className="map-marker-overlay">
                        <div className="map-marker-anchor group">
                          <button
                            type="button"
                            className="map-marker-trigger focus-visible:outline-none"
                            style={{ animationDelay: `${index * 0.08}s` }}
                            aria-label={`${vivienda.name} - ${markerLabel}`}
                            onClick={() => handleNavigate(vivienda.id)}
                          >
                            <span
                              className="px-2 py-1 bg-white/95 border border-neutral-gray text-xs font-semibold rounded-full shadow-md text-neutral-dark whitespace-nowrap"
                            >
                              {markerLabel}
                            </span>
                            <MapPinSolidIcon
                              className={`map-marker-icon h-7 w-7 ${
                                isRent ? "text-primary-blue" : "text-accent-coral"
                              }`}
                            />
                          </button>

                          <div className="map-marker-card absolute left-1/2 bottom-12 w-64 -translate-x-1/2 opacity-0 pointer-events-none translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0">
                            <button
                              type="button"
                              onClick={() => handleNavigate(vivienda.id)}
                              className="w-full text-left bg-white rounded-2xl border border-neutral-gray shadow-lg overflow-hidden hover-bg-neutral-gray transition-colors"
                            >
                              <div className="relative h-28 bg-neutral-light">
                                {primaryImage ? (
                                  <Image
                                    src={primaryImage.url}
                                    alt={`${vivienda.name} en ${vivienda.location}`}
                                    fill
                                    sizes="260px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-neutral-muted text-xs">
                                    {noImageLabel}
                                  </div>
                                )}
                              </div>
                              <div className="p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                                      isRent
                                        ? "bg-primary-blue-light text-primary-blue"
                                        : "bg-accent-coral-light text-accent-coral"
                                    }`}
                                  >
                                    {isRent ? rentLabel : saleLabel}
                                  </span>
                                </div>
                                <h3 className="text-sm font-semibold text-neutral-dark line-clamp-1">
                                  {vivienda.name}
                                </h3>
                                <p className="text-xs text-neutral-muted mt-1 flex items-center gap-1.5 min-w-0">
                                  <MapPinOutlineIcon className="h-3.5 w-3.5 text-neutral-muted shrink-0" />
                                  <span className="truncate min-w-0">
                                    {vivienda.location}
                                  </span>
                                </p>
                                {vivienda.property_type && (
                                  <p className="text-xs text-neutral-muted mt-1 capitalize truncate">
                                    {vivienda.property_type}
                                  </p>
                                )}
                                {energyEfficiencyLabel && (
                                  <div className="mt-2">
                                    <span
                                      className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${energyEfficiencyBadgeClass}`}
                                    >
                                      Eficiencia: {energyEfficiencyLabel}
                                    </span>
                                  </div>
                                )}
                                <p className="text-sm font-semibold text-neutral-dark mt-2">
                                  {priceLabel}
                                </p>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </OverlayView>
                  );
                })}
              </GoogleMap>
            ) : (
              <div className="w-full h-full bg-neutral-light flex items-center justify-center">
                <div className="text-center text-neutral-muted">
                  <MapPinOutlineIcon className="h-10 w-10 text-primary-blue mx-auto mb-4" />
                  <p className="text-base font-semibold">
                    {loadError ? mapErrorText : mapLoadingText}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
