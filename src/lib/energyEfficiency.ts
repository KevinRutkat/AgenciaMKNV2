export const ENERGY_EFFICIENCY_OPTIONS = [
  { value: "", label: "Sin especificar" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" },
  { value: "F", label: "F" },
  { value: "G", label: "G" },
  { value: "en-tramite", label: "En tramite" },
  { value: "exento", label: "Exento" },
] as const;

const ENERGY_EFFICIENCY_MAP: Record<string, string> = {
  a: "A",
  b: "B",
  c: "C",
  d: "D",
  e: "E",
  f: "F",
  g: "G",
  "en-tramite": "en-tramite",
  "en tramite": "en-tramite",
  en_tramite: "en-tramite",
  exento: "exento",
};

export function normalizeEnergyEfficiency(value?: string | null) {
  if (!value) return null;

  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  const sanitizedValue = trimmedValue
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const normalizedValue = ENERGY_EFFICIENCY_MAP[sanitizedValue];
  return normalizedValue ?? trimmedValue.toUpperCase();
}

export function formatEnergyEfficiencyLabel(value?: string | null) {
  const normalizedValue = normalizeEnergyEfficiency(value);

  if (!normalizedValue) return null;
  if (/^[A-G]$/.test(normalizedValue)) return normalizedValue;
  if (normalizedValue === "en-tramite") return "En tramite";
  if (normalizedValue === "exento") return "Exento";

  return normalizedValue;
}

export function getEnergyEfficiencyBadgeClass(value?: string | null) {
  const normalizedValue = normalizeEnergyEfficiency(value);

  switch (normalizedValue) {
    case "A":
    case "B":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "C":
      return "border-lime-200 bg-lime-50 text-lime-700";
    case "D":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "E":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "F":
    case "G":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "en-tramite":
    case "exento":
      return "border-slate-200 bg-slate-50 text-slate-700";
    default:
      return "border-neutral-gray bg-neutral-light text-neutral-dark";
  }
}
