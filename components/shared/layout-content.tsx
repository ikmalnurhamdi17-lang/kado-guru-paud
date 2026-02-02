"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./bottom-nav";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Tentukan di halaman mana saja BottomNav HARUS SEMBUNYI
  const hideNavOn = ["/login"];
  const shouldHideNav = hideNavOn.includes(pathname);

  return (
    <>
      <main className={`min-h-screen ${shouldHideNav ? "" : "pb-24"}`}>
        {children}
      </main>

      {/* Navigasi hanya muncul jika tidak sedang di halaman Login */}
      {!shouldHideNav && <BottomNav />}
    </>
  );
}