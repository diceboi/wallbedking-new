import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const domain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION || '2024-07';

/**
 * Official Shopify Storefront API Client instance
 */
export const shopifyClient =
  domain && storefrontAccessToken
    ? createStorefrontApiClient({
        storeDomain: domain.replace(/^https?:\/\//, ''),
        apiVersion,
        publicAccessToken: storefrontAccessToken,
        customFetchApi: fetch,
      })
    : null;

// Customer Account API Configuration
export const SHOPIFY_CUSTOMER_CONFIG = {
  clientId:
    process.env.SHOPIFY_CLIENT_ID ||
    process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID ||
    '5b02cd56-17cb-4c5a-b110-78900e4ce9d0',
  accountId: process.env.SHOPIFY_ACCOUNT_ID || '100273094983',
  authUrl:
    process.env.NEXT_PUBLIC_SHOPIFY_AUTH_URL ||
    'https://shopify.com/authentication/100273094983/oauth/authorize',
  tokenUrl:
    process.env.SHOPIFY_TOKEN_URL ||
    'https://shopify.com/authentication/100273094983/oauth/token',
  logoutUrl:
    process.env.NEXT_PUBLIC_SHOPIFY_LOGOUT_URL ||
    'https://shopify.com/authentication/100273094983/logout',
};

/**
 * Generic Shopify Storefront GraphQL query executor
 */
export async function shopifyFetch({
  query,
  variables = {},
  cache = 'force-cache',
  tags = ['shopify-products'],
  revalidate = 3600,
}) {
  if (!domain || !storefrontAccessToken) {
    console.warn(
      '[Shopify] Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN in environment variables.'
    );
    return { data: null, errors: [{ message: 'Missing Shopify configuration' }] };
  }

  const endpoint = `https://${domain.replace(/^https?:\/\//, '')}/api/${apiVersion}/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      next: {
        revalidate,
        tags,
      },
      cache,
    });

    const body = await response.json();

    if (body.errors) {
      console.error('[Shopify GraphQL Error]', body.errors);
    }

    return body;
  } catch (error) {
    console.error('[Shopify Fetch Error]', error);
    return { data: null, errors: [error] };
  }
}

/**
 * Example query: Fetch list of products
 */
export async function getShopifyProducts({ first = 20 } = {}) {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: { first },
  });

  return response.data?.products?.edges?.map((edge) => edge.node) || [];
}

/**
 * Example query: Fetch single product by handle
 */
export async function getShopifyProductByHandle(handle) {
  const query = `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
        availableForSale
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
              width
              height
            }
          }
        }
        variants(first: 50) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({
    query,
    variables: { handle },
  });

  return response.data?.product || null;
}
