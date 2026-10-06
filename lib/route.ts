export function sectionRoute(
  bookNumber: number,
  num: string,
  slug: string,
): string {
  const parts = num.split(".");
  if (parts.length <= 2) return `/${bookNumber}/${slug}`;
  return `/${bookNumber}/${parts.slice(0, 2).join("-")}#${slug}`;
}
