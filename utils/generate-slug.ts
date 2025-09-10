export function objectToFormData(obj: Record<string, any>): FormData {
  const formData = new FormData();

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (value === null || value === undefined) {
        continue;
      }

      if (key === "parentId" && value === "") {
        // Skip empty parentId
        continue;
      }

      if (Array.isArray(value)) {
        if (value.every((item) => typeof item === "object" && item !== null)) {
          formData.append(key, JSON.stringify(value));
        } else {
          value.forEach((item) => formData.append(`${key}[]`, item));
        }
      } else if (typeof value === "object" && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === "boolean") {
        formData.append(key, value.toString());
      } else {
        formData.append(key, value);
      }
    }
  }

  return formData;
}

/**
 * Generates a URL-friendly slug from a string.
 */
export const generateSlug = (str: string) => {
  return str
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};
