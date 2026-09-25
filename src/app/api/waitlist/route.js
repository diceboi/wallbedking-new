import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Local fallback store path in case Supabase table is not yet migrated
const FALLBACK_DIR = path.join(process.cwd(), "src", "data");
const FALLBACK_FILE = path.join(FALLBACK_DIR, "waitlist_store.json");

function getFallbackWaitlist() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const content = fs.readFileSync(FALLBACK_FILE, "utf-8");
      return JSON.parse(content) || [];
    }
  } catch (err) {
    console.warn("[Waitlist Fallback] Read warning:", err.message);
  }
  return [];
}

function saveFallbackWaitlist(items) {
  try {
    if (!fs.existsSync(FALLBACK_DIR)) {
      fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Waitlist Fallback] Write warning:", err.message);
  }
}

/**
 * GET /api/waitlist
 * Retrieve active waitlist items for a user (by userId or customerEmail)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: "Missing userId or email parameter" },
        { status: 400 }
      );
    }

    let items = [];
    let usedDb = false;

    if (supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from("product_waitlist")
          .select("*")
          .order("created_at", { ascending: false });

        if (userId && email) {
          query = query.or(`user_id.eq.${userId},customer_email.eq.${email}`);
        } else if (userId) {
          query = query.eq("user_id", userId);
        } else {
          query = query.eq("customer_email", email);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          items = data;
          usedDb = true;
        }
      } catch (dbErr) {
        console.warn("[Waitlist API] Supabase query notice:", dbErr.message);
      }
    }

    // Fallback to local store if DB returned nothing or table not created
    if (!usedDb || items.length === 0) {
      const local = getFallbackWaitlist();
      const filtered = local.filter((it) => {
        if (userId && it.user_id === userId) return true;
        if (email && it.customer_email?.toLowerCase() === email) return true;
        return false;
      });
      if (filtered.length > 0) items = filtered;
    }

    // Check live product stock for each waitlist item
    if (items.length > 0 && supabaseAdmin) {
      try {
        const productIds = items
          .map((i) => i.product_id)
          .filter(Boolean);

        if (productIds.length > 0) {
          const { data: prods } = await supabaseAdmin
            .from("products")
            .select("id, stock, price_gbp, name, image, slug")
            .in("id", productIds);

          if (Array.isArray(prods)) {
            const prodMap = new Map(prods.map((p) => [p.id, p]));
            items = items.map((item) => {
              const liveProd = prodMap.get(item.product_id);
              const currentStock = liveProd ? Number(liveProd.stock ?? 0) : null;
              return {
                ...item,
                current_stock: currentStock,
                is_in_stock: currentStock !== null ? currentStock > 0 : false,
              };
            });
          }
        }
      } catch (stockErr) {
        console.warn("[Waitlist API] Stock check warning:", stockErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      waitlist: items,
      items: items,
      count: items.length,
    });
  } catch (error) {
    console.error("[Waitlist GET Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load waitlist" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/waitlist
 * Add item to waitlist (checks duplicates)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId = null,
      customerEmail,
      customerName = "",
      productId = null,
      productSlug,
      productName,
      productImage = "",
      variantName = "",
      options = {},
      locale = "en",
    } = body || {};

    if (!customerEmail || !customerEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    if (!productSlug && !productName) {
      return NextResponse.json(
        { success: false, error: "Product information is required" },
        { status: 400 }
      );
    }

    const cleanEmail = customerEmail.trim().toLowerCase();

    // Resolve product ID from local catalog if missing
    let resolvedProductId = productId ? parseInt(productId, 10) : null;
    if (!resolvedProductId && productSlug) {
      try {
        const catalogPath = path.join(process.cwd(), "src", "data", "products-catalog.json");
        if (fs.existsSync(catalogPath)) {
          const list = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
          const found = list.find((p) => p.slug === productSlug);
          if (found && found.id) {
            resolvedProductId = parseInt(found.id, 10);
          }
        }
      } catch (catErr) {
        console.warn("[Waitlist API] Catalog resolution notice:", catErr.message);
      }
    }

    const optionsPayload = {
      ...(options || {}),
      customer_name: customerName || (options && options.customer_name) || "",
    };

    const waitlistEntry = {
      user_id: userId || null,
      customer_email: cleanEmail,
      product_id: resolvedProductId,
      product_slug: productSlug || "",
      product_name: productName || "Wall Bed King Product",
      product_image: productImage || "",
      variant_name: variantName || "",
      options: optionsPayload,
      locale: locale || "en",
      status: "waiting",
      notified_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let insertedToDb = false;
    let savedRecord = {
      id: `wl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      customer_name: customerName || "",
      ...waitlistEntry,
    };

    // 1. Try Supabase
    if (supabaseAdmin) {
      try {
        // Check for existing active duplicate in DB
        let dupQuery = supabaseAdmin
          .from("product_waitlist")
          .select("id")
          .eq("customer_email", cleanEmail)
          .eq("status", "waiting");

        if (resolvedProductId && productSlug) {
          dupQuery = dupQuery.or(`product_id.eq.${resolvedProductId},product_slug.eq.${productSlug}`);
        } else if (resolvedProductId) {
          dupQuery = dupQuery.eq("product_id", resolvedProductId);
        } else if (productSlug) {
          dupQuery = dupQuery.eq("product_slug", productSlug);
        }

        const { data: existingDup } = await dupQuery.maybeSingle();

        if (existingDup) {
          return NextResponse.json({
            success: true,
            alreadySubscribed: true,
            message: "You are already on the waitlist for this item!",
            waitlistItem: existingDup,
          });
        }

        // Insert clean payload into Supabase (omit top-level customer_name as it lives in options)
        const { data: inserted, error: insertError } = await supabaseAdmin
          .from("product_waitlist")
          .insert([waitlistEntry])
          .select()
          .single();

        if (!insertError && inserted) {
          insertedToDb = true;
          savedRecord = {
            ...inserted,
            customer_name: customerName || "",
          };
        } else {
          console.warn("[Waitlist API] Supabase insert warning:", insertError?.message);
        }
      } catch (dbErr) {
        console.warn("[Waitlist API] Supabase insert exception:", dbErr.message);
      }
    }

    // 2. Always maintain fallback file
    const local = getFallbackWaitlist();
    const existsLocally = local.find(
      (it) =>
        it.customer_email === cleanEmail &&
        ((resolvedProductId && it.product_id === resolvedProductId) ||
          (productSlug && it.product_slug === productSlug)) &&
        it.status === "waiting"
    );

    if (existsLocally && !insertedToDb) {
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message: "You are already on the waitlist for this item!",
        waitlistItem: existsLocally,
      });
    }

    if (!existsLocally) {
      local.unshift(savedRecord);
      saveFallbackWaitlist(local);
    }

    return NextResponse.json({
      success: true,
      message: "You have been added to the waitlist. We'll notify you as soon as stock arrives!",
      waitlistItem: savedRecord,
    });
  } catch (error) {
    console.error("[Waitlist POST Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to join waitlist" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/waitlist
 * Remove an item from the waitlist
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing waitlist item id" },
        { status: 400 }
      );
    }

    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from("product_waitlist").delete().eq("id", id);
      } catch (dbErr) {
        console.warn("[Waitlist DELETE DB notice]:", dbErr.message);
      }
    }

    // Also remove from local fallback
    const local = getFallbackWaitlist();
    const updated = local.filter((it) => it.id !== id);
    saveFallbackWaitlist(updated);

    return NextResponse.json({
      success: true,
      message: "Removed from waitlist",
    });
  } catch (error) {
    console.error("[Waitlist DELETE Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete from waitlist" },
      { status: 500 }
    );
  }
}
