import { getStorefrontProducts } from "@/lib/products-db";
import fallbackCatalog from "@/data/products-catalog.json";
import {
  getLocalizedProductName,
  getLocalizedProductDescription,
  getLocalizedProductGtin,
  getStorefrontProductUrl,
  isProductAvailableInLocale,
} from "@/lib/products";
import { getProductPrice, formatSizeLabel } from "@/lib/i18n";
import { getCampaigns, isCampaignActive } from "@/lib/promotions";

import {
  GOOGLE_FEED_COUNTRIES,
  resolveCountryConfig,
} from "@/lib/google-feed-constants";

export { GOOGLE_FEED_COUNTRIES, resolveCountryConfig };

/**
 * Resolves the storefront base URL with fallback.
 */
export function getFeedBaseUrl(request = null) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  if (request) {
    try {
      const host =
        request.headers.get("x-forwarded-host") || request.headers.get("host");
      const proto = request.headers.get("x-forwarded-proto") || "https";
      if (host) {
        return `${proto}://${host}`.replace(/\/+$/, "");
      }
    } catch {
      // Fallback
    }
  }
  return "https://www.wallbedking.com";
}

/**
 * Google Product Taxonomy mapping for categories.
 */
function getGoogleProductCategory(parentCategory) {
  const cat = String(parentCategory || "").toLowerCase();
  switch (cat) {
    case "beds":
    case "morphy-beds":
    case "traditional-beds":
      return 436; // Furniture > Beds & Accessories > Beds & Bed Frames
    case "mattresses":
      return 4470; // Furniture > Beds & Accessories > Mattresses
    case "sofas":
      return 6356; // Furniture > Sofas
    case "cabinets":
      return 6364; // Furniture > Cabinets & Storage
    case "tables":
      return 6358; // Furniture > Tables
    default:
      return 436;
  }
}

/**
 * Sanitizes description: strips HTML, decodes common entities, collapses whitespace, limits length.
 */
export function sanitizeDescription(text, fallback = "") {
  if (!text || typeof text !== "string") return fallback;
  const stripped = text
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r\n|\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return (stripped.length > 5000 ? stripped.slice(0, 4997) + "..." : stripped) || fallback;
}

/**
 * Safely wraps text in CDATA to avoid XML escaping issues.
 */
function wrapCdata(text) {
  if (text === null || text === undefined) return "";
  const safe = String(text).replace(/\]\]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[${safe}]]>`;
}

function toMerchantIso(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function parseUtcTimeParts(timeStr, defaultHour, defaultMin, defaultSec) {
  if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(":")) {
    return [defaultHour, defaultMin, defaultSec];
  }
  const [h, m] = timeStr.split(":").map(Number);
  return [
    Number.isFinite(h) ? h : defaultHour,
    Number.isFinite(m) ? m : defaultMin,
    defaultSec,
  ];
}

/**
 * Computes Google Merchant Center `sale_price_effective_date` (ISO_START/ISO_END)
 * for active fixed or recurring promotional campaigns.
 */
function getSalePriceEffectiveDate(campaign, now = new Date()) {
  if (!campaign) return null;

  const capStart = campaign.start_date ? new Date(campaign.start_date) : null;
  const capEnd = campaign.end_date ? new Date(campaign.end_date) : null;

  let winStart = null;
  let winEnd = null;

  if (campaign.schedule_type === "recurring" && campaign.recurring) {
    const { frequency, days_of_week, days_of_month, start_time, end_time } = campaign.recurring;
    const [sh, sm] = parseUtcTimeParts(start_time, 0, 0, 0);
    const [eh, em] = parseUtcTimeParts(end_time, 23, 59, 59);
    const isFullDay = (!start_time || start_time === "00:00") && (!end_time || end_time === "23:59");

    const baseDayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));

    if (
      isFullDay &&
      (frequency === "weekly" || frequency === "custom") &&
      Array.isArray(days_of_week) &&
      days_of_week.length > 0 &&
      days_of_week.length < 7
    ) {
      let startDay = new Date(baseDayStart);
      for (let i = 0; i < 6; i++) {
        const prev = new Date(startDay.getTime() - 86400000);
        if (!days_of_week.includes(prev.getUTCDay())) break;
        startDay = prev;
      }
      let endDay = new Date(baseDayStart);
      for (let i = 0; i < 6; i++) {
        const next = new Date(endDay.getTime() + 86400000);
        if (!days_of_week.includes(next.getUTCDay())) break;
        endDay = next;
      }
      winStart = startDay;
      winEnd = new Date(Date.UTC(endDay.getUTCFullYear(), endDay.getUTCMonth(), endDay.getUTCDate(), 23, 59, 59));
    } else if (
      isFullDay &&
      frequency === "monthly" &&
      Array.isArray(days_of_month) &&
      days_of_month.length > 0 &&
      days_of_month.length < 28
    ) {
      let startDay = new Date(baseDayStart);
      for (let i = 0; i < 31; i++) {
        const prev = new Date(startDay.getTime() - 86400000);
        if (!days_of_month.includes(prev.getUTCDate())) break;
        startDay = prev;
      }
      let endDay = new Date(baseDayStart);
      for (let i = 0; i < 31; i++) {
        const next = new Date(endDay.getTime() + 86400000);
        if (!days_of_month.includes(next.getUTCDate())) break;
        endDay = next;
      }
      winStart = startDay;
      winEnd = new Date(Date.UTC(endDay.getUTCFullYear(), endDay.getUTCMonth(), endDay.getUTCDate(), 23, 59, 59));
    } else if (isFullDay && capStart && capEnd && !isNaN(capStart.getTime()) && !isNaN(capEnd.getTime())) {
      winStart = capStart;
      winEnd = capEnd;
    } else {
      winStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), sh, sm, 0));
      winEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), eh, em, 59));
    }
  } else if (capStart && capEnd && !isNaN(capStart.getTime()) && !isNaN(capEnd.getTime())) {
    winStart = capStart;
    winEnd = capEnd;
  }

  if (!winStart || !winEnd || isNaN(winStart.getTime()) || isNaN(winEnd.getTime())) {
    return null;
  }
  if (capStart && !isNaN(capStart.getTime()) && winStart < capStart) winStart = capStart;
  if (capEnd && !isNaN(capEnd.getTime()) && winEnd > capEnd) winEnd = capEnd;
  if (winEnd <= winStart) return null;

  return `${toMerchantIso(winStart)}/${toMerchantIso(winEnd)}`;
}

/**
 * Fetches and filters products for a specific country / market feed.
 * Products that are NOT public (hidden, draft, archived) or NOT available in the market are excluded.
 */
export async function getGoogleFeedItems(countryConfig, baseUrl = "https://www.wallbedking.com") {
  const { locale, currency } = countryConfig;
  const now = new Date();

  // 1. Fetch live products and active public promotional campaigns in parallel
  const [rawCatalog, allCampaigns] = await Promise.all([
    getStorefrontProducts().catch(() => null),
    getCampaigns({ fresh: true }).catch(() => []),
  ]);

  let catalog = rawCatalog || fallbackCatalog;
  if (!Array.isArray(catalog)) {
    catalog = fallbackCatalog;
  }

  const activeCampaigns = (Array.isArray(allCampaigns) ? allCampaigns : []).filter((c) => {
    if (!c) return false;
    if (c.status === "inactive" || c.status === "preview") return false;
    if (c.end_date && new Date(c.end_date).getTime() < now.getTime()) return false;
    return isCampaignActive(c, now, locale);
  });

  const items = [];

  for (const p of catalog) {
    // 2. Strict Public / Visibility filter
    const visibility = String(p.visibility || "").toLowerCase().trim();
    if (
      visibility === "hidden" ||
      p.visibility === false ||
      p.is_visible === false ||
      p.status === "Draft" ||
      p.status === "archived"
    ) {
      continue;
    }

    // 3. Locale availability filter
    if (!isProductAvailableInLocale(p, locale)) {
      continue;
    }

    // 4. Resolve mandatory Google Merchant Center fields:

    // ID: Product SKU or unique ID
    const id = String(p.sku || `WBK-${p.id}`).trim();
    if (!id) continue;

    // Title: Localized product name (max 150 chars)
    const rawTitle = getLocalizedProductName(p, locale);
    const title = (rawTitle || p.name || "Wall Bed").trim().slice(0, 150);

    // Description: Localized product description (clean text, max 5000 chars)
    const rawDesc = getLocalizedProductDescription(p, locale);
    const description = sanitizeDescription(
      rawDesc || p.description,
      `${title} by WallBedKing - High quality space saving furniture.`
    );

    // Link: Full canonical product URL
    const relativeUrl = getStorefrontProductUrl(p, locale);
    const link = relativeUrl.startsWith("http")
      ? relativeUrl
      : `${baseUrl}${relativeUrl.startsWith("/") ? "" : "/"}${relativeUrl}`;

    // Image Link: Main product image
    let imageLink = p.image || (Array.isArray(p.product_images) && p.product_images[0]) || "";
    if (imageLink && !imageLink.startsWith("http")) {
      imageLink = `${baseUrl}${imageLink.startsWith("/") ? "" : "/"}${imageLink}`;
    }
    if (!imageLink) {
      // Products without image are invalid in Google Merchant Center
      continue;
    }

    // Additional Image Links: Up to 10 additional photos
    const additionalImages = [];
    if (Array.isArray(p.product_images)) {
      for (const img of p.product_images) {
        if (!img || img === imageLink) continue;
        const fullImg = img.startsWith("http")
          ? img
          : `${baseUrl}${img.startsWith("/") ? "" : "/"}${img}`;
        if (!additionalImages.includes(fullImg)) {
          additionalImages.push(fullImg);
        }
        if (additionalImages.length >= 10) break;
      }
    }

    // Availability: in_stock | backorder | out_of_stock
    const stock = Number(p.stock) || 0;
    const isBackorder = p.backorder === true || p.backorder === "true";
    let availability = "out_of_stock";
    if (stock > 0) {
      availability = "in_stock";
    } else if (isBackorder) {
      availability = "backorder";
    }

    // Price, Product-level & Campaign Sale Price (identical logic to storefront)
    const pricing = getProductPrice(p, locale, activeCampaigns);
    const regularRaw = pricing.regularRaw || pricing.raw || 0;
    if (regularRaw <= 0) {
      // Products without valid price cannot be listed on Google Shopping
      continue;
    }
    const price = `${regularRaw.toFixed(2)} ${pricing.currency || currency}`;

    let salePrice = null;
    let salePriceEffectiveDate = null;
    if (pricing.isOnSale && pricing.saleRaw && pricing.saleRaw > 0 && pricing.saleRaw < regularRaw) {
      salePrice = `${pricing.saleRaw.toFixed(2)} ${pricing.currency || currency}`;
      if (pricing.isPromotionalCampaign && pricing.appliedCampaign) {
        salePriceEffectiveDate = getSalePriceEffectiveDate(pricing.appliedCampaign, now);
      }
    }

    // Condition: always new for manufactured furniture
    const condition = "new";

    // Brand: WallBedKing
    const brand = p.brand || (p.isMorphy ? "WallBedKing MORPHY" : "WallBedKing");

    // GTIN / EAN barcode
    const rawGtin = getLocalizedProductGtin(p, locale);
    const gtin = rawGtin ? String(rawGtin).trim().replace(/[^0-9]/g, "") : "";
    const hasValidGtin = gtin.length >= 8 && gtin.length <= 14;

    // Optional & Storefront-matched attributes:
    const itemGroupId = p.parent_sku || p.model_code || (p.orientation && p.type ? `wbk-${p.orientation}-${p.type}`.toLowerCase() : null);
    const googleProductCategory = getGoogleProductCategory(p.parent_category);
    const weight = Number(p.weight) || 0;
    const shippingWeight = weight > 0 ? `${weight} kg` : null;
    const color = p.color ? String(p.color).trim().slice(0, 100) : null;
    const rawSize = formatSizeLabel(null, locale, p);
    const size = rawSize ? String(rawSize).trim().slice(0, 100) : null;
    const customLabel0 = pricing.isOnSale ? String(pricing.discountLabel || "On Sale").slice(0, 100) : null;
    const customLabel1 = pricing.isOnSale
      ? String(
          pricing.isPromotionalCampaign && pricing.appliedCampaign?.name
            ? pricing.appliedCampaign.name
            : "Product Sale"
        ).slice(0, 100)
      : null;

    items.push({
      id,
      title,
      description,
      link,
      image_link: imageLink,
      additional_image_links: additionalImages,
      availability,
      price,
      sale_price: salePrice,
      sale_price_effective_date: salePriceEffectiveDate,
      condition,
      brand,
      gtin: hasValidGtin ? gtin : null,
      identifier_exists: hasValidGtin ? "yes" : "no",
      item_group_id: itemGroupId,
      google_product_category: googleProductCategory,
      shipping_weight: shippingWeight,
      color,
      size,
      custom_label_0: customLabel0,
      custom_label_1: customLabel1,
    });
  }

  return items;
}

/**
 * Generates the Google Merchant Center XML (RSS 2.0 with g: namespace).
 */
export function generateGoogleXmlFeed(countryConfig, items, baseUrl = "https://www.wallbedking.com") {
  const now = new Date().toUTCString();

  const itemsXml = items
    .map((item) => {
      const additionalImagesTags = item.additional_image_links
        .map((img) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
        .join("\n");

      return `    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title>${wrapCdata(item.title)}</g:title>
      <g:description>${wrapCdata(item.description)}</g:description>
      <g:link>${wrapCdata(item.link)}</g:link>
      <g:image_link>${escapeXml(item.image_link)}</g:image_link>
${additionalImagesTags ? additionalImagesTags + "\n" : ""}      <g:availability>${item.availability}</g:availability>
      <g:price>${item.price}</g:price>
${item.sale_price ? `      <g:sale_price>${item.sale_price}</g:sale_price>\n` : ""}${item.sale_price_effective_date ? `      <g:sale_price_effective_date>${item.sale_price_effective_date}</g:sale_price_effective_date>\n` : ""}      <g:condition>${item.condition}</g:condition>
      <g:brand>${escapeXml(item.brand)}</g:brand>
${item.gtin ? `      <g:gtin>${item.gtin}</g:gtin>\n` : `      <g:identifier_exists>no</g:identifier_exists>\n`}${item.item_group_id ? `      <g:item_group_id>${escapeXml(item.item_group_id)}</g:item_group_id>\n` : ""}${item.color ? `      <g:color>${escapeXml(item.color)}</g:color>\n` : ""}${item.size ? `      <g:size>${escapeXml(item.size)}</g:size>\n` : ""}${item.shipping_weight ? `      <g:shipping_weight>${escapeXml(item.shipping_weight)}</g:shipping_weight>\n` : ""}${item.custom_label_0 ? `      <g:custom_label_0>${escapeXml(item.custom_label_0)}</g:custom_label_0>\n` : ""}${item.custom_label_1 ? `      <g:custom_label_1>${escapeXml(item.custom_label_1)}</g:custom_label_1>\n` : ""}      <g:google_product_category>${item.google_product_category}</g:google_product_category>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${wrapCdata(`WallBedKing - Google Shopping Feed (${countryConfig.name})`)}</title>
    <link>${baseUrl}/${countryConfig.locale}</link>
    <description>${wrapCdata(`Live Google Merchant Center product feed for WallBedKing products in ${countryConfig.name}. Auto-synchronized.`)}</description>
    <language>${countryConfig.targetLanguage}</language>
    <lastBuildDate>${now}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;
}

/**
 * Generates TSV (Tab Separated Values) format for Google Merchant Center.
 */
export function generateGoogleTsvFeed(countryConfig, items) {
  const columns = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "additional_image_link",
    "availability",
    "price",
    "sale_price",
    "sale_price_effective_date",
    "condition",
    "brand",
    "gtin",
    "identifier_exists",
    "item_group_id",
    "color",
    "size",
    "shipping_weight",
    "custom_label_0",
    "custom_label_1",
    "google_product_category",
  ];

  const escapeTsv = (val) => {
    if (val === null || val === undefined) return "";
    return String(val)
      .replace(/\t/g, " ")
      .replace(/\r?\n/g, " ")
      .trim();
  };

  const rows = [];
  rows.push(columns.join("\t"));

  for (const item of items) {
    const row = [
      escapeTsv(item.id),
      escapeTsv(item.title),
      escapeTsv(item.description),
      escapeTsv(item.link),
      escapeTsv(item.image_link),
      escapeTsv(item.additional_image_links.join(",")),
      escapeTsv(item.availability),
      escapeTsv(item.price),
      escapeTsv(item.sale_price || ""),
      escapeTsv(item.sale_price_effective_date || ""),
      escapeTsv(item.condition),
      escapeTsv(item.brand),
      escapeTsv(item.gtin || ""),
      escapeTsv(item.identifier_exists),
      escapeTsv(item.item_group_id || ""),
      escapeTsv(item.color || ""),
      escapeTsv(item.size || ""),
      escapeTsv(item.shipping_weight || ""),
      escapeTsv(item.custom_label_0 || ""),
      escapeTsv(item.custom_label_1 || ""),
      escapeTsv(item.google_product_category || ""),
    ];
    rows.push(row.join("\t"));
  }

  return rows.join("\n");
}

function escapeXml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
