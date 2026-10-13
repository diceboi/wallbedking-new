/**
 * Pure category utility functions (Isomorphic - safe for client & server components)
 */

/**
 * Resolves the localized category title/name for a given locale.
 * Fallbacks:
 * 1. category[`title_${locale}`] or category[`name_${locale}`]
 * 2. Portuguese aliases: category.title_por || category.title_pt
 * 3. English: category.title_en || category.name_en
 * 4. Default: category.title || category.name
 */
export function getLocalizedCategoryTitle(category, locale = "en") {
  if (!category) return "";
  const normLocale = (locale || "en").toLowerCase();

  const directTitle = category[`title_${normLocale}`] || category[`name_${normLocale}`];
  if (directTitle && String(directTitle).trim()) {
    return String(directTitle).trim();
  }

  if (normLocale === "por" || normLocale === "pt") {
    const val = category.title_por || category.title_pt || category.name_por || category.name_pt;
    if (val && String(val).trim()) return String(val).trim();
  }

  return (
    category.title_en ||
    category.name_en ||
    category.title ||
    category.name ||
    ""
  );
}

/**
 * Resolves the localized category description for a given locale.
 * Fallbacks:
 * 1. category[`description_${locale}`]
 * 2. Portuguese aliases: category.description_por || category.description_pt
 * 3. English: category.description_en || category.description
 */
export function getLocalizedCategoryDescription(category, locale = "en") {
  if (!category) return "";
  const normLocale = (locale || "en").toLowerCase();

  const directDesc = category[`description_${normLocale}`];
  if (directDesc && String(directDesc).trim()) {
    return String(directDesc).trim();
  }

  if (normLocale === "por" || normLocale === "pt") {
    const val = category.description_por || category.description_pt;
    if (val && String(val).trim()) return String(val).trim();
  }

  return (
    category.description_en ||
    category.description ||
    ""
  );
}
