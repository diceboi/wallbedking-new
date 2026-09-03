import { AdminLayout } from "@/components/admin/AdminLayout";

export const metadata = {
  title: "WallBedKing | Admin Dashboard",
  description: "Webshop and catalog management for WallBedKing",
};

export default function RootAdminLayout({ children }) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}
