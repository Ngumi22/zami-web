"use client";

import { nanoid } from "nanoid";

export interface SKUGenerationOptions {
  productName?: string;
  variantName?: string;
  variantValue?: string;
  existingSKUs?: string[];
}

/**
 * Generates a unique SKU for a product variant
 * Format: sku-{productCode}-{variantCode}-{uniqueId}
 */
export function generateVariantSKU(options: SKUGenerationOptions = {}): string {
  const { productName, variantName, variantValue, existingSKUs = [] } = options;

  // Create product code from product name (first 3 chars, uppercase)
  const productCode = productName
    ? productName
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 3)
        .toUpperCase()
    : "PRD";

  // Create variant code from variant name and value
  const variantCode =
    variantName && variantValue
      ? `${variantName.substring(0, 2)}${variantValue.substring(0, 2)}`
          .replace(/[^a-zA-Z0-9]/g, "")
          .toUpperCase()
      : "VAR";

  // Generate unique identifier
  const uniqueId = nanoid(6).toUpperCase();

  // Construct SKU
  let sku = `SKU-${productCode}-${variantCode}-${uniqueId}`;

  // Ensure uniqueness by checking against existing SKUs
  let attempts = 0;
  const maxAttempts = 10;

  while (existingSKUs.includes(sku) && attempts < maxAttempts) {
    const newUniqueId = nanoid(6).toUpperCase();
    sku = `SKU-${productCode}-${variantCode}-${newUniqueId}`;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    // Fallback to timestamp-based SKU
    const timestamp = Date.now().toString().slice(-6);
    sku = `SKU-${productCode}-${variantCode}-${timestamp}`;
  }

  return sku;
}

/**
 * Validates SKU format
 */
export function validateSKUFormat(sku: string): boolean {
  // SKU format: SKU-XXX-XXX-XXXXXX (where X can be alphanumeric)
  const skuRegex = /^SKU-[A-Z0-9]{1,3}-[A-Z0-9]{1,6}-[A-Z0-9]{6}$/;
  return skuRegex.test(sku);
}

/**
 * Generates a batch of SKUs for multiple variants
 */
export function generateBatchSKUs(
  variants: Array<{ name: string; value: string }>,
  productName: string,
  existingSKUs: string[] = []
): string[] {
  const generatedSKUs: string[] = [];
  const allExistingSKUs = [...existingSKUs];

  variants.forEach((variant) => {
    const sku = generateVariantSKU({
      productName,
      variantName: variant.name,
      variantValue: variant.value,
      existingSKUs: allExistingSKUs,
    });
    generatedSKUs.push(sku);
    allExistingSKUs.push(sku); // Add to existing to prevent duplicates in batch
  });

  return generatedSKUs;
}

/**
 * Extracts components from an existing SKU
 */
export function parseSKU(sku: string): {
  isValid: boolean;
  productCode?: string;
  variantCode?: string;
  uniqueId?: string;
} {
  if (!validateSKUFormat(sku)) {
    return { isValid: false };
  }

  const parts = sku.split("-");
  return {
    isValid: true,
    productCode: parts[1],
    variantCode: parts[2],
    uniqueId: parts[3],
  };
}
