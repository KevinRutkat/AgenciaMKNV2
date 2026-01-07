import type { Vivienda } from "./supabase";

type RentCheck = Pick<
  Vivienda,
  "is_rent" | "category" | "property_type" | "name" | "price"
>;

const normalizeText = (value?: string | number | null) =>
  (value ?? "").toString().trim().toLowerCase();

export const normalizeCategory = (value?: string | null) => {
  const normalized = normalizeText(value);
  if (normalized.includes("alquiler")) return "alquiler";
  if (normalized === "sin estrenar") return "sin-estrenar";
  return normalized;
};

const hasMonthlySuffix = (value?: string | number | null) => {
  const normalized = normalizeText(value);
  return /\/\s*mes\b/i.test(normalized) || normalized.includes("mensual");
};

export const isRentListing = (vivienda: RentCheck) => {
  if (vivienda.is_rent) return true;
  const category = normalizeText(vivienda.category);
  if (category.includes("alquiler")) return true;
  const propertyType = normalizeText(vivienda.property_type);
  if (propertyType.includes("alquiler")) return true;
  const name = normalizeText(vivienda.name);
  if (name.includes("alquiler")) return true;
  if (hasMonthlySuffix(vivienda.price)) return true;
  return false;
};

const normalizePrice = (raw: string | number | null | undefined) => {
  if (raw === null || raw === undefined) return "";
  const value = typeof raw === "number" ? raw.toString() : raw;
  return value
    .replace(/\s+/g, "")
    .replace(/\u00A0/g, "")
    .replace(/\u00FF/g, "");
};

export const formatMonthlyPrice = (
  raw: string | number | null | undefined,
  monthly: boolean,
) => {
  const cleaned = normalizePrice(raw);
  if (!cleaned) return "";
  const formatted = cleaned.includes("\u20AC")
    ? cleaned
    : `${cleaned}\u20AC`;
  if (!monthly && !hasMonthlySuffix(raw)) return formatted;
  if (/\/\s*mes\b/i.test(formatted)) {
    return formatted.replace(/\/\s*mes\b/i, "/mes");
  }
  return `${formatted}/mes`;
};
