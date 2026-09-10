import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAmazonSpApiConfig, syncFeedToAmazon } from "@/lib/amazon-sp-api";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const AMAZON_COLUMNS = [
  "item_sku",
  "external_product_id",
  "external_product_id_type",
  "item_name",
  "brand_name",
  "product_description",
  "bullet_point1",
  "bullet_point2",
  "bullet_point3",
  "bullet_point4",
  "bullet_point5",
  "generic_keywords",
  "main_image_url",
  "other_image_url1",
  "other_image_url2",
  "other_image_url3",
  "other_image_url4",
  "other_image_url5",
  "recommended_browse_nodes",
  "parent_child",
  "parent_sku",
  "relationship_type",
  "variation_theme",
  "size_name",
  "standard_price",
  "currency",
  "quantity",
  "fulfillment_channel",
  "care_instructions",
  "furniture_finish",
  "finish_type",
  "product_type",
  "condition_type",
  "update_delete",
  "warranty_description",
  "safety_warning",
  "country_of_origin",
];

async function getFeedItems(feedId) {
  let items = [];

  // 1. Try Supabase
  try {
    if (SUPABASE_URL && SERVICE_KEY) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/marketplace_feed_items?feed_id=eq.${encodeURIComponent(feedId)}&order=row_number.asc`,
        { headers, cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          items = data;
        }
      }
    }
  } catch (e) {
    // Fallback
  }

  // 2. Fallback to local JSON
  if (items.length === 0) {
    const jsonPath = path.join(process.cwd(), "src", "data", "feeds", `${feedId}.json`);
    if (fs.existsSync(jsonPath)) {
      items = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    }
  }

  return items;
}

function generateTsv(items) {
  const cleanTsv = (val) => {
    if (val === null || val === undefined) return "";
    return String(val).replace(/\r?\n/g, " ").replace(/\t/g, " ");
  };

  const tsvRows = [];
  tsvRows.push(AMAZON_COLUMNS.join("\t"));

  for (const item of items) {
    const line = AMAZON_COLUMNS.map((col) => cleanTsv(item[col]));
    tsvRows.push(line.join("\t"));
  }

  return tsvRows.join("\r\n");
}

/**
 * GET: Return current SP-API configuration & connection readiness
 */
export async function GET(request, { params }) {
  try {
    const { feedId } = await params;
    const config = getAmazonSpApiConfig();

    return NextResponse.json({
      success: true,
      feedId,
      config,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST: Trigger an Amazon SP-API Feed Submission
 * Will execute live if credentials exist, or return a simulation payload if not yet configured.
 */
export async function POST(request, { params }) {
  try {
    const { feedId } = await params;
    const body = await request.json().catch(() => ({}));
    const marketplace = body.marketplace || "FR";

    const items = await getFeedItems(feedId);
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: `Feed "${feedId}" has no items to sync.` },
        { status: 400 }
      );
    }

    const tsvContent = generateTsv(items);

    const syncResult = await syncFeedToAmazon({
      feedId,
      tsvContent,
      marketplace,
    });

    return NextResponse.json({
      ...syncResult,
      itemCount: items.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
