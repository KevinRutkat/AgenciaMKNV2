export type PropertySpecialStatus = 'featured' | 'reserved' | 'sold' | null;
export type PropertyAvailabilityStatus = 'available' | 'reserved' | 'sold';
export type PropertySpecialStatusField =
  | 'is_featured'
  | 'is_sold'
  | 'is_reserved';

type PropertySpecialStatusFlags = {
  is_featured?: boolean | null;
  is_sold?: boolean | null;
  is_reserved?: boolean | null;
};

export function normalizeSpecialStatusFlags(
  flags: PropertySpecialStatusFlags,
) {
  const isSold = Boolean(flags.is_sold);
  const isReserved = !isSold && Boolean(flags.is_reserved);
  const isFeatured = Boolean(flags.is_featured);

  return {
    is_featured: isFeatured,
    is_sold: isSold,
    is_reserved: isReserved,
  };
}

export function resolveSpecialStatusToggle(
  flags: PropertySpecialStatusFlags,
  field: PropertySpecialStatusField,
  checked: boolean,
) {
  if (field === 'is_featured') {
    return normalizeSpecialStatusFlags({
      ...flags,
      is_featured: checked,
    });
  }

  if (field === 'is_sold') {
    return normalizeSpecialStatusFlags({
      ...flags,
      is_sold: checked,
      is_reserved: checked ? false : flags.is_reserved,
    });
  }

  return normalizeSpecialStatusFlags({
    ...flags,
    is_reserved: checked,
    is_sold: checked ? false : flags.is_sold,
  });
}

export function getPropertySpecialStatus(
  flags: PropertySpecialStatusFlags,
): PropertySpecialStatus {
  const normalized = normalizeSpecialStatusFlags(flags);

  if (normalized.is_sold) {
    return 'sold';
  }

  if (normalized.is_reserved) {
    return 'reserved';
  }

  if (normalized.is_featured) {
    return 'featured';
  }

  return null;
}

export function getPropertyAvailabilityStatus(
  flags: PropertySpecialStatusFlags,
): PropertyAvailabilityStatus {
  const normalized = normalizeSpecialStatusFlags(flags);

  if (normalized.is_sold) {
    return 'sold';
  }

  if (normalized.is_reserved) {
    return 'reserved';
  }

  return 'available';
}

export function resolveAvailabilityStatusSelection(
  flags: PropertySpecialStatusFlags,
  status: PropertyAvailabilityStatus,
) {
  return normalizeSpecialStatusFlags({
    ...flags,
    is_sold: status === 'sold',
    is_reserved: status === 'reserved',
  });
}
