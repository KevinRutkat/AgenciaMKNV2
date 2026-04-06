import type { Vivienda } from "./supabase";

export type RentPricePeriod = "month" | "day";

type RentCheck = Pick<
  Vivienda,
  "is_rent" | "category" | "property_type" | "name" | "price" | "rent_price_period"
>;

const normalizeText = (value?: string | number | null) =>
  (value ?? "").toString().trim().toLowerCase();

const normalizeAsciiText = (value?: string | number | null) =>
  normalizeText(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const normalizeCategory = (value?: string | null) => {
  const normalized = normalizeText(value);
  if (normalized.includes("alquiler")) return "alquiler";
  if (normalized === "sin estrenar") return "sin-estrenar";
  return normalized;
};

const hasMonthlySuffix = (value?: string | number | null) => {
  const normalized = normalizeAsciiText(value);
  return /\/\s*mes\b/i.test(normalized) || normalized.includes("mensual");
};

const hasDailySuffix = (value?: string | number | null) => {
  const normalized = normalizeAsciiText(value);
  return /\/\s*(dia|day)\b/i.test(normalized) || normalized.includes("diario");
};

export const normalizeRentPricePeriod = (
  value?: string | null,
  fallback: RentPricePeriod = "month",
): RentPricePeriod => {
  const normalized = normalizeAsciiText(value);

  if (normalized === "day" || normalized === "dia" || normalized === "daily") {
    return "day";
  }

  if (
    normalized === "month" ||
    normalized === "mes" ||
    normalized === "monthly"
  ) {
    return "month";
  }

  return fallback;
};

export const getRentPricePeriod = (
  vivienda: Pick<Vivienda, "price" | "rent_price_period">,
): RentPricePeriod => {
  if (vivienda.rent_price_period) {
    return normalizeRentPricePeriod(vivienda.rent_price_period);
  }

  if (hasDailySuffix(vivienda.price)) {
    return "day";
  }

  return "month";
};

export const getRentPriceSuffix = (period: RentPricePeriod = "month") =>
  period === "day" ? "/día" : "/mes";

export const stripRentPriceSuffix = (
  raw: string | number | null | undefined,
) => {
  if (raw === null || raw === undefined) return "";

  return raw
    .toString()
    .replace(/\s*\/\s*(mes|dia|día|day)\b/gi, "")
    .replace(/\b(mensual|diario)\b/gi, "")
    .trim();
};

export const isRentListing = (vivienda: RentCheck) => {
  if (vivienda.is_rent) return true;
  const category = normalizeText(vivienda.category);
  if (category.includes("alquiler")) return true;
  const propertyType = normalizeText(vivienda.property_type);
  if (propertyType.includes("alquiler")) return true;
  const name = normalizeText(vivienda.name);
  if (name.includes("alquiler")) return true;
  if (hasDailySuffix(vivienda.price)) return true;
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

export const formatListingPrice = (
  raw: string | number | null | undefined,
  isRent: boolean,
  rentPricePeriod: RentPricePeriod = "month",
) => {
  const cleaned = normalizePrice(stripRentPriceSuffix(raw));
  if (!cleaned) return "";
  const formatted = cleaned.includes("\u20AC")
    ? cleaned
    : `${cleaned}\u20AC`;

  if (!isRent) {
    return formatted;
  }

  return `${formatted}${getRentPriceSuffix(rentPricePeriod)}`;
};

export const formatMonthlyPrice = (
  raw: string | number | null | undefined,
  isRent: boolean,
  rentPricePeriod: RentPricePeriod = "month",
) => formatListingPrice(raw, isRent, rentPricePeriod);
