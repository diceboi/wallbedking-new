/**
 * Amazon Selling Partner API (SP-API) Client & Feed Sync Engine
 * Documentation: https://developer-docs.amazon.com/sp-api/docs/feeds-api-v2021-06-30-use-case-guide
 */

const LWA_TOKEN_URL = "https://api.amazon.com/auth/o2/token";
const SP_API_EU_ENDPOINT = "https://sellingpartnerapi-eu.amazon.com";

// Marketplace IDs
export const AMAZON_MARKETPLACE_IDS = {
  FR: "A13V1IB3VIYZZH", // France
  DE: "A1PA6795UKMFR9", // Germany
  UK: "A1F83G8C2ARO7P", // United Kingdom
  IT: "APJ6JRA9NG5V4",  // Italy
  ES: "A1RKKUPIHCS9HS", // Spain
  US: "ATVPDKIKX0DER",  // United States
};

/**
 * Check if Amazon SP-API credentials are configured in environment
 */
export function getAmazonSpApiConfig() {
  const clientId = process.env.AMAZON_SP_API_CLIENT_ID;
  const clientSecret = process.env.AMAZON_SP_API_CLIENT_SECRET;
  const refreshToken = process.env.AMAZON_SP_API_REFRESH_TOKEN;
  const sellerId = process.env.AMAZON_SELLER_ID;
  const region = process.env.AMAZON_SP_API_REGION || "eu";

  const isConfigured = Boolean(clientId && clientSecret && refreshToken);

  return {
    isConfigured,
    clientId: clientId ? `${clientId.slice(0, 8)}...` : null,
    hasSecret: Boolean(clientSecret),
    hasRefreshToken: Boolean(refreshToken),
    sellerId: sellerId || null,
    region,
    endpoint: SP_API_EU_ENDPOINT,
    missingFields: [
      !clientId && "AMAZON_SP_API_CLIENT_ID",
      !clientSecret && "AMAZON_SP_API_CLIENT_SECRET",
      !refreshToken && "AMAZON_SP_API_REFRESH_TOKEN",
    ].filter(Boolean),
  };
}

/**
 * Exchange LWA Refresh Token for a short-lived Access Token
 */
export async function getLwaAccessToken() {
  const clientId = process.env.AMAZON_SP_API_CLIENT_ID;
  const clientSecret = process.env.AMAZON_SP_API_CLIENT_SECRET;
  const refreshToken = process.env.AMAZON_SP_API_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Amazon SP-API credentials (CLIENT_ID, CLIENT_SECRET, or REFRESH_TOKEN).");
  }

  const res = await fetch(LWA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Amazon LWA Token exchange failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Step 1: Create a Feed Document in SP-API to receive a pre-signed S3 upload URL
 */
export async function createFeedDocument(accessToken, contentType = "text/tab-separated-values; charset=UTF-8") {
  const res = await fetch(`${SP_API_EU_ENDPOINT}/feeds/2021-06-30/documents`, {
    method: "POST",
    headers: {
      "x-amz-access-token": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contentType }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create feed document (${res.status}): ${err}`);
  }

  return await res.json(); // returns { feedDocumentId, url }
}

/**
 * Step 2: Upload feed content directly to Amazon's presigned S3 destination
 */
export async function uploadFeedContent(presignedUrl, feedContent, contentType = "text/tab-separated-values; charset=UTF-8") {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: feedContent,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to upload feed content to S3 (${res.status}): ${err}`);
  }

  return true;
}

/**
 * Step 3: Call createFeed to start asynchronous processing on Amazon
 */
export async function submitFeedExecution(
  accessToken,
  feedDocumentId,
  feedType = "POST_FLAT_FILE_LISTINGS_DATA",
  marketplaceIds = [AMAZON_MARKETPLACE_IDS.FR]
) {
  const res = await fetch(`${SP_API_EU_ENDPOINT}/feeds/2021-06-30/feeds`, {
    method: "POST",
    headers: {
      "x-amz-access-token": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      feedType,
      marketplaceIds,
      inputFeedDocumentId: feedDocumentId,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to submit feed execution (${res.status}): ${err}`);
  }

  return await res.json(); // returns { feedId }
}

/**
 * Step 4: Query processing status of a previously submitted feed
 */
export async function getFeedStatus(accessToken, amazonFeedId) {
  const res = await fetch(`${SP_API_EU_ENDPOINT}/feeds/2021-06-30/feeds/${amazonFeedId}`, {
    method: "GET",
    headers: {
      "x-amz-access-token": accessToken,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to get feed status (${res.status}): ${err}`);
  }

  return await res.json();
}

/**
 * High-Level Sync Orchestrator
 * Performs full upload pipeline or returns simulation result if credentials are not yet set.
 */
export async function syncFeedToAmazon({
  feedId = "amazon-fr-classic",
  tsvContent,
  marketplace = "FR",
}) {
  const config = getAmazonSpApiConfig();
  const marketplaceId = AMAZON_MARKETPLACE_IDS[marketplace] || AMAZON_MARKETPLACE_IDS.FR;

  // If credentials are not yet provided in .env.local, run in Simulation / Preparation Mode
  if (!config.isConfigured) {
    const mockFeedId = `SIM-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    return {
      success: true,
      mode: "simulation",
      status: "READY_FOR_CREDENTIALS",
      message: "Simulation mode: Feed TSV was generated and validated successfully. To send directly to Amazon, provide SP-API credentials in .env.local.",
      amazonFeedId: mockFeedId,
      submittedAt: new Date().toISOString(),
      marketplaceId,
      marketplace,
      itemCount: tsvContent ? tsvContent.trim().split("\r\n").length - 1 : 0,
      missingCredentials: config.missingFields,
    };
  }

  // Live SP-API execution
  try {
    const accessToken = await getLwaAccessToken();
    const doc = await createFeedDocument(accessToken, "text/tab-separated-values; charset=UTF-8");
    await uploadFeedContent(doc.url, tsvContent, "text/tab-separated-values; charset=UTF-8");
    const feed = await submitFeedExecution(
      accessToken,
      doc.feedDocumentId,
      "POST_FLAT_FILE_LISTINGS_DATA",
      [marketplaceId]
    );

    return {
      success: true,
      mode: "live",
      status: "SUBMITTED",
      message: "Feed submitted to Amazon SP-API successfully!",
      amazonFeedId: feed.feedId,
      documentId: doc.feedDocumentId,
      submittedAt: new Date().toISOString(),
      marketplaceId,
      marketplace,
    };
  } catch (err) {
    return {
      success: false,
      mode: "live",
      status: "ERROR",
      error: err.message,
      submittedAt: new Date().toISOString(),
    };
  }
}
