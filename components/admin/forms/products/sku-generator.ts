"use client";

import { nanoid } from "nanoid";

export interface SKUGenerationOptions {
  productName?: string;
  variantName?: string;
  variantValue?: string;
  existingSKUs?: string[];
}

export function generateVariantSKU(options: SKUGenerationOptions = {}): string {
  const { productName, variantName, variantValue, existingSKUs = [] } = options;

  const productCode = productName
    ? productName
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 3)
        .toUpperCase()
    : "PRD";

  const variantCode =
    variantName && variantValue
      ? `${variantName.substring(0, 2)}${variantValue.substring(0, 2)}`
          .replace(/[^a-zA-Z0-9]/g, "")
          .toUpperCase()
      : "VAR";

  const uniqueId = nanoid(6).toUpperCase();

  let sku = `SKU-${productCode}-${variantCode}-${uniqueId}`;

  let attempts = 0;
  const maxAttempts = 10;

  while (existingSKUs.includes(sku) && attempts < maxAttempts) {
    const newUniqueId = nanoid(6).toUpperCase();
    sku = `SKU-${productCode}-${variantCode}-${newUniqueId}`;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    const timestamp = Date.now().toString().slice(-6);
    sku = `SKU-${productCode}-${variantCode}-${timestamp}`;
  }

  return sku;
}

export function validateSKUFormat(sku: string): boolean {
  const skuRegex = /^SKU-[A-Z0-9]{1,3}-[A-Z0-9]{1,6}-[A-Z0-9]{6}$/;
  return skuRegex.test(sku);
}

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
    allExistingSKUs.push(sku);
  });

  return generatedSKUs;
}

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
