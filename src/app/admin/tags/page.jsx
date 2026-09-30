"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminTagsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/categories?tab=tags");
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-wbk-brown font-poppins">
      Redirecting to Product Tags manager...
    </div>
  );
}
