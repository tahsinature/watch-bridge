export const COMPARE_FIELD_OPTIONS = [
  { id: "rating", label: "Rating" },
  { id: "votes", label: "Audience" },
  { id: "runtime", label: "Length" },
  { id: "ageRating", label: "Age rating" },
  { id: "genres", label: "Genres" },
  { id: "watchProviders", label: "Watch platforms" },
  { id: "userRating", label: "Your rating" },
] as const;

export type CompareField = (typeof COMPARE_FIELD_OPTIONS)[number]["id"];

export const DEFAULT_COMPARE_FIELDS: CompareField[] =
  COMPARE_FIELD_OPTIONS.map((field) => field.id);

const COMPARE_FIELD_IDS = new Set<CompareField>(DEFAULT_COMPARE_FIELDS);

export function isCompareFields(value: unknown): value is CompareField[] {
  return (
    Array.isArray(value) &&
    value.every(
      (field) =>
        typeof field === "string" &&
        COMPARE_FIELD_IDS.has(field as CompareField),
    )
  );
}
