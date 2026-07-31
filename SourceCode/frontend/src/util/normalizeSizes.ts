export const normalizeSizes = (sizes: unknown): string[] => {
  if (!sizes) return [];
  if (Array.isArray(sizes)) return sizes.filter(Boolean);
  if (typeof sizes === "string") return sizes.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
};
