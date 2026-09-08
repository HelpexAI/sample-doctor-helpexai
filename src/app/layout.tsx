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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('helpex_theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased bg-[#F8FAFC] text-slate-900 dark:bg-[#07080B] dark:text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
