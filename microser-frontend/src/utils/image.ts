export function isValidHttpUrl(value?: string) {
  if (!value) return false;

  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isDataUrl(value?: string) {
  return Boolean(value?.trim().match(/^data:image\/[a-zA-Z]+;base64,/));
}

export function normalizeImageUrl(value?: string) {
  if (!value) return '';
  const trimmed = value.trim();
  if (isDataUrl(trimmed)) return trimmed;
  if (!isValidHttpUrl(trimmed)) return '';
  return new URL(trimmed).href;
}

export function getProductImageUrl(product: { images?: string[]; imageUrl?: string }) {
  const candidates = [...(product.images ?? []), product.imageUrl];

  for (const candidate of candidates) {
    if (!candidate) continue;

    const normalized = normalizeImageUrl(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return 'https://placehold.co/600x400?text=Sin+Imagen';
}
