import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata = {
  title: "WallBedKing – Modular Murphy Beds & Furniture",
};

export default function HomePage() {
  return (
    <>
      {/* 3D Sticky Scroll-driven Hero */}
      <HeroSection />

      {/* Following Section – slides up over the fixed hero */}
      <div className="relative z-20 -mt-[60vh] bg-wbk-white rounded-t-[32px] sm:rounded-t-[48px] shadow-[0_-20px_50px_rgba(0,0,0,0.08)] border-t border-wbk-lightgrey/60">

        {/* About / Intro Section */}
        <section className="py-24 border-b border-wbk-lightgrey">
          <Container className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-wbk-gold">
                About WallBedKing
              </span>
              <h2 className="font-new-york text-4xl sm:text-5xl text-wbk-black leading-tight">
                What we are up to
              </h2>
            </div>
            <div className="space-y-6 text-wbk-brown text-base leading-relaxed">
              <p>
                At WallBedKing, we design versatile, space-saving furniture tailored for modern living.
                Our modular murphy bed systems seamlessly blend elegant aesthetics with precision-engineered mechanism.
              </p>
              <div>
                <Button as="link" href="/about" variant="secondary" size="md">
                  Read More
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* Category Selection Grid */}
        <CategoryGrid />

        {/* Design System Preview */}
        <section className="py-20">
          <Container className="space-y-12">
            <div className="text-center">
              <h2 className="font-new-york text-3xl text-wbk-black">
                Design System Preview
              </h2>
              <p className="mt-2 text-sm text-wbk-brown">
                Colours, typography and buttons – all reusable via Tailwind tokens.
              </p>
            </div>

            {/* Colour swatches */}
            <div className="flex flex-wrap gap-4 justify-center">
              {[
                { name: "wbk-green",     hex: "#A3A48C" },
                { name: "wbk-gold",      hex: "#D2AA7C" },
                { name: "wbk-lightgrey", hex: "#E4E0DE" },
                { name: "wbk-brown",     hex: "#A5988E" },
                { name: "wbk-black",     hex: "#090A0A" },
              ].map((c) => (
                <div key={c.name} className="flex flex-col items-center gap-2">
                  <div
                    className="h-16 w-28 rounded-lg border border-wbk-lightgrey shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[10px] font-mono text-wbk-brown">{c.name}</span>
                </div>
              ))}
            </div>

            {/* Button variants */}
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="gold">Gold</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="white" className="border-wbk-lightgrey">White</Button>
            </div>

            {/* Font specimen */}
            <div className="space-y-3 text-center pt-4">
              <p className="font-new-york text-4xl text-wbk-black">
                NewYork — Aa Bb Cc Dd
              </p>
              <p className="font-poppins text-xl text-wbk-black font-light">
                Poppins Light — The quick brown fox
              </p>
              <p className="font-poppins text-xl text-wbk-black font-medium">
                Poppins Medium — The quick brown fox
              </p>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
