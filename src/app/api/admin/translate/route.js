import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { englishText, targetLocale, key } = await request.json();

    if (!englishText) {
      return NextResponse.json(
        { success: false, error: "englishText is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      const { OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey });

      const languageNames = {
        us: "American English",
        de: "German (high quality, natural ecommerce tone for luxury space-saving furniture / wall beds)",
        fr: "French (polished, natural ecommerce terminology for lits escamotables / wall beds)",
        es: "Spanish (neutral European/Latin American, natural ecommerce tone for camas abatibles)",
        por: "Portuguese (natural European/Brazilian ecommerce tone for camas rebatíveis)",
        it: "Italian (elegant ecommerce terminology for letti a scomparsa)",
        en: "British English",
      };

      const targetDesc = languageNames[targetLocale] || targetLocale;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `You are a professional ecommerce translator for WallBedKing, a high-end manufacturer of space-saving Murphy beds (Schrankbetten, Lits escamotables, Camas abatibles, Letti a scomparsa), modular front sofas, and cabinetry.
Translate the following short UI string or product specification from English into ${targetDesc}.
Return ONLY the translation, without quotes, explanations, or formatting. Preserve variables or punctuation.`,
          },
          {
            role: "user",
            content: englishText,
          },
        ],
      });

      const translated = completion.choices[0]?.message?.content?.trim() || englishText;
      return NextResponse.json({ success: true, translation: translated });
    }

    // Smart fallback if OPENAI_API_KEY is not yet in .env
    return NextResponse.json({
      success: false,
      error: "OPENAI_API_KEY is not configured in .env.local. Please add your key to enable one-click AI translations.",
      fallback: englishText,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
