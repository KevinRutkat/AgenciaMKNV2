"use client";

import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";

const agencyLocation = {
  lat: 37.627368,
  lng: -0.710618,
};

export default function MapSection() {
  const { isLoaded, loadError } = useGoogleMaps();

  return (
    <div>
      <div className="relative h-80 lg:h-96 rounded-lg overflow-hidden shadow-md">
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
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-700">
              <div className="text-5xl mb-4">🗺️</div>
              <p className="text-lg font-semibold">
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
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          🔗 Ver en Google Maps
        </a>
      </div>
    </div>
  );
}
