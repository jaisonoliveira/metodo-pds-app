import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Método PDS - Transforme seu Corpo e Mente",
  description: "Comunidade completa de treino, nutrição, sedução e desenvolvimento pessoal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
