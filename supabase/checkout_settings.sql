-- ============================================================
-- WALLBEDKING CHECKOUT, SHIPPING & PAYMENT SETTINGS SCHEMA
-- Table: public.checkout_settings
-- Run this script in your Supabase SQL Editor.
-- ============================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.checkout_settings (
  locale TEXT PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.checkout_settings ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to prevent conflicts on re-run
DROP POLICY IF EXISTS "Allow public read checkout_settings" ON public.checkout_settings;
DROP POLICY IF EXISTS "Allow service role all checkout_settings" ON public.checkout_settings;
DROP POLICY IF EXISTS "Allow authenticated all checkout_settings" ON public.checkout_settings;

-- 4. Policies:
-- Public storefronts (guest and logged-in visitors) can read checkout configurations
CREATE POLICY "Allow public read checkout_settings" ON public.checkout_settings
  FOR SELECT USING (true);

-- Backend API & Service Role full management
CREATE POLICY "Allow service role all checkout_settings" ON public.checkout_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Authenticated admins full management
CREATE POLICY "Allow authenticated all checkout_settings" ON public.checkout_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Seed initial settings for all 7 markets (UK, US, DE, FR, ES, POR, IT)
INSERT INTO public.checkout_settings (locale, config, updated_at)
VALUES (
  'en',
  $BODY${
  "locale": "en",
  "countryCode": "GB",
  "countryName": "United Kingdom",
  "currency": "GBP",
  "currencySymbol": "£",
  "flag": "🇬🇧",
  "payments": {
    "stripe": {
      "enabled": false,
      "label": "Credit / Debit Card",
      "sublabel": "Stripe & Apple Pay"
    },
    "paypal": {
      "enabled": true,
      "label": "PayPal",
      "sublabel": "Express & Pay in 3"
    },
    "quickPayInCart": {
      "enabled": true,
      "label": "Express Quick Pay in Cart"
    },
    "bankTransfer": {
      "enabled": true,
      "label": "Bank Transfer",
      "sublabel": "Faster Payments / BACS",
      "instructions": "Pay directly into our UK bank account. Your order will be processed once funds are received."
    }
  },
  "shipping": {
    "delivery_option_economy": {
      "enabled": true,
      "cost": 0,
      "label": "Free Mainland Delivery",
      "message": "Delivery within 2 - 4 weeks"
    },
    "delivery_option_standard": {
      "enabled": true,
      "cost": 49,
      "label": "Standard Delivery",
      "message": "Delivery within 1 - 2 weeks"
    },
    "delivery_option_express": {
      "enabled": true,
      "cost": 79,
      "label": "Express Delivery",
      "message": "Delivery within 2 - 5 working days"
    },
    "delivery_option_pickup": {
      "enabled": true,
      "cost": 0,
      "label": "Warehouse Collection",
      "message": "To be collected from our warehouse in Harlow, CM20 2HU. Mon - Fri, 10am - 4pm."
    }
  }
}$BODY$::jsonb,
  NOW()
)
ON CONFLICT (locale) DO UPDATE 
SET config = EXCLUDED.config,
    updated_at = NOW();

INSERT INTO public.checkout_settings (locale, config, updated_at)
VALUES (
  'us',
  $BODY${
  "locale": "us",
  "countryCode": "US",
  "countryName": "United States",
  "currency": "USD",
  "currencySymbol": "$",
  "flag": "🇺🇸",
  "payments": {
    "stripe": {
      "enabled": false,
      "label": "Credit / Debit Card",
      "sublabel": "Stripe & Apple Pay"
    },
    "paypal": {
      "enabled": true,
      "label": "PayPal",
      "sublabel": "Express & Pay Later"
    },
    "quickPayInCart": {
      "enabled": true,
      "label": "Express Quick Pay in Cart"
    },
    "bankTransfer": {
      "enabled": true,
      "label": "Bank Wire Transfer",
      "sublabel": "Direct Wire Transfer",
      "instructions": "Please transfer funds to our bank account. Goods will be dispatched upon receipt of payment."
    }
  },
  "shipping": {
    "delivery_option_economy": {
      "enabled": true,
      "cost": 0,
      "label": "Free US Delivery",
      "message": "Will arrive within 2 - 4 weeks"
    },
    "delivery_option_standard": {
      "enabled": true,
      "cost": 49,
      "label": "Standard Delivery",
      "message": "Will arrive within 1 - 2 weeks"
    },
    "delivery_option_express": {
      "enabled": false,
      "cost": 79,
      "label": "Express Delivery",
      "message": "Will arrive within 2 - 5 working days"
    },
    "delivery_option_pickup": {
      "enabled": false,
      "cost": 0,
      "label": "Warehouse Collection",
      "message": ""
    }
  }
}$BODY$::jsonb,
  NOW()
)
ON CONFLICT (locale) DO UPDATE 
SET config = EXCLUDED.config,
    updated_at = NOW();

INSERT INTO public.checkout_settings (locale, config, updated_at)
VALUES (
  'de',
  $BODY${
  "locale": "de",
  "countryCode": "DE",
  "countryName": "Deutschland & Österreich",
  "currency": "EUR",
  "currencySymbol": "€",
  "flag": "🇩🇪",
  "payments": {
    "stripe": {
      "enabled": false,
      "label": "Kredit- / Debitkarte",
      "sublabel": "Stripe & Apple Pay"
    },
    "paypal": {
      "enabled": true,
      "label": "PayPal",
      "sublabel": "Express & Später Bezahlen"
    },
    "quickPayInCart": {
      "enabled": true,
      "label": "Express-Zahlung im Warenkorb"
    },
    "bankTransfer": {
      "enabled": true,
      "label": "Banküberweisung",
      "sublabel": "SEPA-Überweisung",
      "instructions": "Zahlen Sie direkt per Banküberweisung. Die Ware wird nach Zahlungseingang versendet."
    }
  },
  "shipping": {
    "delivery_option_economy": {
      "enabled": true,
      "cost": 0,
      "label": "Kostenlose Lieferung",
      "message": "Lieferung innerhalb von 2 bis 4 Wochen"
    },
    "delivery_option_standard": {
      "enabled": true,
      "cost": 49,
      "label": "Standardlieferung",
      "message": "Lieferung innerhalb von 1 bis 2 Wochen"
    },
    "delivery_option_express": {
      "enabled": false,
      "cost": 79,
      "label": "Expresslieferung",
      "message": "Lieferung innerhalb von 2 bis 5 Werktagen"
    },
    "delivery_option_pickup": {
      "enabled": false,
      "cost": 0,
      "label": "Abholung im Lager",
      "message": ""
    }
  }
}$BODY$::jsonb,
  NOW()
)
ON CONFLICT (locale) DO UPDATE 
SET config = EXCLUDED.config,
    updated_at = NOW();

INSERT INTO public.checkout_settings (locale, config, updated_at)
VALUES (
  'fr',
  $BODY${
  "locale": "fr",
  "countryCode": "FR",
  "countryName": "France",
  "currency": "EUR",
  "currencySymbol": "€",
  "flag": "🇫🇷",
  "payments": {
    "stripe": {
      "enabled": false,
      "label": "Carte Bancaire",
      "sublabel": "Stripe & Apple Pay"
    },
    "paypal": {
      "enabled": true,
      "label": "PayPal",
      "sublabel": "Express & Paiement en 4x"
    },
    "quickPayInCart": {
      "enabled": true,
      "label": "Paiement rapide dans le panier"
    },
    "bankTransfer": {
      "enabled": false,
      "label": "Virement Bancaire",
      "sublabel": "Virement SEPA",
      "instructions": "Veuillez effectuer le paiement par virement bancaire. Expédition dès réception."
    }
  },
  "shipping": {
    "delivery_option_economy": {
      "enabled": true,
      "cost": 0,
      "label": "Livraison Gratuite",
      "message": "Livraison sous 2 à 4 semaines"
    },
    "delivery_option_standard": {
      "enabled": true,
      "cost": 49,
      "label": "Livraison Standard",
      "message": "Livraison sous 1 à 2 semaines"
    },
    "delivery_option_express": {
      "enabled": false,
      "cost": 79,
      "label": "Livraison Express",
      "message": "Livraison sous 2 à 5 jours ouvrés"
    },
    "delivery_option_pickup": {
      "enabled": false,
      "cost": 0,
      "label": "Retrait Entrepôt",
      "message": ""
    }
  }
}$BODY$::jsonb,
  NOW()
)
ON CONFLICT (locale) DO UPDATE 
SET config = EXCLUDED.config,
    updated_at = NOW();

INSERT INTO public.checkout_settings (locale, config, updated_at)
VALUES (
  'es',
  $BODY${
  "locale": "es",
  "countryCode": "ES",
  "countryName": "España",
  "currency": "EUR",
  "currencySymbol": "€",
  "flag": "🇪🇸",
  "payments": {
    "stripe": {
      "enabled": false,
      "label": "Tarjeta de Crédito / Débito",
      "sublabel": "Stripe & Apple Pay"
    },
    "paypal": {
      "enabled": true,
      "label": "PayPal",
      "sublabel": "Express & Paga en 3 plazos"
    },
    "quickPayInCart": {
      "enabled": true,
      "label": "Pago rápido en el carrito"
    },
    "bankTransfer": {
      "enabled": true,
      "label": "Transferencia Bancaria",
      "sublabel": "Transferencia SEPA",
      "instructions": "Realice el pago por transferencia bancaria. El pedido se enviará tras recibir los fondos."
    }
  },
  "shipping": {
    "delivery_option_economy": {
      "enabled": true,
      "cost": 0,
      "label": "Envío Gratuito",
      "message": "Entrega en un plazo de 2 a 4 semanas"
    },
    "delivery_option_standard": {
      "enabled": true,
      "cost": 49,
      "label": "Envío Estándar",
      "message": "Entrega en un plazo de 1 a 2 semanas"
    },
    "delivery_option_express": {
      "enabled": false,
      "cost": 79,
      "label": "Envío Exprés",
      "message": "Entrega en un plazo de 2 a 5 días laborables"
    },
    "delivery_option_pickup": {
      "enabled": false,
      "cost": 0,
      "label": "Recogida en almacén",
      "message": ""
    }
  }
}$BODY$::jsonb,
  NOW()
)
ON CONFLICT (locale) DO UPDATE 
SET config = EXCLUDED.config,
    updated_at = NOW();

INSERT INTO public.checkout_settings (locale, config, updated_at)
VALUES (
  'por',
  $BODY${
  "locale": "por",
  "countryCode": "PT",
  "countryName": "Portugal",
  "currency": "EUR",
  "currencySymbol": "€",
  "flag": "🇵🇹",
  "payments": {
    "stripe": {
      "enabled": false,
      "label": "Cartão de Crédito / Débito",
      "sublabel": "Stripe & Apple Pay"
    },
    "paypal": {
      "enabled": true,
      "label": "PayPal",
      "sublabel": "Express & Pague em 3x"
    },
    "quickPayInCart": {
      "enabled": true,
      "label": "Pagamento rápido no carrinho"
    },
    "bankTransfer": {
      "enabled": true,
      "label": "Transferência Bancária",
      "sublabel": "Transferência SEPA",
      "instructions": "Efetue o pagamento por transferência bancária. O envio será feito após a receção."
    }
  },
  "shipping": {
    "delivery_option_economy": {
      "enabled": true,
      "cost": 0,
      "label": "Envio Gratuito",
      "message": "Entrega no prazo de 2 a 4 semanas"
    },
    "delivery_option_standard": {
      "enabled": true,
      "cost": 49,
      "label": "Envio Padrão",
      "message": "Entrega no prazo de 1 a 2 semanas"
    },
    "delivery_option_express": {
      "enabled": false,
      "cost": 79,
      "label": "Envio Expresso",
      "message": "Entrega no prazo de 2 a 5 dias úteis"
    },
    "delivery_option_pickup": {
      "enabled": false,
      "cost": 0,
      "label": "Levantamento no armazém",
      "message": ""
    }
  }
}$BODY$::jsonb,
  NOW()
)
ON CONFLICT (locale) DO UPDATE 
SET config = EXCLUDED.config,
    updated_at = NOW();

INSERT INTO public.checkout_settings (locale, config, updated_at)
VALUES (
  'it',
  $BODY${
  "locale": "it",
  "countryCode": "IT",
  "countryName": "Italia",
  "currency": "EUR",
  "currencySymbol": "€",
  "flag": "🇮🇹",
  "payments": {
    "stripe": {
      "enabled": false,
      "label": "Carta di Credito / Debito",
      "sublabel": "Stripe & Apple Pay"
    },
    "paypal": {
      "enabled": true,
      "label": "PayPal",
      "sublabel": "Express & Paga in 3 rate"
    },
    "quickPayInCart": {
      "enabled": true,
      "label": "Pagamento rapido nel carrello"
    },
    "bankTransfer": {
      "enabled": true,
      "label": "Bonifico Bancario",
      "sublabel": "Bonifico SEPA",
      "instructions": "Effettua il pagamento tramite bonifico bancario. L'ordine sarà spedito alla ricezione dei fondi."
    }
  },
  "shipping": {
    "delivery_option_economy": {
      "enabled": true,
      "cost": 0,
      "label": "Spedizione Gratuita",
      "message": "Consegna entro 2 - 4 settimane"
    },
    "delivery_option_standard": {
      "enabled": true,
      "cost": 49,
      "label": "Spedizione Standard",
      "message": "Consegna entro 1 - 2 settimane"
    },
    "delivery_option_express": {
      "enabled": false,
      "cost": 79,
      "label": "Spedizione Express",
      "message": "Consegna entro 2 - 5 giorni lavorativi"
    },
    "delivery_option_pickup": {
      "enabled": false,
      "cost": 0,
      "label": "Ritiro in magazzino",
      "message": ""
    }
  }
}$BODY$::jsonb,
  NOW()
)
ON CONFLICT (locale) DO UPDATE 
SET config = EXCLUDED.config,
    updated_at = NOW();

