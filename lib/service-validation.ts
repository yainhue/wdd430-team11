export type ServiceInput = {
  title: string;
  description: string;
  category: string;
};

export function parseServiceInput(value: unknown): ServiceInput | null {
  if (typeof value !== "object" || value === null) return null;

  const input = value as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description =
    typeof input.description === "string" ? input.description.trim() : "";
  const category =
    typeof input.category === "string" ? input.category.trim() : "";

  if (
    title.length < 3 ||
    title.length > 100 ||
    description.length < 10 ||
    description.length > 2000 ||
    category.length < 2 ||
    category.length > 50
  ) {
    return null;
  }

  return { title, description, category };
}
