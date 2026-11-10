import { NextResponse } from "next/server";

const LOCALE_NAME_MAP = {
  us: "American English",
  de: "German (high quality, natural ecommerce tone for luxury space-saving furniture / wall beds)",
  fr: "French (polished, natural ecommerce terminology for lits escamotables / wall beds)",
  es: "Spanish (neutral European/Latin American, natural ecommerce tone for camas abatibles)",
  por: "Portuguese (natural European/Brazilian ecommerce tone for camas rebatíveis)",
  it: "Italian (elegant ecommerce terminology for letti a scomparsa)",
  en: "British English",
};

const MYMEMORY_LANG_MAP = {
  de: "de",
  fr: "fr",
  es: "es",
  it: "it",
  por: "pt",
  us: "en",
  en: "en",
};

function decodeHtmlEntities(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'");
}

async function translateWithOpenAI(text, targetLocale, apiKey) {
  const { OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });
  const targetDesc = LOCALE_NAME_MAP[targetLocale] || targetLocale;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `You are a professional ecommerce translator for WallBedKing, a high-end manufacturer of space-saving Murphy beds (Schrankbetten, Lits escamotables, Camas abatibles, Letti a scomparsa), modular front sofas, and cabinetry.
Translate the following short promotional text or UI string from English into ${targetDesc}.
Return ONLY the translation, without quotes, explanations, or formatting. Preserve variables or punctuation.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || text;
}

async function translateWithPublicAPI(text, targetLocale) {
  const targetCode = MYMEMORY_LANG_MAP[targetLocale] || targetLocale;
  if (targetCode === "en") return text;

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetCode}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`Public translation API returned HTTP ${res.status}`);
  }

  const data = await res.json();
  const rawTranslation = data.responseData?.translatedText;
  if (!rawTranslation) {
    throw new Error("No translation returned by public translation engine");
  }

  return decodeHtmlEntities(rawTranslation.trim());
}

async function translateSingleText(text, targetLocale) {
  if (!text || typeof text !== "string" || !text.trim()) {
    return "";
  }
  const normLocale = (targetLocale || "en").toLowerCase();
  if (normLocale === "en" || normLocale === "us") {
    return text.trim();
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const aiResult = await translateWithOpenAI(text, normLocale, apiKey);
      if (aiResult) return aiResult;
    } catch (e) {
      console.warn("OpenAI translation failed, falling back to public engine:", e?.message);
    }
  }

  return await translateWithPublicAPI(text, normLocale);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { englishText, targetLocale, targetLocales, texts } = body;

    // Mode 1: Batch translation of multiple fields across multiple target locales
    if (texts && typeof texts === "object" && Array.isArray(targetLocales) && targetLocales.length > 0) {
      const allResults = {};
      for (const loc of targetLocales) {
        allResults[loc] = {};
        for (const [key, val] of Object.entries(texts)) {
          if (!val || typeof val !== "string" || !val.trim()) {
            allResults[loc][key] = "";
            continue;
          }
          try {
            allResults[loc][key] = await translateSingleText(val, loc);
          } catch (e) {
            console.warn(`Translation error for ${key} into ${loc}:`, e?.message);
            allResults[loc][key] = val; // fallback to original
          }
        }
      }
      return NextResponse.json({ success: true, translations: allResults });
    }

    // Mode 2: Multiple fields for a single target locale
    if (texts && typeof texts === "object" && targetLocale) {
      const translatedMap = {};
      for (const [key, val] of Object.entries(texts)) {
        if (!val || typeof val !== "string" || !val.trim()) {
          translatedMap[key] = "";
          continue;
        }
        try {
          translatedMap[key] = await translateSingleText(val, targetLocale);
        } catch (e) {
          console.warn(`Translation error for ${key} into ${targetLocale}:`, e?.message);
          translatedMap[key] = val;
        }
      }
      return NextResponse.json({ success: true, translations: translatedMap });
    }

    // Mode 3: Single text query (backward compatible with bundles & translation admin)
    if (!englishText) {
      return NextResponse.json(
        { success: false, error: "englishText or texts is required" },
        { status: 400 }
      );
    }

    if (!targetLocale) {
      return NextResponse.json(
        { success: false, error: "targetLocale is required" },
        { status: 400 }
      );
    }

    const translation = await translateSingleText(englishText, targetLocale);
    return NextResponse.json({ success: true, translation });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
