export async function getSafeSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  const params = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, value])
  );

  return {
    get(key: string): string | undefined {
      const value = params[key];
      return Array.isArray(value) ? value[0] : value;
    },
    getAll(key: string): string[] {
      const value = params[key];
      return Array.isArray(value) ? value : value ? [value] : [];
    },
    has(key: string): boolean {
      return key in params;
    },
    entries() {
      return Object.entries(params);
    },
  };
}
