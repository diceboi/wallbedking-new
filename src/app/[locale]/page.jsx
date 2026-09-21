import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductSlider } from "@/components/home/ProductSlider";
import { NewProductSection } from "@/components/home/NewProductSection";
import { ReviewsSlider } from "@/components/home/ReviewsSlider";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { mapUrlToLocale } from "@/data/slugs";

import enDict from "@/data/dictionaries/en.json";
import usDict from "@/data/dictionaries/us.json";
import deDict from "@/data/dictionaries/de.json";
import frDict from "@/data/dictionaries/fr.json";
import esDict from "@/data/dictionaries/es.json";
import porDict from "@/data/dictionaries/por.json";
import itDict from "@/data/dictionaries/it.json";

const DICTS = {
  en: enDict,
  us: usDict,
  de: deDict,
  fr: frDict,
  es: esDict,
  por: porDict,
  it: itDict,
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const titles = {
    en: "WallBedKing – Modular Murphy Beds & Space-Saving Furniture",
    us: "WallBedKing – Modular Murphy Beds & Space-Saving Furniture",
    de: "WallBedKing – Modulare Schrankbetten & Raumsparmöbel",
    fr: "WallBedKing – Lits Escamotables Modulaires & Mobilier Gain de Place",
    es: "WallBedKing – Camas Abatibles Modulares & Muebles para el Hogar",
    por: "WallBedKing – Camas Rebatíveis Modulares & Mobiliário Inteligente",
    it: "WallBedKing – Letti a Scomparsa Modulari & Arredo Salvaspazio",
  };
  return {
    title: titles[locale] || titles.en,
  };
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  const dict = DICTS[locale] || DICTS.en;
  const home = dict.home || DICTS.en.home;

  return (
    <>
      {/* 3D Sticky Scroll-driven Hero */}
      <HeroSection />

      {/* Following Section – slides up over the fixed hero */}
      <div className="relative z-20 -mt-[20vh] bg-wbk-white rounded-none shadow-[0_-20px_50px_rgba(0,0,0,0.08)] border-t border-wbk-lightgrey/60">
        {/* About / Intro Section */}
        <section className="py-24 border-b border-wbk-lightgrey">
          <Container className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-wbk-gold">
                {home.aboutTagline || "About WallBedKing"}
              </span>
              <h2 className="font-new-york text-4xl sm:text-5xl text-wbk-black leading-tight">
                {home.aboutHeading || "What we are up to"}
              </h2>
            </div>
            <div className="space-y-6 text-wbk-black text-base leading-relaxed">
              <p>
                {home.aboutDesc ||
                  "At WallBedKing, we design versatile, space-saving furniture tailored for modern living. Our modular murphy bed systems seamlessly blend elegant aesthetics with precision-engineered mechanisms."}
              </p>
              <div>
                <Button
                  as="link"
                  href={mapUrlToLocale("/about", locale)}
                  variant="secondary"
                  size="md"
                >
                  {home.readMore || "Read More"}
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* Category Selection Grid */}
        <CategoryGrid />

        {/* Popular Products Slider */}
        <ProductSlider />

        {/* New Product Interactive Showcase */}
        <NewProductSection />

        {/* Customer Reviews Section */}
        <ReviewsSlider />
      </div>
    </>
  );
}
