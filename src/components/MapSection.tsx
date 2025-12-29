"use client";

import { GoogleMap, Marker } from "@react-google-maps/api";
import { MapIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";

const agencyLocation = {
  lat: 37.627368,
  lng: -0.710618,
};

export default function MapSection() {
  const { isLoaded, loadError } = useGoogleMaps();

  return (
    <div>
      <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden border border-neutral-gray shadow-sm">
        {isLoaded && !loadError ? (
          <GoogleMap
            mapContainerStyle={{ height: "100%", width: "100%" }}
            zoom={15}
            center={agencyLocation}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: true,
              mapTypeControl: true,
              fullscreenControl: true,
              gestureHandling: "cooperative",
            }}
          >
            <Marker
              position={agencyLocation}
              title="Agencia MKN - Inmobiliaria y Servicios de Traducción"
            />
          </GoogleMap>
        ) : (
          <div className="w-full h-full bg-neutral-light flex items-center justify-center">
            <div className="text-center text-neutral-muted">
              <MapIcon className="h-10 w-10 text-primary-blue mx-auto mb-4" />
              <p className="text-base font-semibold">
                {loadError ? "Error cargando el mapa" : "Cargando mapa..."}
              </p>
              <p className="text-sm opacity-70">Cabo de Palos, Cartagena</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <a
          href="https://maps.google.com/?q=Agencia+MKN+Cabo+de+Palos+Murcia"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-full hover-bg-primary-blue-dark transition-colors text-sm font-medium"
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4" /> Ver en Google Maps
        </a>
      </div>
    </div>
  );
}
