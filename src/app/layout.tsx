import type { Metadata } from "next";
import Header from "E:/cyber-pc-store/src/components/ui/Header";
import "E:/cyber-pc-store/src/app/global.css";// Наш проверенный относительный путь

export const metadata: Metadata = {
  title: "Cyber PC Store",
  description: "Modern computer hardware store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}