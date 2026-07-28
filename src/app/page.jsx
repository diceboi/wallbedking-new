import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata = {
  title: "WallBedKing – Modular Murphy Beds & Furniture",
};

export default function HomePage() {
  return (
    <>
      {/* Hero placeholder */}
      <section className="flex min-h-[90vh] flex-col items-center justify-center bg-wbk-lightgrey">
        <Container className="flex flex-col items-center text-center gap-6">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-wbk-brown">
            Space-Saving Living
          </span>
          <h1 className="font-new-york text-5xl leading-tight text-wbk-black sm:text-6xl lg:text-7xl">
            Modular Murphy Beds
          </h1>
          <p className="max-w-xl text-base text-wbk-brown leading-relaxed">
            Premium wall beds and furniture designed to transform any room. Handcrafted for modern
            living, engineered to last a lifetime.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Button as="link" href="/products/beds" size="lg">
              Shop Beds
            </Button>
            <Button as="link" href="/about" variant="secondary" size="lg">
              Our Story
            </Button>
          </div>
        </Container>
      </section>

      {/* Typography / colour token demo */}
      <section className="py-20 bg-wbk-white">
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
          <div className="flex flex-wrap gap-4">
            {[
              { name: "wbk-green",     hex: "#A3A48C" },
              { name: "wbk-gold",      hex: "#D2AA7C" },
              { name: "wbk-lightgrey", hex: "#E4E0DE" },
              { name: "wbk-brown",     hex: "#A5988E" },
              { name: "wbk-black",     hex: "#090A0A" },
            ].map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-2">
                <div
                  className="h-16 w-28 rounded border border-wbk-lightgrey shadow-sm"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[10px] font-mono text-wbk-brown">{c.name}</span>
              </div>
            ))}
          </div>

          {/* Button variants */}
          <div className="flex flex-wrap gap-4 items-center">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="gold">Gold</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="white" className="border-wbk-lightgrey">White</Button>
          </div>

          {/* Font specimen */}
          <div className="space-y-3">
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
    </>
  );
}
