/**
 * Centralized Email Notification Utility using Resend
 * 
 * Configured sender: notifications.wallbedking.com
 * Central support: support@wallbedking.com
 * Set RESEND_API_KEY in .env.local to activate automated outbound emails.
 */

import { BANK_DETAILS, getBankI18n } from "./bank-details.js";

export const DEFAULT_FROM = process.env.EMAIL_FROM || "Wall Bed King <orders@notifications.wallbedking.com>";
export const SUPPORT_EMAIL = "support@wallbedking.com";
// Admin notifications MUST go to support@wallbedking.com (never delivery@)
const configuredAdmin = (process.env.ADMIN_EMAIL || "").trim();
export const ADMIN_EMAIL = (configuredAdmin && !configuredAdmin.toLowerCase().includes("delivery"))
  ? configuredAdmin
  : "support@wallbedking.com";
export const STORE_PHONE = "01928 583 469";
export const STORE_HOURS = "Mon-Fri 9:00 - 20:00, Sat 9:00 - 12:00";

export function getStorePhone(locale = "en") {
  const norm = (locale || "en").toLowerCase();
  if (norm === "en") return "01928 583 469";
  return "+44 1928 583 469";
}

// ==========================================
// SAMPLE DATA FOR PREVIEW & TESTING
// ==========================================
export const SAMPLE_ORDER = {
  id: "WBK-1000",
  customer_name: "John Doe",
  customer_email: "john.doe@example.com",
  customer_phone: "+44 7700 900077",
  payment_method: "Credit Card (Stripe)",
  total_amount: 1449.00,
  locale: "en",
  shipping_address: {
    address: "42 High Street, Flat 3B",
    city: "London",
    postal_code: "SW1A 1AA",
    country: "United Kingdom",
  },
  items: [
    {
      name: "Classic Vertical Wall Bed",
      variant: "Double (135x190cm) • Premium Gas Struts • White Oak",
      quantity: 1,
      price: 1199.00,
      slug: "classic-vertical-wall-bed",
      category: "vertical",
    },
    {
      name: "Integrated LED Reading Light Pair",
      variant: "Warm White (3000K) • Touch Dimmable",
      quantity: 1,
      price: 150.00,
      slug: "led-reading-lights",
      category: "accessories",
    },
    {
      name: "Standard UK Delivery & Room of Choice",
      variant: "Specialist Furniture Handling",
      quantity: 1,
      price: 100.00,
    },
  ],
};

export const SAMPLE_SHIPPING = {
  order: SAMPLE_ORDER,
  trackingNumber: "DXFR-88392190-GB",
  carrier: "DX Freight Furniture Express",
};

export const SAMPLE_CONTACT = {
  name: "Emily Watson",
  email: "emily.watson@example.com",
  phone: "+44 1928 583 469",
  subject: "Ceiling height inquiry for King Size Horizontal Bed",
  message: "Hello,\n\nI am interested in ordering the King Size Horizontal Wall Bed. My ceiling height is 232 cm. Could you please confirm if this leaves sufficient clearance for rotation during daily opening and closing?\n\nThank you,\nEmily",
};

export const SAMPLE_REVIEW = {
  id: "rev-sample-1",
  author_name: "Marcus Vance",
  author_email: "marcus.vance@example.com",
  product_name: "Classic Vertical Wall Bed - Double (135x190cm)",
  product_slug: "classic-vertical-wall-bed",
  rating: 5,
  title: "Transformed our spare room completely!",
  content: "The engineering on the gas pistons is remarkably smooth. Lifting and lowering is effortless with one hand. Highly recommend following the video installation guide — took about 2 hours to assemble securely. Couldn't be happier!",
  photos: [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop&q=80",
  ],
  created_at: new Date().toISOString(),
};

// ==========================================
// MULTILINGUAL CONFIRMATION DICTIONARY
// ==========================================
export const CONFIRMATION_I18N = {
  en: {
    title: "Order Confirmation",
    subjectPrefix: "Wall Bed King Order Confirmation",
    badge: "Payment Confirmed",
    thankYou: "Thank you for your order",
    intro: "We have received your order {id}. Our engineering and dispatch team is now carefully preparing your precision space-saving furniture.",
    orderNumber: "Order Number:",
    date: "Date:",
    deliveryTo: "Delivery To:",
    paymentMethod: "Payment Method:",
    orderSummary: "Order Summary",
    colItem: "Item",
    colQty: "Qty",
    colPrice: "Price",
    totalPaid: "Total Paid (VAT incl.):",
    whatNextTitle: "What happens next?",
    whatNextDesc: "Once your shipment has been scheduled with our freight carriers, you will receive a dispatch email with your tracking number and delivery booking window.",
    footerGuarantee: "Wall Bed King • Premium Murphy Beds • Lifetime Mechanism Guarantee",
    footerHelp: "Need assistance? Reach us at",
  },
  us: {
    title: "Order Confirmation",
    subjectPrefix: "Wall Bed King Order Confirmation",
    badge: "Payment Confirmed",
    thankYou: "Thank you for your order",
    intro: "We have received your order {id}. Our team is now preparing your space-saving Murphy bed for delivery.",
    orderNumber: "Order Number:",
    date: "Date:",
    deliveryTo: "Shipping Address:",
    paymentMethod: "Payment Method:",
    orderSummary: "Order Summary",
    colItem: "Item",
    colQty: "Qty",
    colPrice: "Price",
    totalPaid: "Total Paid:",
    whatNextTitle: "What happens next?",
    whatNextDesc: "Once your shipment is handed over to our freight carrier, you will receive tracking information.",
    footerGuarantee: "Wall Bed King • Premium Murphy Beds • Lifetime Mechanism Warranty",
    footerHelp: "Need assistance? Reach us at",
  },
  de: {
    title: "Bestellbestätigung",
    subjectPrefix: "Wall Bed King Bestellbestätigung",
    badge: "Zahlung bestätigt",
    thankYou: "Vielen Dank für Ihre Bestellung",
    intro: "Wir haben Ihre Bestellung {id} erhalten. Unser Fertigungs- und Versandteam bereitet Ihr Schrankbett sorgfältig vor.",
    orderNumber: "Bestellnummer:",
    date: "Datum:",
    deliveryTo: "Lieferadresse:",
    paymentMethod: "Zahlungsart:",
    orderSummary: "Bestellübersicht",
    colItem: "Artikel",
    colQty: "Menge",
    colPrice: "Preis",
    totalPaid: "Gesamtbetrag (inkl. MwSt.):",
    whatNextTitle: "Wie geht es weiter?",
    whatNextDesc: "Sobald Ihre Sendung an unsere Spedition übergeben wurde, erhalten Sie eine Versandbestätigung mit Sendungsnummer.",
    footerGuarantee: "Wall Bed King • Premium Schrankbetten • Lebenslange Mechanik-Garantie",
    footerHelp: "Brauchen Sie Hilfe? Kontaktieren Sie uns unter",
  },
  fr: {
    title: "Confirmation de Commande",
    subjectPrefix: "Confirmation de commande Wall Bed King",
    badge: "Paiement Confirmé",
    thankYou: "Merci pour votre commande",
    intro: "Nous avons bien reçu votre commande {id}. Notre équipe prépare votre lit escamotable haut de gamme avec le plus grand soin.",
    orderNumber: "Numéro de commande :",
    date: "Date :",
    deliveryTo: "Adresse de livraison :",
    paymentMethod: "Mode de paiement :",
    orderSummary: "Récapitulatif de Commande",
    colItem: "Article",
    colQty: "Qté",
    colPrice: "Prix",
    totalPaid: "Total payé (TTC) :",
    whatNextTitle: "Quelle est la suite ?",
    whatNextDesc: "Dès l'expédition de votre meuble avec notre transporteur spécialisé, vous recevrez un e-mail avec votre numéro de suivi.",
    footerGuarantee: "Wall Bed King • Lits Escamotables Premium • Garantie Mécanisme à Vie",
    footerHelp: "Besoin d'aide ? Contactez-nous à",
  },
  es: {
    title: "Confirmación de Pedido",
    subjectPrefix: "Confirmación de pedido Wall Bed King",
    badge: "Pago Confirmado",
    thankYou: "¡Gracias por su pedido",
    intro: "Hemos recibido su pedido {id}. Nuestro equipo de ingeniería y logística está preparando su cama abatible.",
    orderNumber: "Número de pedido:",
    date: "Fecha:",
    deliveryTo: "Dirección de entrega:",
    paymentMethod: "Método de pago:",
    orderSummary: "Resumen del Pedido",
    colItem: "Artículo",
    colQty: "Cant.",
    colPrice: "Precio",
    totalPaid: "Total pagado (IVA incl.):",
    whatNextTitle: "¿Qué sucede después?",
    whatNextDesc: "Una vez programado el envío con nuestro transportista especializado, recibirá un correo con el número de seguimiento.",
    footerGuarantee: "Wall Bed King • Camas Abatibles Premium • Garantía de Mecanismo de por Vida",
    footerHelp: "¿Necesita ayuda? Contáctenos en",
  },
  it: {
    title: "Conferma dell'Ordine",
    subjectPrefix: "Conferma d'ordine Wall Bed King",
    badge: "Pagamento Confermato",
    thankYou: "Grazie per il tuo ordine",
    intro: "Abbiamo ricevuto il tuo ordine {id}. Il nostro team sta preparando con cura il tuo letto a scomparsa salva-spazio.",
    orderNumber: "Numero d'ordine:",
    date: "Data:",
    deliveryTo: "Indirizzo di consegna:",
    paymentMethod: "Metodo di pagamento:",
    orderSummary: "Riepilogo Ordine",
    colItem: "Articolo",
    colQty: "Qtà",
    colPrice: "Prezzo",
    totalPaid: "Totale pagato (IVA incl.):",
    whatNextTitle: "Cosa succede ora?",
    whatNextDesc: "Non appena la spedizione sarà affidata al corriere specializzato, riceverai una notifica con il codice di tracciamento.",
    footerGuarantee: "Wall Bed King • Letti a Scomparsa Premium • Garanzia a Vita sul Meccanismo",
    footerHelp: "Hai bisogno di assistenza? Contattaci a",
  },
  por: {
    title: "Confirmação de Encomenda",
    subjectPrefix: "Confirmação de encomenda Wall Bed King",
    badge: "Pagamento Confirmado",
    thankYou: "Obrigado pela sua encomenda",
    intro: "Recebemos a sua encomenda {id}. A nossa equipa de fabrico e logística está a preparar a sua cama rebatível.",
    orderNumber: "Número da encomenda:",
    date: "Data:",
    deliveryTo: "Morada de entrega:",
    paymentMethod: "Método de pagamento:",
    orderSummary: "Resumo da Encomenda",
    colItem: "Artigo",
    colQty: "Qtd",
    colPrice: "Preço",
    totalPaid: "Total pago (IVA incl.):",
    whatNextTitle: "Qual é o próximo passo?",
    whatNextDesc: "Assim que a sua encomenda for confiada à transportadora especializada, receberá um e-mail com o código de rastreio.",
    footerGuarantee: "Wall Bed King • Camas Rebatíveis Premium • Garantia Vitalícia do Mecanismo",
    footerHelp: "Precisa de ajuda? Contacte-nos em",
  },
};

// ==========================================
// ORDER UPDATE NOTIFICATION DICTIONARIES
// ==========================================

export function resolveOrderLocale(order, fallback = "en") {
  if (fallback && fallback !== "en") return fallback.toLowerCase();
  if (order?.locale) return order.locale.toLowerCase();
  if (order?.shipping_address?.locale) return order.shipping_address.locale.toLowerCase();
  if (order?.billing_address?.locale) return order.billing_address.locale.toLowerCase();
  if (typeof order?.admin_notes === "string") {
    const match = order.admin_notes.match(/\[Locale:\s*([a-zA-Z-]+)\]/i);
    if (match) return match[1].toLowerCase();
  }
  return "en";
}

export function formatOrderShippingAddress(order) {
  if (!order) return "";
  let s = order.shipping_address;
  if (typeof s === "string") {
    try {
      s = JSON.parse(s);
    } catch {
      return s;
    }
  }
  if (!s || typeof s !== "object") return "";
  const street = [s.address || s.address1, s.address2].filter(Boolean).join(", ");
  const city = s.city || "";
  const post = s.postcode || s.postal_code || "";
  const country = s.country || "";

  const parts = [];
  if (street) parts.push(street);
  if (post && city) parts.push(`${post} ${city}`);
  else if (city) parts.push(city);
  else if (post) parts.push(post);
  if (country) parts.push(country);

  return parts.join(", ");
}

export function formatPaymentMethod(order) {
  if (!order) return "Online Payment";
  const method = String(order.payment_method || "").toLowerCase().trim();
  const txId = String(order.payment_id || order.paymentId || "").trim();
  let label = "Online Payment";

  if (method === "paypal" || (txId && (txId.startsWith("PAYID-") || txId.length === 17))) {
    label = "PayPal";
  } else if (method === "stripe" || method === "card" || (txId && (txId.startsWith("pi_") || txId.startsWith("cs_")))) {
    label = "Credit / Debit Card (Stripe)";
  } else if (method.includes("bank")) {
    label = "Direct Bank Transfer";
  } else if (method) {
    label = method.charAt(0).toUpperCase() + method.slice(1);
  }

  if (txId) {
    return `${label} (TX: ${txId})`;
  }
  return label;
}

export const UPDATE_NOTICE_I18N = {
  en: {
    subjectPrefix: "[UPDATED] ",
    badge: "Order Details Updated",
    title: "Order Update Notice",
    message: "Your order details or delivery information have been modified. Please review your updated details below.",
  },
  us: {
    subjectPrefix: "[UPDATED] ",
    badge: "Order Details Updated",
    title: "Order Update Notice",
    message: "Your order details or delivery information have been modified. Please review your updated details below.",
  },
  de: {
    subjectPrefix: "[AKTUALISIERT] ",
    badge: "Bestellung Aktualisiert",
    title: "Aktualisierungshinweis",
    message: "Ihre Bestelldaten oder Lieferinformationen wurden aktualisiert. Nachfolgend finden Sie die aktuellen Daten.",
  },
  fr: {
    subjectPrefix: "[MISE À JOUR] ",
    badge: "Commande Modifiée",
    title: "Avis de Modification",
    message: "Les détails de votre commande ou de livraison ont été modifiés. Veuillez consulter vos informations mises à jour ci-dessous.",
  },
  es: {
    subjectPrefix: "[ACTUALIZADO] ",
    badge: "Pedido Actualizado",
    title: "Aviso de Actualización",
    message: "Los datos de su pedido o de entrega han sido actualizados. Por favor, revise la información corregida a continuación.",
  },
  it: {
    subjectPrefix: "[AGGIORNATO] ",
    badge: "Ordine Modificato",
    title: "Avviso di Modifica",
    message: "I dettagli del tuo ordine o della spedizione sono stati aggiornati. Di seguito trovi le informazioni corrette.",
  },
  hu: {
    subjectPrefix: "[MÓDOSÍTÁS] ",
    badge: "Rendelés Módosítva",
    title: "Rendelés Módosítási Értesítő",
    message: "Rendelésének adatai vagy a szállítási információk módosultak. Kérjük, tekintse át a frissített adatokat az alábbiakban.",
  },
  por: {
    subjectPrefix: "[ATUALIZADO] ",
    badge: "Encomenda Atualizada",
    title: "Aviso de Atualização",
    message: "Os dados da sua encomenda ou as informações de entrega foram alterados. Por favor, consulte os dados atualizados abaixo.",
  },
};

export const SHIPPING_I18N = {
  en: {
    subject: (id) => `Your Wall Bed King Order ${id} Has Been Dispatched! 🚚`,
  },
  us: {
    subject: (id) => `Your Wall Bed King Order ${id} Has Been Dispatched! 🚚`,
  },
  de: {
    subject: (id) => `Ihre Wall Bed King Bestellung ${id} wurde versandt! 🚚`,
  },
  fr: {
    subject: (id) => `Votre commande Wall Bed King ${id} a été expédiée ! 🚚`,
  },
  es: {
    subject: (id) => `¡Su pedido Wall Bed King ${id} ha sido enviado! 🚚`,
  },
  it: {
    subject: (id) => `Il tuo ordine Wall Bed King ${id} è stato spedito! 🚚`,
  },
  hu: {
    subject: (id) => `A(z) ${id} számú Wall Bed King rendelése feladásra került! 🚚`,
  },
  por: {
    subject: (id) => `A sua encomenda Wall Bed King ${id} foi expedida! 🚚`,
  },
};

// ==========================================
// TEMPLATE GENERATORS
// ==========================================

export function getOrderConfirmationHtml(order = SAMPLE_ORDER, requestedLocale = null, isUpdate = false) {
  const loc = resolveOrderLocale(order, requestedLocale);
  const t = CONFIRMATION_I18N[loc] || CONFIRMATION_I18N.en;
  const upd = UPDATE_NOTICE_I18N[loc] || UPDATE_NOTICE_I18N.en;
  const currencyCode = (order.currency || (loc === "us" ? "USD" : loc === "en" ? "GBP" : "EUR")).toUpperCase();
  const currencySymbol = currencyCode === "EUR" ? "€" : currencyCode === "USD" ? "$" : "£";
  const storePhone = getStorePhone(loc);

  const isBankTransfer = (order.payment_method || "").toLowerCase().includes("bank");
  const isPaid = (order.payment_status || "").toLowerCase() === "paid";
  const bankI18n = getBankI18n(loc);
  const isUk = loc === "en" || (order.shipping_address?.country || "").toLowerCase().includes("kingdom");

  const itemsList = (order.items || [])
    .map((item) => {
      const opts = item.options || {};
      const optionsText =
        (opts && typeof opts === "object"
          ? [opts.size, opts.orientation, opts.type, opts.color].filter(Boolean).join(" • ")
          : "") || item.variant || "";

      const hasSofa = Boolean(opts.sofaIncluded);
      const sofaPriceText = opts.sofaPrice ? ` (+${currencySymbol}${Number(opts.sofaPrice).toFixed(2)})` : "";
      const sofaLabels = {
        en: "Front Sofa Module",
        us: "Front Sofa Module",
        de: "Front-Sofa Modul",
        fr: "Module Canapé Devant de Lit",
        it: "Modulo Divano Frontale",
        es: "Módulo Sofá Frontal",
        por: "Módulo Sofá Frontal",
      };
      const sofaLabel = sofaLabels[loc] || sofaLabels.en;

      return `
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #111;">
          <strong style="font-size: 14px;">${item.name || item.title || "Wall Bed Item"}</strong>
          ${optionsText ? `<br><span style="color:#666; font-size:12px; display:inline-block; margin-top:3px;">${optionsText}</span>` : ""}
          ${hasSofa ? `<br><span style="display:inline-block; margin-top:5px; background:#faf5ea; color:#9f7d3d; border:1px solid #e9d8a6; font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px; letter-spacing:0.3px;">🛋️ + ${sofaLabel}${sofaPriceText}</span>` : ""}
        </td>
        <td style="padding: 14px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #111; text-align: center;">
          ${item.quantity || 1}
        </td>
        <td style="padding: 14px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #111; text-align: right; font-weight: 500;">
          ${currencySymbol}${Number(item.price || 0).toFixed(2)}
        </td>
      </tr>
    `;
    })
    .join("");

  let introText = t.intro.replace("{id}", order.id);
  if (isBankTransfer && !isPaid) {
    introText = bankI18n.instructionIntro;
  } else if (isBankTransfer && isPaid) {
    const paidIntros = {
      en: `We have received your bank transfer payment of ${currencySymbol}${Number(order.total_amount || 0).toFixed(2)} for order ${order.id}. Thank you! Your order is now confirmed and our team is preparing your precision wall bed.`,
      us: `We have received your bank transfer payment of ${currencySymbol}${Number(order.total_amount || 0).toFixed(2)} for order ${order.id}. Thank you! Your order is now confirmed and our team is preparing your precision wall bed.`,
      de: `Wir haben Ihre Überweisung in Höhe von ${currencySymbol}${Number(order.total_amount || 0).toFixed(2)} für die Bestellung ${order.id} erhalten und verbucht. Vielen Dank! Ihre Bestellung ist bestätigt und wird nun für die Fertigung vorbereitet.`,
      fr: `Nous avons bien reçu et validé votre virement bancaire de ${currencySymbol}${Number(order.total_amount || 0).toFixed(2)} pour la commande ${order.id}. Merci ! Votre commande est confirmée et entre en production.`,
      it: `Abbiamo ricevuto e verificato il pagamento tramite bonifico di ${currencySymbol}${Number(order.total_amount || 0).toFixed(2)} per l'ordine ${order.id}. Grazie! Il suo ordine è confermato ed entra in produzione.`,
      es: `Hemos recibido y confirmado tu transferencia bancaria de ${currencySymbol}${Number(order.total_amount || 0).toFixed(2)} para el pedido ${order.id}. ¡Gracias! Tu pedido está confirmado y entra en producción.`,
      por: `Recebemos e confirmámos a sua transferência bancária de ${currencySymbol}${Number(order.total_amount || 0).toFixed(2)} para a encomenda ${order.id}. Obrigado! A sua encomenda está confirmada e entra em produção.`,
    };
    introText = paidIntros[loc] || paidIntros.en;
  }

  const updateBannerHtml = isUpdate ? `
    <div style="margin-bottom: 22px; padding: 14px 18px; background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #b45309; margin-bottom: 4px;">
        ⚠️ ${upd.title}
      </div>
      <div style="font-size: 13px; color: #78350f; line-height: 1.5;">
        ${upd.message}
      </div>
    </div>
  ` : "";

  const badgeHtml = isBankTransfer && !isPaid
    ? `<span class="badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a;">⏳ ${bankI18n.statusBadge}</span>`
    : `<span class="badge" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0;">✓ ${t.badge}</span>`;

  const bankDetailsBoxHtml = isBankTransfer && !isPaid ? `
    <div style="background: #faf8f5; border: 1px solid #d4b26f; border-left: 5px solid #b4832c; padding: 20px 22px; border-radius: 6px; margin: 24px 0;">
      <h3 style="margin: 0 0 14px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #111;">
        🏦 ${bankI18n.methodLabel} — Banking Coordinates
      </h3>
      <table style="width: 100%; font-size: 13px; line-height: 1.6; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px 0; color: #666; width: 45%;"><strong>${bankI18n.accountHolderLabel}:</strong></td>
          <td style="padding: 5px 0; text-align: right; color: #111; font-weight: 600;">${BANK_DETAILS.accountName}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #666;"><strong>${bankI18n.bankNameLabel}:</strong></td>
          <td style="padding: 5px 0; text-align: right; color: #111; font-weight: 600;">${BANK_DETAILS.bankName}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #666;"><strong>${bankI18n.ibanLabel}:</strong></td>
          <td style="padding: 5px 0; text-align: right; font-family: monospace; font-size: 14px; font-weight: 700; color: #111;">${BANK_DETAILS.ibanFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #666;"><strong>${bankI18n.bicLabel}:</strong></td>
          <td style="padding: 5px 0; text-align: right; font-family: monospace; font-size: 13px; font-weight: 700; color: #111;">${BANK_DETAILS.bic}</td>
        </tr>
        ${isUk ? `
        <tr>
          <td style="padding: 5px 0; color: #666;"><strong>${bankI18n.sortCodeLabel}:</strong></td>
          <td style="padding: 5px 0; text-align: right; font-family: monospace; font-size: 14px; font-weight: 700; color: #111;">${BANK_DETAILS.sortCode}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #666;"><strong>${bankI18n.accountNumberLabel}:</strong></td>
          <td style="padding: 5px 0; text-align: right; font-family: monospace; font-size: 14px; font-weight: 700; color: #111;">${BANK_DETAILS.accountNumber}</td>
        </tr>
        ` : ""}
        <tr style="border-top: 1px dashed #d4b26f;">
          <td style="padding: 10px 0 4px; color: #666;"><strong>${bankI18n.amountToTransferLabel}:</strong></td>
          <td style="padding: 10px 0 4px; text-align: right; font-size: 18px; font-weight: 800; color: #047857;">${currencySymbol}${Number(order.total_amount || 0).toFixed(2)}</td>
        </tr>
      </table>

      <div style="margin-top: 16px; padding: 14px; background: #ffffff; border: 1px solid #ecd8ab; border-radius: 4px;">
        <div style="font-size: 11px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">
          ⚠️ ${bankI18n.referenceFieldName} (CRITICAL)
        </div>
        <div style="font-size: 15px; font-family: monospace; font-weight: 700; color: #111; margin-bottom: 6px;">
          ${order.id}
        </div>
        <p style="margin: 0; font-size: 12px; color: #78350f; line-height: 1.5;">
          ${bankI18n.referenceNotice.replace("{orderId}", order.id).replace("{email}", order.customer_email || "")}
        </p>
      </div>
    </div>
  ` : "";

  const totalLabel = isBankTransfer && !isPaid ? bankI18n.amountToTransferLabel : t.totalPaid;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${isBankTransfer && !isPaid ? bankI18n.thankYouTitle : t.title} - ${order.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f5f3; margin: 0; padding: 24px; color: #222; }
          .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e7e5e1; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
          .header { background: #111111; color: #ffffff; padding: 32px 28px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #ffffff; }
          .header p { margin: 8px 0 0; font-size: 12px; color: #d4b26f; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
          .content { padding: 32px 28px; }
          .badge { display: inline-block; padding: 5px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 4px; margin-bottom: 16px; }
          .order-box { background: #faf9f7; border: 1px solid #eeeae3; padding: 18px 20px; border-radius: 6px; margin: 22px 0; }
          .table { width: 100%; border-collapse: collapse; margin-top: 18px; }
          .footer { background: #faf8f5; border-top: 1px solid #eeebe6; padding: 24px 28px; text-align: center; font-size: 12px; color: #777777; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Wall Bed King</h1>
            <p>${isBankTransfer && !isPaid ? bankI18n.thankYouTitle : t.title}</p>
          </div>
          <div class="content">
            ${updateBannerHtml}
            ${badgeHtml}
            <h2 style="font-size: 20px; color: #111; margin-top: 0; font-weight: 600;">${isBankTransfer && !isPaid ? bankI18n.thankYouSubtitle : t.thankYou}, ${order.customer_name || "Customer"}!</h2>
            <p style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 20px;">
              ${introText}
            </p>
            
            ${bankDetailsBoxHtml}

            <div class="order-box">
              <table style="width:100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #666;"><strong>${t.orderNumber}</strong></td>
                  <td style="padding: 4px 0; text-align: right; color: #111; font-weight: 600;">${order.id}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #666;"><strong>${t.date}</strong></td>
                  <td style="padding: 4px 0; text-align: right; color: #111;">${new Date().toLocaleDateString(loc === "us" ? "en-US" : loc === "de" ? "de-DE" : "en-GB")}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #666;"><strong>${t.deliveryTo}</strong></td>
                  <td style="padding: 4px 0; text-align: right; color: #111;">${formatOrderShippingAddress(order) || (order.shipping_address?.city ? `${order.shipping_address.city}, ${order.shipping_address.country || "UK"}` : "Standard Delivery")}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #666;"><strong>${t.paymentMethod}</strong></td>
                  <td style="padding: 4px 0; text-align: right; color: #111;">${isBankTransfer ? bankI18n.methodLabel : (order.payment_method || "Online Card")}</td>
                </tr>
              </table>
            </div>

            <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #111; margin-top: 28px; margin-bottom: 8px;">${t.orderSummary}</h3>
            <table class="table">
              <thead>
                <tr style="border-bottom: 2px solid #111; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #666;">
                  <th style="padding-bottom: 10px;">${t.colItem}</th>
                  <th style="padding-bottom: 10px; text-align: center;">${t.colQty}</th>
                  <th style="padding-bottom: 10px; text-align: right;">${t.colPrice}</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList || '<tr><td colspan="3" style="padding:14px 0;">Wall Bed System & Accessories</td></tr>'}
              </tbody>
            </table>

            <div style="text-align: right; margin-top: 20px; font-size: 14px; border-top: 2px solid #111; padding-top: 16px;">
              <span style="color: #666; margin-right: 12px;">${totalLabel}</span>
              <strong style="font-size: 20px; color: #111;">${currencySymbol}${Number(order.total_amount || 0).toFixed(2)}</strong>
            </div>

            <div style="margin-top: 32px; padding: 16px; background: #fafafa; border-radius: 6px; border-left: 3px solid #d4b26f;">
              <p style="margin: 0; font-size: 12px; color: #444; line-height: 1.5;">
                <strong>${isBankTransfer && !isPaid ? bankI18n.whatHappensNext : t.whatNextTitle}</strong> ${isBankTransfer && !isPaid ? bankI18n.whatHappensNextText : t.whatNextDesc}
              </p>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px; font-weight: 500; color: #333;">${t.footerGuarantee}</p>
            <p style="margin: 0;">${t.footerHelp} <a href="mailto:support@wallbedking.com" style="color: #9f7d3d; text-decoration: none; font-weight: 600;">support@wallbedking.com</a> or call <strong>${storePhone}</strong> (${STORE_HOURS}).</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getAdminOrderAlertHtml(order = SAMPLE_ORDER) {
  const currencyCode = (order.currency || "GBP").toUpperCase();
  const currencySymbol = currencyCode === "EUR" ? "€" : currencyCode === "USD" ? "$" : "£";
  const isBank = (order.payment_method || "").toLowerCase().includes("bank");
  const isPaid = (order.payment_status || "").toLowerCase() === "paid";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wallbedking.co.uk";
  const adminOrderUrl = `${siteUrl}/admin/orders?search=${encodeURIComponent(order.id)}`;
  const paymentMethodLabel = formatPaymentMethod(order);

  let itemsList = [];
  if (Array.isArray(order.items)) {
    itemsList = order.items;
  } else if (typeof order.items === "string") {
    try {
      itemsList = JSON.parse(order.items);
    } catch {
      itemsList = [];
    }
  }

  const itemsRowsHtml = itemsList.length > 0 ? itemsList.map((item) => {
    const title = item.title || item.name || item.product_name || "Wall Bed King Product";
    const opts = item.options && typeof item.options === "object" ? item.options : {};
    const variantParts = [opts.size, opts.orientation, opts.type, opts.color].filter(Boolean);
    const variantText = variantParts.length > 0 ? variantParts.join(" • ") : (item.variant || "");
    const hasSofa = Boolean(opts.sofaIncluded);
    const sofaPriceText = opts.sofaPrice ? ` (+${currencySymbol}${Number(opts.sofaPrice).toFixed(2)})` : "";
    const sku = item.sku || item.rawId || item.productId || item.id || "";
    const qty = parseInt(item.quantity, 10) || 1;
    const unitPrice = Number(item.price || item.unitPrice || 0);
    const lineTotal = Number(item.itemTotal || (unitPrice * qty));

    return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 14px; vertical-align: top;">
          <strong style="color: #111; font-size: 14px; display: block;">${title}</strong>
          ${variantText ? `<div style="color: #666; font-size: 12px; margin-top: 3px;"><strong>Option:</strong> ${variantText}</div>` : ""}
          ${hasSofa ? `<div style="margin-top: 5px;"><span style="display:inline-block; background:#faf5ea; color:#9f7d3d; border:1px solid #e9d8a6; font-size:11px; font-weight:700; padding:3px 8px; border-radius:4px; letter-spacing:0.3px;">🛋️ + Front Sofa Included${sofaPriceText}</span></div>` : ""}
          ${sku ? `<div style="color: #888; font-size: 11px; font-family: monospace; margin-top: 2px;">SKU: ${sku}</div>` : ""}
        </td>
        <td style="padding: 12px 14px; text-align: center; vertical-align: top; font-weight: 600; color: #111;">
          ${qty}
        </td>
        <td style="padding: 12px 14px; text-align: right; vertical-align: top; color: #555;">
          ${currencySymbol}${unitPrice.toFixed(2)}
        </td>
        <td style="padding: 12px 14px; text-align: right; vertical-align: top; font-weight: 700; color: #111;">
          ${currencySymbol}${lineTotal.toFixed(2)}
        </td>
      </tr>
    `;
  }).join("") : `
    <tr>
      <td colspan="4" style="padding: 16px 14px; text-align: center; color: #777; font-style: italic;">
        No items itemized in payload.
      </td>
    </tr>
  `;

  const subtotalAmount = Number(order.subtotal || order.total_amount || 0);
  const shippingAmount = Number(order.shipping_amount || 0);
  const discountAmount = Number(order.discount_amount || 0);
  const deliveryLabel = order.delivery_label || order.delivery_option || "Delivery";
  const formattedAddress = formatOrderShippingAddress(order);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Alert: ${order.id}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 24px;">
        <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.05);">
          
          <!-- Header Banner -->
          <div style="background: ${isBank && !isPaid ? "#b4832c" : "#111111"}; color: #ffffff; padding: 20px 24px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #d4b26f; margin-bottom: 4px;">
              Wall Bed King • Internal Support Alert
            </div>
            <h2 style="margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">
              ${isBank && !isPaid ? "🏦 Bank Transfer Request" : "🚨 New Order Received"}: ${order.id}
            </h2>
          </div>

          <div style="padding: 24px; color: #222; font-size: 14px; line-height: 1.6;">
            
            ${isBank && !isPaid ? `
              <div style="padding: 14px 16px; background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; margin-bottom: 20px; border-radius: 4px;">
                <strong style="color: #92400e; font-size: 13px; text-transform: uppercase; display: block; margin-bottom: 4px;">
                  Awaiting Bank Transfer Payment
                </strong>
                <p style="margin: 0; font-size: 13px; color: #78350f;">
                  The customer chose <strong>Bank Transfer</strong>. The banking coordinates were emailed to them. Once the funds arrive with reference <strong>${order.id}</strong> or <strong>${order.customer_email}</strong>, mark the order as Paid in the dashboard.
                </p>
                <div style="margin-top: 12px;">
                  <a href="${adminOrderUrl}" style="display: inline-block; background: #111111; color: #ffffff; padding: 10px 18px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 4px;">
                    Open Order in Admin & Mark as Paid →
                  </a>
                </div>
              </div>
            ` : ""}

            <!-- Quick Summary Bar -->
            <table style="width: 100%; border-collapse: collapse; background: #faf9f7; border: 1px solid #eee; border-radius: 6px; margin-bottom: 22px;">
              <tr>
                <td style="padding: 12px 16px; vertical-align: top;">
                  <span style="font-size: 11px; text-transform: uppercase; color: #777; display: block; margin-bottom: 2px;">Total Paid</span>
                  <strong style="font-size: 18px; color: #111;">${currencySymbol}${Number(order.total_amount || 0).toFixed(2)}</strong>
                </td>
                <td style="padding: 12px 16px; vertical-align: top;">
                  <span style="font-size: 11px; text-transform: uppercase; color: #777; display: block; margin-bottom: 4px;">Payment Status</span>
                  <span style="display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; background: ${isPaid ? "#ecfdf5" : "#fef3c7"}; color: ${isPaid ? "#065f46" : "#92400e"}; border: 1px solid ${isPaid ? "#a7f3d0" : "#fde68a"};">
                    ${isPaid ? "✓ PAID" : "⏳ UNPAID"}
                  </span>
                </td>
                <td style="padding: 12px 16px; vertical-align: top;">
                  <span style="font-size: 11px; text-transform: uppercase; color: #777; display: block; margin-bottom: 2px;">Payment Method</span>
                  <strong style="font-size: 13px; color: #111;">${paymentMethodLabel}</strong>
                </td>
              </tr>
            </table>

            <!-- 1. Ordered Products Table -->
            <div style="margin-bottom: 24px;">
              <h3 style="margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #111; border-bottom: 2px solid #111; padding-bottom: 6px;">
                📦 Ordered Products (${itemsList.length} ${itemsList.length === 1 ? "item" : "items"})
              </h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #eee;">
                <thead>
                  <tr style="background: #f7f7f7; color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ddd;">
                    <th style="padding: 10px 14px; text-align: left;">Product Details</th>
                    <th style="padding: 10px 14px; text-align: center;">Qty</th>
                    <th style="padding: 10px 14px; text-align: right;">Unit Price</th>
                    <th style="padding: 10px 14px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRowsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 8px 14px; text-align: right; color: #666; border-top: 1px solid #eee;">Subtotal:</td>
                    <td style="padding: 8px 14px; text-align: right; font-weight: 600; border-top: 1px solid #eee;">${currencySymbol}${subtotalAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="padding: 4px 14px; text-align: right; color: #666;">Delivery (${deliveryLabel}):</td>
                    <td style="padding: 4px 14px; text-align: right; font-weight: 600; color: ${shippingAmount > 0 ? "#111" : "#047857"};">
                      ${shippingAmount > 0 ? `${currencySymbol}${shippingAmount.toFixed(2)}` : "FREE"}
                    </td>
                  </tr>
                  ${discountAmount > 0 ? `
                  <tr>
                    <td colspan="3" style="padding: 4px 14px; text-align: right; color: #b45309;">Discount (${order.promo_code || "Promo"}):</td>
                    <td style="padding: 4px 14px; text-align: right; font-weight: 600; color: #b45309;">-${currencySymbol}${discountAmount.toFixed(2)}</td>
                  </tr>
                  ` : ""}
                  <tr style="background: #faf9f7; border-top: 2px solid #111; font-size: 15px;">
                    <td colspan="3" style="padding: 12px 14px; text-align: right; font-weight: 700; color: #111;">Total:</td>
                    <td style="padding: 12px 14px; text-align: right; font-weight: 800; color: #111;">${currencySymbol}${Number(order.total_amount || 0).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- 2. Customer & Shipping Details -->
            <div style="margin-bottom: 24px;">
              <h3 style="margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #111; border-bottom: 2px solid #111; padding-bottom: 6px;">
                👤 Customer & Shipping Information
              </h3>
              <table style="width: 100%; border-collapse: collapse; background: #fbfbfb; border: 1px solid #eee; border-radius: 4px; font-size: 13px;">
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #666; width: 35%;"><strong>Customer Name:</strong></td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #eee; font-weight: 600;">${order.customer_name || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #666;"><strong>Email:</strong></td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #eee;">
                    <a href="mailto:${order.customer_email}" style="color: #9f7d3d; text-decoration: none; font-weight: 600;">${order.customer_email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #666;"><strong>Telephone:</strong></td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #eee;">
                    ${order.customer_phone ? `<a href="tel:${order.customer_phone}" style="color: #111; text-decoration: none; font-weight: 600;">${order.customer_phone}</a>` : '<span style="color: #888;">Not provided</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #666;"><strong>Delivery Address:</strong></td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #eee; font-weight: 500;">
                    ${formattedAddress || (order.shipping_address?.city ? `${order.shipping_address.city}, ${order.shipping_address.country || "UK"}` : "Address provided via checkout")}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #666;"><strong>Delivery Speed:</strong></td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${deliveryLabel}</td>
                </tr>
                ${order.customer_notes ? `
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #666;"><strong>Customer Notes:</strong></td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #b45309; font-style: italic;">${order.customer_notes}</td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding: 10px 14px; color: #666;"><strong>Storefront / Market:</strong></td>
                  <td style="padding: 10px 14px; color: #777; font-size: 12px;">${order.admin_notes || `Locale: ${order.locale || "en"}`}</td>
                </tr>
              </table>
            </div>

            <!-- Action Buttons -->
            <div style="margin-top: 24px; text-align: center;">
              <a href="${adminOrderUrl}" style="display: inline-block; background: #111111; color: #ffffff; padding: 12px 26px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 4px; margin-right: 8px;">
                Open Order in Admin Dashboard →
              </a>
              ${order.customer_email ? `
              <a href="mailto:${order.customer_email}?subject=Regarding%20your%20Wall%20Bed%20King%20Order%20${order.id}" style="display: inline-block; background: #f3f3f3; color: #333; border: 1px solid #ddd; padding: 11px 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 4px;">
                Reply to Customer
              </a>
              ` : ""}
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #faf8f5; border-top: 1px solid #eeebe6; padding: 16px 24px; text-align: center; font-size: 11px; color: #888;">
            Wall Bed King Central Support Alert • Sent to <strong>support@wallbedking.com</strong>
          </div>

        </div>
      </body>
    </html>
  `;
}

export function getCarrierTrackingUrl(carrier, trackingNumber) {
  if (!trackingNumber) return null;
  const c = (carrier || "").toLowerCase().trim();
  const tn = encodeURIComponent(String(trackingNumber).trim());

  if (c.includes("ups")) {
    return `https://www.ups.com/track?track=yes&trackNums=${tn}`;
  }
  if (c.includes("dhl")) {
    return `https://www.dhl.com/en/express/tracking.html?AWB=${tn}&brand=DHL`;
  }
  return null;
}

export function isOwnDelivery(carrier) {
  const c = (carrier || "").toLowerCase().trim();
  return (
    c.includes("own") ||
    c.includes("saját") ||
    c.includes("dedicated") ||
    c.includes("fleet") ||
    c.includes("direct") ||
    c.includes("internal")
  );
}

export function getCarrierDisplayName(carrier) {
  const c = (carrier || "").toLowerCase().trim();
  if (c.includes("ups")) return "UPS";
  if (c.includes("dhl")) return "DHL Express";
  if (isOwnDelivery(carrier)) return "Wall Bed King Dedicated Delivery (Internal Fleet)";
  return carrier || "Specialist Delivery Service";
}

export function getShippingNotificationHtml(order = SAMPLE_ORDER, trackingNumber = "1Z9999999999999999", carrier = "UPS", isUpdate = false) {
  const ownFleet = isOwnDelivery(carrier);
  const carrierName = getCarrierDisplayName(carrier);
  const trackingUrl = !ownFleet ? getCarrierTrackingUrl(carrier, trackingNumber) : null;
  const loc = resolveOrderLocale(order);
  const upd = UPDATE_NOTICE_I18N[loc] || UPDATE_NOTICE_I18N.en;

  const updateBannerHtml = isUpdate ? `
    <div style="margin-bottom: 22px; padding: 14px 18px; background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #b45309; margin-bottom: 4px;">
        ⚠️ ${upd.title}
      </div>
      <div style="font-size: 13px; color: #78350f; line-height: 1.5;">
        ${upd.message}
      </div>
    </div>
  ` : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${isUpdate ? `${upd.subjectPrefix}` : ""}Order Dispatched - ${order.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f5f3; margin: 0; padding: 24px; color: #222; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e7e5e1; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
          .header { background: #111111; color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
          .header p { margin: 6px 0 0; font-size: 12px; color: #d4b26f; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 32px 28px; }
          .tracking-card { background: #faf9f7; border: 1px solid #eeeae3; border-radius: 6px; padding: 22px 20px; margin: 24px 0; text-align: center; }
          .footer { background: #faf8f5; border-top: 1px solid #eeebe6; padding: 20px; text-align: center; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Wall Bed King</h1>
            <p>${isUpdate ? `${upd.badge}` : "Dispatch Notification"}</p>
          </div>
          <div class="content">
            ${updateBannerHtml}
            <h2 style="color: #111; font-size: 20px; margin-top: 0; font-weight: 600;">Your Order is On Its Way! 🚚</h2>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              Great news, <strong>${order.customer_name || "Customer"}</strong>! Your wall bed order <strong style="color: #111;">${order.id}</strong> has been carefully packed and handed over for delivery.
            </p>

            ${ownFleet ? `
              <!-- Own Dedicated Delivery Box (No Tracking Link) -->
              <div class="tracking-card">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 6px;">
                  Delivery Partner
                </div>
                <div style="font-size: 17px; font-weight: 700; color: #111; margin-bottom: 12px;">
                  Wall Bed King Dedicated Delivery (Internal Fleet)
                </div>
                <div style="max-width: 460px; margin: 0 auto; background: #ffffff; padding: 14px 18px; border: 1px solid #e7e5e1; border-radius: 4px; text-align: left;">
                  <p style="margin: 0; font-size: 13px; color: #444; line-height: 1.6;">
                    Your order is being transported directly by our own dedicated delivery fleet.
                    Our logistics coordinator will contact you by <strong>telephone or SMS</strong> to confirm your scheduled delivery date and your dedicated 2-hour arrival slot.
                  </p>
                </div>
              </div>
            ` : `
              <!-- External Courier Box (UPS / DHL with direct tracking link) -->
              <div class="tracking-card">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 6px;">
                  Assigned Courier Service
                </div>
                <div style="font-size: 17px; font-weight: 700; color: #111; margin-bottom: 14px;">
                  ${carrierName}
                </div>

                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 6px;">
                  Tracking / Waybill Number
                </div>
                <div style="margin-bottom: 16px;">
                  ${trackingUrl ? `
                    <a href="${trackingUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 19px; font-weight: 700; color: #111; letter-spacing: 1.5px; background: #ffffff; padding: 10px 18px; border: 1px dashed #cca864; display: inline-block; border-radius: 4px; text-decoration: none; font-family: monospace;">
                      ${trackingNumber}
                    </a>
                  ` : `
                    <div style="font-size: 19px; font-weight: 700; color: #111; letter-spacing: 1.5px; background: #ffffff; padding: 10px 18px; border: 1px dashed #cca864; display: inline-block; border-radius: 4px; font-family: monospace;">
                      ${trackingNumber}
                    </div>
                  `}
                </div>

                ${trackingUrl ? `
                  <div style="margin-top: 14px;">
                    <a href="${trackingUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #111111; color: #ffffff !important; text-decoration: none; padding: 13px 28px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.12);">
                      Track Your Parcel on ${carrier.toLowerCase().includes("dhl") ? "DHL" : "UPS"} →
                    </a>
                  </div>
                ` : ""}
              </div>
            `}

            <h4 style="font-size: 14px; color: #111; margin-top: 24px; margin-bottom: 8px;">Delivery Details & Instructions:</h4>
            <ul style="color: #555; font-size: 13px; line-height: 1.7; padding-left: 20px; margin-top: 0;">
              ${ownFleet ? `
                <li>Our two-man delivery team will carefully handle your furniture and carry boxes to your room of choice.</li>
                <li>You will receive a confirmation call 30-60 minutes before our van arrives at your address.</li>
                <li>Digital installation manuals, diagrams, and video assembly guides are available on our website at any time.</li>
              ` : `
                <li>The courier provides automated live status updates via the tracking link above.</li>
                <li>Please ensure somebody is available at the delivery premises to inspect and sign for packages.</li>
                <li>Digital installation manuals, diagrams, and video assembly guides are available on our website at any time.</li>
              `}
            </ul>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px;">Wall Bed King Support • Phone: <strong>${STORE_PHONE}</strong> • Email: <a href="mailto:support@wallbedking.com" style="color: #9f7d3d;">support@wallbedking.com</a></p>
            <p style="margin: 0;">Lifetime Mechanism Guarantee Included.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getContactFormHtml({ name, email, phone, subject, message } = SAMPLE_CONTACT) {
  const safeSubject = subject || "Customer Inquiry";
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Contact Form: ${safeSubject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 24px;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 6px; border: 1px solid #e0e0e0; overflow: hidden;">
          <div style="background: #111; color: #fff; padding: 18px 24px;">
            <h3 style="margin: 0; font-size: 16px; letter-spacing: 1px; text-transform: uppercase;">📩 New Inquiry via Contact Page</h3>
          </div>
          <div style="padding: 24px; font-size: 14px; color: #222; line-height: 1.6;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
              <tr><td style="padding: 6px 0; color: #777; width: 100px;"><strong>Name:</strong></td><td style="padding: 6px 0; color: #111; font-weight: 500;">${name}</td></tr>
              <tr><td style="padding: 6px 0; color: #777;"><strong>Email:</strong></td><td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #b89c66; font-weight: 600;">${email}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #777;"><strong>Phone:</strong></td><td style="padding: 6px 0; color: #111;">${phone || "Not provided"}</td></tr>
              <tr><td style="padding: 6px 0; color: #777;"><strong>Topic:</strong></td><td style="padding: 6px 0; color: #111; font-weight: 600;">${safeSubject}</td></tr>
            </table>
            <div style="border-top: 1px solid #eee; padding-top: 14px;">
              <strong style="display: block; margin-bottom: 8px; color: #444; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message Content:</strong>
              <div style="white-space: pre-wrap; background: #fafafa; border: 1px solid #eaeaea; border-radius: 4px; padding: 14px; font-size: 13px; color: #333; line-height: 1.5;">${message}</div>
            </div>

            <!-- Direct One-Click Reply Button for Support Team -->
            <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #eee; text-align: center;">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(safeSubject)}" style="display: inline-block; background: #111111; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-radius: 4px;">
                ✉️ Reply to Customer (${email})
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Multi-language strings for Review Request Email
 */
export const REVIEW_REQUEST_I18N = {
  en: {
    title: "How is your Wall Bed King Murphy bed?",
    badge: "Customer Experience",
    headline: "How are you enjoying your new Murphy bed?",
    greeting: (name) => `Hi <strong>${name || "there"}</strong>, we hope your new space-saving furniture arrived safely and has transformed your home!`,
    productLabel: "Product Purchased",
    btnLeaveReview: "Leave a Review & Share Photos",
    photoTip: "📸 <strong>Have you taken a photo of your setup?</strong> You can now attach photos to your review to show future homeowners how you designed your space!",
    footerHelp: "Wall Bed King Support",
    guarantee: "Lifetime Mechanism Guarantee Included on all wall beds.",
  },
  us: {
    title: "How is your Wall Bed King Murphy bed?",
    badge: "Customer Experience",
    headline: "How are you enjoying your new Murphy bed?",
    greeting: (name) => `Hi <strong>${name || "there"}</strong>, we hope your new space-saving furniture arrived safely and has transformed your home!`,
    productLabel: "Product Purchased",
    btnLeaveReview: "Leave a Review & Share Photos",
    photoTip: "📸 <strong>Have you taken a photo of your setup?</strong> You can now attach photos to your review to show future homeowners how you designed your space!",
    footerHelp: "Wall Bed King Support",
    guarantee: "Lifetime Mechanism Guarantee Included on all wall beds.",
  },
  de: {
    title: "Wie gefällt Ihnen Ihr Wall Bed King Schrankbett?",
    badge: "Kundenerfahrung",
    headline: "Wie gefällt Ihnen Ihr neues Schrankbett?",
    greeting: (name) => `Hallo <strong>${name || "Kunde"}</strong>, wir hoffen, dass Ihr neues platzsparendes Möbelstück sicher angekommen ist und Ihr Zuhause bereichert!`,
    productLabel: "Gekauftes Produkt",
    btnLeaveReview: "Bewertung abgeben & Fotos teilen",
    photoTip: "📸 <strong>Haben Sie ein Foto Ihres Zimmers gemacht?</strong> Sie können Ihrer Bewertung Fotos hinzufügen und zukünftigen Kunden zeigen, wie Sie Ihren Raum gestaltet haben!",
    footerHelp: "Wall Bed King Kundenservice",
    guarantee: "Lebenslange Mechanik-Garantie auf alle Schrankbetten inbegriffen.",
  },
  fr: {
    title: "Que pensez-vous de votre lit escamotable Wall Bed King ?",
    badge: "Expérience Client",
    headline: "Que pensez-vous de votre nouveau lit escamotable ?",
    greeting: (name) => `Bonjour <strong>${name || "client"}</strong>, nous espérons que votre meuble gain de place est bien arrivé et transforme votre intérieur !`,
    productLabel: "Produit Acheté",
    btnLeaveReview: "Laisser un avis & Partager des photos",
    photoTip: "📸 <strong>Avez-vous pris une photo de votre aménagement ?</strong> Vous pouvez désormais joindre des photos à votre avis pour inspirer d'autres clients !",
    footerHelp: "Service client Wall Bed King",
    guarantee: "Garantie à vie sur le mécanisme incluse sur tous les lits escamotables.",
  },
  es: {
    title: "¿Qué tal tu cama abatible Wall Bed King?",
    badge: "Experiencia del Cliente",
    headline: "¿Qué tal estás disfrutando de tu nueva cama abatible?",
    greeting: (name) => `Hola <strong>${name || "cliente"}</strong>, ¡esperamos que tu nuevo mueble abatible haya llegado perfecto y transforme tu hogar!`,
    productLabel: "Producto Comprado",
    btnLeaveReview: "Dejar una reseña y compartir fotos",
    photoTip: "📸 <strong>¿Has hecho fotos de tu habitación?</strong> ¡Ahora puedes adjuntar fotos a tu reseña para mostrar tu diseño a otros clientes!",
    footerHelp: "Atención al Cliente Wall Bed King",
    guarantee: "Garantía de por vida en el mecanismo incluida en todas las camas abatibles.",
  },
  it: {
    title: "Come ti trovi con il tuo letto a scomparsa Wall Bed King?",
    badge: "Esperienza del Cliente",
    headline: "Come ti trovi con il tuo nuovo letto a scomparsa?",
    greeting: (name) => `Gentile <strong>${name || "cliente"}</strong>, speriamo che il tuo nuovo mobile salvaspazio sia arrivato in perfette condizioni e trasformi la tua casa!`,
    productLabel: "Prodotto Acquistato",
    btnLeaveReview: "Lascia una recensione e condividi foto",
    photoTip: "📸 <strong>Hai scattato una foto della tua stanza?</strong> Puoi allegare foto alla tua recensione per mostrare agli altri clienti come hai arredato il tuo spazio!",
    footerHelp: "Assistenza Clienti Wall Bed King",
    guarantee: "Garanzia a vita sul meccanismo inclusa su tutti i letti a scomparsa.",
  },
  por: {
    title: "Como está a correr com a sua cama rebatível Wall Bed King?",
    badge: "Experiência do Cliente",
    headline: "Como está a desfrutar da sua nova cama rebatível?",
    greeting: (name) => `Olá <strong>${name || "cliente"}</strong>, esperamos que o seu novo móvel tenha chegado com segurança e esteja a transformar a sua casa!`,
    productLabel: "Produto Adquirido",
    btnLeaveReview: "Deixar uma avaliação e partilhar fotos",
    photoTip: "📸 <strong>Tirou uma fotografia do seu quarto?</strong> Pode anexar fotos à sua avaliação para mostrar aos próximos clientes como organizou o seu espaço!",
    footerHelp: "Apoio ao Cliente Wall Bed King",
    guarantee: "Garantia vitalícia do mecanismo incluída em todas as camas rebatíveis.",
  },
};

/**
 * Post-purchase Review Request Email Template
 */
export function getReviewRequestHtml(order = SAMPLE_ORDER, product = null, siteUrl = null) {
  const targetProduct = product || order.items?.[0] || {
    name: "Classic Vertical Wall Bed",
    slug: "classic-vertical-wall-bed",
    category: "beds",
  };

  const rawCat = (targetProduct.parent_category || targetProduct.category || "beds").toLowerCase();
  const category = rawCat === "vertical" || rawCat === "horizontal" || rawCat.includes("bed") ? "beds" : rawCat;
  const slug = targetProduct.slug || "classic-vertical-wall-bed";
  const loc = order.locale || "en";
  const t = REVIEW_REQUEST_I18N[loc] || REVIEW_REQUEST_I18N.en;

  const baseUrl = siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://wallbedking.co.uk";
  const localePrefix = loc && loc !== "en" ? `/${loc}` : "";
  const customerName = encodeURIComponent(order.customer_name || "");
  const customerEmail = encodeURIComponent(order.customer_email || "");

  const productBaseUrl = `${baseUrl}${localePrefix}/products/${category}/${slug}?review=true&order=${order.id || ""}&name=${customerName}&email=${customerEmail}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${t.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f5f3; margin: 0; padding: 24px; color: #222; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e7e5e1; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
          .header { background: #111111; color: #ffffff; padding: 32px 28px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
          .header p { margin: 6px 0 0; font-size: 12px; color: #d4b26f; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 32px 28px; text-align: center; }
          .product-box { background: #faf9f7; border: 1px solid #eeeae3; border-radius: 6px; padding: 20px; margin: 24px 0; text-align: center; }
          .stars-row { margin: 20px 0; font-size: 34px; letter-spacing: 8px; }
          .star-link { text-decoration: none; color: #cca864; display: inline-block; padding: 4px 6px; transition: transform 0.2s; }
          .review-btn { display: inline-block; background: #111; color: #ffffff !important; text-decoration: none; padding: 14px 28px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 4px; margin-top: 12px; }
          .footer { background: #faf8f5; border-top: 1px solid #eeebe6; padding: 20px; text-align: center; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Wall Bed King</h1>
            <p>${t.badge}</p>
          </div>
          <div class="content">
            <h2 style="color: #111; font-size: 20px; margin-top: 0; font-weight: 600;">${t.headline}</h2>
            <p style="color: #555; font-size: 14px; line-height: 1.6; max-width: 480px; margin: 0 auto 16px;">
              ${t.greeting(order.customer_name)}
            </p>

            <div class="product-box">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 4px;">${t.productLabel}</div>
              <strong style="font-size: 16px; color: #111; display: block;">${targetProduct.name}</strong>
              ${targetProduct.variant ? `<span style="font-size: 12px; color: #666; display: block; margin-top: 4px;">${targetProduct.variant}</span>` : ""}

              <div class="stars-row">
                <a href="${productBaseUrl}&rating=1#reviews-section" class="star-link" target="_blank" rel="noopener noreferrer" title="1 Star">★</a>
                <a href="${productBaseUrl}&rating=2#reviews-section" class="star-link" target="_blank" rel="noopener noreferrer" title="2 Stars">★</a>
                <a href="${productBaseUrl}&rating=3#reviews-section" class="star-link" target="_blank" rel="noopener noreferrer" title="3 Stars">★</a>
                <a href="${productBaseUrl}&rating=4#reviews-section" class="star-link" target="_blank" rel="noopener noreferrer" title="4 Stars">★</a>
                <a href="${productBaseUrl}&rating=5#reviews-section" class="star-link" target="_blank" rel="noopener noreferrer" title="5 Stars">★</a>
              </div>

              <a href="${productBaseUrl}&rating=5#reviews-section" class="review-btn" target="_blank" rel="noopener noreferrer">
                ${t.btnLeaveReview}
              </a>
            </div>

            <p style="color: #666; font-size: 13px; line-height: 1.6; max-width: 460px; margin: 20px auto 0;">
              ${t.photoTip}
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px;">${t.footerHelp} • Freephone: <strong>${STORE_PHONE}</strong> • Email: <a href="mailto:support@wallbedking.com" style="color: #9f7d3d;">support@wallbedking.com</a></p>
            <p style="margin: 0;">${t.guarantee}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Admin Notification Email for New Customer Review
 */
export function getAdminNewReviewAlertHtml(review = SAMPLE_REVIEW) {
  const starsString = "★".repeat(review.rating || 5) + "☆".repeat(5 - (review.rating || 5));
  const hasPhotos = Array.isArray(review.photos) && review.photos.length > 0;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Review Awaiting Approval</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 24px;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 6px; border: 1px solid #e0e0e0; overflow: hidden;">
          <div style="background: #cca864; color: #111; padding: 18px 24px;">
            <h2 style="margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">⭐ New Review Awaiting Moderation</h2>
          </div>
          <div style="padding: 24px; color: #222; font-size: 14px; line-height: 1.6;">
            <p style="margin-top: 0;">A customer just submitted a new product review on Wall Bed King:</p>
            
            <div style="background: #faf9f7; border: 1px solid #eeeae3; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <div style="color: #d4b26f; font-size: 20px; font-weight: bold; margin-bottom: 4px;">${starsString} (${review.rating}/5)</div>
              <strong style="font-size: 15px; color: #111; display: block;">${review.title || "Customer Review"}</strong>
              <div style="font-size: 12px; color: #666; margin-top: 2px;">By <strong>${review.author_name}</strong> (${review.author_email || "N/A"})</div>
              <div style="font-size: 12px; color: #888; margin-top: 2px;">Product: <strong>${review.product_name || review.product_slug}</strong></div>
              <p style="margin: 12px 0 0; font-size: 13px; color: #333; line-height: 1.5; font-style: italic;">"${review.content}"</p>

              ${hasPhotos ? `
                <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #eee;">
                  <span style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 600;">Customer Photos Attached (${review.photos.length}):</span>
                  <div style="margin-top: 6px; display: flex; gap: 8px;">
                    ${review.photos.map((p) => `<img src="${p}" alt="Review photo" style="width: 70px; height: 70px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; margin-right: 6px;" />`).join("")}
                  </div>
                </div>
              ` : ""}
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://wallbedking.co.uk/admin/reviews" style="display: inline-block; background: #111111; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-radius: 4px;">
                ✓ Open Admin Reviews to Approve
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// ==========================================
// OUTBOUND SENDER FUNCTIONS
// ==========================================

/**
 * 1. Customer Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(order, locale = null, isUpdate = false) {
  if (!order || !order.customer_email) return { success: false, error: "Missing recipient" };

  const effectiveLocale = resolveOrderLocale(order, locale);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[Email Service: Mock] Order Confirmation (${effectiveLocale}) for ${order.id} to ${order.customer_email} (isUpdate: ${isUpdate})`);
    return {
      success: true,
      mode: "mock",
      message: "Email logged in dev mode (RESEND_API_KEY not configured).",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const htmlContent = getOrderConfirmationHtml(order, effectiveLocale, isUpdate);
    const i18n = CONFIRMATION_I18N[effectiveLocale.toLowerCase()] || CONFIRMATION_I18N.en;
    const upd = UPDATE_NOTICE_I18N[effectiveLocale.toLowerCase()] || UPDATE_NOTICE_I18N.en;
    const isBank = (order.payment_method || "").toLowerCase().includes("bank");
    const isPaid = (order.payment_status || "").toLowerCase() === "paid";
    const bankI18n = getBankI18n(effectiveLocale);
    const subjectPrefix = isUpdate ? upd.subjectPrefix : "";
    let emailSubject = `${subjectPrefix}${i18n.subjectPrefix} - ${order.id}`;
    if (isBank && !isPaid && !isUpdate) {
      emailSubject = `[Wall Bed King] ${bankI18n.thankYouTitle} - ${order.id}`;
    } else if (isBank && isPaid) {
      emailSubject = `✓ [Wall Bed King] ${i18n.badge} - ${order.id}`;
    }

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [order.customer_email],
      replyTo: SUPPORT_EMAIL,
      reply_to: SUPPORT_EMAIL,
      subject: emailSubject,
      html: htmlContent,
    });

    // Also trigger admin notification in parallel on initial order creation
    if (!isUpdate) {
      await sendAdminOrderAlert(order).catch((err) => console.error("Admin order email alert failed:", err));
    }

    return { success: true, data };
  } catch (error) {
    console.error("[Email Service Error]", error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Admin Alert Email for New Incoming Order
 */
export async function sendAdminOrderAlert(order) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "No API Key" };

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const adminCurr = (order.currency || "GBP").toUpperCase();
    const adminSymbol = adminCurr === "EUR" ? "€" : adminCurr === "USD" ? "$" : "£";
    const isBank = (order.payment_method || "").toLowerCase().includes("bank");
    const isPaid = (order.payment_status || "").toLowerCase() === "paid";

    const recipient = "support@wallbedking.com";

    const subject = isBank && !isPaid
      ? `🏦 BANK TRANSFER REQUEST: ${order.id} (${adminSymbol}${Number(order.total_amount || 0).toFixed(2)}) - ${order.customer_name || "Customer"}`
      : `🚨 NEW ORDER RECEIVED: ${order.id} (${adminSymbol}${Number(order.total_amount || 0).toFixed(2)}) - ${order.customer_name || "Customer"}`;

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [recipient],
      replyTo: order.customer_email || SUPPORT_EMAIL,
      reply_to: order.customer_email || SUPPORT_EMAIL,
      subject,
      html: getAdminOrderAlertHtml(order),
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Admin Email Error]", error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Customer Shipping / Tracking Notification Email
 */
export async function sendShippingNotificationEmail(order, trackingNumber, carrier, isUpdate = false) {
  if (!order || !order.customer_email) return { success: false, error: "Missing recipient" };

  const effectiveLocale = resolveOrderLocale(order);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[Email Service: Mock] Dispatch Notification for ${order.id} to ${order.customer_email} (isUpdate: ${isUpdate})`);
    return {
      success: true,
      mode: "mock",
      message: "Shipping notification logged in dev mode (RESEND_API_KEY not configured).",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const i18n = SHIPPING_I18N[effectiveLocale] || SHIPPING_I18N.en;
    const upd = UPDATE_NOTICE_I18N[effectiveLocale] || UPDATE_NOTICE_I18N.en;
    const subjectPrefix = isUpdate ? upd.subjectPrefix : "";

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [order.customer_email],
      replyTo: SUPPORT_EMAIL,
      reply_to: SUPPORT_EMAIL,
      subject: `${subjectPrefix}${i18n.subject(order.id)}`,
      html: getShippingNotificationHtml(order, trackingNumber, carrier, isUpdate),
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Email Service Error]", error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. Contact Form Submission Email
 */
export async function sendContactFormEmail({ name, email, phone, subject, message }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "No API Key" };

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [SUPPORT_EMAIL],
      replyTo: email,
      reply_to: email,
      subject: `📩 Contact Form Submission: ${subject} from ${name}`,
      html: getContactFormHtml({ name, email, phone, subject, message }),
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Contact Email Error]", error);
    return { success: false, error: error.message };
  }
}

/**
 * 5. Post-Purchase Review Request Email
 */
export async function sendReviewRequestEmail(order, product = null) {
  if (!order || !order.customer_email) return { success: false, error: "Missing recipient" };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[Email Service: Mock] Review Request for ${order.id} to ${order.customer_email}`);
    return {
      success: true,
      mode: "mock",
      message: "Review request logged in dev mode.",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [order.customer_email],
      replyTo: SUPPORT_EMAIL,
      reply_to: SUPPORT_EMAIL,
      subject: `How is your Wall Bed King Murphy bed? (Order ${order.id})`,
      html: getReviewRequestHtml(order, product),
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Review Request Email Error]", error);
    return { success: false, error: error.message };
  }
}

/**
 * 6. Admin Notification of New Submitted Review
 */
export async function sendAdminNewReviewAlert(review) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "No API Key" };

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [ADMIN_EMAIL],
      replyTo: review.author_email || SUPPORT_EMAIL,
      reply_to: review.author_email || SUPPORT_EMAIL,
      subject: `⭐ NEW REVIEW SUBMITTED: ${review.author_name} for ${review.product_name || review.product_slug} (${review.rating} Stars)`,
      html: getAdminNewReviewAlertHtml(review),
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Admin Review Alert Error]", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 7. MULTILINGUAL RESTOCK / BACK IN STOCK EMAIL
// ==========================================
export const RESTOCK_I18N = {
  en: {
    subject: (name) => `Good news! ${name} is back in stock at Wall Bed King`,
    badge: "Back in Stock",
    headline: "Your requested item is available again!",
    greeting: (name) => `Hello ${name || "Customer"},`,
    intro: "You previously requested to be notified when this item was restocked. It is now back in inventory and ready to order.",
    btnText: "Order Now While Stock Lasts",
    urgency: "Please note that stock is limited and allocated on a first-come, first-served basis.",
    warrantyBadge: "Lifetime Mechanism Guarantee • Free UK Mainland Delivery",
  },
  us: {
    subject: (name) => `Good news! ${name} is back in stock at Wall Bed King`,
    badge: "Back in Stock",
    headline: "Your requested item is available again!",
    greeting: (name) => `Hello ${name || "Customer"},`,
    intro: "You asked us to let you know when this Murphy bed returns to inventory. It is now available and ready to order.",
    btnText: "Order Now While Supplies Last",
    urgency: "Inventory is limited and orders are processed on a first-come, first-served basis.",
    warrantyBadge: "Lifetime Mechanism Warranty • Free Shipping",
  },
  de: {
    subject: (name) => `Gute Neuigkeiten! ${name} ist wieder bei Wall Bed King verfügbar`,
    badge: "Wieder Verfügbar",
    headline: "Ihr Wunschartikel ist wieder auf Lager!",
    greeting: (name) => `Hallo ${name || "Kunde"},`,
    intro: "Sie haben sich auf die Warteliste für dieses Schrankbett gesetzt. Das Produkt ist nun wieder vorrätig und kann ab sofort bestellt werden.",
    btnText: "Jetzt Bestellen, Solange Vorrat Reicht",
    urgency: "Bitte beachten Sie, dass die Stückzahlen begrenzt sind und nach Bestelleingang zugeteilt werden.",
    warrantyBadge: "Lebenslange Mechanik-Garantie • Kostenlose Lieferung",
  },
  fr: {
    subject: (name) => `Bonne nouvelle ! ${name} est de retour en stock chez Wall Bed King`,
    badge: "De Retour en Stock",
    headline: "Votre article demandé est à nouveau disponible !",
    greeting: (name) => `Bonjour ${name || "Client"},`,
    intro: "Vous aviez demandé à être prévenu(e) du retour de cet article. Il est désormais disponible à la commande.",
    btnText: "Commander Maintenant",
    urgency: "Attention : les quantités sont limitées et allouées selon l'ordre d'arrivée des commandes.",
    warrantyBadge: "Garantie Mécanisme à Vie • Livraison Gratuite",
  },
  es: {
    subject: (name) => `¡Buenas noticias! ${name} vuelve a estar disponible en Wall Bed King`,
    badge: "De Nuevo en Stock",
    headline: "¡El producto que esperabas ya está disponible!",
    greeting: (name) => `Hola ${name || "Cliente"},`,
    intro: "Te registraste en nuestra lista de espera para este modelo. ¡Nos complace informarte de que ya está disponible para ordenar!",
    btnText: "Comprar Ahora",
    urgency: "Ten en cuenta que el stock es limitado y se asigna por orden de llegada.",
    warrantyBadge: "Garantía de Mecanismo de por Vida • Envío Gratuito",
  },
  it: {
    subject: (name) => `Buone notizie! ${name} è di nuovo disponibile su Wall Bed King`,
    badge: "Di Nuovo Disponibile",
    headline: "Il prodotto che desideravi è tornato in stock!",
    greeting: (name) => `Gentile ${name || "Cliente"},`,
    intro: "Hai richiesto di essere informato al ritorno di questo letto a scomparsa. È ora nuovamente disponibile per l'ordine.",
    btnText: "Ordina Ora",
    urgency: "Nota: le scorte sono limitate e assegnate in ordine di ricezione degli ordini.",
    warrantyBadge: "Garanzia a Vita sul Meccanismo • Spedizione Gratuita",
  },
  pt: {
    subject: (name) => `Boas notícias! ${name} está novamente disponível na Wall Bed King`,
    badge: "Novamente em Stock",
    headline: "O artigo que aguardava já está disponível!",
    greeting: (name) => `Olá ${name || "Cliente"},`,
    intro: "Pediu para ser avisado quando este modelo estivesse disponível. Já pode fazer a sua encomenda online.",
    btnText: "Encomendar Agora",
    urgency: "Atenção: as unidades são limitadas e atribuídas por ordem de chegada.",
    warrantyBadge: "Garantia Vitalícia do Mecanismo • Envio Gratuito",
  },
};

export function getRestockNotificationHtml(waitlistItem, product = null, locale = "en") {
  const loc = (locale || waitlistItem?.locale || "en").toLowerCase();
  const t = RESTOCK_I18N[loc] || RESTOCK_I18N.en;
  const pName = waitlistItem.product_name || product?.name || "Wall Bed King Murphy Bed";
  const pSlug = waitlistItem.product_slug || product?.slug || "";
  let pImage = waitlistItem.product_image || product?.image || "https://wallbedking.co.uk/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp";
  if (pImage && pImage.startsWith("/")) {
    pImage = `https://wallbedking.co.uk${pImage}`;
  }
  const variantText = waitlistItem.variant_name || (waitlistItem.options?.size ? `${waitlistItem.options.size}` : "");
  const customerName = waitlistItem.customer_name || waitlistItem.options?.customer_name || "";
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wallbedking.co.uk";
  const localePrefix = loc && loc !== "en" ? `/${loc}` : "";
  const cat = product?.parent_category || "beds";
  const productUrl = `${siteUrl}${localePrefix}/products/${cat}/${pSlug}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${t.badge} - ${pName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f5f3; margin: 0; padding: 24px; color: #222; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e7e5e1; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
          .header { background: #111111; color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
          .header p { margin: 6px 0 0; font-size: 11px; color: #d4b26f; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 32px 28px; text-align: center; }
          .product-card { background: #faf9f7; border: 1px solid #eeeae3; border-radius: 6px; padding: 20px; margin: 24px 0; text-align: center; }
          .cta-btn { display: inline-block; background: #111111; color: #ffffff !important; text-decoration: none; padding: 14px 32px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
          .footer { background: #faf8f5; border-top: 1px solid #eeebe6; padding: 20px; text-align: center; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Wall Bed King</h1>
            <p>${t.badge}</p>
          </div>
          <div class="content">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #2e7d32; background: #e8f5e9; padding: 4px 10px; border-radius: 20px; display: inline-block; margin-bottom: 12px;">
              ✓ ${t.badge}
            </span>
            <h2 style="color: #111; font-size: 22px; margin-top: 0; font-weight: 600;">${t.headline}</h2>
            <p style="color: #555; font-size: 14px; line-height: 1.6; max-width: 480px; margin: 0 auto 20px;">
              ${t.greeting(customerName)} ${t.intro}
            </p>

            <div class="product-card">
              <img src="${pImage}" alt="${pName}" style="width: 100%; max-width: 320px; height: 180px; object-fit: cover; border-radius: 4px; border: 1px solid #e0e0e0; margin-bottom: 14px;" />
              <strong style="font-size: 16px; color: #111; display: block;">${pName}</strong>
              ${variantText ? `<span style="font-size: 12px; color: #666; display: block; margin-top: 4px;">${variantText}</span>` : ""}

              <div style="margin-top: 20px;">
                <a href="${productUrl}" class="cta-btn" target="_blank" rel="noopener noreferrer">
                  ${t.btnText} →
                </a>
              </div>
            </div>

            <p style="color: #888; font-size: 12px; line-height: 1.5; margin: 20px 0 0;">
              ${t.urgency}
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px;">${t.warrantyBadge}</p>
            <p style="margin: 0 0 6px;">Freephone: <strong>${STORE_PHONE}</strong> • Email: <a href="mailto:support@wallbedking.com" style="color: #9f7d3d;">support@wallbedking.com</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send Back in Stock Notification Email via Resend
 */
export async function sendRestockNotificationEmail(waitlistItem, product = null) {
  if (!waitlistItem || !waitlistItem.customer_email) {
    return { success: false, error: "Missing recipient email" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const loc = (waitlistItem.locale || "en").toLowerCase();
  const t = RESTOCK_I18N[loc] || RESTOCK_I18N.en;
  const pName = waitlistItem.product_name || product?.name || "Wall Bed King Murphy Bed";

  if (!apiKey) {
    console.log(`[Email Service: Mock] Restock Alert for ${pName} sent to ${waitlistItem.customer_email} (${loc})`);
    return {
      success: true,
      mode: "mock",
      message: "Restock alert logged in dev mode.",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [waitlistItem.customer_email],
      replyTo: SUPPORT_EMAIL,
      reply_to: SUPPORT_EMAIL,
      subject: t.subject(pName),
      html: getRestockNotificationHtml(waitlistItem, product, loc),
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Restock Email Error]", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 8. MULTILINGUAL ORDER STATUS NOTIFICATIONS
// ==========================================

export const PRODUCTION_I18N = {
  en: {
    subject: (id) => `Your Wall Bed King Order ${id} is Now in Production! ⚙️`,
    badge: "In Production",
    headline: "Your Wall Bed System is Being Crafted",
    greeting: (name) => `Hello ${name || "Valued Customer"},`,
    intro: (id) => `Great news! Your custom order ${id} has entered our production and precision engineering stage. Our team is now preparing the laser-cut steel framing and German gas-piston lifting mechanisms for your wall bed.`,
    step1: "Precision Steel Fabrication & Frame Assembly",
    step2: "Piston Counterbalance Calibration & Load Testing",
    step3: "Final Multi-Point Quality Inspection & Protective Crating",
    whatNextTitle: "What happens next?",
    whatNextDesc: "Once manufacturing and quality checks are completed, your order will be scheduled with our freight partners. You will receive an automated dispatch notification with full tracking details as soon as it leaves our warehouse.",
    supportNotice: "Have questions about delivery prep or room measurements? Our specialists are here to help.",
    footerGuarantee: "Wall Bed King • Premium Murphy Beds • Lifetime Mechanism Guarantee",
    footerHelp: "Need assistance? Contact us at",
  },
  us: {
    subject: (id) => `Your Wall Bed King Order ${id} is Now in Production! ⚙️`,
    badge: "In Production",
    headline: "Your Murphy Bed is Being Built",
    greeting: (name) => `Hello ${name || "Valued Customer"},`,
    intro: (id) => `Great news! Your custom order ${id} has entered our production stage. Our team is now preparing the heavy-duty steel frame and gas-piston lifting mechanisms for your Murphy bed.`,
    step1: "Precision Steel Fabrication & Frame Assembly",
    step2: "Piston Counterbalance Calibration & Testing",
    step3: "Final Multi-Point Quality Inspection & Protective Crating",
    whatNextTitle: "What happens next?",
    whatNextDesc: "Once built and inspected, your Murphy bed will be handed over to our freight carrier. You will receive a dispatch notice with tracking information as soon as it ships.",
    supportNotice: "Have questions about room prep or delivery? Our support team is ready to assist.",
    footerGuarantee: "Wall Bed King • Premium Murphy Beds • Lifetime Mechanism Warranty",
    footerHelp: "Need assistance? Contact us at",
  },
  de: {
    subject: (id) => `Ihre Wall Bed King Bestellung ${id} ist jetzt in Produktion! ⚙️`,
    badge: "In Produktion",
    headline: "Ihr Schrankbett wird jetzt gefertigt",
    greeting: (name) => `Guten Tag ${name || "Kunde"},`,
    intro: (id) => `Gute Neuigkeiten! Ihre Bestellung ${id} befindet sich jetzt in der Fertigung. Unser Ingenieurteam bereitet den Präzisionsstahlrahmen und die deutschen Gasdruckkolben für Ihr Schrankbett vor.`,
    step1: "Präzisionsstahlfertigung & Rahmenmontage",
    step2: "Kalibrierung & Belastungstest der Gasdruckfedern",
    step3: "Umfassende Qualitätsprüfung & sichere Schutzverpackung",
    whatNextTitle: "Wie geht es weiter?",
    whatNextDesc: "Sobald Ihr Möbelstück die Endkontrolle durchlaufen hat, übergeben wir es an unsere Spedition. Sie erhalten umgehend eine Versandbestätigung mit Trackinglink.",
    supportNotice: "Haben Sie Fragen zur Raumvorbereitung oder Lieferung? Unser Kundenservice berät Sie gerne.",
    footerGuarantee: "Wall Bed King • Premium Schrankbetten • Lebenslange Mechanik-Garantie",
    footerHelp: "Brauchen Sie Hilfe? Kontaktieren Sie uns unter",
  },
  fr: {
    subject: (id) => `Votre commande Wall Bed King ${id} est en cours de fabrication ! ⚙️`,
    badge: "En Fabrication",
    headline: "Votre lit escamotable est en cours de fabrication",
    greeting: (name) => `Bonjour ${name || "Cher Client"},`,
    intro: (id) => `Excellente nouvelle ! Votre commande ${id} est entrée dans notre atelier de fabrication. Notre équipe prépare le cadre en acier de précision et les vérins à gaz allemands de votre lit escamotable.`,
    step1: "Fabrication de précision & assemblage du châssis",
    step2: "Calibrage & test de résistance des pistons à gaz",
    step3: "Contrôle qualité rigoureux & emballage de protection renforcé",
    whatNextTitle: "Quelle est la suite ?",
    whatNextDesc: "Dès que votre meuble a passé avec succès tous les contrôles qualité, il est confié à notre transporteur spécialisé. Vous recevrez un e-mail d'expédition avec le suivi.",
    supportNotice: "Une question concernant la préparation de votre pièce ou la livraison ? Notre équipe est à votre disposition.",
    footerGuarantee: "Wall Bed King • Lits Escamotables Premium • Garantie Mécanisme à Vie",
    footerHelp: "Besoin d'aide ? Contactez-nous à",
  },
  es: {
    subject: (id) => `¡Su pedido Wall Bed King ${id} está en producción! ⚙️`,
    badge: "En Producción",
    headline: "Su cama abatible está en proceso de fabricación",
    greeting: (name) => `Hola ${name || "Cliente"},`,
    intro: (id) => `¡Buenas noticias! Su pedido ${id} ha entrado en la fase de fabricación e ingeniería. Nuestro equipo está preparando la estructura de acero de precisión y los pistones de gas alemanes de su cama abatible.`,
    step1: "Fabricación de precisión y ensamblaje de la estructura",
    step2: "Calibración y pruebas de resistencia de los pistones",
    step3: "Inspección de calidad exhaustiva y embalaje de protección",
    whatNextTitle: "¿Qué sucede a continuación?",
    whatNextDesc: "Una vez completada la fabricación y las pruebas de calidad, su pedido será programado con nuestra agencia de transporte. Recibirá un aviso de envío con número de seguimiento.",
    supportNotice: "¿Tiene alguna duda sobre el espacio o la entrega? Nuestro equipo de soporte está a su entera disposición.",
    footerGuarantee: "Wall Bed King • Camas Abatibles Premium • Garantía Mecanismo de por Vida",
    footerHelp: "¿Necesita ayuda? Contáctenos en",
  },
  it: {
    subject: (id) => `Il tuo ordine Wall Bed King ${id} è ora in produzione! ⚙️`,
    badge: "In Produzione",
    headline: "Il tuo letto a scomparsa è in produzione",
    greeting: (name) => `Gentile ${name || "Cliente"},`,
    intro: (id) => `Ottime notizie! Il tuo ordine ${id} è entrato nella fase di produzione e assemblaggio. Il nostro team sta preparando il telaio in acciaio ad alta precisione e i pistoni a gas tedeschi per il tuo letto.`,
    step1: "Lavorazione laser dell'acciaio e montaggio del telaio",
    step2: "Calibrazione e collaudo dei pistoni a gas",
    step3: "Controllo qualità multipunto e imballaggio protettivo rinforzato",
    whatNextTitle: "Cosa succede ora?",
    whatNextDesc: "Non appena il mobile supera i controlli qualità, verrà affidato ai nostri corrieri specializzati. Riceverai un'email di spedizione con il link di tracciamento.",
    supportNotice: "Hai domande sull'installazione o sulla consegna? Il nostro team di supporto è a tua completa disposizione.",
    footerGuarantee: "Wall Bed King • Letti a Scomparsa Premium • Garanzia Meccanismo a Vita",
    footerHelp: "Hai bisogno di assistenza? Contattaci a",
  },
  hu: {
    subject: (id) => `A(z) ${id} számú Wall Bed King rendelése gyártás alatt áll! ⚙️`,
    badge: "Gyártás Alatt",
    headline: "Lenyitható ágya gyártásba került",
    greeting: (name) => `Kedves ${name || "Vásárlónk"},`,
    intro: (id) => `Nagyszerű hír! A(z) ${id} számú rendelése megérkezett műszaki és gyártási részlegünkhöz. Munkatársaink megkezdték a precíziós acélkeret és a német gázteleszkópos mechanizmus összeszerelését és tesztelését.`,
    step1: "Lézervágott acélszerkezet precíziós összeszerelése",
    step2: "Német gázteleszkópok kalibrálása és teherbírási tesztje",
    step3: "Többpontos minőségellenőrzés és biztonságos védőcsomagolás",
    whatNextTitle: "Mi történik ezután?",
    whatNextDesc: "Amint az ágyrendszer átment a szigorú minőségellenőrzésen, átadjuk a szállítmányozó partnerünknek. Amint feladásra kerül, automatikus értesítő emailt küldünk a csomagszámmal és a kézbesítés részleteivel.",
    supportNotice: "Kérdése merült fel a telepítéssel vagy szállítással kapcsolatban? Ügyfélszolgálatunk készséggel áll rendelkezésére.",
    footerGuarantee: "Wall Bed King • Prémium Lenyitható Ágyak • Élethosszig Tartó Mechanika Garancia",
    footerHelp: "Segítségre van szüksége? Írjon nekünk:",
  },
};

export const DELIVERY_I18N = {
  en: {
    subject: (id) => `Your Wall Bed King Order ${id} Has Been Delivered! 🏡✨`,
    badge: "Delivered",
    headline: "Your Murphy Bed Has Arrived!",
    greeting: (name) => `Hello ${name || "Valued Customer"},`,
    intro: (id) => `We are delighted to confirm that your order ${id} has been delivered! We hope your new space-saving wall bed system transforms your home with unmatched style and function.`,
    supportTitle: "Assembly & Installation Assistance",
    supportDesc: "All assembly manuals, clear step-by-step PDF diagrams, and video assembly tutorials are available 24/7 on our website. Take your time during installation, and remember our support team is on hand if you have any questions.",
    manualsBtn: "View Installation Manuals & Video Guides",
    warrantyReminder: "🛡️ <strong>Lifetime Mechanism Guarantee:</strong> Remember that all steel framing and gas-strut lift mechanisms are covered by our comprehensive lifetime warranty.",
    reviewInvite: "⭐ <strong>We'd love to see your new room!</strong> Once your bed is installed, feel free to share a photo and review with our community.",
    footerGuarantee: "Wall Bed King • Premium Murphy Beds • Lifetime Mechanism Guarantee",
    footerHelp: "Need assistance? Contact us at",
  },
  us: {
    subject: (id) => `Your Wall Bed King Order ${id} Has Been Delivered! 🏡✨`,
    badge: "Delivered",
    headline: "Your Murphy Bed Has Arrived!",
    greeting: (name) => `Hello ${name || "Valued Customer"},`,
    intro: (id) => `We are pleased to confirm that your order ${id} has been successfully delivered! We hope your new Murphy bed helps you make the absolute most of your living space.`,
    supportTitle: "Assembly & Installation Support",
    supportDesc: "Step-by-step PDF installation guides and video tutorials are available on our website anytime. Please reach out if you need guidance with mounting or assembly.",
    manualsBtn: "View Installation Guides & Videos",
    warrantyReminder: "🛡️ <strong>Lifetime Mechanism Warranty:</strong> Your frame and piston mechanisms are backed by our lifetime warranty.",
    reviewInvite: "⭐ <strong>Share your new space!</strong> Once set up, we invite you to leave a review and share a picture of your room.",
    footerGuarantee: "Wall Bed King • Premium Murphy Beds • Lifetime Mechanism Warranty",
    footerHelp: "Need assistance? Contact us at",
  },
  de: {
    subject: (id) => `Ihre Wall Bed King Bestellung ${id} wurde zugestellt! 🏡✨`,
    badge: "Zugestellt",
    headline: "Ihr Schrankbett ist angekommen!",
    greeting: (name) => `Guten Tag ${name || "Kunde"},`,
    intro: (id) => `Wir freuen uns, Ihnen mitteilen zu können, dass Ihre Bestellung ${id} erfolgreich zugestellt wurde! Wir hoffen, dass Ihr neues platzsparendes Schrankbett Ihr Zuhause bereichert.`,
    supportTitle: "Aufbauanleitung & Montageunterstützung",
    supportDesc: "Alle Aufbauanleitungen, Schritt-für-Schritt-Pläne und Videoanleitungen stehen Ihnen jederzeit rund um die Uhr auf unserer Website zur Verfügung.",
    manualsBtn: "Montageanleitungen & Videos ansehen",
    warrantyReminder: "🛡️ <strong>Lebenslange Mechanik-Garantie:</strong> Der Stahlrahmen und die Gasdruckfedern sind durch unsere lebenslange Garantie geschützt.",
    reviewInvite: "⭐ <strong>Wir freuen uns auf Ihr Feedback!</strong> Sobald Ihr Bett aufgebaut ist, teilen Sie gerne Ihre Erfahrungen und Fotos mit uns.",
    footerGuarantee: "Wall Bed King • Premium Schrankbetten • Lebenslange Mechanik-Garantie",
    footerHelp: "Brauchen Sie Hilfe? Kontaktieren Sie uns unter",
  },
  fr: {
    subject: (id) => `Votre commande Wall Bed King ${id} a été livrée ! 🏡✨`,
    badge: "Livré",
    headline: "Votre lit escamotable est bien arrivé !",
    greeting: (name) => `Bonjour ${name || "Cher Client"},`,
    intro: (id) => `Nous avons le plaisir de vous confirmer que votre commande ${id} a bien été livrée ! Nous espérons que votre nouveau lit escamotable saura transformer et optimiser votre espace de vie.`,
    supportTitle: "Aide au montage & guides d'installation",
    supportDesc: "Toutes nos notices de montage en PDF, schémas détaillés et vidéos tutorielles d'assemblage sont accessibles 24h/24 et 7j/7 sur notre site internet.",
    manualsBtn: "Voir les notices & vidéos de montage",
    warrantyReminder: "🛡️ <strong>Garantie Mécanisme à Vie :</strong> Le châssis en acier et les pistons à gaz bénéficient de notre garantie intégrale à vie.",
    reviewInvite: "⭐ <strong>Partagez votre avis !</strong> Une fois votre lit installé, n'hésitez pas à nous laisser un commentaire avec vos photos.",
    footerGuarantee: "Wall Bed King • Lits Escamotables Premium • Garantie Mécanisme à Vie",
    footerHelp: "Besoin d'aide ? Contactez-nous à",
  },
  es: {
    subject: (id) => `¡Su pedido Wall Bed King ${id} ha sido entregado! 🏡✨`,
    badge: "Entregado",
    headline: "¡Su cama abatible ha llegado!",
    greeting: (name) => `Hola ${name || "Cliente"},`,
    intro: (id) => `¡Nos complace confirmarle que su pedido ${id} ha sido entregado con éxito! Esperamos que su nueva cama abatible transforme su hogar brindándole el máximo espacio y confort.`,
    supportTitle: "Guías y asistencia de montaje",
    supportDesc: "Todos los manuales de montaje, esquemas explicativos en PDF y tutoriales en vídeo están a su disposición las 24 horas en nuestra web.",
    manualsBtn: "Ver guías de montaje y vídeos",
    warrantyReminder: "🛡️ <strong>Garantía de Mecanismo de por Vida:</strong> Todos los herrajes de acero y pistones hidráulicos cuentan con garantía vitalicia.",
    reviewInvite: "⭐ <strong>¡Queremos ver su espacio!</strong> Cuando instale la cama, le animamos a compartir una reseña y fotografías con nuestra comunidad.",
    footerGuarantee: "Wall Bed King • Camas Abatibles Premium • Garantía Mecanismo de por Vida",
    footerHelp: "¿Necesita ayuda? Contáctenos en",
  },
  it: {
    subject: (id) => `Il tuo ordine Wall Bed King ${id} è stato consegnato! 🏡✨`,
    badge: "Consegnato",
    headline: "Il tuo letto a scomparsa è arrivato!",
    greeting: (name) => `Gentile ${name || "Cliente"},`,
    intro: (id) => `Siamo lieti di confermarti che il tuo ordine ${id} è stato consegnato con successo! Ci auguriamo che il tuo nuovo letto a scomparsa ottimizzi al meglio i tuoi spazi quotidiani.`,
    supportTitle: "Manuali e supporto al montaggio",
    supportDesc: "Tutti i manuali in PDF, gli schemi di montaggio e i video tutorial passo-passo sono disponibili in ogni momento sul nostro sito web.",
    manualsBtn: "Guarda le guide e i video di montaggio",
    warrantyReminder: "🛡️ <strong>Garanzia Meccanismo a Vita:</strong> Il telaio in acciaio e i pistoni a gas sono garantiti a vita da Wall Bed King.",
    reviewInvite: "⭐ <strong>Condividi la tua opinione!</strong> Una volta montato il letto, raccontaci la tua esperienza e carica le foto della tua stanza.",
    footerGuarantee: "Wall Bed King • Letti a Scomparsa Premium • Garanzia Meccanismo a Vita",
    footerHelp: "Hai bisogno di assistenza? Contattaci a",
  },
  hu: {
    subject: (id) => `A(z) ${id} számú Wall Bed King rendelése kézbesítésre került! 🏡✨`,
    badge: "Kézbesítve",
    headline: "Lenyitható ágya megérkezett!",
    greeting: (name) => `Kedves ${name || "Vásárlónk"},`,
    intro: (id) => `Örömmel értesítjük, hogy a(z) ${id} számú rendelése sikeresen kézbesítésre került! Reméljük, hogy új helytakarékos ágymechanizmusa maximális kényelmet és prémium helykihasználást nyújt otthonában.`,
    supportTitle: "Összeszerelési segédlet és útmutatók",
    supportDesc: "Az összeszereléshez szükséges részletes magyar és angol nyelvű PDF útmutatók, rajzok és lépésről-lépésre videós segédletek bármikor elérhetőek a weboldalunkon.",
    manualsBtn: "Szerelési útmutatók és videók megtekintése",
    warrantyReminder: "🛡️ <strong>Élethosszig Tartó Mechanika Garancia:</strong> A tömör acélkeretre és a prémium gázteleszkópokra teljes élethosszig tartó garanciát biztosítunk.",
    reviewInvite: "⭐ <strong>Ossza meg véleményét!</strong> Amint elkészült a beépítés, örömmel fogadjuk visszajelzését és fotóit a megújult szobáról.",
    footerGuarantee: "Wall Bed King • Prémium Lenyitható Ágyak • Élethosszig Tartó Mechanika Garancia",
    footerHelp: "Segítségre van szüksége? Írjon nekünk:",
  },
};

export function getProductionNotificationHtml(order = SAMPLE_ORDER, locale = "en", isUpdate = false) {
  const loc = resolveOrderLocale(order, locale);
  const t = PRODUCTION_I18N[loc] || PRODUCTION_I18N.en;
  const upd = UPDATE_NOTICE_I18N[loc] || UPDATE_NOTICE_I18N.en;
  const currencyCode = (order.currency || (loc === "en" ? "GBP" : "EUR")).toUpperCase();
  const currencySymbol = currencyCode === "EUR" ? "€" : currencyCode === "USD" ? "$" : "£";

  const itemsList = (order.items || [])
    .map(
      (item) => {
        const opts = item.options || {};
        const optText = item.variant || [opts.size, opts.orientation, opts.type].filter(Boolean).join(" • ");
        const hasSofa = Boolean(opts.sofaIncluded);
        return `
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 12px 0;">
            <strong style="color: #111; font-size: 13px;">${item.name || item.title || "Wall Bed"}</strong>
            ${optText ? `<br><span style="font-size: 11px; color: #777;">${optText}</span>` : ""}
            ${hasSofa ? `<br><span style="display:inline-block; margin-top:4px; background:#faf5ea; color:#9f7d3d; border:1px solid #e9d8a6; font-size:10px; font-weight:700; padding:2px 6px; border-radius:3px;">🛋️ + Front Sofa Module</span>` : ""}
          </td>
          <td style="padding: 12px 0; text-align: center; color: #444; font-size: 13px;">${item.quantity || 1}</td>
          <td style="padding: 12px 0; text-align: right; color: #111; font-weight: 600; font-size: 13px;">${currencySymbol}${Number(item.price || 0).toFixed(2)}</td>
        </tr>
      `;
      }
    )
    .join("");

  const updateBannerHtml = isUpdate ? `
    <div style="margin-bottom: 22px; padding: 14px 18px; background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #b45309; margin-bottom: 4px;">
        ⚠️ ${upd.title}
      </div>
      <div style="font-size: 13px; color: #78350f; line-height: 1.5;">
        ${upd.message}
      </div>
    </div>
  ` : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${isUpdate ? `${upd.subjectPrefix}` : ""}${t.badge} - ${order.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f5f3; margin: 0; padding: 24px; color: #222; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e7e5e1; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
          .header { background: #111111; color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
          .header p { margin: 6px 0 0; font-size: 12px; color: #d4b26f; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 32px 28px; }
          .steps-card { background: #faf9f7; border: 1px solid #eeeae3; border-radius: 6px; padding: 20px; margin: 24px 0; }
          .footer { background: #faf8f5; border-top: 1px solid #eeebe6; padding: 20px; text-align: center; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Wall Bed King</h1>
            <p>${isUpdate ? `${upd.badge}` : t.badge}</p>
          </div>
          <div class="content">
            ${updateBannerHtml}
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #1e3a8a; background: #dbeafe; padding: 4px 10px; border-radius: 20px; display: inline-block; margin-bottom: 12px;">
              ⚙️ ${t.badge}
            </span>
            <h2 style="color: #111; font-size: 22px; margin-top: 0; font-weight: 600;">${t.headline}</h2>
            <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              ${t.greeting(order.customer_name)}<br><br>
              ${t.intro(order.id)}
            </p>

            <div class="steps-card">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 12px; font-weight: 600;">
                Production Milestones
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #333;">
                <tr>
                  <td style="padding: 6px 10px 6px 0; width: 24px; vertical-align: top; color: #2e7d32; font-weight: bold;">✓</td>
                  <td style="padding: 6px 0; line-height: 1.4;">${t.step1}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px 6px 0; width: 24px; vertical-align: top; color: #b89c66; font-weight: bold;">⚙️</td>
                  <td style="padding: 6px 0; line-height: 1.4;">${t.step2}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px 6px 0; width: 24px; vertical-align: top; color: #888; font-weight: bold;">📦</td>
                  <td style="padding: 6px 0; line-height: 1.4;">${t.step3}</td>
                </tr>
              </table>
            </div>

            <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #111; margin-top: 28px; margin-bottom: 8px;">Order Details (${order.id})</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #111; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #666;">
                  <th style="padding-bottom: 10px;">Item</th>
                  <th style="padding-bottom: 10px; text-align: center;">Qty</th>
                  <th style="padding-bottom: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList || '<tr><td colspan="3" style="padding:14px 0;">Wall Bed System & Accessories</td></tr>'}
              </tbody>
            </table>

            <div style="margin-top: 28px; padding: 16px; background: #fafafa; border-radius: 6px; border-left: 3px solid #d4b26f;">
              <p style="margin: 0; font-size: 12px; color: #444; line-height: 1.5;">
                <strong>${t.whatNextTitle}</strong> ${t.whatNextDesc}
              </p>
            </div>

            <p style="font-size: 12px; color: #777; margin-top: 20px; line-height: 1.5;">
              ${t.supportNotice}
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px; font-weight: 500; color: #333;">${t.footerGuarantee}</p>
            <p style="margin: 0;">${t.footerHelp} <a href="mailto:support@wallbedking.com" style="color: #9f7d3d; text-decoration: none; font-weight: 600;">support@wallbedking.com</a> or call <strong>${STORE_PHONE}</strong> (${STORE_HOURS}).</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getDeliveryNotificationHtml(order = SAMPLE_ORDER, locale = "en", isUpdate = false) {
  const loc = resolveOrderLocale(order, locale);
  const t = DELIVERY_I18N[loc] || DELIVERY_I18N.en;
  const upd = UPDATE_NOTICE_I18N[loc] || UPDATE_NOTICE_I18N.en;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wallbedking.co.uk";
  const localePrefix = loc && loc !== "en" ? `/${loc}` : "";
  const guidesUrl = `${siteUrl}${localePrefix}/support/installation-guides`;

  const updateBannerHtml = isUpdate ? `
    <div style="margin-bottom: 22px; padding: 14px 18px; background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #b45309; margin-bottom: 4px;">
        ⚠️ ${upd.title}
      </div>
      <div style="font-size: 13px; color: #78350f; line-height: 1.5;">
        ${upd.message}
      </div>
    </div>
  ` : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${isUpdate ? `${upd.subjectPrefix}` : ""}${t.badge} - ${order.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f5f3; margin: 0; padding: 24px; color: #222; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e7e5e1; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
          .header { background: #111111; color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
          .header p { margin: 6px 0 0; font-size: 12px; color: #d4b26f; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 32px 28px; }
          .support-card { background: #faf9f7; border: 1px solid #eeeae3; border-radius: 6px; padding: 22px 20px; margin: 24px 0; text-align: center; }
          .cta-btn { display: inline-block; background: #111111; color: #ffffff !important; text-decoration: none; padding: 13px 28px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
          .footer { background: #faf8f5; border-top: 1px solid #eeebe6; padding: 20px; text-align: center; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Wall Bed King</h1>
            <p>${isUpdate ? `${upd.badge}` : t.badge}</p>
          </div>
          <div class="content">
            ${updateBannerHtml}
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #166534; background: #dcfce7; padding: 4px 10px; border-radius: 20px; display: inline-block; margin-bottom: 12px;">
              ✅ ${t.badge}
            </span>
            <h2 style="color: #111; font-size: 22px; margin-top: 0; font-weight: 600;">${t.headline}</h2>
            <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              ${t.greeting(order.customer_name)}<br><br>
              ${t.intro(order.id)}
            </p>

            <div class="support-card">
              <div style="font-size: 15px; font-weight: 700; color: #111; margin-bottom: 8px;">
                ${t.supportTitle}
              </div>
              <p style="margin: 0 auto 18px; font-size: 13px; color: #555; line-height: 1.6; max-width: 480px;">
                ${t.supportDesc}
              </p>
              <div>
                <a href="${guidesUrl}" target="_blank" rel="noopener noreferrer" class="cta-btn">
                  ${t.manualsBtn} →
                </a>
              </div>
            </div>

            <div style="margin: 20px 0; padding: 14px 16px; background: #fdfbf7; border: 1px solid #f3ebe0; border-radius: 6px; font-size: 12px; color: #555; line-height: 1.5;">
              ${t.warrantyReminder}
            </div>

            <div style="margin: 20px 0; padding: 14px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; color: #334155; line-height: 1.5;">
              ${t.reviewInvite}
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px; font-weight: 500; color: #333;">${t.footerGuarantee}</p>
            <p style="margin: 0;">${t.footerHelp} <a href="mailto:support@wallbedking.com" style="color: #9f7d3d; text-decoration: none; font-weight: 600;">support@wallbedking.com</a> or call <strong>${STORE_PHONE}</strong> (${STORE_HOURS}).</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send "In Production" Notification Email via Resend
 */
export async function sendProductionNotificationEmail(order, locale = null, isUpdate = false) {
  if (!order || !order.customer_email) return { success: false, error: "Missing recipient email" };

  const effectiveLocale = resolveOrderLocale(order, locale);
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[Email Service: Mock] In Production Notification for ${order.id} sent to ${order.customer_email} (${effectiveLocale}, isUpdate: ${isUpdate})`);
    return {
      success: true,
      mode: "mock",
      message: "Production notification logged in dev mode.",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const i18n = PRODUCTION_I18N[effectiveLocale.toLowerCase()] || PRODUCTION_I18N.en;
    const upd = UPDATE_NOTICE_I18N[effectiveLocale.toLowerCase()] || UPDATE_NOTICE_I18N.en;
    const subjectPrefix = isUpdate ? upd.subjectPrefix : "";
    const htmlContent = getProductionNotificationHtml(order, effectiveLocale, isUpdate);

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [order.customer_email],
      replyTo: SUPPORT_EMAIL,
      reply_to: SUPPORT_EMAIL,
      subject: `${subjectPrefix}${i18n.subject(order.id)}`,
      html: htmlContent,
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Production Email Error]", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send "Delivered" Notification Email via Resend
 */
export async function sendDeliveryNotificationEmail(order, locale = null, isUpdate = false) {
  if (!order || !order.customer_email) return { success: false, error: "Missing recipient email" };

  const effectiveLocale = resolveOrderLocale(order, locale);
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[Email Service: Mock] Delivery Notification for ${order.id} sent to ${order.customer_email} (${effectiveLocale}, isUpdate: ${isUpdate})`);
    return {
      success: true,
      mode: "mock",
      message: "Delivery notification logged in dev mode.",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const i18n = DELIVERY_I18N[effectiveLocale.toLowerCase()] || DELIVERY_I18N.en;
    const upd = UPDATE_NOTICE_I18N[effectiveLocale.toLowerCase()] || UPDATE_NOTICE_I18N.en;
    const subjectPrefix = isUpdate ? upd.subjectPrefix : "";
    const htmlContent = getDeliveryNotificationHtml(order, effectiveLocale, isUpdate);

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [order.customer_email],
      replyTo: SUPPORT_EMAIL,
      reply_to: SUPPORT_EMAIL,
      subject: `${subjectPrefix}${i18n.subject(order.id)}`,
      html: htmlContent,
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Delivery Email Error]", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// PASSWORD RESET / SUPABASE AUTH TEMPLATES
// ==========================================

export const SUPABASE_PASSWORD_RESET_RAW_TEMPLATE = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Wall Bed King</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f5f3; margin: 0; padding: 24px; color: #222; -webkit-font-smoothing: antialiased; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e7e5e1; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
      .header { background: #111111; color: #ffffff; padding: 32px 28px; text-align: center; }
      .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #ffffff; }
      .header p { margin: 8px 0 0; font-size: 11px; color: #d4b26f; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
      .content { padding: 36px 32px; }
      .badge { display: inline-block; padding: 5px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 4px; margin-bottom: 20px; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
      .btn { display: inline-block; background: #111111; color: #ffffff !important; text-decoration: none; padding: 15px 34px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 50px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.12); margin: 24px 0; }
      .alert-box { background: #faf9f7; border: 1px solid #eeeae3; border-left: 4px solid #b89c66; padding: 16px 18px; border-radius: 6px; margin: 24px 0; font-size: 13px; color: #555; line-height: 1.6; }
      .fallback-box { background: #faf8f5; border: 1px dashed #d6d3cd; padding: 14px 16px; border-radius: 6px; font-size: 12px; color: #666; margin-top: 24px; word-break: break-all; line-height: 1.5; }
      .footer { background: #faf8f5; border-top: 1px solid #eeebe6; padding: 24px 28px; text-align: center; font-size: 12px; color: #777777; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Wall Bed King</h1>
        <p>Security &amp; Account Access</p>
      </div>
      <div class="content">
        <span class="badge">🔒 Password Reset Request</span>
        <h2 style="font-size: 22px; color: #111111; margin-top: 0; font-weight: 600; letter-spacing: -0.5px;">
          Reset Your Password
        </h2>
        <p style="font-size: 14px; color: #555555; line-height: 1.6; margin-bottom: 8px;">
          Hello,
        </p>
        <p style="font-size: 14px; color: #555555; line-height: 1.6; margin-bottom: 20px;">
          We received a request to reset the password for your Wall Bed King account: <strong style="color: #111111;">{{ .Email }}</strong>. Click the button below to choose a new password:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ .ConfirmationURL }}" class="btn" style="color: #ffffff; background: #111111;">
            Reset My Password &rarr;
          </a>
        </div>

        <div class="alert-box">
          <strong style="color: #111111; display: block; margin-bottom: 4px;">⚠️ Didn't request this change?</strong>
          If you did not request a password reset, you can safely ignore this email. Your current password remains active and your account is secure.
        </div>

        <p style="font-size: 12px; color: #888888; line-height: 1.5; margin-top: 20px;">
          <em>Note: This password reset link is time-sensitive and will expire in 60 minutes.</em>
        </p>

        <div class="fallback-box">
          <strong style="color: #444444; display: block; margin-bottom: 6px;">Button not working?</strong>
          Copy and paste the following link directly into your browser:
          <br>
          <a href="{{ .ConfirmationURL }}" style="color: #9f7d3d; text-decoration: underline; font-family: monospace; font-size: 11px;">{{ .ConfirmationURL }}</a>
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px; font-weight: 600; color: #333333;">Wall Bed King • Premium Murphy Beds • Lifetime Mechanism Guarantee</p>
        <p style="margin: 0; color: #777777;">
          Need assistance? Contact our team at <a href="mailto:support@wallbedking.com" style="color: #9f7d3d; text-decoration: none; font-weight: 600;">support@wallbedking.com</a> or call <strong>${STORE_PHONE}</strong> (${STORE_HOURS}).
        </p>
      </div>
    </div>
  </body>
</html>`;

export function getPasswordResetHtml({ email = "customer@example.com", confirmationUrl = "https://wallbedking.com/en/account?mode=recovery" } = {}) {
  return SUPABASE_PASSWORD_RESET_RAW_TEMPLATE
    .replace(/\{\{\s*\.Email\s*\}\}/g, email)
    .replace(/\{\{\s*\.ConfirmationURL\s*\}\}/g, confirmationUrl);
}

