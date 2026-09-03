import { ConfiguratorHub } from "@/components/configurator/ConfiguratorHub";

export const metadata = {
  title: "3D Sofa & Furniture Configurator | Wall Bed King",
  description:
    "Design and configure your modular sofa and furniture pieces in interactive 3D with custom fabric colors and instant cart addition.",
};

export default function ConfiguratorPage() {
  return (
    <main className="w-full h-[calc(100dvh-var(--header-height,75px))] overflow-hidden relative bg-[#F7F6F5]">
      <ConfiguratorHub />
    </main>
  );
}
