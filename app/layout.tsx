import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: "Mana Mentor",
  description: "Mobile-first POLYCET and TGRJC preparation mentor for Telangana SSC students."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-24 pt-4 sm:px-6">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
