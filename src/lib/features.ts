// Centralized list of property features with labels and optional emojis
// We store label (without emoji) in DB, and only use emoji for UI rendering.

export type Feature = {
  key: string; // normalized, lowercase key (no accents)
  label: string; // human label to persist in DB
  emoji?: string;
};

// Utility: normalize a feature string for comparisons (remove emoji, accents, punctuation, lowercase)
export function normalizeFeature(value: string): string {
  if (!value) return "";
  // Remove emoji and non-word characters except spaces
  const withoutEmoji = value.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "");
  const noAccents = withoutEmoji.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return noAccents
    .toLowerCase()
    .replace(/[^a-z0-9\sáéíóúñü\.\-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const FEATURES: Feature[] = [
  // Exteriores
  { key: "jardin", label: "Jardín", emoji: "🌿" },
  { key: "jardin privado", label: "Jardín Privado", emoji: "🌱" },
  { key: "terraza", label: "Terraza", emoji: "🏡" },
  { key: "terraza privada", label: "Terraza Privada", emoji: "🏡" },
  { key: "terraza solarium", label: "Terraza Solárium", emoji: "☀️" },
  { key: "patio trasero", label: "Patio Trasero", emoji: "🧱" },
  { key: "balcones", label: "Balcones", emoji: "🏛️" },
  { key: "balcon con vistas", label: "Balcón con vistas", emoji: "🌅" },
  { key: "porche", label: "Porche", emoji: "🏘️" },
  { key: "cesped artificial", label: "Césped Artificial", emoji: "🌳" },
  { key: "barbacoa", label: "Barbacoa", emoji: "🔥" },
  { key: "cocina exterior", label: "Cocina exterior", emoji: "🍳" },
  { key: "comedor exterior", label: "Comedor exterior", emoji: "�️" },
  { key: "comedor exterior cubierto", label: "Comedor exterior cubierto", emoji: "🏠" },
  { key: "trastero", label: "Trastero", emoji: "📦" },

  // Piscinas
  { key: "piscina privada", label: "Piscina Privada", emoji: "🏊‍♀️" },
  { key: "piscina comunitaria", label: "Piscina Comunitaria", emoji: "🏊" },
  { key: "piscina climatizada", label: "Piscina Climatizada", emoji: "🌡️" },
  { key: "piscina con jacuzzi", label: "Piscina con jacuzzi", emoji: "🛁" },
  { key: "zona de piscina con tumbonas", label: "Zona de piscina con tumbonas", emoji: "🏖️" },

  // Cocina y equipamiento
  { key: "cocina equipada", label: "Cocina Equipada", emoji: "🍽️" },
  { key: "cocina totalmente equipada", label: "Cocina Totalmente Equipada", emoji: "👩‍🍳" },
  { key: "cocina independiente", label: "Cocina Independiente", emoji: "👨‍🍳" },
  { key: "isla central", label: "Isla Central", emoji: "🏝️" },
  { key: "electrodomesticos (nevera, horno, microondas, lavavajillas)", label: "Electrodomésticos (nevera, horno, microondas, lavavajillas)", emoji: "🔌" },
  { key: "nevera", label: "Nevera", emoji: "🧊" },
  { key: "horno", label: "Horno", emoji: "🔥" },
  { key: "microondas", label: "Microondas", emoji: "📡" },
  { key: "lavavajillas", label: "Lavavajillas", emoji: "🧼" },
  { key: "campana extractora", label: "Campana Extractora", emoji: "💨" },
  { key: "cocina de gas", label: "Cocina de gas", emoji: "🔥" },
  { key: "cocina de induccion", label: "Cocina De Inducción", emoji: "⚡" },
  { key: "lavadora", label: "Lavadora", emoji: "🧺" },

  // Parking / garaje
  { key: "garaje cerrado", label: "Garaje Cerrado", emoji: "🚗" },
  { key: "parking privado", label: "Parking Privado", emoji: "🅿️" },
  { key: "plaza de garaje en propiedad", label: "Plaza De Garaje En Propiedad", emoji: "🚙" },
  { key: "aparcamiento para varias plazas", label: "Aparcamiento para varias plazas", emoji: "🚐" },
  { key: "estacionamiento techado", label: "Estacionamiento techado", emoji: "🏠" },
  { key: "parking", label: "Parking", emoji: "🅿️" },

  // Vistas y orientación / playa
  { key: "primera linea de playa", label: "Primera línea de playa", emoji: "🏖️" },
  { key: "acceso directo a la playa", label: "Acceso directo a la playa", emoji: "🏖️" },
  { key: "vistas al mar", label: "Vistas Al Mar", emoji: "🌊" },
  { key: "vistas al campo o montanas", label: "Vistas Al Campo O Montañas", emoji: "🏔️" },
  { key: "orientacion sur", label: "Orientación Sur", emoji: "🧭" },

  // Seguridad
  { key: "sistema de alarma", label: "Sistema De Alarma", emoji: "🚨" },
  { key: "camaras de vigilancia", label: "Cámaras De Vigilancia", emoji: "📹" },
  { key: "rejas de seguridad", label: "Rejas De Seguridad", emoji: "🔒" },
  { key: "cerraduras de seguridad", label: "Cerraduras De Seguridad", emoji: "🔐" },
  { key: "detector de humo", label: "Detector De Humo", emoji: "🚭" },

  // Servicios y comodidades
  { key: "amueblado", label: "Amueblado", emoji: "🛋️" },
  { key: "accesible para personas con movilidad reducida", label: "Accesible Para Personas Con Movilidad Reducida", emoji: "♿" },
  { key: "rampas de acceso", label: "Rampas de acceso", emoji: "🛣️" },
  { key: "ascensor en la propiedad", label: "Ascensor En La Propiedad", emoji: "🛗" },
  { key: "gimnasio comunitario", label: "Gimnasio Comunitario", emoji: "💪" },
  { key: "zona de juegos infantil", label: "Zona De Juegos Infantil", emoji: "🎠" },
  { key: "zona de padel o tenis", label: "Zona De Pádel O Tenis", emoji: "🎾" },
  { key: "spa", label: "Spa", emoji: "🧖" },
  { key: "wifi", label: "WiFi", emoji: "📶" },
  { key: "aire acondicionado", label: "Aire Acondicionado", emoji: "❄️" },
  { key: "calefaccion", label: "Calefacción", emoji: "🌡️" },
  { key: "led/bajo consumo", label: "LED/Bajo Consumo", emoji: "💡" },
];

// Find a feature by any user-provided string (robust to accents/emoji/case)
export function findFeatureByAny(value: string): Feature | undefined {
  const norm = normalizeFeature(value);
  return FEATURES.find(f => normalizeFeature(f.label) === norm || f.key === norm);
}
