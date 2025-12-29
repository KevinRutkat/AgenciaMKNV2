// Centralized list of property features with labels (no emojis).
// We store the label in DB and render UI with icons where needed.

export type Feature = {
  key: string; // normalized, lowercase key (no accents)
  label: string; // human label to persist in DB
};

// Utility: normalize a feature string for comparisons (remove emoji, accents, punctuation, lowercase)
export function normalizeFeature(value: string): string {
  if (!value) return "";
  const withoutEmoji = value.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "");
  const noAccents = withoutEmoji.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return noAccents
    .toLowerCase()
    .replace(/[^a-z0-9\s.\-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const FEATURES: Feature[] = [
  // Exteriores
  { key: "jardin", label: "Jardín" },
  { key: "jardin privado", label: "Jardín privado" },
  { key: "terraza", label: "Terraza" },
  { key: "terraza privada", label: "Terraza privada" },
  { key: "terraza solarium", label: "Terraza solárium" },
  { key: "patio trasero", label: "Patio trasero" },
  { key: "balcones", label: "Balcones" },
  { key: "balcon con vistas", label: "Balcón con vistas" },
  { key: "porche", label: "Porche" },
  { key: "cesped artificial", label: "Césped artificial" },
  { key: "barbacoa", label: "Barbacoa" },
  { key: "cocina exterior", label: "Cocina exterior" },
  { key: "comedor exterior", label: "Comedor exterior" },
  { key: "comedor exterior cubierto", label: "Comedor exterior cubierto" },
  { key: "trastero", label: "Trastero" },

  // Piscinas
  { key: "piscina privada", label: "Piscina privada" },
  { key: "piscina comunitaria", label: "Piscina comunitaria" },
  { key: "piscina climatizada", label: "Piscina climatizada" },
  { key: "piscina con jacuzzi", label: "Piscina con jacuzzi" },
  { key: "zona de piscina con tumbonas", label: "Zona de piscina con tumbonas" },

  // Cocina y equipamiento
  { key: "cocina equipada", label: "Cocina equipada" },
  { key: "cocina totalmente equipada", label: "Cocina totalmente equipada" },
  { key: "cocina independiente", label: "Cocina independiente" },
  { key: "isla central", label: "Isla central" },
  {
    key: "electrodomesticos (nevera, horno, microondas, lavavajillas)",
    label: "Electrodomésticos (nevera, horno, microondas, lavavajillas)",
  },
  { key: "nevera", label: "Nevera" },
  { key: "horno", label: "Horno" },
  { key: "microondas", label: "Microondas" },
  { key: "lavavajillas", label: "Lavavajillas" },
  { key: "campana extractora", label: "Campana extractora" },
  { key: "cocina de gas", label: "Cocina de gas" },
  { key: "cocina de induccion", label: "Cocina de inducción" },
  { key: "lavadora", label: "Lavadora" },

  // Parking / garaje
  { key: "garaje cerrado", label: "Garaje cerrado" },
  { key: "parking privado", label: "Parking privado" },
  { key: "plaza de garaje en propiedad", label: "Plaza de garaje en propiedad" },
  { key: "aparcamiento para varias plazas", label: "Aparcamiento para varias plazas" },
  { key: "estacionamiento techado", label: "Estacionamiento techado" },
  { key: "parking", label: "Parking" },

  // Vistas y orientacion / playa
  { key: "primera linea de playa", label: "Primera línea de playa" },
  { key: "acceso directo a la playa", label: "Acceso directo a la playa" },
  { key: "vistas al mar", label: "Vistas al mar" },
  { key: "vistas al campo o montanas", label: "Vistas al campo o montañas" },
  { key: "orientacion sur", label: "Orientación sur" },

  // Seguridad
  { key: "sistema de alarma", label: "Sistema de alarma" },
  { key: "camaras de vigilancia", label: "Cámaras de vigilancia" },
  { key: "rejas de seguridad", label: "Rejas de seguridad" },
  { key: "cerraduras de seguridad", label: "Cerraduras de seguridad" },
  { key: "detector de humo", label: "Detector de humo" },

  // Servicios y comodidades
  { key: "amueblado", label: "Amueblado" },
  {
    key: "accesible para personas con movilidad reducida",
    label: "Accesible para personas con movilidad reducida",
  },
  { key: "rampas de acceso", label: "Rampas de acceso" },
  { key: "ascensor en la propiedad", label: "Ascensor en la propiedad" },
  { key: "gimnasio comunitario", label: "Gimnasio comunitario" },
  { key: "zona de juegos infantil", label: "Zona de juegos infantil" },
  { key: "zona de padel o tenis", label: "Zona de pádel o tenis" },
  { key: "spa", label: "Spa" },
  { key: "wifi", label: "WiFi" },
  { key: "aire acondicionado", label: "Aire acondicionado" },
  { key: "calefaccion", label: "Calefacción" },
  { key: "led/bajo consumo", label: "LED/Bajo consumo" },
];

// Find a feature by any user-provided string (robust to accents/emoji/case)
export function findFeatureByAny(value: string): Feature | undefined {
  const norm = normalizeFeature(value);
  return FEATURES.find((f) => normalizeFeature(f.label) === norm || f.key === norm);
}
