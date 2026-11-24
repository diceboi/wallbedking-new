export const metadata = {
  title: "Wholesale B2B Catalog | WallBedKing",
  description: "Exclusive B2B wholesale portal for WallBedKing trade partners and retailers.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function WholesaleLayout({ children }) {
  return <>{children}</>;
}
