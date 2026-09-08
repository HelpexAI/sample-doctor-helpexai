import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Al-Shifa Executive Dental & Medical Complex | Helpex",
  description: "Advanced Dental, Aesthetic & Family Healthcare in Islamabad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#07080B] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
