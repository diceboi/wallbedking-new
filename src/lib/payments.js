// Central Payment Gateway Configuration for WallBedKing
// Separates UK and International company accounts for Stripe and PayPal

export const PAYMENT_ENTITIES = {
  UK: {
    key: "UK",
    name: "Wall Bed King Ltd (UK)",
    domain: "https://www.wallbedking.co.uk",
    currency: "GBP",
    currencyLower: "gbp",
    paypal: {
      clientId:
        process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_UK ||
        "AatfEC-B5arwZNWs2BbzxxYC0P1Z9jGIXw0HFXQ0f-57xEsm2W0y_4GGl_o0wF_vlliq2vE5hzRkhvrL",
      currency: "GBP",
      softDescriptor: "WBK UK",
      locale: "en_GB",
    },
    stripe: {
      endpoint: "https://stripe-uk.onrender.com/create-checkout-session",
      statusEndpoint: "https://stripe-uk.onrender.com/session-status",
      origin: "https://www.wallbedking.co.uk",
      referer: "https://www.wallbedking.co.uk/cart",
      currency: "gbp",
    },
  },
  INTERNATIONAL: {
    key: "INTERNATIONAL",
    name: "Wall Bed King International",
    domain: "https://www.wallbedking.com",
    currency: "EUR",
    currencyLower: "eur",
    paypal: {
      clientId:
        process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_INTL ||
        process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_EU ||
        "AdTk8PvPQ3s9XFdinBN0-K2az5-5cJ7toYKvvq_mRIkfXj2BF06U0k5PE1St09rT3x6dhLL50z3cU6t-",
      currency: "EUR",
      softDescriptor: "WBK COM",
      locale: "en_US",
    },
    stripe: {
      endpoint: "https://stripe-05m9.onrender.com/create-checkout-session",
      statusEndpoint: "https://stripe-05m9.onrender.com/session-status",
      origin: "https://www.wallbedking.com",
      referer: "https://www.wallbedking.com/cart",
      currency: "eur",
    },
  },
};

/**
 * Returns the appropriate payment configuration depending on the storefront locale / market.
 *
 * Rules:
 * - Locale "en" (or UK domain): UK entity (Wall Bed King Ltd)
 * - All other locales ("us", "de", "fr", "es", "it", "por"): International entity
 *
 * @param {string} locale
 * @param {string} [currency]
 * @returns {object} Payment configuration
 */
export function getPaymentConfig(locale = "en", currency = null) {
  const normLocale = (locale || "en").toLowerCase();
  const isUK = normLocale === "en" || normLocale === "en_uk" || normLocale === "gb";

  if (isUK) {
    return {
      entity: "UK",
      companyName: PAYMENT_ENTITIES.UK.name,
      domain: PAYMENT_ENTITIES.UK.domain,
      currency: "GBP",
      currencyLower: "gbp",
      paypalClientId: PAYMENT_ENTITIES.UK.paypal.clientId,
      paypalCurrency: "GBP",
      paypalDescriptor: PAYMENT_ENTITIES.UK.paypal.softDescriptor,
      paypalSecretKey: process.env.PAYPAL_CLIENT_SECRET_UK || null,
      paypalWebhookId: process.env.PAYPAL_WEBHOOK_ID_UK || null,
      stripeEndpoint: PAYMENT_ENTITIES.UK.stripe.endpoint,
      stripeStatusEndpoint: PAYMENT_ENTITIES.UK.stripe.statusEndpoint,
      stripeOrigin: PAYMENT_ENTITIES.UK.stripe.origin,
      stripeReferer: PAYMENT_ENTITIES.UK.stripe.referer,
      stripeCurrency: "gbp",
      stripeSecretKey: process.env.STRIPE_SECRET_KEY_UK || process.env.STRIPE_SECRET_KEY || null,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET_UK || process.env.STRIPE_WEBHOOK_SECRET || null,
    };
  }

  // International Market
  const intlCurrency = (currency || (normLocale === "us" ? "USD" : "EUR")).toUpperCase();
  const intlCurrencyLower = intlCurrency.toLowerCase();

  return {
    entity: "INTERNATIONAL",
    companyName: PAYMENT_ENTITIES.INTERNATIONAL.name,
    domain: PAYMENT_ENTITIES.INTERNATIONAL.domain,
    currency: intlCurrency,
    currencyLower: intlCurrencyLower,
    paypalClientId: PAYMENT_ENTITIES.INTERNATIONAL.paypal.clientId,
    paypalCurrency: intlCurrency,
    paypalDescriptor: PAYMENT_ENTITIES.INTERNATIONAL.paypal.softDescriptor,
    paypalSecretKey: process.env.PAYPAL_CLIENT_SECRET_INTL || process.env.PAYPAL_CLIENT_SECRET_EU || null,
    paypalWebhookId: process.env.PAYPAL_WEBHOOK_ID_INTL || process.env.PAYPAL_WEBHOOK_ID_EU || null,
    stripeEndpoint: PAYMENT_ENTITIES.INTERNATIONAL.stripe.endpoint,
    stripeStatusEndpoint: PAYMENT_ENTITIES.INTERNATIONAL.stripe.statusEndpoint,
    stripeOrigin: PAYMENT_ENTITIES.INTERNATIONAL.stripe.origin,
    stripeReferer: PAYMENT_ENTITIES.INTERNATIONAL.stripe.referer,
    stripeCurrency: intlCurrencyLower,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY_EU || process.env.STRIPE_SECRET_KEY_INTL || process.env.STRIPE_SECRET_KEY || null,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET_EU || process.env.STRIPE_WEBHOOK_SECRET_INTL || process.env.STRIPE_WEBHOOK_SECRET || null,
  };
}
