import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsArrayOf,
} from "nuqs/server";

export const coordinatesSearchParams = {
  category: parseAsString,
  query: parseAsString,
  page: parseAsInteger,
  search: parseAsString.withDefault(""),
  perPage: parseAsInteger.withDefault(12),
  offset: parseAsInteger.withDefault(0),
  priceMin: parseAsInteger,
  priceMax: parseAsInteger,
  subcategories: parseAsArrayOf(parseAsString),
  brands: parseAsArrayOf(parseAsString),
};

export const loadSearchParams = createLoader(coordinatesSearchParams);

export function extractSpecifications(
  params: Record<string, string | string[] | undefined>
): Record<string, string[]> {
  const specifications: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(params)) {
    if (
      key &&
      value !== undefined &&
      ![
        "category",
        "search",
        "page",
        "perPage",
        "offset",
        "priceMin",
        "priceMax",
        "subcategories",
        "brands",
      ].includes(key)
    ) {
      if (Array.isArray(value)) {
        specifications[key] = value;
      } else if (typeof value === "string") {
        specifications[key] = value.split(",").filter(Boolean);
      }
    }
  }

  return specifications;
}
