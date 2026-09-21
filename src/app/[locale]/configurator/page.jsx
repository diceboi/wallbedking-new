import { ConfiguratorHub } from "@/components/configurator/ConfiguratorHub";

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
  const resolvedParams = await params;
  const loc = resolvedParams?.locale || "en";
  const dict = DICTS[loc] || DICTS.en;
  return {
    title: dict.configurator?.metaTitle || "3D Sofa & Furniture Configurator | Wall Bed King",
    description:
      dict.configurator?.metaDesc ||
      "Design and configure your modular sofa and furniture pieces in interactive 3D with custom fabric colors and instant cart addition.",
  };
}

export default function ConfiguratorPage() {
  return (
    <main className="w-full h-[calc(100dvh-var(--header-height,75px))] overflow-hidden relative bg-[#F7F6F5]">
      <ConfiguratorHub />
    </main>
  );
}
