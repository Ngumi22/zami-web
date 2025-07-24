import { Category } from "@prisma/client";
import { ProductWithRelations } from "@/hooks/use-compare";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SPEC_CATEGORIES } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, currency = "KES") =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function mapSpecifications(product: any) {
  try {
    const productSpecs = product.specifications || {};
    const categorySpecs = product.category?.specifications || [];

    return categorySpecs.map((spec: any) => {
      const rawValue = productSpecs[spec.name] ?? productSpecs[spec.id];

      const value =
        rawValue !== null && rawValue !== undefined
          ? String(rawValue)
          : "Not specified";

      return {
        ...spec,
        value,
      };
    });
  } catch (error) {
    console.error("Error mapping specifications:", error);
    return [];
  }
}

export function extractFacetSpecifications(products: any[]) {
  const specs: Record<string, Set<string>> = {};

  for (const product of products) {
    const specList = product.specifications || [];

    for (const spec of specList) {
      if (!specs[spec.name]) specs[spec.name] = new Set();
      if (spec.value) specs[spec.name].add(spec.value);
    }
  }

  return Object.entries(specs).map(([name, values]) => ({
    name,
    values: Array.from(values),
  }));
}

export function getCategoryMap(categories: Category[]) {
  return Object.fromEntries(categories.map((cat) => [cat.id, cat.name]));
}

// Helper function to extract specification objects from products
export function getAllSpecificationNames(
  products: ProductWithRelations[]
): string[] {
  const allSpecNames = new Set<string>();

  products.forEach((product) => {
    if (product.specifications && typeof product.specifications === "object") {
      Object.values(product.specifications).forEach((spec: any) => {
        if (
          spec &&
          typeof spec === "object" &&
          spec.name &&
          spec.value !== undefined &&
          spec.value !== null &&
          spec.value !== ""
        ) {
          allSpecNames.add(spec.name);
        }
      });
    }
  });

  return Array.from(allSpecNames).sort();
}

// Helper function to categorize specifications by name
export function categorizeSpecifications(
  specNames: string[]
): Record<string, string[]> {
  const categorized: Record<string, string[]> = {};

  Object.keys(SPEC_CATEGORIES).forEach((category) => {
    categorized[category] = [];
  });
  categorized["Other"] = [];

  categorized["General Information"] = [
    "price",
    "brand",
    "category",
    "stock",
    "rating",
  ];

  specNames.forEach((specName) => {
    let categorized_spec = false;
    const normalizedSpecName = specName.toLowerCase().replace(/\s+/g, "");

    for (const [category, keywords] of Object.entries(SPEC_CATEGORIES)) {
      if (
        keywords.some((keyword) => {
          const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, "");
          return (
            normalizedSpecName.includes(normalizedKeyword) ||
            normalizedKeyword.includes(normalizedSpecName)
          );
        })
      ) {
        if (!categorized[category].includes(specName)) {
          categorized[category].push(specName);
        }
        categorized_spec = true;
        break;
      }
    }

    if (!categorized_spec) {
      categorized["Other"].push(specName);
    }
  });

  Object.keys(categorized).forEach((category) => {
    if (categorized[category].length === 0) {
      delete categorized[category];
    }
  });

  return categorized;
}

// Helper function to get specification value by name
export function getSpecificationValueByName(
  product: ProductWithRelations,
  specName: string
): any {
  switch (specName) {
    case "price":
      return `${formatCurrency(product.price)}`;
    case "brand":
      return product.brand?.name;
    case "category":
      return product.category?.name;
    case "stock":
      return product.stock;
    case "rating":
      return product.averageRating;
    default:
      if (
        product.specifications &&
        typeof product.specifications === "object"
      ) {
        const specObj = Object.values(product.specifications).find(
          (spec: any) =>
            spec && typeof spec === "object" && spec.name === specName
        ) as any;

        if (
          specObj &&
          specObj.value !== undefined &&
          specObj.value !== null &&
          specObj.value !== ""
        ) {
          return specObj.value;
        }
      }
      return null;
  }
}
