import tagsData from "@/data/tags.json";

export const DEFAULT_TAG_COLOR = "#090A0A";

/**
 * Returns all configured tags from tags.json
 */
export function getAllTags() {
  return Array.isArray(tagsData) ? tagsData : [];
}

/**
 * Pure string heuristic to resolve icon name from slug or name without calling getTagMeta
 */
export function resolveTagIcon(str) {
  const clean = String(str || "").toLowerCase().trim();
  if (!clean) return "tag";
  if (clean.includes("best") || clean.includes("popul") || clean.includes("top")) return "flame";
  if (clean.includes("new") || clean.includes("uj") || clean.includes("fresh")) return "sparkles";
  if (clean.includes("space") || clean.includes("hely") || clean.includes("compact") || clean.includes("saver")) return "maximize";
  if (clean.includes("prem") || clean.includes("delux") || clean.includes("lux")) return "crown";
  if (clean.includes("ship") || clean.includes("fast") || clean.includes("szallit") || clean.includes("quick")) return "truck";
  if (clean.includes("sale") || clean.includes("offer") || clean.includes("akci") || clean.includes("deal")) return "tag";
  if (clean.includes("star")) return "star";
  if (clean.includes("award")) return "award";
  return "tag";
}

/**
 * Returns the icon key associated with a tag ('flame', 'sparkles', 'maximize', 'crown', 'truck', 'tag')
 * Does NOT call getTagMeta to prevent circular recursion.
 */
export function getTagIconName(tagIdOrSlug) {
  if (!tagIdOrSlug) return "tag";
  const clean = String(tagIdOrSlug).toLowerCase().trim();

  const found = getAllTags().find(
    (t) =>
      (t.id && t.id.toLowerCase() === clean) ||
      (t.slug && t.slug.toLowerCase() === clean)
  );

  if (found?.icon) return found.icon;
  return resolveTagIcon(clean);
}

/**
 * Find tag metadata by ID or slug
 */
export function getTagMeta(tagIdOrSlug) {
  if (!tagIdOrSlug) return null;
  const clean = String(tagIdOrSlug).toLowerCase().trim();

  const found = getAllTags().find(
    (t) =>
      (t.id && t.id.toLowerCase() === clean) ||
      (t.slug && t.slug.toLowerCase() === clean)
  );

  if (found) {
    return {
      ...found,
      icon: found.icon || resolveTagIcon(found.slug || found.id),
      color: found.color || DEFAULT_TAG_COLOR,
    };
  }

  // Fallback if tag is an ad-hoc custom slug
  const formattedName = clean
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    id: clean,
    slug: clean,
    name: formattedName,
    icon: resolveTagIcon(clean),
    color: DEFAULT_TAG_COLOR,
    description: "",
  };
}

/**
 * Localized tag display name
 */
export function getLocalizedTagName(tagIdOrSlug, locale = "en") {
  const meta = getTagMeta(tagIdOrSlug);
  if (!meta) return "";

  // Optional localized overrides for common marketing tags
  const LOCALIZED_NAMES = {
    "best-seller": {
      hu: "Legnépszerűbb",
      de: "Bestseller",
      fr: "Meilleure Vente",
      es: "Más Vendido",
      it: "Più Venduto",
      por: "Mais Vendido",
    },
    "new-arrival": {
      hu: "Újdonság",
      de: "Neuheit",
      fr: "Nouveauté",
      es: "Novedad",
      it: "Novità",
      por: "Novidade",
    },
    sale: {
      hu: "Akciós",
      de: "Angebot",
      fr: "Promotion",
      es: "Oferta",
      it: "Offerta",
      por: "Promoção",
    },
    "space-saver": {
      hu: "Helytakarékos",
      de: "Platzsparend",
      fr: "Gain de Place",
      es: "Ahorro de Espacio",
      it: "Salvaspazio",
      por: "Economia de Espaço",
    },
    premium: {
      hu: "Prémium",
      de: "Premium",
      fr: "Premium",
      es: "Premium",
      it: "Premium",
      por: "Premium",
    },
    "quick-ship": {
      hu: "Gyors szállítás",
      de: "Schnellversand",
      fr: "Expédition Rapide",
      es: "Envío Rápido",
      it: "Spedizione Rapida",
      por: "Envio Rápido",
    },
  };

  const loc = (locale || "en").toLowerCase();
  const overrides = LOCALIZED_NAMES[meta.slug || meta.id];
  if (overrides && overrides[loc]) {
    return overrides[loc];
  }

  return meta.name;
}
